import type { GetStaticPaths, GetStaticProps } from "next";
import Content from "@/components/Home/Content";
import { getAllPosts, getPostsByTag, getTagsMap } from "@/lib/api";
import type { PostRecord, TagsMap } from "@/types/post";

interface TagPageProps {
  allPosts: PostRecord[];
  postsByTag: PostRecord[];
  tags: TagsMap;
}

export default function TagPost({ allPosts, postsByTag, tags }: TagPageProps) {
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

export const getStaticProps: GetStaticProps<TagPageProps> = async ({ params }) => {
  const allPosts = getAllPosts(["title", "date", "slug", "author"]);
  const postsByTag = getPostsByTag(decodeURIComponent(String(params?.tag ?? "")), [
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
    props: { allPosts, postsByTag, tags },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const tags = getTagsMap();
  return {
    paths: Object.keys(tags).map((tag) => ({
      params: { tag: encodeURIComponent(tag) },
    })),
    fallback: false,
  };
};
