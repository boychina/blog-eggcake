import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import ErrorPage from "next/error";
import { useRouter } from "next/router";
import Container from "@/components/Layout/Container";
import Layout from "@/components/Layout";
import Widget from "@/components/Layout/Widget";
import Wrapper from "@/components/Layout/Wrapper";
import PostBody from "@/components/Post/PostBody";
import PostHeader from "@/components/Post/PostHeader";
import PrevNextBtns from "@/components/Post/PrevNextBtns";
import PostTitle from "@/components/Post/PostTitle";
import { getAllPosts, getPostBySlug, getPrevNextPost, getTagsMap } from "@/lib/api";
import markdownToHtml from "@/lib/markdownToHtml";
import type { PostRecord, PrevNextPost, TagsMap } from "@/types/post";

interface PostPageProps {
  post: PostRecord;
  allPosts: PostRecord[];
  prevNextPost: PrevNextPost;
  preview?: boolean;
  tags: TagsMap;
}

export default function Post({ post, allPosts, prevNextPost, preview, tags }: PostPageProps) {
  const router = useRouter();
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <Layout preview={preview}>
      <Head>
        <title>{String(post.title ?? "")} | 蛋烘糕</title>
        <meta property="og:image" content={String(post.ogImage && (post.ogImage as { url: string }).url)} />
        <meta name="description" itemProp="description" content={String(post.description ?? "")} />
        <meta name="keywords" itemProp="keywords" content={String(post.keyword ?? "")}></meta>
      </Head>
      <Container>
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <Wrapper>
              <PostHeader
                title={String(post.title ?? "")}
                coverImage={String(post.coverImage ?? "")}
                date={String(post.date ?? "")}
                author={post.author as { name: string; picture: string }}
              />
              <PostBody content={String(post.content ?? "")} />
              <PrevNextBtns prevNextPost={prevNextPost} />
            </Wrapper>
            <Widget allPosts={allPosts} tags={tags} />
          </>
        )}
      </Container>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<PostPageProps> = async ({ params }) => {
  const slugParam = params?.slug;
  const slug = Array.isArray(slugParam)
    ? slugParam.map((segment) => decodeURIComponent(segment)).join("/")
    : decodeURIComponent(String(slugParam ?? ""));
  const allPosts = getAllPosts(["title", "date", "slug", "author"]);
  const prevNextPost = getPrevNextPost(slug, ["title", "slug"]);
  const post = getPostBySlug(slug, [
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
  const content = await markdownToHtml(String(post.content ?? ""));
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
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = getAllPosts(["slug"]);
  return {
    paths: posts.map((post) => ({
      params: {
        slug: String(post.slug ?? "").split("/"),
      },
    })),
    fallback: false,
  };
};
