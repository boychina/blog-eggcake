import { useRouter } from "next/router";
import ErrorPage from "next/error";
import Layout from "@/components/Layout";
import Container from "@/components/Layout/Container";
import Wrapper from "@/components/Layout/Wrapper";
import Widget from "@/components/Layout/Widget";
import PostHeader from "@/components/Post/PostHeader";
import PostTitle from "@/components/Post/PostTitle";
import PostBody from "@/components/Post/PostBody";
import PrevNextBtns from '@/components/Post/PrevNextBtns';
import { getPostBySlug, getAllPosts, getPrevNextPost, getTagsMap } from "@/lib/api";
import markdownToHtml from "@/lib/markdownToHtml";
import Head from "next/head";

export default function Post({ post, allPosts, prevNextPost, preview, tags }) {
  const router = useRouter();
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <Layout preview={preview}>
      <Head>
        <title>
          {post.title} | 淡烘糕
        </title>
        <meta property="og:image" content={post.ogImage.url} />
        <meta name="description" itemProp="description" content={post.description} />
        <meta name="keywords" itemProp="keywords" content={post.keyword}></meta>
      </Head>
      <Container>
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <Wrapper>
              <PostHeader
                title={post.title}
                coverImage={post.coverImage}
                date={post.date}
                author={post.author}
                />
              <PostBody content={post.content} />
              <PrevNextBtns prevNextPost={prevNextPost} />
            </Wrapper>
            <Widget allPosts={allPosts} tags={tags} />
          </>
        )}
      </Container>
    </Layout>
  );
}

export async function getStaticProps({ params }) {
  const allPosts = getAllPosts([
    "title",
    "date",
    "slug",
    "author",
  ]);
  const prevNextPost = getPrevNextPost(params.slug, ["title", "slug"]);
  const post = getPostBySlug(params.slug, [
    "title",
    "description",
    "keyword",
    "date",
    "slug",
    "author",
    "content",
    "ogImage",
    "coverImage",
  ]);
  const content = await markdownToHtml(post.content || "");
  const tags = getTagsMap();
  return {
    props: {
      allPosts,
      prevNextPost,
      post: {
        ...post,
        content,
      },
      tags,
    },
  };
}

export async function getStaticPaths() {
  const posts = getAllPosts(["slug"]);
  const result = {
    paths: posts.map((post) => {
      return {
        params: {
          slug: post.slug,
        },
      };
    }),
    fallback: false,
  };
  return result;
}
