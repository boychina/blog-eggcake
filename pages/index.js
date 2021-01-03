import { getAllPosts, getPageIndexes, getPostsByPageIndex, getKeywords } from "@/lib/api";
import Content from "@/components/Home/Content";

export default function Index({ allPosts, postsByPageIndex, totalPage, keywords }) {
  return (
    <Content
      allPosts={allPosts}
      postsByPageIndex={postsByPageIndex}
      current={1}
      totalPage={totalPage}
      keywords={keywords}
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
  const keywords = getKeywords();
  return {
    props: { allPosts, postsByPageIndex, totalPage: pageIndexes.length, keywords },
  };
}
