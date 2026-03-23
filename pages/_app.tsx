import type { AppProps } from "next/app";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import "antd/dist/reset.css";
import "highlight.js/styles/github.css";
import "katex/dist/katex.min.css";
import "@/styles/index.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider locale={zhCN}>
      <Component {...pageProps} />
    </ConfigProvider>
  );
}
