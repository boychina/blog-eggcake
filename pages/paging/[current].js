import Container from "@/components/Layout/Container";
import Wrapper from "@/components/Layout/Wrapper";
import Widget from "@/components/Layout/Widget";
import AllStories from "@/components/Home/AllStories";
import Intro from "@/components/Common/Intro";
import Layout from "@/components/Layout";
import { getAllPosts } from "@/lib/api";
import Head from "next/head";

export default function Index({ allPosts }) {
  return (
    <Layout>
      <Head>
        <title>淡烘糕的学习笔记</title>
      </Head>
      <Intro />
      <Container>
        <Wrapper>
          <AllStories posts={allPosts} />
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
  return {
    props: { allPosts },
  };
}

// export async function getStaticPaths() {
//   // const posts = getAllPosts(["current"]);
//   // return {
//   //   paths: posts.map((post) => {
//   //     return {
//   //       params: {
//   //         current: post.current,
//   //       },
//   //     };
//   //   }),
//   //   fallback: false,
//   // };
// }
