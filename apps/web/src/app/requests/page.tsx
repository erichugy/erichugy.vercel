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

type FilterOperator =
  | "is"
  | "is_any_of"
  | "is_none_of"
  | "contains"
  | "not_contains"
  | "starts_with"
  | "equals"
  | "after"
  | "before"
  | "between";

type FilterField = "method" | "path" | "time" | "body" | "headers";

type SingleFilter = {
  id: string;
  field: FilterField;
  operator: FilterOperator;
  value: string;
  values?: string[];
  valueTo?: string;
};

type FilterGroup = {
  id: string;
  logic: "AND" | "OR";
  filters: SingleFilter[];
};

type FilterState = {
  groups: FilterGroup[];
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
  filterGroups: FilterGroup[];
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
const MAX_VIEW_NAME_LENGTH = 100;
const MAX_SEARCH_QUERY_LENGTH = 1000;

const FIELD_OPERATORS: Record<FilterField, { value: FilterOperator; label: string }[]> = {
  method: [
    { value: "is", label: "is" },
    { value: "is_any_of", label: "is any of" },
    { value: "is_none_of", label: "is none of" },
  ],
  path: [
    { value: "contains", label: "contains" },
    { value: "not_contains", label: "does not contain" },
    { value: "starts_with", label: "starts with" },
    { value: "equals", label: "equals" },
  ],
  time: [
    { value: "after", label: "after" },
    { value: "before", label: "before" },
    { value: "between", label: "between" },
  ],
  body: [
    { value: "contains", label: "contains" },
    { value: "not_contains", label: "does not contain" },
  ],
  headers: [
    { value: "contains", label: "contains" },
    { value: "not_contains", label: "does not contain" },
  ],
};

const FILTER_FIELDS: { value: FilterField; label: string }[] = [
  { value: "method", label: "Method" },
  { value: "path", label: "Path" },
  { value: "time", label: "Time" },
  { value: "body", label: "Body" },
  { value: "headers", label: "Headers" },
];

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

function generateFilterId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function createDefaultFilterState(): FilterState {
  return { groups: [] };
}

function createDefaultSearch(): SearchState {
  return {
    query: "",
    isRegex: false,
    caseSensitive: false,
    wholeWord: false,
  };
}

function operatorLabel(op: FilterOperator): string {
  const labels: Record<FilterOperator, string> = {
    is: "is",
    is_any_of: "is any of",
    is_none_of: "is none of",
    contains: "contains",
    not_contains: "does not contain",
    starts_with: "starts with",
    equals: "equals",
    after: "after",
    before: "before",
    between: "between",
  };
  return labels[op];
}

function filterDisplayValue(f: SingleFilter): string {
  if (f.operator === "is_any_of" || f.operator === "is_none_of") {
    return f.values?.join(", ") ?? "";
  }
  if (f.operator === "between") {
    return `${f.value} - ${f.valueTo ?? ""}`;
  }
  return f.value;
}

function matchesSingleFilter(req: CapturedRequest, f: SingleFilter): boolean {
  switch (f.field) {
    case "method": {
      if (f.operator === "is") return req.method === f.value;
      if (f.operator === "is_any_of") return f.values?.includes(req.method) ?? false;
      if (f.operator === "is_none_of") return !(f.values?.includes(req.method) ?? false);
      return true;
    }
    case "path": {
      const path = req.path.toLowerCase();
      const val = f.value.toLowerCase();
      if (f.operator === "contains") return path.includes(val);
      if (f.operator === "not_contains") return !path.includes(val);
      if (f.operator === "starts_with") return path.startsWith(val);
      if (f.operator === "equals") return req.path === f.value;
      return true;
    }
    case "time": {
      const ts = new Date(req.timestamp).getTime();
      if (f.operator === "after") return ts > new Date(f.value).getTime();
      if (f.operator === "before") return ts < new Date(f.value).getTime();
      if (f.operator === "between") {
        const from = new Date(f.value).getTime();
        const to = new Date(f.valueTo ?? "").getTime();
        return ts >= from && ts <= to;
      }
      return true;
    }
    case "body": {
      const bodyStr = typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? "");
      const lower = bodyStr.toLowerCase();
      const val = f.value.toLowerCase();
      if (f.operator === "contains") return lower.includes(val);
      if (f.operator === "not_contains") return !lower.includes(val);
      return true;
    }
    case "headers": {
      const headersStr = JSON.stringify(req.headers).toLowerCase();
      const val = f.value.toLowerCase();
      if (f.operator === "contains") return headersStr.includes(val);
      if (f.operator === "not_contains") return !headersStr.includes(val);
      return true;
    }
  }
}

