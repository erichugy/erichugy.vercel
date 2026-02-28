import { randomUUID } from "node:crypto";
import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

const API_BASE_URL = "https://api.botpress.cloud/v1/chat/messages";
const PAGE_LIMIT = 700;
const MAX_RETRIES = 8;
const REQUEST_TIMEOUT_MS = 60_000;
const PREVIEW_LIMIT = 200;

export type KeywordCounterStatus = "running" | "completed" | "failed";

export interface KeywordCounterInput {
  pat: string;
  botId: string;
  keywords: string;
  startDate: string;
  endDate?: string;
  verbose?: boolean;
}

export interface MessageMatchRow {
  conversationId: string;
  keywords: string;
  sender: string;
  messageId: string;
  message: string;
}

export interface KeywordCounterJob {
  id: string;
  status: KeywordCounterStatus;
  createdAt: string;
  updatedAt: string;
  outputDir: string;
  error?: string;
  summaryText?: string;
  summary?: Record<string, unknown>;
  files: Array<{ name: string; size: number }>;
  messageMatchesCount: number;
  messageMatchesPreview: MessageMatchRow[];
  progress: {
    stage: string;
    pagesFetched: number;
    messagesScanned: number;
    messagesWithAnyKeyword: number;
    matchedConversations: number;
    elapsedSeconds: number;
  };
}

const outputRoot = path.join(process.cwd(), ".tmp", "keyword-counter");

const globalState = globalThis as typeof globalThis & {
  __keywordCounterJobs?: Map<string, KeywordCounterJob>;
};

const jobs = globalState.__keywordCounterJobs ?? new Map<string, KeywordCounterJob>();
globalState.__keywordCounterJobs = jobs;

function nowIso() {
  return new Date().toISOString();
}

