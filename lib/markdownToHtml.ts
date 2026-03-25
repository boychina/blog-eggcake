import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import katex, { type KatexOptions } from "katex";
import markdownItAnchor from "markdown-it-anchor";

const markdownItFootnote = require("markdown-it-footnote");
const markdownItTaskLists = require("markdown-it-task-lists");

type InlineRuleState = {
  src: string;
  pos: number;
  posMax: number;
  pending: string;
  push: (type: string, tag: string, nesting: number) => { markup?: string; content?: string };
};

type BlockRuleState = {
  src: string;
  bMarks: number[];
  tShift: number[];
  eMarks: number[];
  blkIndent: number;
  line: number;
  getLines: (begin: number, end: number, indent: number, keepLastLF: boolean) => string;
  push: (type: string, tag: string, nesting: number) => {
    block?: boolean;
    content?: string;
    map?: [number, number];
    markup?: string;
  };
};

function isValidMathDelimiter(state: InlineRuleState, pos: number) {
  const prevChar = pos > 0 ? state.src.charCodeAt(pos - 1) : -1;
  const nextChar = pos + 1 <= state.posMax ? state.src.charCodeAt(pos + 1) : -1;

  let canOpen = true;
  let canClose = true;

  if (
    prevChar === 0x20 ||
    prevChar === 0x09 ||
    (nextChar >= 0x30 && nextChar <= 0x39)
  ) {
    canClose = false;
  }

  if (nextChar === 0x20 || nextChar === 0x09) {
    canOpen = false;
  }

  return { canOpen, canClose };
}

function createKatexPlugin(baseOptions: KatexOptions = {}) {
  return (md: MarkdownIt) => {
    const renderInlineMath = (latex: string) => {
      try {
        return katex.renderToString(latex, {
          ...baseOptions,
          displayMode: false,
        });
      } catch {
        return latex;
      }
    };

    const renderBlockMath = (latex: string) => {
      try {
        return `<p>${katex.renderToString(latex, {
          ...baseOptions,
          displayMode: true,
        })}</p>`;
      } catch {
        return latex;
      }
    };

    const mathInline = (state: InlineRuleState, silent: boolean) => {
      if (state.src[state.pos] !== "$") {
        return false;
      }

      const opening = isValidMathDelimiter(state, state.pos);
      if (!opening.canOpen) {
        if (!silent) {
          state.pending += "$";
        }
        state.pos += 1;
        return true;
      }

      const start = state.pos + 1;
      let match = start;

      while ((match = state.src.indexOf("$", match)) !== -1) {
        let pos = match - 1;
        while (state.src[pos] === "\\") {
          pos -= 1;
        }
        if ((match - pos) % 2 === 1) {
          break;
        }
        match += 1;
      }

      if (match === -1) {
        if (!silent) {
          state.pending += "$";
        }
        state.pos = start;
        return true;
      }

      if (match - start === 0) {
        if (!silent) {
          state.pending += "$$";
        }
        state.pos = start + 1;
        return true;
      }

      const closing = isValidMathDelimiter(state, match);
      if (!closing.canClose) {
        if (!silent) {
          state.pending += "$";
        }
        state.pos = start;
        return true;
      }

      if (!silent) {
        const token = state.push("math_inline", "math", 0);
        token.markup = "$";
        token.content = state.src.slice(start, match);
      }

      state.pos = match + 1;
      return true;
    };

    const mathBlock = (
      state: BlockRuleState,
      startLine: number,
      endLine: number,
      silent: boolean,
    ) => {
      let pos = state.bMarks[startLine] + state.tShift[startLine];
      let max = state.eMarks[startLine];

      if (pos + 2 > max || state.src.slice(pos, pos + 2) !== "$$") {
        return false;
      }

      pos += 2;
      let firstLine = state.src.slice(pos, max);
      let lastLine = "";
      let nextLine = startLine;
      let found = false;

      if (silent) {
        return true;
      }

      if (firstLine.trim().slice(-2) === "$$") {
        firstLine = firstLine.trim().slice(0, -2);
        found = true;
      }

      while (!found) {
        nextLine += 1;
        if (nextLine >= endLine) {
          break;
        }

        pos = state.bMarks[nextLine] + state.tShift[nextLine];
        max = state.eMarks[nextLine];

        if (pos < max && state.tShift[nextLine] < state.blkIndent) {
          break;
        }

        const lineText = state.src.slice(pos, max).trim();
        if (lineText.slice(-2) === "$$") {
          const lastPos = state.src.slice(0, max).lastIndexOf("$$");
          lastLine = state.src.slice(pos, lastPos);
          found = true;
        }
      }

      state.line = nextLine + 1;

      const token = state.push("math_block", "math", 0);
      token.block = true;
      token.content =
        (firstLine && firstLine.trim() ? `${firstLine}\n` : "") +
        state.getLines(startLine + 1, nextLine, state.tShift[startLine], true) +
        (lastLine && lastLine.trim() ? lastLine : "");
      token.map = [startLine, state.line];
      token.markup = "$$";
      return true;
    };

    md.inline.ruler.after("escape", "math_inline", mathInline);
    md.block.ruler.after("blockquote", "math_block", mathBlock, {
      alt: ["paragraph", "reference", "blockquote", "list"],
    });
    md.renderer.rules.math_inline = (tokens, idx) => renderInlineMath(tokens[idx].content);
    md.renderer.rules.math_block = (tokens, idx) => `${renderBlockMath(tokens[idx].content)}\n`;
  };
}

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
md.use(createKatexPlugin({
  throwOnError: false,
  errorColor: "#cc0000",
}));
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
