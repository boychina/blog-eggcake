import Link from "next/link";
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';

export default function PageTurn({ current, totalPage }) {
  return (
    <section className="my-10 flex items-center justify-center">
      <div className="flex items-center gap-3">
        {current > 1 && (
          <Link as={`/paging/${Number(current) - 1}`} href="/paging/[current]">
            <div className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-sm border border-[#d5dce5] bg-white text-[#0f4d6f] transition hover:bg-[#f1f5f9]">
              <ArrowLeftOutlined />
            </div>
          </Link>
        )}
        {current < totalPage && (
          <Link as={`/paging/${Number(current) + 1}`} href="/paging/[current]">
            <div className="cursor-pointer rounded-sm border border-[#d5dce5] bg-[#edf2f6] px-9 py-3 text-sm font-extrabold uppercase tracking-[0.1em] text-[#0f4d6f] transition hover:bg-[#e2e8f0]">
              Load Previous Archives
            </div>
          </Link>
        )}
        {current < totalPage && (
          <Link as={`/paging/${Number(current) + 1}`} href="/paging/[current]">
            <div className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-sm border border-[#d5dce5] bg-white text-[#0f4d6f] transition hover:bg-[#f1f5f9]">
              <ArrowRightOutlined />
            </div>
          </Link>
        )}
      </div>
    </section>
  );
}
