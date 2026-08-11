/**
 * Converts a Lexical serialized editor state (JSON) to styled HTML.
 * Classes are designed to work with the `.content-view` stylesheet in app.css.
 */

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Lexical text format bitmask flags
const FORMAT_BOLD = 1;
const FORMAT_ITALIC = 2;
const FORMAT_STRIKETHROUGH = 4;
const FORMAT_UNDERLINE = 8;
const FORMAT_CODE = 16;
const FORMAT_SUBSCRIPT = 32;
const FORMAT_SUPERSCRIPT = 64;

function applyTextFormat(text: string, format: number): string {
  let out = text;
  if (format & FORMAT_CODE) out = `<code class="cv-inline-code">${out}</code>`;
  if (format & FORMAT_BOLD) out = `<strong class="cv-bold">${out}</strong>`;
  if (format & FORMAT_ITALIC) out = `<em class="cv-italic">${out}</em>`;
  if (format & FORMAT_STRIKETHROUGH)
    out = `<s class="cv-strikethrough">${out}</s>`;
  if (format & FORMAT_UNDERLINE) out = `<u class="cv-underline">${out}</u>`;
  if (format & FORMAT_SUBSCRIPT) out = `<sub>${out}</sub>`;
  if (format & FORMAT_SUPERSCRIPT) out = `<sup>${out}</sup>`;
  return out;
}

function formatAlignment(format: string | number | undefined): string {
  if (!format) return "";
  const map: Record<string, string> = {
    left: ' style="text-align:left"',
    center: ' style="text-align:center"',
    right: ' style="text-align:right"',
    justify: ' style="text-align:justify"',
    start: ' style="text-align:start"',
    end: ' style="text-align:end"',
  };
  if (typeof format === "string") return map[format] ?? "";
  const numMap: Record<number, string> = {
    1: ' style="text-align:left"',
    2: ' style="text-align:center"',
    3: ' style="text-align:right"',
    4: ' style="text-align:justify"',
  };
  return numMap[format as number] ?? "";
}

