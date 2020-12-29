import Container from "@/components/Layout/Container";
import Wrapper from "@/components/Layout/Wrapper";
import Widget from "@/components/Layout/Widget";
import Stories from "@/components/Home/Stories";
import Intro from "@/components/Common/Intro";
import Layout from "@/components/Layout";
import { getAllPosts, getPageIndexes, getPostsByPageIndex } from "@/lib/api";
import Head from "next/head";

export default function Index({ allPosts, postsByPageIndex, totalPage }) {
  return (
    <Layout>
      <Head>
        <title>淡烘糕的学习笔记</title>
      </Head>
      <Intro />
      <Container>
        <Wrapper>
          <Stories posts={postsByPageIndex} current={1} totalPage={totalPage} />
        </Wrapper>
        <Widget allPosts={allPosts} />
      </Container>
    </Layout>
  );
}

export async function getStaticProps() {
  const allPosts = getAllPosts([
    "title",
    "date",
    "slug",
    "author",
    "coverImage",
    "excerpt",
  ]);
  const pageIndexes = getPageIndexes();
  const postsByPageIndex = getPostsByPageIndex(1, [
    "title",
    "date",
    "slug",
    "author",
    "coverImage",
    "excerpt",
  ]);
  return {
    props: { allPosts, postsByPageIndex, totalPage: pageIndexes.length },
  };
}
