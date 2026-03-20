import type { GetStaticPaths, GetStaticProps } from "next";
import Content from "@/components/Home/Content";
import { getAllPosts, getDatesMap, getPostsByDate, getTagsMap } from "@/lib/api";
import type { PostRecord, TagsMap } from "@/types/post";

interface DatePageProps {
  allPosts: PostRecord[];
  postsByDate: PostRecord[];
  tags: TagsMap;
}

export default function DatePost({ allPosts, postsByDate, tags }: DatePageProps) {
  return (
    <Content
      allPosts={allPosts}
      postsByPageIndex={postsByDate}
      current={1}
      totalPage={1}
      tags={tags}
    />
  );
}

export const getStaticProps: GetStaticProps<DatePageProps> = async ({ params }) => {
  const allPosts = getAllPosts(["title", "date", "slug", "author"]);
  const postsByDate = getPostsByDate(String(params?.date ?? ""), [
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
    props: { allPosts, postsByDate, tags },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const dates = getDatesMap();
  return {
    paths: Object.keys(dates).map((date) => ({
      params: { date },
    })),
    fallback: false,
  };
};