function parseKeywords(input: string) {
  const raw = String(input || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const deduped: string[] = [];
  for (const item of raw) {
    if (!deduped.some((existing) => existing.toLowerCase() === item.toLowerCase())) {
      deduped.push(item);
    }
  }

  if (!deduped.length) {
    throw new Error("Please provide at least one keyword.");
  }

  return deduped;
}

function parseDateInput(input: string, isEnd: boolean) {
  const value = String(input || "").trim();
  if (!value) {
    if (isEnd) {
      return new Date();
    }
    throw new Error("startDate is required.");
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    if (isEnd) {
      return new Date(year, month - 1, day, 23, 59, 59, 999);
    }
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date input: ${value}`);
  }
  return parsed;
}

function toUtcIso(value: Date) {
  return value.toISOString();
}

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function compileKeywordPatterns(keywordList: string[]) {
  const patterns = new Map<string, RegExp>();
  for (const keyword of keywordList) {
    const isSimpleWord = /^[A-Za-z0-9_]+$/.test(keyword);
    const pattern = isSimpleWord
      ? new RegExp(`\\b${escapeRegex(keyword)}\\b`, "gi")
      : new RegExp(escapeRegex(keyword), "gi");
    patterns.set(keyword, pattern);
  }
  return patterns;
}

function extractText(payload: unknown): string {
  const chunks: string[] = [];

  const walk = (node: unknown) => {
    if (typeof node === "string") {
      chunks.push(node);
      return;
    }

    if (Array.isArray(node)) {
      for (const entry of node) {
        walk(entry);
      }
      return;
    }

    if (node && typeof node === "object") {
      for (const value of Object.values(node as Record<string, unknown>)) {
        walk(value);
      }
    }
  };

  walk(payload);
  return chunks.join("\n");
}

function csvEscape(value: unknown) {
  const str = String(value ?? "");
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function createCsvChunkWriter(filePath: string, header: string[], chunkSize = 1000) {
  const stream = fsSync.createWriteStream(filePath, { encoding: "utf8" });
  const buffer = [header.map(csvEscape).join(",")];

  const waitForDrainOrError = () =>
    new Promise<void>((resolve, reject) => {
      const onDrain = () => {
        stream.off("error", onError);
        resolve();
      };
      const onError = (err: Error) => {
        stream.off("drain", onDrain);
        reject(err);
      };

      stream.once("drain", onDrain);
      stream.once("error", onError);
    });

  const flush = async () => {
    if (!buffer.length) {
      return;
    }

    const payload = `${buffer.join("\n")}\n`;
    buffer.length = 0;
    if (!stream.write(payload)) {
      await waitForDrainOrError();
    }
  };

  return {
    async writeRow(row: unknown[]) {
      buffer.push(row.map(csvEscape).join(","));
      if (buffer.length >= chunkSize) {
        await flush();
      }
    },
    async close() {
      await flush();
      await new Promise<void>((resolve, reject) => {
        stream.once("error", reject);
        stream.end(resolve);
      });
    },
  };
}

function buildSummaryText(summary: {
  runId: string;
  createdAtUtc: string;
  dateRangeUtc: { start: string; end: string };
  keywords: string[];
  totals: {
    pagesFetched: number;
    messagesScanned: number;
    messagesWithAnyKeyword: number;
    uniqueConversationsWithAnyKeyword: number;
  };
  keywordStats: Record<string, { occurrences: number; messagesContainingKeyword: number }>;
  conversationIdsWithAnyKeyword: string[];
}) {
  const lines: string[] = [];
  lines.push("Keyword Search Summary");
  lines.push("");
  lines.push(`Run ID: ${summary.runId}`);
  lines.push(`Created At (UTC): ${summary.createdAtUtc}`);
  lines.push(`Date Range (UTC): ${summary.dateRangeUtc.start} -> ${summary.dateRangeUtc.end}`);
  lines.push("");
  lines.push(`Keywords: ${summary.keywords.join(", ")}`);
  lines.push("");
  lines.push("Totals:");
  lines.push(`- Pages Fetched: ${summary.totals.pagesFetched}`);
  lines.push(`- Messages Scanned: ${summary.totals.messagesScanned}`);
  lines.push(`- Messages With Any Keyword: ${summary.totals.messagesWithAnyKeyword}`);
  lines.push(
    `- Unique Conversations With Any Keyword: ${summary.totals.uniqueConversationsWithAnyKeyword}`,
  );
  lines.push("");
  lines.push("Keyword Stats:");
  for (const keyword of summary.keywords) {
    const stats = summary.keywordStats[keyword];
    lines.push(`- ${keyword}: ${stats.occurrences} occurrence(s), ${stats.messagesContainingKeyword} message(s)`);
  }
  lines.push("");
  lines.push("Conversation IDs With Any Keyword:");
  if (!summary.conversationIdsWithAnyKeyword.length) {
    lines.push("- None");
  } else {
    for (const conversationId of summary.conversationIdsWithAnyKeyword) {
      lines.push(`- ${conversationId}`);
    }
  }
  lines.push("");
  return `${lines.join("\n")}\n`;
}

async function requestJson(url: string, headers: Record<string, string>) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
      signal: controller.signal,
      cache: "no-store",
    });
    const body = await response.text();

    if (!response.ok) {
      const err = new Error(`HTTP ${response.status}`) as Error & {
        response?: { status: number; body: string; headers: Headers };
      };
      err.response = { status: response.status, body, headers: response.headers };
      throw err;
    }

    return JSON.parse(body);
  } finally {
    clearTimeout(timeout);
  }
}

function parseRetrySeconds(headers: Headers, attempt: number) {
  const retryAfter = headers.get("retry-after");
  if (retryAfter) {
    const parsed = Number(retryAfter);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      return parsed;
    }
  }

  const rateLimitReset = headers.get("ratelimit-reset");
  if (rateLimitReset) {
    const parsed = Number(rateLimitReset);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      return Math.max(parsed, 1);
    }
  }

  return Math.min(2 ** attempt, 30);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchMessagesPage(params: {
  botId: string;
  token: string;
  afterDate: string;
  beforeDate: string;
  nextToken?: string;
}) {
  const url = new URL(API_BASE_URL);
  url.searchParams.set("afterDate", params.afterDate);
  url.searchParams.set("beforeDate", params.beforeDate);
  url.searchParams.set("limit", String(PAGE_LIMIT));
  if (params.nextToken) {
    url.searchParams.set("nextToken", params.nextToken);
  }

  const headers = {
    Authorization: `Bearer ${params.token}`,
    "x-bot-id": params.botId,
    Accept: "application/json",
  };

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      return await requestJson(url.toString(), headers);
    } catch (cause) {
      const error = cause as Error & {
        response?: { status: number; body: string; headers: Headers };
      };
      const status = error.response?.status ?? 0;
      const retryable = status === 429 || (status >= 500 && status < 600) || status === 0;

      if (!retryable || attempt === MAX_RETRIES) {
        const body = error.response?.body ? String(error.response.body).slice(0, 700) : error.message;
        throw new Error(`API request failed after retries: ${body}`, { cause });
      }

      const waitSeconds = parseRetrySeconds(error.response?.headers ?? new Headers(), attempt);
      const jitter = Math.min(0.25 * attempt, 2);
      await sleep(Math.round((waitSeconds + jitter) * 1000));
    }
  }

  throw new Error("Unexpected retry loop exit");
}

function updateJob(jobId: string, mutator: (job: KeywordCounterJob) => void) {
  const job = jobs.get(jobId);
  if (!job) {
    return;
  }
  mutator(job);
  job.updatedAt = nowIso();
}

async function runJob(jobId: string, input: KeywordCounterInput) {
  const startedAt = Date.now();
  const keywordList = parseKeywords(input.keywords);
  const start = parseDateInput(input.startDate, false);
  const end = parseDateInput(input.endDate || "", true);

  if (start.getTime() > end.getTime()) {
    throw new Error("startDate must be before endDate.");
  }

  const afterDate = toUtcIso(start);
  const beforeDate = toUtcIso(end);

  const outputDir = path.join(outputRoot, jobId);
  await fs.mkdir(outputDir, { recursive: true });
  updateJob(jobId, (job) => {
    job.outputDir = outputDir;
    job.progress.stage = "Connecting to Botpress";
  });

  const messageMatchesCsv = createCsvChunkWriter(path.join(outputDir, "messages-matches.csv"), [
    "conversation_id",
    "keywords",
    "sender",
    "message_id",
    "message",
  ]);

  const conversationToMessagesCsv = input.verbose
    ? createCsvChunkWriter(path.join(outputDir, "conversation-to-messages.csv"), [
        "conversation_id",
        "message_id",
      ])
    : null;
  const keywordToMessagesCsv = input.verbose
    ? createCsvChunkWriter(path.join(outputDir, "keyword-to-messages.csv"), ["keyword", "message_id"])
    : null;
  const conversationToKeywordsCsv = input.verbose
    ? createCsvChunkWriter(path.join(outputDir, "conversation-to-keywords.csv"), [
        "conversation_id",
        "keyword",
      ])
    : null;

  const patterns = compileKeywordPatterns(keywordList);
  const conversationToKeywords = new Map<string, Set<string>>();
  const keywordOccurrences = new Map<string, number>();
  const keywordMessageCounts = new Map<string, number>();
  const matchedConversationIds = new Set<string>();
  for (const keyword of keywordList) {
    keywordOccurrences.set(keyword, 0);
    keywordMessageCounts.set(keyword, 0);
  }

  let pages = 0;
  let totalMessages = 0;
  let matchedMessages = 0;
  let nextToken: string | undefined;

  while (true) {
    const data = await fetchMessagesPage({
      botId: input.botId,
      token: input.pat,
      afterDate,
      beforeDate,
      nextToken,
    });

    const messages = Array.isArray(data?.messages) ? data.messages : [];
    pages += 1;

    for (const msg of messages) {
      totalMessages += 1;

      const conversationId = String(msg?.conversationId || "unknown");
      const messageId = String(msg?.id || "");
      if (conversationToMessagesCsv) {
        await conversationToMessagesCsv.writeRow([conversationId, messageId]);
      }

      const text = extractText(msg?.payload || {});
      if (!text) {
        continue;
      }

      let messageMatchedAny = false;
      const matchedKeywords = new Set<string>();
      for (const keyword of keywordList) {
        const pattern = patterns.get(keyword);
        if (!pattern) {
          continue;
        }

        pattern.lastIndex = 0;
        const matches = text.match(pattern);
        if (!matches || !matches.length) {
          continue;
        }

        messageMatchedAny = true;
        matchedKeywords.add(keyword);
        keywordOccurrences.set(keyword, (keywordOccurrences.get(keyword) || 0) + matches.length);
        keywordMessageCounts.set(keyword, (keywordMessageCounts.get(keyword) || 0) + 1);

        if (keywordToMessagesCsv) {
          await keywordToMessagesCsv.writeRow([keyword, messageId]);
        }

        if (!conversationToKeywords.has(conversationId)) {
          conversationToKeywords.set(conversationId, new Set());
        }
        conversationToKeywords.get(conversationId)?.add(keyword);
      }

      if (messageMatchedAny) {
        matchedMessages += 1;
        matchedConversationIds.add(conversationId);

        const sender = msg?.direction
          ? String(msg.direction)
          : msg?.userId
            ? String(msg.userId)
            : "unknown";
        const compactMessage = text.replace(/\s+/g, " ").trim();
        const matchedKeywordsList = [...matchedKeywords].sort().join(" | ");

        await messageMatchesCsv.writeRow([
          conversationId,
          matchedKeywordsList,
          sender,
          messageId,
          compactMessage,
        ]);

        updateJob(jobId, (job) => {
          job.messageMatchesCount += 1;
          if (job.messageMatchesPreview.length < PREVIEW_LIMIT) {
            job.messageMatchesPreview.push({
              conversationId,
              keywords: matchedKeywordsList,
              sender,
              messageId,
              message: compactMessage,
            });
          }
        });
      }
    }

    updateJob(jobId, (job) => {
      job.progress.stage = "Scanning messages";
      job.progress.pagesFetched = pages;
      job.progress.messagesScanned = totalMessages;
      job.progress.messagesWithAnyKeyword = matchedMessages;
      job.progress.matchedConversations = matchedConversationIds.size;
      job.progress.elapsedSeconds = Number(((Date.now() - startedAt) / 1000).toFixed(1));
    });

    nextToken = data?.meta?.nextToken;
    if (!nextToken) {
      break;
    }
  }

  if (conversationToKeywordsCsv) {
    for (const [conversationId, keywordSet] of conversationToKeywords.entries()) {
      for (const keyword of [...keywordSet].sort()) {
        await conversationToKeywordsCsv.writeRow([conversationId, keyword]);
      }
    }
  }

  await messageMatchesCsv.close();
  if (conversationToMessagesCsv) {
    await conversationToMessagesCsv.close();
  }
  if (keywordToMessagesCsv) {
    await keywordToMessagesCsv.close();
  }
  if (conversationToKeywordsCsv) {
    await conversationToKeywordsCsv.close();
  }

  const sortedConversationIds = [...matchedConversationIds].sort();
  const summary = {
    runId: jobId,
    createdAtUtc: nowIso(),
    dateRangeUtc: { start: afterDate, end: beforeDate },
    keywords: keywordList,
    totals: {
      pagesFetched: pages,
      messagesScanned: totalMessages,
      messagesWithAnyKeyword: matchedMessages,
      uniqueConversationsWithAnyKeyword: sortedConversationIds.length,
    },
    keywordStats: Object.fromEntries(
      keywordList.map((keyword) => [
        keyword,
        {
          occurrences: keywordOccurrences.get(keyword) || 0,
          messagesContainingKeyword: keywordMessageCounts.get(keyword) || 0,
        },
      ]),
    ),
    conversationIdsWithAnyKeyword: sortedConversationIds,
  };

  const summaryText = buildSummaryText(summary);
  await fs.writeFile(path.join(outputDir, "summary.json"), JSON.stringify(summary, null, 2), "utf8");
  await fs.writeFile(path.join(outputDir, "summary.txt"), summaryText, "utf8");

  const fileNames = await fs.readdir(outputDir);
  const files: Array<{ name: string; size: number }> = [];
  for (const name of fileNames.sort()) {
    const filePath = path.join(outputDir, name);
    const stat = await fs.stat(filePath);
    if (stat.isFile()) {
      files.push({ name, size: stat.size });
    }
  }

  updateJob(jobId, (job) => {
    job.status = "completed";
    job.summary = summary as unknown as Record<string, unknown>;
    job.summaryText = summaryText;
    job.files = files;
    job.progress.stage = "Completed";
  });
}

export function createKeywordCounterJob(input: KeywordCounterInput) {
  const id = randomUUID();
  const createdAt = nowIso();

  const job: KeywordCounterJob = {
    id,
    status: "running",
    createdAt,
    updatedAt: createdAt,
    outputDir: path.join(outputRoot, id),
    files: [],
    messageMatchesCount: 0,
    messageMatchesPreview: [],
    progress: {
      stage: "Queued",
      pagesFetched: 0,
      messagesScanned: 0,
      messagesWithAnyKeyword: 0,
      matchedConversations: 0,
      elapsedSeconds: 0,
    },
  };

  jobs.set(id, job);

  void runJob(id, input).catch((err) => {
    updateJob(id, (target) => {
      target.status = "failed";
      target.error = err instanceof Error ? err.message : "Unknown error";
      target.progress.stage = "Failed";
    });
  });

  return job;
}

export function getKeywordCounterJob(jobId: string) {
  return jobs.get(jobId);
}
