// import remark from "remark";
// import html from "remark-html";
// import highlight from "remark-highlight.js";

// export default async function markdownToHtml(markdown) {
//   const result = await remark()
//     .use(highlight)
//     .use(html)
//     .process(markdown);
//   return result.toString();
// }

import MarkdownIt from "markdown-it";
import hljs from "highlight.js";

const md = new MarkdownIt({
  html: true,
  linkify: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(lang, str, true).value +
          "</code></pre>"
        );
      } catch (__) {}
    }

    return (
      '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + "</code></pre>"
    );
  },
});

export default async function markdownToHtml(markdown) {
  return md.render(markdown);
}
