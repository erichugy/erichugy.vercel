export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function syntaxHighlightJson(obj: unknown): string {
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
