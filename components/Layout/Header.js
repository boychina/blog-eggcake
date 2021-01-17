/**
 * @author boychina
 */
import Link from "next/link";

export default function Header() {
  return (
    <section className="w-screen bg-white flex-col md:flex-row flex items-center md:justify-between pt-3 pb-1 mb-6 md:mb-4 px-10 shadow-md md:fixed z-50">
      <Link href="/">
        <a className="text-2xl md:text-xl font-bold tracking-tighter leading-tight md:pr-8 flex">
          <img src="/favicon/safari-pinned-tab.svg" className="w-6 mr-1"/>
          淡烘糕.
        </a>
      </Link>
      <h4 className="text-center md:text-left text-sm mt-4 md:pl-8">
        不写博客的工程师不是好的搬砖工🧱
      </h4>
    </section>
  );
}