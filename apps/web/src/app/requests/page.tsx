"use client";

import { useCallback, useEffect, useState } from "react";

import axios from "@/lib/axios";
import type { CapturedRequest } from "@/lib/request-bin-store";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function syntaxHighlightJson(obj: unknown): string {
  const json = JSON.stringify(obj, null, 2);
  if (json === undefined) {
    return escapeHtml(String(obj));
  }
  return escapeHtml(json).replace(
    /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "rb-json-number";
      if (match.startsWith('"')) {
        cls = match.endsWith(":") ? "rb-json-key" : "rb-json-string";
      } else if (/true|false/.test(match)) {
        cls = "rb-json-boolean";
      } else if (match === "null") {
        cls = "rb-json-null";
      }
      return `<span class="${cls}">${match}</span>`;
    },
  );
}

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString();
}

const styles = `
  .rb-root {
    background: #ffffff;
    color: #24292f;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;
    height: 100vh;
    display: flex;
    flex-direction: column;
    position: fixed;
    inset: 0;
    z-index: 50;
  }
  .rb-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-bottom: 1px solid #d0d7de;
    background: #f6f8fa;
  }
  .rb-toolbar h1 { color: #0969da; font-size: 18px; margin: 0; }
  .rb-toolbar-actions { display: flex; gap: 16px; }
  .rb-toolbar-actions button {
    color: #0969da;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 13px;
    font-family: inherit;
    padding: 0;
  }
  .rb-toolbar-actions button:hover { text-decoration: underline; }
  .rb-container {
    display: flex;
    flex: 1;
    min-height: 0;
  }
  .rb-list-panel {
    width: 340px;
    min-width: 340px;
    border-right: 1px solid #d0d7de;
    overflow-y: auto;
    background: #ffffff;
  }
  .rb-list-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    border-bottom: 1px solid #eaeef2;
    cursor: pointer;
    transition: background 0.1s;
  }
  .rb-list-item:hover { background: #f6f8fa; }
  .rb-list-item.rb-selected { background: #ddf4ff; border-left: 3px solid #0969da; padding-left: 13px; }
  .rb-method {
    padding: 2px 6px;
    border-radius: 3px;
    font-weight: bold;
    font-size: 11px;
    color: #fff;
    flex-shrink: 0;
  }
  .rb-method-get { background: #1a7f37; }
  .rb-method-post { background: #0969da; }
  .rb-method-put { background: #9a6700; }
  .rb-method-delete { background: #cf222e; }
  .rb-method-patch { background: #8250df; }
  .rb-method-head { background: #656d76; }
  .rb-method-options { background: #656d76; }
  .rb-list-item .rb-path {
    font-size: 13px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }
  .rb-list-item .rb-time {
    color: #656d76;
    font-size: 11px;
    flex-shrink: 0;
  }
  .rb-detail-panel {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  }
  .rb-detail-header { margin-bottom: 20px; }
  .rb-detail-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 4px;
  }
  .rb-detail-title .rb-method {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 13px;
  }
  .rb-detail-title .rb-path { font-size: 16px; font-weight: 600; }
  .rb-detail-meta { color: #656d76; font-size: 12px; }
  .rb-detail-panel section { margin-bottom: 20px; }
  .rb-detail-panel section h2 { font-size: 14px; color: #24292f; margin-bottom: 8px; }
  .rb-detail-panel pre {
    background: #f6f8fa;
    border: 1px solid #d0d7de;
    border-radius: 6px;
    padding: 14px;
    overflow-x: auto;
    font-size: 13px;
    line-height: 1.5;
    margin: 0;
  }
  .rb-json-key { color: #0550ae; }
  .rb-json-string { color: #0a3069; }
  .rb-json-number { color: #8250df; }
  .rb-json-boolean { color: #cf222e; }
  .rb-json-null { color: #656d76; font-style: italic; }
  .rb-empty, .rb-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #656d76;
    font-size: 14px;
  }
`;

export default function RequestBinPage() {
  const [requests, setRequests] = useState<CapturedRequest[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await axios.get<CapturedRequest[]>("/api/requests");
      setRequests(res.data);
    } catch {
      // silently ignore fetch errors
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleClear = async () => {
    try {
      await axios.delete("/api/requests");
      setRequests([]);
      setSelectedIndex(0);
    } catch {
      // silently ignore delete errors
    }
  };

  const selected = requests[selectedIndex] ?? null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rb-root">
        <div className="rb-toolbar">
          <h1>RequestBin</h1>
          <div className="rb-toolbar-actions">
            <button type="button" onClick={handleClear}>
              Clear
            </button>
            <button type="button" onClick={fetchRequests}>
              Refresh
            </button>
          </div>
        </div>
        <div className="rb-container">
          <div className="rb-list-panel">
            {requests.length === 0 ? (
              <div className="rb-empty">No requests yet</div>
            ) : (
              requests.map((r, i) => (
                <div
                  key={r.id}
                  className={`rb-list-item${i === selectedIndex ? " rb-selected" : ""}`}
                  onClick={() => setSelectedIndex(i)}
                >
                  <span
                    className={`rb-method rb-method-${r.method.toLowerCase()}`}
                  >
                    {r.method}
                  </span>
                  <span className="rb-path">{r.path}</span>
                  <span className="rb-time">{formatTime(r.timestamp)}</span>
                </div>
              ))
            )}
          </div>
          <div className="rb-detail-panel">
            {selected ? (
              <>
                <div className="rb-detail-header">
                  <div className="rb-detail-title">
                    <span
                      className={`rb-method rb-method-${selected.method.toLowerCase()}`}
                    >
                      {selected.method}
                    </span>
                    <span className="rb-path">{selected.path}</span>
                  </div>
                  <div className="rb-detail-meta">
                    {selected.timestamp} &middot; ID: {selected.id}
                  </div>
                </div>
                <section>
                  <h2>Body</h2>
                  <pre
                    dangerouslySetInnerHTML={{
                      __html: syntaxHighlightJson(selected.body),
                    }}
                  />
                </section>
                <section>
                  <h2>Headers</h2>
                  <pre
                    dangerouslySetInnerHTML={{
                      __html: syntaxHighlightJson(selected.headers),
                    }}
                  />
                </section>
                <section>
                  <h2>Query Parameters</h2>
                  <pre
                    dangerouslySetInnerHTML={{
                      __html: syntaxHighlightJson(selected.query),
                    }}
                  />
                </section>
              </>
            ) : (
              <div className="rb-placeholder">
                Select a request to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
