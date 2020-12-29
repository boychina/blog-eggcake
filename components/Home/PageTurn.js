import Link from "next/link";
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';

export default function PageTurn({ current, totalPage }) {

  return (
    <section className="flex justify-between my-8">
      <div>
        {current > 1 && 
          <Link as={`/paging/${Number(current) - 1}`} href="/paging/[current]">
            <div className="cursor-pointer leading-none text-sm bg-black hover:bg-white hover:text-black border border-black text-white font-bold py-2 px-12 duration-200 transition-colors">
              <ArrowLeftOutlined />
            </div>
          </Link>}
      </div>
      <div>
        {current < totalPage && 
          <Link as={`/paging/${Number(current) + 1}`} href="/paging/[current]">
            <div className="cursor-pointer leading-none text-sm bg-black hover:bg-white hover:text-black border border-black text-white font-bold py-2 px-12 duration-200 transition-colors">
              <ArrowRightOutlined />
            </div>
          </Link>}
      </div>
    </section>
  )
}