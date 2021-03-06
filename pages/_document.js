import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="zh-CN">
        <Head>
          <meta name="google-site-verification" content="ysl9po9N59vjLGroL70RxvgSCwmCa4y0Vf-bQ0dnnYg" />
          <meta name="baidu-site-verification" content="code-SQ8pinCY3n" />
          <meta name="sogou_site_verification" content="IbqK7EsWs0"/>
        </Head>
        <body>
          <Main />
          <NextScript />
          <script src="https://hm.baidu.com/hm.js?984a14f3e0e615ff993c5631e3c3e660" />
        </body>
      </Html>
    );
  }
}
