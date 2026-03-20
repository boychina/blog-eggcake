import type { GetStaticPaths, GetStaticProps } from "next";
import Content from "@/components/Home/Content";
import { getAllPosts, getPageIndexes, getPostsByPageIndex, getTagsMap } from "@/lib/api";
import type { PostRecord, TagsMap } from "@/types/post";

interface PagingPageProps {
  allPosts: PostRecord[];
  postsByPageIndex: PostRecord[];
  current: number;
  totalPage: number;
  tags: TagsMap;
}

export default function Paging({
  allPosts,
  postsByPageIndex,
  current,
  totalPage,
  tags,
}: PagingPageProps) {
  return (
    <Content
      allPosts={allPosts}
      postsByPageIndex={postsByPageIndex}
      current={current}
      totalPage={totalPage}
      tags={tags}
    />
  );
}

export const getStaticProps: GetStaticProps<PagingPageProps> = async ({ params }) => {
  const current = Number(params?.current ?? 1);
  const allPosts = getAllPosts(["title", "date", "slug", "author"]);
  const pageIndexes = getPageIndexes();
  const postsByPageIndex = getPostsByPageIndex(current, ["title", "date", "slug", "author", "coverImage", "excerpt"]);
  const tags = getTagsMap();
  return {
    props: {
      allPosts,
      postsByPageIndex,
      current,
      totalPage: pageIndexes.length,
      tags,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const pageIndexes = getPageIndexes();
  return {
    paths: pageIndexes.map((index) => ({
      params: {
        current: `${index}`,
      },
    })),
    fallback: false,
  };
};
