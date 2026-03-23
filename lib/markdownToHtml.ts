import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import markdownItAnchor from "markdown-it-anchor";

const markdownItFootnote = require("markdown-it-footnote");
const markdownItTaskLists = require("markdown-it-task-lists");
const markdownItKatex = require("markdown-it-katex");

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u4e00-\u9fa5-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(str: string, lang: string) {
    const language = lang?.trim().toLowerCase();
    if (language === "mermaid") {
      return `<pre class="mermaid">${md.utils.escapeHtml(str)}</pre>`;
    }
    if (language && hljs.getLanguage(language)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language, ignoreIllegals: true }).value}</code></pre>`;
      } catch {
        return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
      }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  },
});

md.use(markdownItFootnote);
md.use(markdownItTaskLists, {
  enabled: true,
  label: true,
  labelAfter: true,
});
md.use(markdownItKatex, {
  throwOnError: false,
  errorColor: "#cc0000",
});
md.use(markdownItAnchor, {
  level: [2, 3, 4],
  slugify,
  permalink: markdownItAnchor.permalink.linkInsideHeader({
    symbol: "#",
    placement: "after",
    class: "header-anchor",
    ariaHidden: true,
  }),
});

export default async function markdownToHtml(markdown: string): Promise<string> {
  return md.render(markdown);
}
