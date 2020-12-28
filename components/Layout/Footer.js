import { EXAMPLE_PATH } from "../../lib/constants";

export default function Footer() {
  return (
    <footer className="bg-accent-1 border-t border-accent-2">
      <div className="container mx-auto px-5">
        <div className="py-10 flex flex-col lg:flex-row items-center">
          <h3 className="text-base lg:text-2xl font-bold tracking-tighter leading-tight text-center lg:text-left mb-4Z lg:mb-0 lg:pr-4 lg:w-1/2">
            Statically Generated with Next.js.
          </h3>
          <div className="flex flex-col lg:flex-row justify-center items-center lg:pl-4 lg:w-1/2">
            <a
              href="https://nextjs.org/docs/basic-features/pages"
              className="text-sm mx-3 bg-black hover:bg-white hover:text-black border border-black text-white font-bold py-2 px-8 lg:px-4 duration-200 transition-colors mb-6 lg:mb-0"
            >
              Read Documentation
            </a>
            <a
              href={`https://github.com/vercel/next.js/tree/canary/examples/${EXAMPLE_PATH}`}
              className="text-sm mx-3 font-bold hover:underline"
            >
              View on GitHub
            </a>
          </div>
        </div>
        <div className="text-sm text-center mb-2 text-gray-500">
          <a href="http://beian.miit.gov.cn" target="_blank">
            ICP备案号：蜀ICP备2020034346号-1
          </a>
        </div>
      </div>
    </footer>
  );
}