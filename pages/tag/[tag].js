import { useRouter } from "next/router";
import { getAllPosts, getTagsMap, getPostsByTag } from "@/lib/api";
import Content from "@/components/Home/Content";

export default function TagPost({ allPosts, postsByTag, tags }) {
  const router = useRouter();
  return (
    <Content
      allPosts={allPosts}
      postsByPageIndex={postsByTag}
      current={1}
      totalPage={1}
      tags={tags}
    />
  );
}

export async function getStaticProps({ params }) {
  const allPosts = getAllPosts([
    "title",
    "date",
    "slug",
    "author",
  ]);
  const postsByTag = getPostsByTag(decodeURIComponent(params.tag), [
    "title",
    "date",
    "tag",
    "slug",
    "author",
    "coverImage",
    "excerpt",
  ]);
  const tags = getTagsMap();
  return {
    props: {
      allPosts,
      postsByTag,
      tags,
    },
  };
}

export async function getStaticPaths() {
  const tags = getTagsMap();
  const result = {
    paths: Object.keys(tags).map((tag) => {
      return {
        params: {
          tag: encodeURIComponent(tag),
        },
      };
    }),
    fallback: false,
  };
  return result;
}
