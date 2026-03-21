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
  current: number;
  totalPage: number;
  tags: TagsMap;
}

export default function Content({
  allPosts,
  postsByPageIndex,
  current,
  totalPage,
  tags,
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
            current={current}
            totalPage={totalPage}
          />
        </Wrapper>
        <Widget allPosts={allPosts} tags={tags} />
      </Container>
    </Layout>
  );
}
