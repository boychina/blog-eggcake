import Head from "next/head";
import { HOME_OG_IMAGE_URL } from "@/config";

export default function Meta() {
  return (
    <Head>
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/favicon/apple-touch-icon.png"
        />
      <link
        rel="icon"
        type="image/png"
        sizes="64x64"
        href="/favicon/favicon-64x64.png"
        />
      <link rel="manifest" href="/favicon/site.webmanifest" />
      <link
        rel="mask-icon"
        href="/favicon/safari-pinned-tab.svg"
        color="#000000"
        />
      <link rel="shortcut icon" href="/favicon/favicon.ico" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="msapplication-config" content="/favicon/browserconfig.xml" />
      <meta name="theme-color" content="#000" />
      <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
      <meta
        name="description"
        content="淡烘糕的个人博客。不写博客的工程师不是好的搬砖工🧱。专注大前端相关技术，不断更新从HTML、CSS、JavaScript、TypeScrip、React、Vue等Web前端技术，到Flutter、ReactNative、uni-app等前端混合开发技术，以及交互设计、算法、设计模式等点滴积累。。。"
        />
      <meta property="og:image" content={HOME_OG_IMAGE_URL} />
    </Head>
  );
}
