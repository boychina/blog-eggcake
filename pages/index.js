import { getAllPosts, getPageIndexes, getPostsByPageIndex } from "@/lib/api";
import Content from "@/components/Home/Content";

export default function Index({ allPosts, postsByPageIndex, totalPage }) {
  return (
    <Content
      allPosts={allPosts}
      postsByPageIndex={postsByPageIndex}
      current={1}
      totalPage={totalPage}
    />
  );
}

export async function getStaticProps() {
  const allPosts = getAllPosts([
    "title",
    "date",
    "slug",
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
  return {
    props: { allPosts, postsByPageIndex, totalPage: pageIndexes.length },
  };
}
