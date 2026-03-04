"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { CapturedRequest } from "@/lib/requestBinStore";

// --- Types ---

type RouteFilter = {
  value: string;
  mode: "contains" | "exact" | "starts-with";
};

type FilterState = {
  methods: Set<string>;
  timeFrom: string;
  timeTo: string;
  routes: RouteFilter[];
  logic: "AND" | "OR";
};

type SearchState = {
  query: string;
  isRegex: boolean;
  caseSensitive: boolean;
  wholeWord: boolean;
};

type CollapsedSections = {
  body: boolean;
  headers: boolean;
  query: boolean;
};

type SavedView = {
  id: string;
  name: string;
  createdAt: string;
  filter: {
    methods: string[];
    timeFrom: string;
    timeTo: string;
    routes: RouteFilter[];
    logic: "AND" | "OR";
  };
  search: SearchState;
};

// --- Constants ---

const HTTP_METHODS = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
  "HEAD",
  "OPTIONS",
] as const;

const DEFAULT_PANEL_WIDTH = 340;
const MIN_PANEL_WIDTH = 200;
const MAX_PANEL_WIDTH = 800;
const MAX_VIEWS = 50;
const MAX_ROUTE_FILTERS = 20;
const MAX_VIEW_NAME_LENGTH = 100;
const MAX_ROUTE_VALUE_LENGTH = 500;
const MAX_SEARCH_QUERY_LENGTH = 1000;
const ROUTE_MODES = ["contains", "exact", "starts-with"] as const;

// --- Helpers ---

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

function isCapturedRequest(v: unknown): v is CapturedRequest {
  if (typeof v !== "object" || v === null) return false;
  return "id" in v && "method" in v && "path" in v && "timestamp" in v;
}

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString();
}

function isRouteMode(val: string): val is RouteFilter["mode"] {
  return ROUTE_MODES.some((m) => m === val);
}

function createDefaultFilter(): FilterState {
  return {
    methods: new Set<string>(),
    timeFrom: "",
    timeTo: "",
    routes: [],
    logic: "AND",
  };
}

function createDefaultSearch(): SearchState {
  return {
    query: "",
    isRegex: false,
    caseSensitive: false,
    wholeWord: false,
  };
}

function matchesFilter(req: CapturedRequest, filter: FilterState): boolean {
  const methodMatch =
    filter.methods.size === 0 || filter.methods.has(req.method);

  const timeMatch = (() => {
    if (!filter.timeFrom && !filter.timeTo) return true;
    const ts = new Date(req.timestamp).getTime();
    if (filter.timeFrom && ts < new Date(filter.timeFrom).getTime())
      return false;
    if (filter.timeTo && ts > new Date(filter.timeTo).getTime()) return false;
    return true;
  })();

  const routeMatch = (() => {
    if (filter.routes.length === 0) return true;
    return filter.routes.some((rf) => {
      const trimmed = rf.value.trim();
      if (!trimmed) return true;
      switch (rf.mode) {
        case "contains":
          return req.path.includes(trimmed);
        case "exact":
          return req.path === trimmed;
        case "starts-with":
          return req.path.startsWith(trimmed);
      }
    });
  })();

  if (filter.logic === "AND") return methodMatch && timeMatch && routeMatch;
  return methodMatch || timeMatch || routeMatch;
}

function matchesSearch(req: CapturedRequest, search: SearchState): boolean {
  if (!search.query.trim()) return true;

  const searchable = [
    req.method,
    req.path,
    req.id,
    req.timestamp,
    JSON.stringify(req.body),
    JSON.stringify(req.headers),
    JSON.stringify(req.query),
  ].join("\n");

  try {
    let pattern: RegExp;
    if (search.isRegex) {
      const flags = search.caseSensitive ? "" : "i";
      pattern = new RegExp(search.query, flags);
    } else {
      const escaped = search.query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const flags = search.caseSensitive ? "" : "i";
      const term = search.wholeWord ? `\\b${escaped}\\b` : escaped;
      pattern = new RegExp(term, flags);
    }
    return pattern.test(searchable);
  } catch {
    // invalid regex — treat as no match rather than crashing
    return false;
  }
}

