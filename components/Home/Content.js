import Head from "next/head";
import Container from "@/components/Layout/Container";
import Wrapper from "@/components/Layout/Wrapper";
import Widget from "@/components/Layout/Widget";
import Layout from "@/components/Layout";
import Stories from "./Stories";

export default function Content({
  allPosts,
  postsByPageIndex,
  current,
  totalPage,
  tags,
}) {
  return (
    <Layout>
      <Head>
        <title>淡烘糕的学习笔记</title>
      </Head>
      <Container>
        <Wrapper>
          <Stories
            posts={postsByPageIndex}
            current={current}
            totalPage={totalPage}
          />
        </Wrapper>
        <Widget allPosts={allPosts} tags={tags}/>
      </Container>
    </Layout>
  );
}