function renderLexicalNode(node: any): string {
  if (!node || typeof node !== "object") return "";

  const children =
    Array.isArray(node.children) ?
      node.children.map(renderLexicalNode).join("")
    : "";

  const align = formatAlignment(node.format);

  switch (node.type) {
    // ── Root ──────────────────────────────────────────────────────────────
    case "root":
      return children;

    // ── Headings ──────────────────────────────────────────────────────────
    case "heading": {
      const tag =
        typeof node.tag === "string" && /^h[1-6]$/.test(node.tag) ?
          node.tag
        : "h1";
      const cls: Record<string, string> = {
        h1: "cv-h1",
        h2: "cv-h2",
        h3: "cv-h3",
        h4: "cv-h4",
        h5: "cv-h5",
        h6: "cv-h6",
      };
      return `<${tag} class="${cls[tag]}"${align}>${children}</${tag}>`;
    }

    // ── Paragraph ─────────────────────────────────────────────────────────
    case "paragraph":
      return children.trim() === "" ?
          `<p class="cv-p cv-p-empty"${align}>&nbsp;</p>`
        : `<p class="cv-p"${align}>${children}</p>`;

    // ── Quote ─────────────────────────────────────────────────────────────
    case "quote":
      return `<blockquote class="cv-quote"${align}>${children}</blockquote>`;

    // ── Lists ─────────────────────────────────────────────────────────────
    case "list": {
      const tag = node.listType === "number" ? "ol" : "ul";
      const cls =
        node.listType === "number" ? "cv-ol"
        : node.listType === "check" ? "cv-checklist"
        : "cv-ul";
      return `<${tag} class="${cls}">${children}</${tag}>`;
    }
    case "listitem": {
      const isChecked = node.checked === true;
      const isUnchecked = node.checked === false;
      if (isChecked || isUnchecked) {
        return `<li class="cv-listitem cv-listitem-check${isChecked ? " cv-checked" : ""}" data-checked="${isChecked}">${children}</li>`;
      }
      return `<li class="cv-listitem">${children}</li>`;
    }

    // ── Code block ────────────────────────────────────────────────────────
    case "code": {
      const lang = node.language ?
        ` data-language="${escapeHtml(node.language)}"`
      : "";
      const langLabel =
        node.language ?
          `<div class="cv-code-lang">${escapeHtml(node.language)}</div>`
        : "";
      return `<div class="cv-code-wrapper">${langLabel}<pre class="cv-code"${lang}><code>${children}</code></pre></div>`;
    }
    case "code-highlight": {
      const typeClass = node.highlightType ?
        ` cv-token-${node.highlightType}`
      : "";
      return `<span class="cv-code-token${typeClass}">${escapeHtml(node.text ?? "")}</span>`;
    }

    // ── Link ──────────────────────────────────────────────────────────────
    case "link":
    case "autolink": {
      const href = node.url ? escapeHtml(node.url) : "#";
      return `<a class="cv-link" href="${href}" target="_blank" rel="noopener noreferrer">${children}</a>`;
    }

    // ── Horizontal Rule ───────────────────────────────────────────────────
    case "horizontalrule":
      return `<hr class="cv-hr" />`;

    // ── Image ─────────────────────────────────────────────────────────────
    case "image": {
      const src = node.src ? escapeHtml(node.src) : "";
      const alt = node.altText ? escapeHtml(node.altText) : "";
      const width = node.width ? ` width="${node.width}"` : "";
      const height = node.height ? ` height="${node.height}"` : "";
      return `<figure class="cv-figure"><img class="cv-img" src="${src}" alt="${alt}"${width}${height} />${alt ? `<figcaption class="cv-figcaption">${alt}</figcaption>` : ""}</figure>`;
    }

    // ── Table ─────────────────────────────────────────────────────────────
    case "table":
      return `<div class="cv-table-wrapper"><table class="cv-table">${children}</table></div>`;
    case "tablerow":
      return `<tr class="cv-tr">${children}</tr>`;
    case "tablecell": {
      const isHeader =
        typeof node.headerState === "number" && node.headerState > 0;
      const tag = isHeader ? "th" : "td";
      const cls = isHeader ? "cv-th" : "cv-td";
      const colSpan =
        node.colSpan && node.colSpan > 1 ? ` colspan="${node.colSpan}"` : "";
      const rowSpan =
        node.rowSpan && node.rowSpan > 1 ? ` rowspan="${node.rowSpan}"` : "";
      return `<${tag} class="${cls}"${align}${colSpan}${rowSpan}>${children}</${tag}>`;
    }

    // ── Layout ────────────────────────────────────────────────────────────
    case "layout-container": {
      const cols = node.templateColumns ?? "1fr 1fr";
      return `<div class="cv-layout-container" style="grid-template-columns:${escapeHtml(String(cols))}">${children}</div>`;
    }
    case "layout-item":
      return `<div class="cv-layout-item">${children}</div>`;

    // ── Embeds ────────────────────────────────────────────────────────────
    case "youtube": {
      const videoId = node.videoID ? escapeHtml(node.videoID) : "";
      return `<div class="cv-embed cv-youtube"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="cv-iframe"></iframe></div>`;
    }
    case "tweet": {
      const tweetId = node.id ? escapeHtml(node.id) : "";
      return `<div class="cv-embed cv-tweet"><a class="cv-link" href="https://twitter.com/i/web/status/${tweetId}" target="_blank" rel="noopener noreferrer">View Tweet →</a></div>`;
    }

    // ── Inline text ───────────────────────────────────────────────────────
    case "text": {
      const format: number = typeof node.format === "number" ? node.format : 0;
      let text = escapeHtml(node.text ?? "");
      // Wrap inline color/background styles
      if (node.style) {
        text = `<span style="${escapeHtml(node.style)}">${text}</span>`;
      }
      return applyTextFormat(text, format);
    }

    // ── Linebreak ─────────────────────────────────────────────────────────
    case "linebreak":
      return "<br />";

    // ── Emoji ─────────────────────────────────────────────────────────────
    case "emoji":
      return `<span class="cv-emoji">${escapeHtml(node.text ?? node.unified ?? "")}</span>`;

    // ── DateTime ──────────────────────────────────────────────────────────
    case "datetime":
      return `<span class="cv-datetime">${escapeHtml(node.text ?? "")}</span>`;

    // ── Fallback ──────────────────────────────────────────────────────────
    default:
      return children;
  }
}

export function convertLexicalToHtml({
  jsonData,
}: {
  jsonData: string | object;
}) {
  const parsed =
    typeof jsonData === "string" ?
      (() => {
        try {
          return JSON.parse(jsonData);
        } catch {
          return null;
        }
      })()
    : jsonData;

  if (!parsed || typeof parsed !== "object") {
    return "";
  }

  return renderLexicalNode(parsed.root ?? parsed);
}
