import { type NextRequest } from "next/server";

export type CapturedRequest = {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body: unknown;
};

const MAX_REQUESTS = 100;

const globalState = globalThis as typeof globalThis & {
  __requestBinStore?: CapturedRequest[];
};

const capturedRequests: CapturedRequest[] =
  globalState.__requestBinStore ?? [];
globalState.__requestBinStore = capturedRequests;

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function addRequest(req: CapturedRequest): void {
  capturedRequests.unshift(req);
  if (capturedRequests.length > MAX_REQUESTS) {
    capturedRequests.pop();
  }
}

export function getRequests(): CapturedRequest[] {
  return capturedRequests;
}

export function clearRequests(): void {
  capturedRequests.length = 0;
}

export async function captureFromNextRequest(
  request: NextRequest,
  path: string,
): Promise<CapturedRequest> {
  const url = new URL(request.url);

  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  let body: unknown = null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      const text = await request.text();
      try {
        body = JSON.parse(text);
      } catch {
        body = text || null;
      }
    } catch {
      body = null;
    }
  }

  const captured: CapturedRequest = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    method: request.method,
    path,
    query,
    headers,
    body,
  };

  addRequest(captured);
  return captured;
}
