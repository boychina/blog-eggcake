import "@/styles/index.css";
import "antd/dist/antd.css";
// 代码高亮主题参考 https://highlightjs.org/static/demo/
// import 'highlight.js/styles/atom-one-dark.css';
// import "highlight.js/styles/night-owl.css";
// import 'highlight.js/styles/vs2015.css';
import 'highlight.js/styles/github.css';

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
