"use client";

import { PostgreSQL, sql, type SQLNamespace } from "@codemirror/lang-sql";
import { HighlightStyle, indentUnit, syntaxHighlighting } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { tags } from "@lezer/highlight";
import CodeMirror from "@uiw/react-codemirror";
import { useMemo } from "react";

import type { ParsedTable } from "@/tools/sql-erd";

/** Tab and auto-indent insert this many spaces — SQL files here are space-indented. */
const INDENT = "    ";

/**
 * Colours come from CSS variables defined in styles.css rather than literals, so a
 * single theme object serves both light and dark without being rebuilt on toggle.
 */
const highlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "var(--cm-keyword)", fontWeight: "600" },
  { tag: tags.typeName, color: "var(--cm-type)" },
  { tag: tags.standard(tags.name), color: "var(--cm-type)" },
  { tag: [tags.string, tags.special(tags.string)], color: "var(--cm-string)" },
  { tag: tags.number, color: "var(--cm-number)" },
  { tag: [tags.comment, tags.lineComment, tags.blockComment], color: "var(--cm-comment)", fontStyle: "italic" },
  { tag: [tags.operator, tags.punctuation], color: "var(--cm-punctuation)" },
  { tag: tags.bool, color: "var(--cm-number)" },
  { tag: tags.null, color: "var(--cm-number)" },
  { tag: [tags.variableName, tags.propertyName], color: "var(--cm-name)" },
  { tag: [tags.definition(tags.variableName), tags.labelName], color: "var(--cm-name)" },
  { tag: tags.function(tags.variableName), color: "var(--cm-function)" },
  { tag: tags.special(tags.variableName), color: "var(--cm-name)" },
  { tag: tags.invalid, color: "var(--cm-invalid)" },
]);

const editorTheme = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "12px",
    backgroundColor: "var(--color-page)",
    color: "var(--color-heading)",
  },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": {
    fontFamily: "var(--font-mono)",
    lineHeight: "1.55",
  },
  ".cm-content": { caretColor: "var(--color-accent)" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--color-accent)" },
  ".cm-gutters": {
    backgroundColor: "var(--color-page)",
    color: "var(--color-muted)",
    border: "none",
    borderRight: "1px solid var(--color-border)",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "transparent",
    color: "var(--color-heading)",
  },
  ".cm-activeLine": { backgroundColor: "var(--cm-active-line)" },
  ".cm-selectionBackground, .cm-content ::selection": {
    backgroundColor: "var(--cm-selection) !important",
  },
  "&.cm-focused .cm-selectionBackground": { backgroundColor: "var(--cm-selection) !important" },
  ".cm-matchingBracket, &.cm-focused .cm-matchingBracket": {
    backgroundColor: "var(--cm-selection)",
    outline: "1px solid var(--color-accent)",
  },
  ".cm-tooltip": {
    backgroundColor: "var(--color-card)",
    border: "1px solid var(--color-border)",
    borderRadius: "6px",
    color: "var(--color-body)",
  },
  ".cm-tooltip-autocomplete ul li[aria-selected]": {
    backgroundColor: "var(--color-accent)",
    color: "var(--color-accent-text)",
  },
  ".cm-placeholder": { color: "var(--color-muted)" },
});

export interface SqlCodeEditorProps {
  value: string;
  /** Parsed tables, fed to autocompletion so table and column names complete. */
  tables: ParsedTable[];
  placeholder: string;
  readOnly: boolean;
  onChange: (value: string) => void;
}

export default function SqlCodeEditor({
  value,
  tables,
  placeholder,
  readOnly,
  onChange,
}: SqlCodeEditorProps) {
  const extensions = useMemo(() => {
    const schema: SQLNamespace = {};

    for (const table of tables) {
      schema[table.name] = table.columns.map((column) => column.name);
    }

    return [
      sql({ dialect: PostgreSQL, schema, upperCaseKeywords: true }),
      indentUnit.of(INDENT),
      EditorView.lineWrapping,
      syntaxHighlighting(highlightStyle),
      editorTheme,
    ];
  }, [tables]);

  return (
    <CodeMirror
      value={value}
      height="100%"
      className="erd-code-editor h-full"
      // "none" keeps the package from injecting its own light-only theme over this one.
      theme="none"
      extensions={extensions}
      placeholder={placeholder}
      editable={!readOnly}
      indentWithTab
      basicSetup={{
        // CodeMirror's fallback palette is hardcoded for light backgrounds; leaving it
        // on makes identifiers unreadable in dark mode, so this theme covers everything.
        syntaxHighlighting: false,
        lineNumbers: true,
        foldGutter: false,
        highlightActiveLine: true,
        highlightActiveLineGutter: true,
        bracketMatching: true,
        closeBrackets: true,
        autocompletion: true,
        highlightSelectionMatches: true,
        tabSize: INDENT.length,
      }}
      onChange={onChange}
    />
  );
}
