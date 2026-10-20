const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** HTML that is already escaped and can be embedded as-is. */
export class SafeHtml {
  constructor(readonly value: string) {}
}

/** Tagged template that escapes every interpolated value unless it is already SafeHtml. */
export function html(strings: TemplateStringsArray, ...values: unknown[]): SafeHtml {
  return new SafeHtml(
    strings.reduce((out, chunk, index) => out + render(values[index - 1]) + chunk),
  );
}

/** Escapes user text and keeps its line breaks. */
export function multiline(text: string): SafeHtml {
  return new SafeHtml(escapeHtml(text).replace(/\r?\n/g, "<br>"));
}

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char);
}

function render(value: unknown): string {
  if (value instanceof SafeHtml) return value.value;
  if (Array.isArray(value)) return value.map(render).join("");
  if (value === null || value === undefined || value === false) return "";
  return escapeHtml(String(value));
}