function countActiveFilters(filter: FilterState): number {
  let count = 0;
  if (filter.methods.size > 0) count++;
  if (filter.timeFrom || filter.timeTo) count++;
  if (filter.routes.some((r) => r.value.trim())) count++;
  return count;
}

// --- localStorage helpers with try/catch for private browsing ---

function loadFromStorage(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveToStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage may be full or unavailable in private browsing
  }
}

function hasStringProp(o: object, key: string): boolean {
  return key in o && typeof (o as Record<string, unknown>)[key] === "string";
}

function hasObjectProp(o: object, key: string): boolean {
  const val = (o as Record<string, unknown>)[key];
  return key in o && typeof val === "object" && val !== null;
}

function isValidSavedView(v: unknown): v is SavedView {
  if (typeof v !== "object" || v === null) return false;
  return (
    hasStringProp(v, "id") &&
    hasStringProp(v, "name") &&
    hasObjectProp(v, "filter") &&
    hasObjectProp(v, "search")
  );
}

function loadViews(): SavedView[] {
  const raw = loadFromStorage("requestbin-views");
  if (!Array.isArray(raw)) return [];
  return raw.filter(isValidSavedView).slice(0, MAX_VIEWS);
}

function loadPanelWidth(): number {
  try {
    const saved = localStorage.getItem("requestbin-panel-width");
    if (saved === null) return DEFAULT_PANEL_WIDTH;
    const num = Number(saved);
    if (Number.isNaN(num)) return DEFAULT_PANEL_WIDTH;
    return Math.max(MIN_PANEL_WIDTH, Math.min(num, MAX_PANEL_WIDTH));
  } catch {
    return DEFAULT_PANEL_WIDTH;
  }
}

// --- CollapsibleSection component ---

function CollapsibleSection({
  title,
  collapsed,
  onToggle,
  children,
}: {
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <section>
      <button
        type="button"
        className="rb-collapse-toggle"
        onClick={onToggle}
        aria-expanded={!collapsed}
      >
        <span
          className={`rb-chevron${collapsed ? "" : " rb-chevron-open"}`}
        >
          ▶
        </span>
        <h2>{title}</h2>
      </button>
      <div
        className="rb-collapse-content"
        style={{ gridTemplateRows: collapsed ? "0fr" : "1fr" }}
      >
        <div style={{ overflow: "hidden" }}>{children}</div>
      </div>
    </section>
  );
}

