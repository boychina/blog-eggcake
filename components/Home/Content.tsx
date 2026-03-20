import Head from "next/head";
import Link from "next/link";
import dayjs from "dayjs";
import { BellFilled, InboxOutlined, NotificationOutlined, RiseOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import Layout from "@/components/Layout";
import Calendars from "@/components/Common/Calendars";
import WordCloud from "@/components/Common/WordCloud";
import Stories from "./Stories";
import type { PostRecord, TagsMap } from "@/types/post";

interface ContentProps {
  allPosts: PostRecord[];
  postsByPageIndex: PostRecord[];
  current: number;
  totalPage: number;
  tags: TagsMap;
}

export default function Content({
  allPosts,
  postsByPageIndex,
  current,
  totalPage,
  tags,
}: ContentProps) {
  return (
    <Layout hideHeader hideFooter>
      <Head>
        <title>蛋烘糕的学习笔记</title>
      </Head>
      <div className="min-h-screen bg-white text-[#111827]">
        <header className="sticky top-0 z-20 border-b border-[#e8ebf0] bg-white/95 backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-6 lg:px-8">
            <div className="flex items-center gap-10">
              <Link href="/" className="text-2xl font-black tracking-tight">
                Evan Zhao
              </Link>
              <nav className="hidden items-center gap-8 text-[17px] font-semibold text-[#334155] md:flex">
                <Link
                  href="/"
                  className="border-b-2 border-[#2563eb] pb-1 text-[#111827]"
                >
                  文章
                </Link>
                <a className="hover:text-[#111827]">智能分析</a>
                <a className="hover:text-[#111827]">归档</a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden h-10 w-[260px] items-center rounded-lg bg-[#f4f5f7] px-4 text-sm text-[#94a3b8] lg:flex">
                <SearchOutlined className="mr-2" />
                搜索见解...
              </div>
              <BellFilled className="text-lg text-[#334155]" />
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8d8bf] text-[#4b5563]">
                <UserOutlined />
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-[1280px] gap-16 px-6 py-12 lg:px-8">
          <aside className="hidden w-[340px] shrink-0 space-y-10 xl:block">
            <section>
              <h3 className="text-[16px] font-black leading-none tracking-tight text-[#0f172a]">
                Discovery
              </h3>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6f82a0]">
                Curated Intelligence
              </p>
            </section>
            <section className="space-y-3 text-[14px] font-semibold">
              <a className="flex items-center rounded-xl bg-white px-4 py-3 text-[#2463ff] shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
                <span className="flex items-center gap-3">
                  <NotificationOutlined className="text-[18px]" />
                  <span className="text-[14px] leading-none">Feed</span>
                </span>
              </a>
              <a className="flex items-center rounded-xl px-2 py-2 text-[#6f82a0] transition-colors hover:bg-[#f1f5f9]">
                <span className="flex items-center gap-3">
                  <RiseOutlined className="text-[18px]" />
                  <span className="text-[14px] leading-none">Trending</span>
                </span>
              </a>
              <a className="flex items-center rounded-xl px-2 py-2 text-[#6f82a0] transition-colors hover:bg-[#f1f5f9]">
                <span className="flex items-center gap-3">
                  <InboxOutlined className="text-[18px]" />
                  <span className="text-[14px] leading-none">Archives</span>
                </span>
              </a>
            </section>
            <section>
              <div className="mb-5 flex font-black items-center gap-2 text-[16px] leading-none text-[#1f2937]">
                标签
              </div>
              <WordCloud title="" tags={tags} />
            </section>
            <section>
              <div className="mb-5 flex font-black items-center gap-2 text-[16px] leading-none text-[#1f2937]">
                博客日历
              </div>
              <Calendars title="" allPosts={allPosts} />
            </section>
          </aside>
          <section className="flex-1 min-w-0">
            <Stories
              posts={postsByPageIndex}
              current={current}
              totalPage={totalPage}
            />
          </section>
        </main>
        <footer className="mt-14 border-t border-[#e8ebf0] bg-white py-12 text-center">
          <div className="text-4xl font-black tracking-tight text-[#0f172a]">
            Evan Zhao
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-6 text-xs font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
            <a>Privacy Policy</a>
            <a>Terms of Service</a>
            <a>Contact</a>
            <a>API</a>
          </div>
          <p className="mt-6 text-xs tracking-[0.2em] text-[#94a3b8]">
            © {dayjs().format("YYYY")} Evan Zhao. CURATED BY INTELLIGENCE.
          </p>
        </footer>
      </div>
    </Layout>
  );
}
