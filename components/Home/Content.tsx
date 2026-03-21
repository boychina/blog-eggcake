import Head from "next/head";
import Container from "@/components/Layout/Container";
import Wrapper from "@/components/Layout/Wrapper";
import Widget from "@/components/Layout/Widget";
import Layout from "@/components/Layout";
import Stories from "./Stories";
import type { PostRecord, TagsMap } from "@/types/post";

interface ContentProps {
  allPosts: PostRecord[];
  postsByPageIndex: PostRecord[];
  feedPosts?: PostRecord[];
  current: number;
  totalPage: number;
  tags: TagsMap;
  enableInfiniteScroll?: boolean;
}

export default function Content({
  allPosts,
  postsByPageIndex,
  feedPosts,
  current,
  totalPage,
  tags,
  enableInfiniteScroll = false,
}: ContentProps) {
  return (
    <Layout>
      <Head>
        <title>蛋烘糕的学习笔记</title>
      </Head>
      <Container>
        <Wrapper>
          <Stories
            posts={postsByPageIndex}
            feedPosts={feedPosts}
            current={current}
            totalPage={totalPage}
            enableInfiniteScroll={enableInfiniteScroll}
          />
        </Wrapper>
        <Widget allPosts={allPosts} tags={tags} />
      </Container>
    </Layout>
  );
}
