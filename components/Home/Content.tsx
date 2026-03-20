import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import { BellFilled, LeftOutlined, RightOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import { DATE_FORMAT } from "@/config";
import Layout from "@/components/Layout";
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
  const router = useRouter();
  const [calendarMonth, setCalendarMonth] = useState(dayjs(String(allPosts?.[0]?.date ?? new Date())));
  const postDateSet = useMemo(
    () => new Set(allPosts.map((item) => dayjs(String(item.date ?? "")).format(DATE_FORMAT))),
    [allPosts],
  );
  const tagCloudItems = useMemo(() => {
    const entries = Object.entries(tags || {});
    const sorted = entries.sort((a, b) => b[1].value - a[1].value).slice(0, 30);
    if (!sorted.length) return [];
    const max = sorted[0][1].value;
    const min = sorted[sorted.length - 1][1].value;
    const colors = ["#102a43", "#334e68", "#486581", "#5fa8c4", "#d97706", "#cf222e", "#78a55a", "#96a8c8"];
    return sorted.map(([name, meta], index) => {
      const ratio = max === min ? 0.5 : (meta.value - min) / (max - min);
      const size = Math.round(22 + ratio * 30);
      const rotations = [0, 90, -90, 0, 0];
      return {
        name,
        size,
        color: colors[index % colors.length],
        rotate: rotations[index % rotations.length],
      };
    });
  }, [tags]);
  const calendarStart = calendarMonth.startOf("month");
  const monthOffset = (calendarStart.day() + 6) % 7;
  const calendarDays = Array.from({ length: 42 }).map((_, index) =>
    calendarStart.subtract(monthOffset, "day").add(index, "day"),
  );

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
                <Link href="/" className="border-b-2 border-[#2563eb] pb-1 text-[#111827]">
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
              <h3 className="text-xl font-black leading-none tracking-tight text-[#0f172a]">Discovery</h3>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#94a3b8]">
                Curated Intelligence
              </p>
            </section>
            <section className="text-[15px] font-semibold text-[#475569] space-y-1">
              <a className="flex items-center justify-between rounded-lg px-4 py-2.5 text-[#0f172a] bg-white shadow-sm border border-[#e8ebf0]">
                <span className="flex items-center gap-3"><span className="text-blue-600 text-lg">RSS</span> Feed</span>
              </a>
              <a className="flex items-center justify-between rounded-lg px-4 py-2.5 hover:bg-[#f1f5f9] transition-colors">
                <span className="flex items-center gap-3"><span className="text-[#94a3b8] text-lg">↗</span> Trending</span>
              </a>
              <a className="flex items-center justify-between rounded-lg px-4 py-2.5 hover:bg-[#f1f5f9] transition-colors">
                <span className="flex items-center gap-3"><span className="text-[#94a3b8] text-lg">☐</span> Archives</span>
              </a>
            </section>
            <section>
              <div className="mb-5 flex items-center gap-2 text-[40px] leading-none text-[#1f2937]">
                <span className="font-light">{">"}</span>
                <span className="text-[44px] font-semibold">标签</span>
              </div>
              <div className="flex min-h-[360px] flex-wrap items-center gap-x-3 gap-y-2 px-2">
                {tagCloudItems.map((item) => (
                  <Link
                    key={item.name}
                    href={`/tag/${encodeURIComponent(item.name)}`}
                    className="inline-block font-semibold leading-none transition-opacity hover:opacity-80"
                    style={{
                      fontSize: `${item.size}px`,
                      color: item.color,
                      transform: `rotate(${item.rotate}deg)`,
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </section>
            <section>
              <div className="mb-5 flex items-center gap-2 text-[40px] leading-none text-[#1f2937]">
                <span className="font-light">{">"}</span>
                <span className="text-[44px] font-semibold">博客日历</span>
              </div>
              <div className="rounded-md border border-[#eef2f7] bg-white">
                <div className="flex items-center justify-between border-b border-[#eef2f7] px-5 py-4">
                  <button
                    type="button"
                    onClick={() => setCalendarMonth((prev) => prev.subtract(1, "month"))}
                    className="text-[#475569] transition hover:text-[#0f172a]"
                  >
                    <LeftOutlined />
                  </button>
                  <span className="text-[28px] font-semibold tracking-wide text-[#0f172a]">
                    {calendarMonth.format("YYYY年MM月")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCalendarMonth((prev) => prev.add(1, "month"))}
                    className="text-[#475569] transition hover:text-[#0f172a]"
                  >
                    <RightOutlined />
                  </button>
                </div>
                <div className="grid grid-cols-7 border-b border-[#eef2f7] px-3 py-3 text-center text-[15px] font-semibold text-[#1f2937]">
                  {["一", "二", "三", "四", "五", "六", "日"].map((item, index) => (
                    <span key={`${item}-${index}`}>{item}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-y-2 px-3 py-4 text-center text-[38px] leading-none">
                  {calendarDays.map((day) => {
                    const dayKey = day.format(DATE_FORMAT);
                    const isCurrentMonth = day.isSame(calendarMonth, "month");
                    const hasPost = postDateSet.has(dayKey);
                    const isToday = day.isSame(dayjs(), "day");
                    return (
                      <button
                        key={dayKey}
                        type="button"
                        disabled={!hasPost}
                        onClick={() => router.push({ pathname: "/date/[date]" }, `/date/${dayKey}`)}
                        className={`mx-auto flex h-11 w-11 items-center justify-center rounded-md font-medium transition ${
                          isToday
                            ? "bg-[#1d91ff] text-white"
                            : hasPost
                              ? "text-[#334155] hover:bg-[#f1f5f9]"
                              : "text-[#cbd5e1]"
                        } ${!isCurrentMonth ? "opacity-45" : ""}`}
                      >
                        {day.format("DD")}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          </aside>
          <section className="flex-1 min-w-0">
            <Stories posts={postsByPageIndex} current={current} totalPage={totalPage} />
          </section>
        </main>
        <footer className="mt-14 border-t border-[#e8ebf0] bg-white py-12 text-center">
          <div className="text-4xl font-black tracking-tight text-[#0f172a]">Evan Zhao</div>
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
