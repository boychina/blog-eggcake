import Link from "next/link";
import { Col, Row } from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import type { PrevNextPost } from "@/types/post";

interface PrevNextBtnsProps {
  prevNextPost: PrevNextPost;
}

export default function PrevNextBtns({ prevNextPost }: PrevNextBtnsProps) {
  const { prevPost, nextPost } = prevNextPost;

  return (
    <Row className="flex justify-between my-8" gutter={12}>
      <Col span={12}>
        {prevPost && (
          <Link href={`/posts/${String(prevPost.slug)}`}>
            <div className="cursor-pointer flex items-center h-full text-sm bg-black hover:bg-white hover:text-black border border-black text-white font-bold py-2 px-4 duration-200 transition-colors">
              <ArrowLeftOutlined />
              <span className="ml-2">{String(prevPost.title ?? "")}</span>
            </div>
          </Link>
        )}
      </Col>
      <Col span={12}>
        {nextPost && (
          <Link href={`/posts/${String(nextPost.slug)}`}>
            <div className="cursor-pointer flex items-center h-full text-sm bg-black hover:bg-white hover:text-black border border-black text-white font-bold py-2 px-4 duration-200 transition-colors justify-between">
              <span className="mr-2">{String(nextPost.title ?? "")}</span>
              <ArrowRightOutlined />
            </div>
          </Link>
        )}
      </Col>
    </Row>
  );
}
