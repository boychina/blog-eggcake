import Head from "next/head";
import Link from "next/link";
import dayjs from "dayjs";
import { BellFilled, SearchOutlined, UserOutlined } from "@ant-design/icons";
import Layout from "@/components/Layout";
import Stories from "./Stories";

export default function Content({
  allPosts,
  postsByPageIndex,
  current,
  totalPage,
  tags,
}) {
  const monthBase = dayjs(allPosts?.[0]?.date || new Date());
  const totalDays = monthBase.daysInMonth();
  const firstWeekDay = monthBase.startOf("month").day();
  const tagList = Object.keys(tags || {}).slice(0, 6);
  const recentDays = new Set(
    allPosts
      .filter((item) => dayjs(item.date).isSame(monthBase, "month"))
      .map((item) => dayjs(item.date).date())
  );
  const calendarCells = Array.from({ length: firstWeekDay + totalDays }).map(
    (_, index) => {
      const day = index - firstWeekDay + 1;
      return day > 0 ? day : null;
    }
  );

  return (
    <Layout hideHeader hideFooter>
      <Head>
        <title>蛋烘糕的学习笔记</title>
      </Head>
      <div className="min-h-screen bg-[#f7f8fa] text-[#111827]">
        <header className="sticky top-0 z-20 border-b border-[#e8ebf0] bg-white/95 backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-6 lg:px-8">
            <div className="flex items-center gap-10">
              <Link href="/" className="text-2xl font-black tracking-tight">
                AETHER_LIGHT
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
        <main className="mx-auto flex w-full max-w-[1400px] gap-12 px-6 py-8 lg:px-8">
          <aside className="hidden w-[240px] shrink-0 space-y-6 xl:block">
            <section className="rounded-xl border border-[#e8ebf0] bg-white p-6">
              <h3 className="text-[32px] font-black leading-none tracking-tight">Discovery</h3>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#94a3b8]">
                Curated Intelligence
              </p>
            </section>
            <section className="rounded-xl border border-[#e8ebf0] bg-white p-4 text-[15px] font-semibold text-[#334155]">
              <a className="flex items-center justify-between rounded-lg px-3 py-2 text-[#0f172a] hover:bg-[#f4f7fb]">Feed</a>
              <a className="mt-1 flex items-center justify-between rounded-lg px-3 py-2 hover:bg-[#f4f7fb]">Trending</a>
              <a className="mt-1 flex items-center justify-between rounded-lg px-3 py-2 hover:bg-[#f4f7fb]">Archives</a>
            </section>
            <section className="rounded-xl border border-[#e8ebf0] bg-white p-5">
              <h4 className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#64748b]">
                Knowledge Cloud
              </h4>
              <div className="mt-4 flex flex-wrap gap-2">
                {tagList.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tag/${encodeURIComponent(tag)}`}
                    className="rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-semibold text-[#334155]"
                  >
                    /{tag}
                  </Link>
                ))}
              </div>
            </section>
            <section className="rounded-xl border border-[#e8ebf0] bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-extrabold uppercase tracking-[0.15em] text-[#0f172a]">
                  {monthBase.format("MMM YYYY")}
                </span>
                <span className="text-xs text-[#94a3b8]">{monthBase.format("YYYY")}</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-[#94a3b8]">
                {["S", "M", "T", "W", "T", "F", "S"].map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs">
                {calendarCells.map((day, index) => (
                  <span
                    key={`${day}-${index}`}
                    className={`h-7 rounded-full leading-7 ${
                      day
                        ? recentDays.has(day)
                          ? "bg-[#0f4d6f] font-bold text-white"
                          : "text-[#334155]"
                        : ""
                    }`}
                  >
                    {day || ""}
                  </span>
                ))}
              </div>
            </section>
          </aside>
          <section className="flex-1 max-w-[960px]">
            <Stories posts={postsByPageIndex} current={current} totalPage={totalPage} />
          </section>
        </main>
        <footer className="mt-14 border-t border-[#e8ebf0] bg-white py-12 text-center">
          <div className="text-4xl font-black tracking-tight text-[#0f172a]">AETHER_LIGHT</div>
          <div className="mt-5 flex flex-wrap justify-center gap-6 text-xs font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
            <a>Privacy Policy</a>
            <a>Terms of Service</a>
            <a>Contact</a>
            <a>API</a>
          </div>
          <p className="mt-6 text-xs tracking-[0.2em] text-[#94a3b8]">
            © {dayjs().format("YYYY")} AETHER_LIGHT. CURATED BY INTELLIGENCE.
          </p>
        </footer>
      </div>
    </Layout>
  );
}
