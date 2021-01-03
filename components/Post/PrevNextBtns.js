import Link from "next/link";
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';

export default function PrevNextBtns({ prevNextPost }) {
  const { prevPost, nextPost } = prevNextPost;

  return (
    <section className="flex justify-between flex-wrap my-8">
      <div style={{ marginTop: 2 }}>
        {nextPost && 
          <Link as={`/posts/${nextPost.slug}`} href="/posts/[slug]">
            <div className="whitespace-nowrap cursor-pointer flex items-center h-10 text-sm bg-black hover:bg-white hover:text-black border border-black text-white font-bold py-2 px-4 duration-200 transition-colors">
              <ArrowLeftOutlined />
              <span className="ml-2">{nextPost.title}</span>
            </div>
          </Link>}
      </div>
      <div style={{ marginTop: 2 }}>
        {prevPost && 
          <Link as={`/posts/${prevPost.slug}`} href="/posts/[slug]">
            <div className="whitespace-nowrap cursor-pointer flex items-center h-10 text-sm bg-black hover:bg-white hover:text-black border border-black text-white font-bold py-2 px-4 duration-200 transition-colors">
              <span className="mr-2">{prevPost.title}</span>
              <ArrowRightOutlined />
            </div>
          </Link>}
      </div>
    </section>
  )
}