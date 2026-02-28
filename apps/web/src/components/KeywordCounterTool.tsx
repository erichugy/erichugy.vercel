"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

interface JobResponse {
  id: string;
  status: "running" | "completed" | "failed";
  progress: {
    stage: string;
    pagesFetched: number;
    messagesScanned: number;
    messagesWithAnyKeyword: number;
    matchedConversations: number;
    elapsedSeconds: number;
  };
  error?: string;
  summaryText?: string;
  messageMatchesCount: number;
  previewTruncated: boolean;
  messageMatchesPreview: Array<{
    conversationId: string;
    keywords: string;
    sender: string;
    messageId: string;
    message: string;
  }>;
  files: Array<{ name: string; size: number; downloadUrl: string }>;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function KeywordCounterTool() {
  const [pat, setPat] = useState("");
  const [botId, setBotId] = useState("");
  const [keywords, setKeywords] = useState("zendesk, escalation, ticket");
  const [startDate, setStartDate] = useState("2025-11-01");
  const [endDate, setEndDate] = useState("2025-11-30");
  const [verbose, setVerbose] = useState(false);

  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<JobResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!jobId) {
      return;
    }

    const poll = async () => {
      const response = await fetch(`/api/tools/keyword-counter?jobId=${jobId}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Failed to fetch tool status.");
      }

      const data = (await response.json()) as JobResponse;
      setJob(data);

      if (data.status === "completed" || data.status === "failed") {
        return true;
      }

      return false;
    };

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const loop = async () => {
      try {
        const done = await poll();
        if (!cancelled && !done) {
          timeoutId = setTimeout(loop, 1500);
        }
      } catch (pollError) {
        if (!cancelled) {
          setError(pollError instanceof Error ? pollError.message : "Unexpected polling error.");
        }
      }
    };

    void loop();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [jobId]);

  const canRun = useMemo(() => {
    return Boolean(pat.trim() && botId.trim() && keywords.trim() && startDate.trim());
  }, [pat, botId, keywords, startDate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canRun || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setJob(null);

    try {
      const response = await fetch("/api/tools/keyword-counter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pat,
          botId,
          keywords,
          startDate,
          endDate,
          verbose,
        }),
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.error || "Unable to start keyword counter run.");
      }

      setJobId(body.jobId);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unexpected error.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
      <h3 className="text-2xl md:text-3xl font-bold text-heading mb-3">Keyword Counter</h3>
      <p className="text-body leading-relaxed mb-6">
        Enter your Botpress credentials and scan messages for keywords without using a `.env` file.
      </p>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6">
        <label className="flex flex-col gap-2 text-body text-sm md:text-base">
          Botpress PAT
          <input
            type="password"
            value={pat}
            onChange={(event) => setPat(event.target.value)}
            placeholder="bp_pat_..."
            className="px-4 py-3 rounded-lg border border-border bg-page text-heading"
          />
        </label>

        <label className="flex flex-col gap-2 text-body text-sm md:text-base">
          Bot ID
          <input
            type="text"
            value={botId}
            onChange={(event) => setBotId(event.target.value)}
            placeholder="your-bot-id"
            className="px-4 py-3 rounded-lg border border-border bg-page text-heading"
          />
        </label>

        <label className="md:col-span-2 flex flex-col gap-2 text-body text-sm md:text-base">
          Keywords (comma-separated)
          <input
            type="text"
            value={keywords}
            onChange={(event) => setKeywords(event.target.value)}
            placeholder="zendesk, escalation, ticket"
            className="px-4 py-3 rounded-lg border border-border bg-page text-heading"
          />
        </label>

        <label className="flex flex-col gap-2 text-body text-sm md:text-base">
          Start Date
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="px-4 py-3 rounded-lg border border-border bg-page text-heading"
          />
        </label>

        <label className="flex flex-col gap-2 text-body text-sm md:text-base">
          End Date (optional)
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="px-4 py-3 rounded-lg border border-border bg-page text-heading"
          />
        </label>

        <label className="md:col-span-2 inline-flex items-center gap-3 text-body">
          <input
            type="checkbox"
            checked={verbose}
            onChange={(event) => setVerbose(event.target.checked)}
            className="h-4 w-4"
          />
          Include verbose mapping CSV files
        </label>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={!canRun || isSubmitting}
            className="bg-accent hover:bg-accent-hover disabled:bg-muted text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            {isSubmitting ? "Starting..." : "Run Keyword Counter"}
          </button>
        </div>
      </form>

      {error ? (
        <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">{error}</p>
      ) : null}

      {job ? (
        <div className="space-y-6">
          <div className="bg-page border border-border rounded-xl p-4 md:p-5">
            <p className="text-heading font-semibold mb-2">Status: {job.status}</p>
            <p className="text-body mb-4">{job.progress.stage}</p>

            {job.status === "running" ? (
              <div className="relative h-3 rounded-full bg-border overflow-hidden mb-4">
                <div className="keyword-progress-indeterminate" />
              </div>
            ) : (
              <div className="h-3 rounded-full bg-border overflow-hidden mb-4">
                <div className="h-full w-full bg-accent" />
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 text-sm md:text-base">
              <p className="text-body">Pages: {job.progress.pagesFetched}</p>
              <p className="text-body">Messages: {job.progress.messagesScanned}</p>
              <p className="text-body">Matched: {job.progress.messagesWithAnyKeyword}</p>
              <p className="text-body">Conversations: {job.progress.matchedConversations}</p>
              <p className="text-body">Elapsed: {job.progress.elapsedSeconds}s</p>
            </div>
          </div>

          {job.error ? (
            <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{job.error}</p>
          ) : null}

          {job.status === "completed" ? (
            <>
              <div>
                <h4 className="text-xl font-semibold text-heading mb-3">Downloadable Files</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {job.files.map((file) => (
                    <a
                      key={file.name}
                      href={file.downloadUrl}
                      className="bg-page border border-border rounded-lg p-4 hover:border-accent transition-colors"
                    >
                      <p className="text-heading font-medium">{file.name}</p>
                      <p className="text-muted text-sm">{formatBytes(file.size)}</p>
                    </a>
                  ))}
                </div>
              </div>

              {job.summaryText ? (
                <div>
                  <h4 className="text-xl font-semibold text-heading mb-3">Summary Output</h4>
                  <pre className="bg-page border border-border rounded-lg p-4 text-sm text-body whitespace-pre-wrap overflow-auto max-h-96">
                    {job.summaryText}
                  </pre>
                </div>
              ) : null}

              <div>
                <h4 className="text-xl font-semibold text-heading mb-2">messages-matches.csv Results</h4>
                <p className="text-body mb-4">
                  Showing {job.messageMatchesPreview.length} of {job.messageMatchesCount} matched rows.
                </p>

                <div className="overflow-x-auto border border-border rounded-lg">
                  <table className="w-full min-w-[900px] bg-page text-sm">
                    <thead>
                      <tr className="bg-card border-b border-border text-left">
                        <th className="px-3 py-2 text-heading">conversation_id</th>
                        <th className="px-3 py-2 text-heading">keywords</th>
                        <th className="px-3 py-2 text-heading">sender</th>
                        <th className="px-3 py-2 text-heading">message_id</th>
                        <th className="px-3 py-2 text-heading">message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {job.messageMatchesPreview.map((row) => (
                        <tr key={`${row.messageId}-${row.conversationId}`} className="border-b border-border/60">
                          <td className="px-3 py-2 text-body">{row.conversationId}</td>
                          <td className="px-3 py-2 text-body">{row.keywords}</td>
                          <td className="px-3 py-2 text-body">{row.sender}</td>
                          <td className="px-3 py-2 text-body">{row.messageId}</td>
                          <td className="px-3 py-2 text-body">{row.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {job.previewTruncated ? (
                  <p className="text-muted text-sm mt-3">
                    Preview is capped for performance. Download `messages-matches.csv` for full results.
                  </p>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
