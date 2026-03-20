import Link from "next/link";
import { ArrowDownOutlined } from "@ant-design/icons";

interface PageTurnProps {
  current: number;
  totalPage: number;
}

export default function PageTurn({ current, totalPage }: PageTurnProps) {
  return (
    <section className="my-16 flex items-center justify-center">
      {current < totalPage && (
        <Link as={`/paging/${Number(current) + 1}`} href="/paging/[current]">
          <div className="flex items-center gap-3 cursor-pointer rounded bg-[#f1f5f9] px-8 py-4 text-[13px] font-extrabold uppercase tracking-[0.1em] text-[#334155] transition hover:bg-[#e2e8f0]">
            Load Previous Archives <ArrowDownOutlined className="text-lg" />
          </div>
        </Link>
      )}
    </section>
  );
}
