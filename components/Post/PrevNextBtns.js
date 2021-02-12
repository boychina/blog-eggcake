import Link from "next/link";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { Row, Col } from "antd";

export default function PrevNextBtns({ prevNextPost }) {
  const { prevPost, nextPost } = prevNextPost;

  return (
    <Row className="flex justify-between my-8" gutter={12}>
      <Col span={12}>
        {prevPost && (
          <Link as={`/posts/${prevPost.slug}`} href="/posts/[slug]">
            <div className="whitespace-nowrap cursor-pointer flex items-center h-full text-sm bg-black hover:bg-white hover:text-black border border-black text-white font-bold py-2 px-4 duration-200 transition-colors">
              <ArrowLeftOutlined />
              <span className="ml-2">{prevPost.title}</span>
            </div>
          </Link>
        )}
      </Col>
      <Col span={12}>
        {nextPost && (
          <Link as={`/posts/${nextPost.slug}`} href="/posts/[slug]">
            <div className="whitespace-nowrap cursor-pointer flex items-center h-full text-sm bg-black hover:bg-white hover:text-black border border-black text-white font-bold py-2 px-4 duration-200 transition-colors justify-between">
              <span className="mr-2">{nextPost.title}</span>
              <ArrowRightOutlined />
            </div>
          </Link>
        )}
      </Col>
    </Row>
  );
}
