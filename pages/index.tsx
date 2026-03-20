import type { GetStaticProps } from "next";
import Content from "@/components/Home/Content";
import { getAllPosts, getPageIndexes, getPostsByPageIndex, getTagsMap } from "@/lib/api";
import type { PostRecord, TagsMap } from "@/types/post";

interface HomePageProps {
  allPosts: PostRecord[];
  postsByPageIndex: PostRecord[];
  totalPage: number;
  tags: TagsMap;
}

export default function Index({ allPosts, postsByPageIndex, totalPage, tags }: HomePageProps) {
  return (
    <Content
      allPosts={allPosts}
      postsByPageIndex={postsByPageIndex}
      current={1}
      totalPage={totalPage}
      tags={tags}
    />
  );
}

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  const allPosts = getAllPosts(["title", "date", "slug", "author"]);
  const pageIndexes = getPageIndexes();
  const postsByPageIndex = getPostsByPageIndex(1, ["title", "date", "slug", "author", "tag", "coverImage", "excerpt"]);
  const tags = getTagsMap();
  return {
    props: { allPosts, postsByPageIndex, totalPage: pageIndexes.length, tags },
  };
};
