import { getAllPosts, getPageIndexes, getPostsByPageIndex, getTagsMap } from "@/lib/api";
import Content from "@/components/Home/Content";

export default function Index({ allPosts, postsByPageIndex, totalPage, tags }) {
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

export async function getStaticProps() {
  const allPosts = getAllPosts([
    "title",
    "date",
    "slug",
    "author",
  ]);
  const pageIndexes = getPageIndexes();
  const postsByPageIndex = getPostsByPageIndex(1, [
    "title",
    "date",
    "slug",
    "author",
    "coverImage",
    "excerpt",
  ]);
  const tags = getTagsMap();
  return {
    props: { allPosts, postsByPageIndex, totalPage: pageIndexes.length, tags },
  };
}