// --- Styles ---

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
    border-right: 1px solid #d0d7de;
    overflow-y: auto;
    background: #ffffff;
    flex-shrink: 0;
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

  /* Filter bar */
  .rb-filter-bar {
    padding: 8px 20px;
    border-bottom: 1px solid #d0d7de;
    background: #f6f8fa;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    font-size: 12px;
  }
  .rb-filter-group {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .rb-filter-group label {
    color: #656d76;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
  }
  .rb-method-toggle {
    padding: 2px 8px;
    border-radius: 3px;
    border: 1px solid #d0d7de;
    background: #ffffff;
    cursor: pointer;
    font-size: 11px;
    font-weight: 600;
    color: #656d76;
    transition: all 0.1s;
    font-family: inherit;
  }
  .rb-method-toggle.rb-active { color: #fff; border-color: transparent; }
  .rb-method-toggle.rb-active-get { background: #1a7f37; }
  .rb-method-toggle.rb-active-post { background: #0969da; }
  .rb-method-toggle.rb-active-put { background: #9a6700; }
  .rb-method-toggle.rb-active-delete { background: #cf222e; }
  .rb-method-toggle.rb-active-patch { background: #8250df; }
  .rb-method-toggle.rb-active-head { background: #656d76; }
  .rb-method-toggle.rb-active-options { background: #656d76; }
  .rb-filter-input {
    padding: 3px 8px;
    border: 1px solid #d0d7de;
    border-radius: 4px;
    font-size: 12px;
    font-family: inherit;
    background: #ffffff;
  }
  .rb-filter-select {
    padding: 3px 6px;
    border: 1px solid #d0d7de;
    border-radius: 4px;
    font-size: 12px;
    background: #ffffff;
  }
  .rb-logic-toggle {
    padding: 2px 8px;
    border: 1px solid #d0d7de;
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
    font-weight: 600;
    background: #ffffff;
    font-family: inherit;
    color: #656d76;
  }
  .rb-logic-toggle.rb-active { background: #0969da; color: #fff; border-color: #0969da; }
  .rb-filter-status {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
    color: #656d76;
    font-size: 12px;
  }
  .rb-filter-status button {
    color: #cf222e;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 12px;
    font-family: inherit;
    padding: 0;
  }
  .rb-filter-status button:hover { text-decoration: underline; }
  .rb-route-row {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .rb-route-remove {
    background: none;
    border: none;
    cursor: pointer;
    color: #cf222e;
    font-size: 14px;
    padding: 0 4px;
    font-family: inherit;
    line-height: 1;
  }
  .rb-route-add {
    background: none;
    border: 1px solid #d0d7de;
    border-radius: 4px;
    cursor: pointer;
    color: #0969da;
    font-size: 11px;
    padding: 2px 8px;
    font-family: inherit;
  }
  .rb-route-add:hover { background: #f6f8fa; }

  /* Search bar */
  .rb-search-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 20px;
    border-bottom: 1px solid #d0d7de;
    background: #ffffff;
  }
  .rb-search-input {
    flex: 1;
    padding: 5px 10px;
    border: 1px solid #d0d7de;
    border-radius: 4px;
    font-size: 13px;
    font-family: inherit;
    outline: none;
  }
  .rb-search-input:focus { border-color: #0969da; box-shadow: 0 0 0 3px rgba(9,105,218,0.15); }
  .rb-search-toggle {
    padding: 3px 8px;
    border: 1px solid #d0d7de;
    border-radius: 4px;
    background: #ffffff;
    cursor: pointer;
    font-size: 12px;
    font-family: monospace;
    color: #656d76;
    transition: all 0.1s;
  }
  .rb-search-toggle.rb-active { background: #0969da; color: #fff; border-color: #0969da; }
  .rb-search-count { color: #656d76; font-size: 12px; white-space: nowrap; }

  /* Views bar */
  .rb-views-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 20px;
    border-bottom: 1px solid #d0d7de;
    background: #f6f8fa;
    overflow-x: auto;
  }
  .rb-view-tab {
    padding: 3px 10px;
    border-radius: 4px;
    border: 1px solid #d0d7de;
    background: #ffffff;
    cursor: pointer;
    font-size: 12px;
    white-space: nowrap;
    transition: all 0.1s;
    font-family: inherit;
  }
  .rb-view-tab.rb-active { background: #0969da; color: #fff; border-color: #0969da; }
  .rb-view-actions {
    display: flex;
    gap: 8px;
    margin-left: auto;
  }
  .rb-view-actions button {
    color: #0969da;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 12px;
    font-family: inherit;
    padding: 0;
  }
  .rb-view-actions button:hover { text-decoration: underline; }

  /* Collapsible sections */
  .rb-collapse-toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    margin-bottom: 8px;
    font-family: inherit;
    width: 100%;
    text-align: left;
  }
  .rb-collapse-toggle h2 { margin: 0; }
  .rb-chevron {
    font-size: 10px;
    color: #656d76;
    transition: transform 0.2s;
    display: inline-block;
  }
  .rb-chevron-open { transform: rotate(90deg); }
  .rb-collapse-content {
    display: grid;
    transition: grid-template-rows 0.2s ease-in-out;
  }

  /* Resizable divider */
  .rb-divider {
    width: 4px;
    background: #d0d7de;
    cursor: col-resize;
    flex-shrink: 0;
    transition: background 0.1s;
    position: relative;
  }
  .rb-divider::before {
    content: '';
    position: absolute;
    inset: 0 -2px;
  }
  .rb-divider:hover, .rb-divider.rb-dragging {
    background: #0969da;
  }
`;

// --- Main component ---

export default function RequestBinPage(): React.ReactNode {
  const [requests, setRequests] = useState<CapturedRequest[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter state
  const [filterState, setFilterState] = useState<FilterState>(
    createDefaultFilter,
  );

  // Search state
  const [searchState, setSearchState] = useState<SearchState>(
    createDefaultSearch,
  );

  // Collapse state
  const [collapsed, setCollapsed] = useState<CollapsedSections>({
    body: false,
    headers: false,
    query: false,
  });

  // Views state
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [activeViewId, setActiveViewId] = useState("default");

  // Resizable panel
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
  const panelWidthRef = useRef(DEFAULT_PANEL_WIDTH);
  const isDragging = useRef(false);
  const [isDraggingState, setIsDraggingState] = useState(false);

  // Stale-fetch guard
  const isMountedRef = useRef(true);
  const fetchIdRef = useRef(0);

  // Double-submit guard for clear
  const isClearingRef = useRef(false);

  // Hidden file input ref for import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load persisted state on mount
  useEffect(() => {
    const width = loadPanelWidth();
    setPanelWidth(width);
    panelWidthRef.current = width;

    const views = loadViews();
    setSavedViews(views);

    const activeId = loadFromStorage("requestbin-active-view") || "default";
    if (typeof activeId === "string") {
      setActiveViewId(activeId);
      // Restore view state if not default
      if (activeId !== "default") {
        const view = views.find((v) => v.id === activeId);
        if (view) {
          setFilterState({
            methods: new Set(view.filter.methods),
            timeFrom: view.filter.timeFrom || "",
            timeTo: view.filter.timeTo || "",
            routes: Array.isArray(view.filter.routes)
              ? view.filter.routes
              : [],
            logic: view.filter.logic === "OR" ? "OR" : "AND",
          });
          setSearchState({
            query: view.search.query || "",
            isRegex: Boolean(view.search.isRegex),
            caseSensitive: Boolean(view.search.caseSensitive),
            wholeWord: Boolean(view.search.wholeWord),
          });
        }
      }
    }

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Keep panelWidthRef in sync
  useEffect(() => {
    panelWidthRef.current = panelWidth;
  }, [panelWidth]);

  // Fetch requests with abort controller — returns controller for cleanup
  const fetchRequests = useCallback((): AbortController => {
    const thisId = ++fetchIdRef.current;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    (async () => {
      try {
        const res = await fetch("/api/requests", {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const raw: unknown = await res.json().catch(() => null);
        if (!Array.isArray(raw)) return;
        const validated = raw.filter(isCapturedRequest);
        if (isMountedRef.current && fetchIdRef.current === thisId) {
          setRequests(validated);
        }
      } catch {
        // NOTE: network error or aborted — silently ignore
      } finally {
        clearTimeout(timeout);
      }
    })();

    return controller;
  }, []);

  useEffect(() => {
    const controller = fetchRequests();
    return () => { controller.abort(); };
  }, [fetchRequests]);

  const handleClear = useCallback(async () => {
    if (isClearingRef.current) return;
    isClearingRef.current = true;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      await fetch("/api/requests", {
        method: "DELETE",
        signal: controller.signal,
      });
      if (isMountedRef.current) {
        setRequests([]);
        setSelectedIndex(0);
      }
    } catch {
      // network error or aborted
    } finally {
      clearTimeout(timeout);
      isClearingRef.current = false;
    }
  }, []);

  // Computed filtered + searched list
  const displayedRequests = useMemo(() => {
    const filtered = requests.filter((r) => matchesFilter(r, filterState));
    if (!searchState.query.trim()) return filtered;
    return filtered.filter((r) => matchesSearch(r, searchState));
  }, [requests, filterState, searchState]);

  // Reset selectedIndex when filters/search change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filterState, searchState]);

  const selected = displayedRequests[selectedIndex] ?? null;

  // --- Filter handlers ---

  const toggleMethod = useCallback((method: string) => {
    setFilterState((prev) => {
      const next = new Set(prev.methods);
      if (next.has(method)) {
        next.delete(method);
      } else {
        next.add(method);
      }
      return { ...prev, methods: next };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilterState(createDefaultFilter());
    setSearchState(createDefaultSearch());
  }, []);

  const addRouteFilter = useCallback(() => {
    setFilterState((prev) => {
      if (prev.routes.length >= MAX_ROUTE_FILTERS) return prev;
      return {
        ...prev,
        routes: [...prev.routes, { value: "", mode: "contains" }],
      };
    });
  }, []);

  const updateRouteFilter = useCallback(
    (index: number, updates: Partial<RouteFilter>) => {
      setFilterState((prev) => {
        const routes = prev.routes.map((r, i) => {
          if (i !== index) return r;
          const updated = { ...r, ...updates };
          // enforce max length
          if (updated.value.length > MAX_ROUTE_VALUE_LENGTH) {
            updated.value = updated.value.slice(0, MAX_ROUTE_VALUE_LENGTH);
          }
          return updated;
        });
        return { ...prev, routes };
      });
    },
    [],
  );

  const removeRouteFilter = useCallback((index: number) => {
    setFilterState((prev) => ({
      ...prev,
      routes: prev.routes.filter((_, i) => i !== index),
    }));
  }, []);

  // --- Views handlers ---

  const handleSaveView = useCallback(() => {
    const rawName = window.prompt("View name:");
    if (!rawName) return;
    const name = rawName.trim().slice(0, MAX_VIEW_NAME_LENGTH);
    if (name.length < 1) return;

    const view: SavedView = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      filter: {
        methods: [...filterState.methods],
        timeFrom: filterState.timeFrom,
        timeTo: filterState.timeTo,
        routes: filterState.routes,
        logic: filterState.logic,
      },
      search: searchState,
    };

    setSavedViews((prev) => {
      const next = [...prev, view].slice(-MAX_VIEWS);
      saveToStorage("requestbin-views", next);
      return next;
    });
    setActiveViewId(view.id);
    saveToStorage("requestbin-active-view", view.id);
  }, [filterState, searchState]);

  const handleDeleteView = useCallback(() => {
    if (activeViewId === "default") return;
    setSavedViews((prev) => {
      const next = prev.filter((v) => v.id !== activeViewId);
      saveToStorage("requestbin-views", next);
      return next;
    });
    setActiveViewId("default");
    saveToStorage("requestbin-active-view", "default");
    setFilterState(createDefaultFilter());
    setSearchState(createDefaultSearch());
  }, [activeViewId]);

  const handleSwitchView = useCallback(
    (viewId: string) => {
      setActiveViewId(viewId);
      saveToStorage("requestbin-active-view", viewId);

      if (viewId === "default") {
        setFilterState(createDefaultFilter());
        setSearchState(createDefaultSearch());
        return;
      }

      const view = savedViews.find((v) => v.id === viewId);
      if (!view) return;

      setFilterState({
        methods: new Set(view.filter.methods),
        timeFrom: view.filter.timeFrom || "",
        timeTo: view.filter.timeTo || "",
        routes: Array.isArray(view.filter.routes) ? view.filter.routes : [],
        logic: view.filter.logic === "OR" ? "OR" : "AND",
      });
      setSearchState({
        query: view.search.query || "",
        isRegex: Boolean(view.search.isRegex),
        caseSensitive: Boolean(view.search.caseSensitive),
        wholeWord: Boolean(view.search.wholeWord),
      });
    },
    [savedViews],
  );

  const handleExportViews = useCallback(() => {
    if (savedViews.length === 0) return;
    const json = JSON.stringify(savedViews, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const date = new Date().toISOString().slice(0, 10);
    a.download = `requestbin-views-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [savedViews]);

  const handleImportViews = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const raw: unknown = JSON.parse(String(reader.result));
          if (!Array.isArray(raw)) return;

          const valid = raw.filter(isValidSavedView);
          if (valid.length === 0) return;

          setSavedViews((prev) => {
            const existingIds = new Set(prev.map((v) => v.id));
            const newViews = valid.filter((v) => !existingIds.has(v.id));
            const merged = [...prev, ...newViews].slice(-MAX_VIEWS);
            saveToStorage("requestbin-views", merged);
            return merged;
          });
        } catch {
          // malformed JSON — silently ignore
        }
      };
      reader.readAsText(file);

      // reset input so re-importing the same file works
      e.target.value = "";
    },
    [],
  );

  // --- Resize handlers ---

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    setIsDraggingState(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return;
      const newWidth = Math.max(
        MIN_PANEL_WIDTH,
        Math.min(moveEvent.clientX, MAX_PANEL_WIDTH),
      );
      setPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      setIsDraggingState(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      // read from ref to get latest value
      try {
        localStorage.setItem(
          "requestbin-panel-width",
          String(panelWidthRef.current),
        );
      } catch {
        // localStorage unavailable
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, []);

  // --- Collapse handlers ---

  const toggleCollapse = useCallback(
    (section: keyof CollapsedSections) => {
      setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
    },
    [],
  );

  // --- Derived values ---

  const activeFilterCount = countActiveFilters(filterState);
  const matchCount = searchState.query.trim()
    ? displayedRequests.length
    : null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rb-root">
        {/* Toolbar */}
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

        {/* Views bar */}
        <div className="rb-views-bar">
          <button
            type="button"
            className={`rb-view-tab${activeViewId === "default" ? " rb-active" : ""}`}
            onClick={() => handleSwitchView("default")}
          >
            Default
          </button>
          {savedViews.map((v) => (
            <button
              key={v.id}
              type="button"
              className={`rb-view-tab${activeViewId === v.id ? " rb-active" : ""}`}
              onClick={() => handleSwitchView(v.id)}
            >
              {v.name}
            </button>
          ))}
          <div className="rb-view-actions">
            <button type="button" onClick={handleSaveView}>
              Save view
            </button>
            {activeViewId !== "default" && (
              <button type="button" onClick={handleDeleteView}>
                Delete view
              </button>
            )}
            <button type="button" onClick={handleExportViews}>
              Export
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: "none" }}
              onChange={handleImportViews}
            />
          </div>
        </div>

        {/* Filter bar */}
        <div className="rb-filter-bar">
          <div className="rb-filter-group">
            <label>Method</label>
            {HTTP_METHODS.map((m) => {
              const isActive = filterState.methods.has(m);
              return (
                <button
                  key={m}
                  type="button"
                  className={`rb-method-toggle${isActive ? ` rb-active rb-active-${m.toLowerCase()}` : ""}`}
                  onClick={() => toggleMethod(m)}
                >
                  {m}
                </button>
              );
            })}
          </div>

          <div className="rb-filter-group">
            <label>From</label>
            <input
              type="datetime-local"
              className="rb-filter-input"
              value={filterState.timeFrom}
              onChange={(e) =>
                setFilterState((prev) => ({
                  ...prev,
                  timeFrom: e.target.value,
                }))
              }
            />
            <label>To</label>
            <input
              type="datetime-local"
              className="rb-filter-input"
              value={filterState.timeTo}
              onChange={(e) =>
                setFilterState((prev) => ({
                  ...prev,
                  timeTo: e.target.value,
                }))
              }
            />
          </div>

          <div className="rb-filter-group" style={{ flexWrap: "wrap" }}>
            <label>Route</label>
            {filterState.routes.map((rf, i) => (
              <div key={i} className="rb-route-row">
                <select
                  className="rb-filter-select"
                  value={rf.mode}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (isRouteMode(val)) {
                      updateRouteFilter(i, { mode: val });
                    }
                  }}
                >
                  <option value="contains">contains</option>
                  <option value="exact">exact</option>
                  <option value="starts-with">starts with</option>
                </select>
                <input
                  className="rb-filter-input"
                  placeholder="/path..."
                  value={rf.value}
                  maxLength={MAX_ROUTE_VALUE_LENGTH}
                  onChange={(e) =>
                    updateRouteFilter(i, { value: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="rb-route-remove"
                  onClick={() => removeRouteFilter(i)}
                  aria-label="Remove route filter"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              className="rb-route-add"
              onClick={addRouteFilter}
            >
              + Route
            </button>
          </div>

          <div className="rb-filter-group">
            <label>Logic</label>
            <button
              type="button"
              className={`rb-logic-toggle${filterState.logic === "AND" ? " rb-active" : ""}`}
              onClick={() =>
                setFilterState((prev) => ({ ...prev, logic: "AND" }))
              }
            >
              AND
            </button>
            <button
              type="button"
              className={`rb-logic-toggle${filterState.logic === "OR" ? " rb-active" : ""}`}
              onClick={() =>
                setFilterState((prev) => ({ ...prev, logic: "OR" }))
              }
            >
              OR
            </button>
          </div>

          {(activeFilterCount > 0 || searchState.query.trim()) && (
            <div className="rb-filter-status">
              <span>
                {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""}{" "}
                active
              </span>
              <button type="button" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Search bar */}
        <div className="rb-search-bar">
          <input
            className="rb-search-input"
            placeholder="Search requests..."
            value={searchState.query}
            maxLength={MAX_SEARCH_QUERY_LENGTH}
            onChange={(e) =>
              setSearchState((prev) => ({ ...prev, query: e.target.value.slice(0, MAX_SEARCH_QUERY_LENGTH) }))
            }
          />
          <button
            type="button"
            className={`rb-search-toggle${searchState.isRegex ? " rb-active" : ""}`}
            onClick={() =>
              setSearchState((prev) => ({
                ...prev,
                isRegex: !prev.isRegex,
              }))
            }
            title="Regex mode"
          >
            .*
          </button>
          <button
            type="button"
            className={`rb-search-toggle${searchState.caseSensitive ? " rb-active" : ""}`}
            onClick={() =>
              setSearchState((prev) => ({
                ...prev,
                caseSensitive: !prev.caseSensitive,
              }))
            }
            title="Case sensitive"
          >
            Aa
          </button>
          <button
            type="button"
            className={`rb-search-toggle${searchState.wholeWord ? " rb-active" : ""}`}
            onClick={() =>
              setSearchState((prev) => ({
                ...prev,
                wholeWord: !prev.wholeWord,
              }))
            }
            title="Whole word"
          >
            {"\\bW\\b"}
          </button>
          {matchCount !== null && (
            <span className="rb-search-count">
              {matchCount} match{matchCount !== 1 ? "es" : ""}
            </span>
          )}
        </div>

        {/* Main content */}
        <div className="rb-container">
          <div
            className="rb-list-panel"
            style={{
              width: panelWidth,
              minWidth: MIN_PANEL_WIDTH,
              maxWidth: MAX_PANEL_WIDTH,
            }}
          >
            {displayedRequests.length === 0 ? (
              <div className="rb-empty">No requests yet</div>
            ) : (
              displayedRequests.map((r, i) => (
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

          <div
            className={`rb-divider${isDraggingState ? " rb-dragging" : ""}`}
            onMouseDown={handleMouseDown}
          />

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
                <CollapsibleSection
                  title="Body"
                  collapsed={collapsed.body}
                  onToggle={() => toggleCollapse("body")}
                >
                  <pre
                    dangerouslySetInnerHTML={{
                      __html: syntaxHighlightJson(selected.body),
                    }}
                  />
                </CollapsibleSection>
                <CollapsibleSection
                  title="Headers"
                  collapsed={collapsed.headers}
                  onToggle={() => toggleCollapse("headers")}
                >
                  <pre
                    dangerouslySetInnerHTML={{
                      __html: syntaxHighlightJson(selected.headers),
                    }}
                  />
                </CollapsibleSection>
                <CollapsibleSection
                  title="Query Parameters"
                  collapsed={collapsed.query}
                  onToggle={() => toggleCollapse("query")}
                >
                  <pre
                    dangerouslySetInnerHTML={{
                      __html: syntaxHighlightJson(selected.query),
                    }}
                  />
                </CollapsibleSection>
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
