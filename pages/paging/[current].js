import { useRouter } from "next/router";
import Container from "@/components/Layout/Container";
import Wrapper from "@/components/Layout/Wrapper";
import Widget from "@/components/Layout/Widget";
import Stories from "@/components/Home/Stories";
import Intro from "@/components/Common/Intro";
import Layout from "@/components/Layout";
import { getAllPosts, getPostBySlug, getPageIndexes, getPostsByPageIndex } from "@/lib/api";
import Head from "next/head";

export default function Paging({ allPosts, postsByPageIndex, current, totalPage }) {
  return (
    <Layout>
      <Head>
        <title>淡烘糕的学习笔记</title>
      </Head>
      <Intro />
      <Container>
        <Wrapper>
          <Stories posts={postsByPageIndex} current={current} totalPage={totalPage} />
        </Wrapper>
        <div className="w-full"><Widget allPosts={allPosts} /></div>
      </Container>
    </Layout>
  );
}

export async function getStaticProps({ params }) {
  const postsByPageIndex = getPostsByPageIndex(params.current, [
    "title",
    "date",
    "slug",
    "author",
    "coverImage",
    "excerpt",
  ]);
  const pageIndexes = getPageIndexes();
  const allPosts = getAllPosts([
    "title",
    "date",
    "slug",
    "author",
    "coverImage",
    "excerpt",
  ]);
  return {
    props: {
      allPosts,
      postsByPageIndex,
      current: params.current,
      totalPage: pageIndexes.length,
    },
  };
}

export async function getStaticPaths() {
  const pageIndexes = getPageIndexes();

  const result = {
    paths: pageIndexes.map((index) => {
      return {
        params: {
          current: `${index}`,
        },
      };
    }),
    fallback: false,
  };
  return result;
}
