const ALLOWED_TAGS = new Set([
  "STRONG",
  "B",
  "EM",
  "I",
  "U",
  "UL",
  "OL",
  "LI",
  "P",
  "BR",
  "DIV",
]);

function cleanNode(node: Node) {
  const children = [...node.childNodes];
  for (const child of children) {
    if (child.nodeType === Node.COMMENT_NODE) {
      child.parentNode?.removeChild(child);
      continue;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) continue;
    const el = child as HTMLElement;
    if (!ALLOWED_TAGS.has(el.tagName)) {
      const parent = el.parentNode;
      while (el.firstChild) parent?.insertBefore(el.firstChild, el);
      parent?.removeChild(el);
      continue;
    }
    for (const attr of [...el.attributes]) {
      el.removeAttribute(attr.name);
    }
    cleanNode(el);
  }
}

export function sanitizeRichText(html: string): string {
  if (!html?.trim()) return "";
  if (typeof window === "undefined") {
    return html
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/on\w+="[^"]*"/gi, "");
  }
  const template = document.createElement("template");
  template.innerHTML = html;
  cleanNode(template.content);
  return template.innerHTML.trim();
}

export function richTextToPlain(html: string): string {
  if (!html) return "";
  if (typeof window === "undefined") {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  const div = document.createElement("div");
  div.innerHTML = sanitizeRichText(html);
  return (div.textContent || "").replace(/\s+/g, " ").trim();
}

export function isRichTextEmpty(html: string): boolean {
  return richTextToPlain(html).length === 0;
}
