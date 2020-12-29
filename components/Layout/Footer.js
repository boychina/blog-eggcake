import { GithubOutlined } from '@ant-design/icons';
import { EXAMPLE_PATH } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-accent-1 border-t border-accent-2">
      <div className="container mx-auto px-5">
        <div className="pt-10 flex flex-col items-center">
          <div className="flex flex-col lg:flex-row justify-center items-center">
            <a
              href={`https://github.com/vercel/next.js/tree/canary/examples/${EXAMPLE_PATH}`}
              className="text-sm mx-3 hover:underline"
            >
              <div className="flex items-center"><GithubOutlined className="mr-1"/> GitHub</div>
            </a>
            <span>&copy;2021 boychina</span>
          </div>
        </div>
        <div className="text-sm text-center mt-2 pb-8 text-gray-500">
          <a href="http://beian.miit.gov.cn" target="_blank">
            ICP备案号：蜀ICP备2020034346号-1
          </a>
        </div>
      </div>
    </footer>
  );
}
