import { useRouter } from "next/router";
import ErrorPage from "next/error";
import Layout from "@/components/Layout";
import Container from "@/components/Layout/Container";
import Header from "@/components/Layout/Header";
import Wrapper from "@/components/Layout/Wrapper";
import Widget from "@/components/Layout/Widget";
import PostHeader from "@/components/Post/PostHeader";
import PostBody from "@/components/Post/PostBody";
import PostTitle from "@/components/Post/PostTitle";
import { getPostBySlug, getAllPosts } from "@/lib/api";
import { CMS_NAME } from "@/lib/constants";
import markdownToHtml from "@/lib/markdownToHtml";
import Head from "next/head";

export default function Post({ post, allPosts, preview }) {
  const router = useRouter();
  if (!router.isFallback && !post ?.slug) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <Layout preview={preview}>
      <Head>
        <title>
          {post.title} | Next.js Blog Example with {CMS_NAME}
        </title>
        <meta property="og:image" content={post.ogImage.url} />
      </Head>
      <Container>
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <Wrapper>
              <Header />
              <PostHeader
                title={post.title}
                coverImage={post.coverImage}
                date={post.date}
                author={post.author}
                />
              <PostBody content={post.content} />
            </Wrapper>
            <div className="pt-40"><Widget allPosts={allPosts} /></div>
          </>
        )}
      </Container>
    </Layout>
  );
}

export async function getStaticProps({ params }) {
  if (!params.slug.includes(".DS_Store")) {
    const allPosts = getAllPosts([
      "title",
      "date",
      "slug",
      "author",
      "coverImage",
      "excerpt",
    ]);
    const post = getPostBySlug(params.slug, [
      "title",
      "date",
      "slug",
      "author",
      "content",
      "ogImage",
      "coverImage",
    ]);
    const content = await markdownToHtml(post.content || "");
    return {
      props: {
        allPosts,
        post: {
          ...post,
          content,
        },
      },
    };
  }
}

export async function getStaticPaths() {
  const posts = getAllPosts(["slug"]);
  return {
    paths: posts.map((post) => {
      return {
        params: {
          slug: post.slug,
        },
      };
    }),
    fallback: false,
  };
}