function matchesFilterState(req: CapturedRequest, state: FilterState): boolean {
  if (state.groups.length === 0) return true;

  // All groups joined by AND
  return state.groups.every((group) => {
    if (group.filters.length === 0) return true;
    if (group.logic === "AND") {
      return group.filters.every((f) => matchesSingleFilter(req, f));
    }
    // OR
    return group.filters.some((f) => matchesSingleFilter(req, f));
  });
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
    return false;
  }
}

function getAllFilters(state: FilterState): SingleFilter[] {
  return state.groups.flatMap((g) => g.filters);
}

// --- localStorage helpers ---

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
    // localStorage may be full or unavailable
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
    (hasObjectProp(v, "search") || true)
  );
}

function loadViews(): SavedView[] {
  const raw = loadFromStorage("requestbin-views-v2");
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
  .rb-toolbar-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
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

  /* View tabs - Linear style */
  .rb-view-tabs {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 0 20px;
    border-bottom: 1px solid #d0d7de;
    background: #ffffff;
    overflow-x: auto;
  }
  .rb-view-tab {
    padding: 8px 12px;
    font-size: 13px;
    color: #656d76;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    white-space: nowrap;
    transition: all 0.1s;
    background: none;
    border-top: none;
    border-left: none;
    border-right: none;
    font-family: inherit;
  }
  .rb-view-tab:hover { color: #24292f; }
  .rb-view-tab.rb-active {
    color: #24292f;
    font-weight: 600;
    border-bottom-color: #0969da;
  }
  .rb-view-add {
    padding: 8px;
    color: #656d76;
    cursor: pointer;
    font-size: 16px;
    background: none;
    border: none;
    font-family: inherit;
  }
  .rb-view-add:hover { color: #24292f; }
  .rb-view-tab-ctx {
    position: relative;
    display: inline-flex;
  }
  .rb-tab-context-menu {
    position: absolute;
    top: 100%;
    left: 0;
    background: #ffffff;
    border: 1px solid #d0d7de;
    border-radius: 6px;
    box-shadow: 0 8px 24px rgba(140,149,159,0.2);
    z-index: 100;
    min-width: 140px;
    padding: 4px 0;
  }
  .rb-tab-context-menu button {
    display: block;
    width: 100%;
    padding: 6px 12px;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 13px;
    font-family: inherit;
    color: #24292f;
  }
  .rb-tab-context-menu button:hover { background: #f6f8fa; }
  .rb-tab-context-menu button.rb-danger { color: #cf222e; }

  /* Filter area */
  .rb-filter-area {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    padding: 8px 20px;
    border-bottom: 1px solid #d0d7de;
    background: #ffffff;
    font-size: 13px;
    min-height: 40px;
  }
  .rb-filter-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border: 1px solid #d0d7de;
    border-radius: 6px;
    background: #ffffff;
    cursor: pointer;
    font-size: 13px;
    font-family: inherit;
    color: #656d76;
    transition: all 0.1s;
    position: relative;
  }
  .rb-filter-btn:hover { border-color: #0969da; color: #0969da; }

  /* Filter chip */
  .rb-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 20px;
    background: #ddf4ff;
    color: #0969da;
    font-size: 12px;
    white-space: nowrap;
  }
  .rb-chip-remove {
    background: none;
    border: none;
    cursor: pointer;
    color: #0969da;
    font-size: 14px;
    padding: 0 2px;
    line-height: 1;
    font-family: inherit;
  }
  .rb-chip-remove:hover { color: #cf222e; }
  .rb-chip-logic {
    color: #656d76;
    font-size: 11px;
    font-weight: 600;
    padding: 0 2px;
  }
  .rb-group-bracket {
    color: #656d76;
    font-size: 16px;
    font-weight: 300;
    line-height: 1;
  }
  .rb-group-logic-toggle {
    background: none;
    border: 1px solid #d0d7de;
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
    font-weight: 600;
    padding: 1px 6px;
    color: #656d76;
    font-family: inherit;
  }
  .rb-group-logic-toggle:hover { border-color: #0969da; color: #0969da; }

  /* Filter dropdown */
  .rb-filter-dropdown-wrap { position: relative; display: inline-flex; }
  .rb-filter-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    background: #ffffff;
    border: 1px solid #d0d7de;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(140,149,159,0.2);
    z-index: 200;
    min-width: 220px;
    padding: 4px 0;
  }
  .rb-filter-dropdown-title {
    padding: 8px 12px 4px;
    font-size: 11px;
    color: #656d76;
    font-weight: 600;
    text-transform: uppercase;
  }
  .rb-filter-dropdown-divider {
    height: 1px;
    background: #d0d7de;
    margin: 4px 0;
  }
  .rb-filter-dropdown-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 6px 12px;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 13px;
    font-family: inherit;
    color: #24292f;
  }
  .rb-filter-dropdown-item:hover { background: #f6f8fa; }
  .rb-filter-dropdown-item .rb-arrow { color: #656d76; }

  /* Sub-menu */
  .rb-submenu-wrap { position: relative; }
  .rb-submenu {
    position: absolute;
    top: -4px;
    left: 100%;
    background: #ffffff;
    border: 1px solid #d0d7de;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(140,149,159,0.2);
    z-index: 210;
    min-width: 220px;
    padding: 4px 0;
  }
  .rb-submenu-input-row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
  }
  .rb-submenu-input {
    flex: 1;
    padding: 4px 8px;
    border: 1px solid #d0d7de;
    border-radius: 4px;
    font-size: 12px;
    font-family: inherit;
    outline: none;
  }
  .rb-submenu-input:focus { border-color: #0969da; }
  .rb-submenu-apply {
    padding: 4px 10px;
    background: #0969da;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-family: inherit;
  }
  .rb-submenu-apply:hover { background: #0860c4; }
  .rb-method-option {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 6px 12px;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 13px;
    font-family: inherit;
    color: #24292f;
  }
  .rb-method-option:hover { background: #f6f8fa; }
  .rb-method-checkbox {
    width: 14px;
    height: 14px;
    accent-color: #0969da;
  }

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

  // Filter state - new group-based model
  const [filterState, setFilterState] = useState<FilterState>(createDefaultFilterState);

  // Search state
  const [searchState, setSearchState] = useState<SearchState>(createDefaultSearch);

  // Collapse state
  const [collapsed, setCollapsed] = useState<CollapsedSections>({
    body: false,
    headers: false,
    query: false,
  });

  // Views state
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [activeViewId, setActiveViewId] = useState("default");

  // Filter dropdown state
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [activeFieldMenu, setActiveFieldMenu] = useState<FilterField | null>(null);
  const [activeOperatorMenu, setActiveOperatorMenu] = useState<FilterOperator | null>(null);
  const [pendingMethodSelections, setPendingMethodSelections] = useState<Set<string>>(new Set());
  const [pendingInputValue, setPendingInputValue] = useState("");
  const [pendingInputValueTo, setPendingInputValueTo] = useState("");
  const [addingToGroupId, setAddingToGroupId] = useState<string | null>(null);

  // Tab context menu
  const [tabContextMenuId, setTabContextMenuId] = useState<string | null>(null);

  // Resizable panel
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
  const panelWidthRef = useRef(DEFAULT_PANEL_WIDTH);
  const isDragging = useRef(false);
  const [isDraggingState, setIsDraggingState] = useState(false);

  // Refs
  const isMountedRef = useRef(true);
  const fetchIdRef = useRef(0);
  const isClearingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const tabContextMenuRef = useRef<HTMLDivElement>(null);

  // Load persisted state on mount
  useEffect(() => {
    const width = loadPanelWidth();
    setPanelWidth(width);
    panelWidthRef.current = width;

    const views = loadViews();
    setSavedViews(views);

    const activeId = loadFromStorage("requestbin-active-view-v2");
    if (typeof activeId === "string") {
      setActiveViewId(activeId);
      if (activeId !== "default") {
        const view = views.find((v) => v.id === activeId);
        if (view) {
          setFilterState({ groups: view.filterGroups ?? [] });
          setSearchState({
            query: view.search?.query ?? "",
            isRegex: Boolean(view.search?.isRegex),
            caseSensitive: Boolean(view.search?.caseSensitive),
            wholeWord: Boolean(view.search?.wholeWord),
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

  // Close filter dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(e.target as Node)
      ) {
        setFilterDropdownOpen(false);
        setActiveFieldMenu(null);
        setActiveOperatorMenu(null);
        setPendingMethodSelections(new Set());
        setPendingInputValue("");
        setPendingInputValueTo("");
        setAddingToGroupId(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close tab context menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        tabContextMenuRef.current &&
        !tabContextMenuRef.current.contains(e.target as Node)
      ) {
        setTabContextMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch requests
  const fetchRequests = useCallback((): AbortController => {
    const thisId = ++fetchIdRef.current;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    (async () => {
      try {
        const res = await fetch("/api/requests", { signal: controller.signal });
        if (!res.ok) return;
        const raw: unknown = await res.json().catch(() => null);
        if (!Array.isArray(raw)) return;
        const validated = raw.filter(isCapturedRequest);
        if (isMountedRef.current && fetchIdRef.current === thisId) {
          setRequests(validated);
        }
      } catch {
        // network error or aborted
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
      await fetch("/api/requests", { method: "DELETE", signal: controller.signal });
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

  // Filtered + searched list
  const displayedRequests = useMemo(() => {
    const filtered = requests.filter((r) => matchesFilterState(r, filterState));
    if (!searchState.query.trim()) return filtered;
    return filtered.filter((r) => matchesSearch(r, searchState));
  }, [requests, filterState, searchState]);

  // Reset selectedIndex on filter/search change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filterState, searchState]);

  const selected = displayedRequests[selectedIndex] ?? null;

  // --- Filter handlers ---

  const addFilter = useCallback((groupId: string | null, field: FilterField, operator: FilterOperator, value: string, values?: string[], valueTo?: string) => {
    const newFilter: SingleFilter = {
      id: generateFilterId(),
      field,
      operator,
      value,
      values,
      valueTo,
    };

    setFilterState((prev) => {
      if (groupId !== null) {
        // Add to existing group
        return {
          groups: prev.groups.map((g) =>
            g.id === groupId
              ? { ...g, filters: [...g.filters, newFilter] }
              : g
          ),
        };
      }

      // Add to first group, or create a new AND group
      if (prev.groups.length === 0) {
        return {
          groups: [{
            id: generateFilterId(),
            logic: "AND",
            filters: [newFilter],
          }],
        };
      }

      const first = prev.groups[0];
      return {
        groups: [
          { ...first, filters: [...first.filters, newFilter] },
          ...prev.groups.slice(1),
        ],
      };
    });
  }, []);

  const removeFilter = useCallback((filterId: string) => {
    setFilterState((prev) => {
      const groups = prev.groups
        .map((g) => ({
          ...g,
          filters: g.filters.filter((f) => f.id !== filterId),
        }))
        .filter((g) => g.filters.length > 0);
      return { groups };
    });
  }, []);

  const addFilterGroup = useCallback(() => {
    setFilterState((prev) => ({
      groups: [
        ...prev.groups,
        {
          id: generateFilterId(),
          logic: "OR",
          filters: [],
        },
      ],
    }));
  }, []);

  const toggleGroupLogic = useCallback((groupId: string) => {
    setFilterState((prev) => ({
      groups: prev.groups.map((g) =>
        g.id === groupId
          ? { ...g, logic: g.logic === "AND" ? "OR" : "AND" }
          : g
      ),
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilterState(createDefaultFilterState());
    setSearchState(createDefaultSearch());
  }, []);

  // --- Dropdown handlers ---

  const handleApplyFilter = useCallback((field: FilterField, operator: FilterOperator) => {
    if (field === "method") {
      if (operator === "is") {
        // Single method selected from inline click — value set via pendingInputValue
        // But for method "is", we use a method picker
        return;
      }
      if (operator === "is_any_of" || operator === "is_none_of") {
        if (pendingMethodSelections.size > 0) {
          addFilter(addingToGroupId, field, operator, "", [...pendingMethodSelections]);
        }
      }
    } else if (field === "time" && operator === "between") {
      if (pendingInputValue) {
        addFilter(addingToGroupId, field, operator, pendingInputValue, undefined, pendingInputValueTo);
      }
    } else {
      if (pendingInputValue) {
        addFilter(addingToGroupId, field, operator, pendingInputValue);
      }
    }

    // Close menus
    setFilterDropdownOpen(false);
    setActiveFieldMenu(null);
    setActiveOperatorMenu(null);
    setPendingMethodSelections(new Set());
    setPendingInputValue("");
    setPendingInputValueTo("");
    setAddingToGroupId(null);
  }, [pendingMethodSelections, pendingInputValue, pendingInputValueTo, addFilter, addingToGroupId]);

  const handleMethodSingleSelect = useCallback((method: string) => {
    addFilter(addingToGroupId, "method", "is", method);
    setFilterDropdownOpen(false);
    setActiveFieldMenu(null);
    setActiveOperatorMenu(null);
    setAddingToGroupId(null);
  }, [addFilter, addingToGroupId]);

  // --- View handlers ---

  const handleSaveView = useCallback(() => {
    const rawName = window.prompt("View name:");
    if (!rawName) return;
    const name = rawName.trim().slice(0, MAX_VIEW_NAME_LENGTH);
    if (name.length < 1) return;

    const view: SavedView = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      filterGroups: filterState.groups,
      search: searchState,
    };

    setSavedViews((prev) => {
      const next = [...prev, view].slice(-MAX_VIEWS);
      saveToStorage("requestbin-views-v2", next);
      return next;
    });
    setActiveViewId(view.id);
    saveToStorage("requestbin-active-view-v2", view.id);
  }, [filterState, searchState]);

  const handleDeleteView = useCallback((viewId: string) => {
    setSavedViews((prev) => {
      const next = prev.filter((v) => v.id !== viewId);
      saveToStorage("requestbin-views-v2", next);
      return next;
    });
    if (activeViewId === viewId) {
      setActiveViewId("default");
      saveToStorage("requestbin-active-view-v2", "default");
      setFilterState(createDefaultFilterState());
      setSearchState(createDefaultSearch());
    }
    setTabContextMenuId(null);
  }, [activeViewId]);

  const handleRenameView = useCallback((viewId: string) => {
    const view = savedViews.find((v) => v.id === viewId);
    if (!view) return;
    const rawName = window.prompt("New name:", view.name);
    if (!rawName) return;
    const name = rawName.trim().slice(0, MAX_VIEW_NAME_LENGTH);
    if (name.length < 1) return;

    setSavedViews((prev) => {
      const next = prev.map((v) => v.id === viewId ? { ...v, name } : v);
      saveToStorage("requestbin-views-v2", next);
      return next;
    });
    setTabContextMenuId(null);
  }, [savedViews]);

  const handleSwitchView = useCallback((viewId: string) => {
    setActiveViewId(viewId);
    saveToStorage("requestbin-active-view-v2", viewId);

    if (viewId === "default") {
      setFilterState(createDefaultFilterState());
      setSearchState(createDefaultSearch());
      return;
    }

    const view = savedViews.find((v) => v.id === viewId);
    if (!view) return;

    setFilterState({ groups: view.filterGroups ?? [] });
    setSearchState({
      query: view.search?.query ?? "",
      isRegex: Boolean(view.search?.isRegex),
      caseSensitive: Boolean(view.search?.caseSensitive),
      wholeWord: Boolean(view.search?.wholeWord),
    });
  }, [savedViews]);

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

  const handleImportViews = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
          saveToStorage("requestbin-views-v2", merged);
          return merged;
        });
      } catch {
        // malformed JSON
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, []);

  // --- Resize handlers ---

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    setIsDraggingState(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return;
      const newWidth = Math.max(MIN_PANEL_WIDTH, Math.min(moveEvent.clientX, MAX_PANEL_WIDTH));
      setPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      setIsDraggingState(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      try {
        localStorage.setItem("requestbin-panel-width", String(panelWidthRef.current));
      } catch {
        // localStorage unavailable
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, []);

  // --- Collapse handlers ---

  const toggleCollapse = useCallback((section: keyof CollapsedSections) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  // --- Derived ---

  const allFilters = getAllFilters(filterState);
  const matchCount = searchState.query.trim() ? displayedRequests.length : null;

  // --- Render filter chips ---

  function renderFilterChips(): React.ReactNode {
    if (filterState.groups.length === 0) return null;

    return filterState.groups.map((group, groupIdx) => (
      <span key={group.id} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {groupIdx > 0 && <span className="rb-chip-logic">AND</span>}
        {filterState.groups.length > 1 && group.filters.length > 0 && (
          <span className="rb-group-bracket">(</span>
        )}
        {group.filters.map((f, filterIdx) => (
          <span key={f.id} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            {filterIdx > 0 && (
              <button
                type="button"
                className="rb-group-logic-toggle"
                onClick={() => toggleGroupLogic(group.id)}
                title={`Click to toggle ${group.logic === "AND" ? "OR" : "AND"}`}
              >
                {group.logic}
              </button>
            )}
            <span className="rb-chip">
              <span style={{ fontWeight: 600 }}>{f.field}</span>
              {" "}
              {operatorLabel(f.operator)}
              {" "}
              {filterDisplayValue(f)}
              <button
                type="button"
                className="rb-chip-remove"
                onClick={() => removeFilter(f.id)}
                aria-label="Remove filter"
              >
                ×
              </button>
            </span>
          </span>
        ))}
        {filterState.groups.length > 1 && group.filters.length > 0 && (
          <span className="rb-group-bracket">)</span>
        )}
      </span>
    ));
  }

  // --- Render filter dropdown ---

  function renderFilterDropdown(): React.ReactNode {
    if (!filterDropdownOpen) return null;

    return (
      <div className="rb-filter-dropdown">
        <div className="rb-filter-dropdown-title">Add Filter...</div>
        <div className="rb-filter-dropdown-divider" />
        <button
          type="button"
          className="rb-filter-dropdown-item"
          onClick={() => {
            addFilterGroup();
            setFilterDropdownOpen(false);
          }}
        >
          <span>( ) Add filter group</span>
        </button>
        <div className="rb-filter-dropdown-divider" />
        {FILTER_FIELDS.map((ff) => (
          <div key={ff.value} className="rb-submenu-wrap">
            <button
              type="button"
              className="rb-filter-dropdown-item"
              onMouseEnter={() => {
                setActiveFieldMenu(ff.value);
                setActiveOperatorMenu(null);
                setPendingMethodSelections(new Set());
                setPendingInputValue("");
                setPendingInputValueTo("");
              }}
            >
              <span>{ff.label}</span>
              <span className="rb-arrow">&#9656;</span>
            </button>
            {activeFieldMenu === ff.value && (
              <div className="rb-submenu">
                {FIELD_OPERATORS[ff.value].map((op) => (
                  <div key={op.value} className="rb-submenu-wrap">
                    <button
                      type="button"
                      className="rb-filter-dropdown-item"
                      onMouseEnter={() => {
                        setActiveOperatorMenu(op.value);
                        setPendingMethodSelections(new Set());
                        setPendingInputValue("");
                        setPendingInputValueTo("");
                      }}
                      onClick={() => {
                        if (ff.value !== "method" && ff.value !== "time") {
                          setActiveOperatorMenu(op.value);
                        }
                      }}
                    >
                      <span>{op.label}</span>
                      <span className="rb-arrow">&#9656;</span>
                    </button>
                    {activeOperatorMenu === op.value && renderOperatorInput(ff.value, op.value)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  function renderOperatorInput(field: FilterField, operator: FilterOperator): React.ReactNode {
    if (field === "method") {
      if (operator === "is") {
        return (
          <div className="rb-submenu">
            {HTTP_METHODS.map((m) => (
              <button
                key={m}
                type="button"
                className="rb-method-option"
                onClick={() => handleMethodSingleSelect(m)}
              >
                <span className={`rb-method rb-method-${m.toLowerCase()}`}>{m}</span>
              </button>
            ))}
          </div>
        );
      }
      // is_any_of / is_none_of: multi-select
      return (
        <div className="rb-submenu">
          {HTTP_METHODS.map((m) => (
            <label key={m} className="rb-method-option">
              <input
                type="checkbox"
                className="rb-method-checkbox"
                checked={pendingMethodSelections.has(m)}
                onChange={() => {
                  setPendingMethodSelections((prev) => {
                    const next = new Set(prev);
                    if (next.has(m)) {
                      next.delete(m);
                    } else {
                      next.add(m);
                    }
                    return next;
                  });
                }}
              />
              <span className={`rb-method rb-method-${m.toLowerCase()}`}>{m}</span>
            </label>
          ))}
          <div className="rb-submenu-input-row">
            <button
              type="button"
              className="rb-submenu-apply"
              onClick={() => handleApplyFilter(field, operator)}
            >
              Apply
            </button>
          </div>
        </div>
      );
    }

    if (field === "time") {
      if (operator === "between") {
        return (
          <div className="rb-submenu">
            <div className="rb-submenu-input-row">
              <span style={{ fontSize: 12, color: "#656d76" }}>From</span>
              <input
                type="datetime-local"
                className="rb-submenu-input"
                value={pendingInputValue}
                onChange={(e) => setPendingInputValue(e.target.value)}
              />
            </div>
            <div className="rb-submenu-input-row">
              <span style={{ fontSize: 12, color: "#656d76" }}>To</span>
              <input
                type="datetime-local"
                className="rb-submenu-input"
                value={pendingInputValueTo}
                onChange={(e) => setPendingInputValueTo(e.target.value)}
              />
            </div>
            <div className="rb-submenu-input-row">
              <button
                type="button"
                className="rb-submenu-apply"
                onClick={() => handleApplyFilter(field, operator)}
              >
                Apply
              </button>
            </div>
          </div>
        );
      }
      // after / before
      return (
        <div className="rb-submenu">
          <div className="rb-submenu-input-row">
            <input
              type="datetime-local"
              className="rb-submenu-input"
              value={pendingInputValue}
              onChange={(e) => setPendingInputValue(e.target.value)}
            />
            <button
              type="button"
              className="rb-submenu-apply"
              onClick={() => handleApplyFilter(field, operator)}
            >
              Apply
            </button>
          </div>
        </div>
      );
    }

    // Path, Body, Headers — text input
    return (
      <div className="rb-submenu">
        <div className="rb-submenu-input-row">
          <input
            type="text"
            className="rb-submenu-input"
            placeholder={`Enter ${field} value...`}
            value={pendingInputValue}
            onChange={(e) => setPendingInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleApplyFilter(field, operator);
              }
            }}
          />
          <button
            type="button"
            className="rb-submenu-apply"
            onClick={() => handleApplyFilter(field, operator)}
          >
            Apply
          </button>
        </div>
      </div>
    );
  }

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

        {/* Views tab bar - Linear style */}
        <div className="rb-view-tabs">
          <button
            type="button"
            className={`rb-view-tab${activeViewId === "default" ? " rb-active" : ""}`}
            onClick={() => handleSwitchView("default")}
          >
            All requests
          </button>
          {savedViews.map((v) => (
            <span key={v.id} className="rb-view-tab-ctx" ref={tabContextMenuId === v.id ? tabContextMenuRef : undefined}>
              <button
                type="button"
                className={`rb-view-tab${activeViewId === v.id ? " rb-active" : ""}`}
                onClick={() => handleSwitchView(v.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setTabContextMenuId(tabContextMenuId === v.id ? null : v.id);
                }}
              >
                {v.name}
              </button>
              {tabContextMenuId === v.id && (
                <div className="rb-tab-context-menu">
                  <button type="button" onClick={() => handleRenameView(v.id)}>
                    Rename
                  </button>
                  <button type="button" className="rb-danger" onClick={() => handleDeleteView(v.id)}>
                    Delete
                  </button>
                  <button type="button" onClick={handleExportViews}>
                    Export
                  </button>
                </div>
              )}
            </span>
          ))}
          <button
            type="button"
            className="rb-view-add"
            onClick={handleSaveView}
            title="Save current filters as a view"
          >
            +
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={handleImportViews}
          />
          <button
            type="button"
            className="rb-view-add"
            onClick={() => fileInputRef.current?.click()}
            title="Import views"
            style={{ fontSize: 13, color: "#656d76" }}
          >
            Import
          </button>
        </div>

        {/* Filter chips + Filter button */}
        <div className="rb-filter-area">
          {renderFilterChips()}
          {allFilters.length > 0 && (
            <button
              type="button"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#cf222e",
                fontSize: 12,
                fontFamily: "inherit",
                padding: "0 4px",
              }}
              onClick={clearAllFilters}
            >
              Clear all
            </button>
          )}
          <div
            className="rb-filter-dropdown-wrap"
            ref={filterDropdownRef}
            style={{ marginLeft: allFilters.length > 0 ? "auto" : 0 }}
          >
            <button
              type="button"
              className="rb-filter-btn"
              onClick={() => {
                setFilterDropdownOpen((prev) => !prev);
                setActiveFieldMenu(null);
                setActiveOperatorMenu(null);
                setAddingToGroupId(null);
              }}
            >
              &#8862; Filter
            </button>
            {renderFilterDropdown()}
          </div>
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
              setSearchState((prev) => ({ ...prev, isRegex: !prev.isRegex }))
            }
            title="Regex mode"
          >
            .*
          </button>
          <button
            type="button"
            className={`rb-search-toggle${searchState.caseSensitive ? " rb-active" : ""}`}
            onClick={() =>
              setSearchState((prev) => ({ ...prev, caseSensitive: !prev.caseSensitive }))
            }
            title="Case sensitive"
          >
            Aa
          </button>
          <button
            type="button"
            className={`rb-search-toggle${searchState.wholeWord ? " rb-active" : ""}`}
            onClick={() =>
              setSearchState((prev) => ({ ...prev, wholeWord: !prev.wholeWord }))
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
                  <span className={`rb-method rb-method-${r.method.toLowerCase()}`}>
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
                    <span className={`rb-method rb-method-${selected.method.toLowerCase()}`}>
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
