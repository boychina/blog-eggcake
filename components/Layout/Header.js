/**
 * @author boychina
 */
import Link from "next/link";

export default function Header() {
  return (
    <section className="w-screen bg-white flex-col md:flex-row flex items-center md:justify-between pt-3 pb-1 mb-6 md:mb-4 pl-10 pr-20 shadow-lg md:fixed z-50">
      <Link href="/">
        <a>
          <div className="text-xl h-6 font-bold tracking-tighter leading-tight flex">
            <img src="/favicon/safari-pinned-tab.svg" className="w-6 mr-1"/>
            <span>蛋烘糕.</span>
          </div>
        </a>
      </Link>
      <h4 className="text-center md:text-left text-sm mt-2 md:mt-4 md:pl-8">
        不写博客的工程师不是好的搬砖工🧱
      </h4>
    </section>
  );
}