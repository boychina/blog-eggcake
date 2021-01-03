import { getAllPosts, getPageIndexes, getPostsByPageIndex } from "@/lib/api";
import Content from "@/components/Home/Content";

export default function Paging({
  allPosts,
  postsByPageIndex,
  current,
  totalPage,
}) {
  return (
    <Content
      allPosts={allPosts}
      postsByPageIndex={postsByPageIndex}
      current={current}
      totalPage={totalPage}
    />
  );
}

export async function getStaticProps({ params }) {
  const postsByPageIndex = getPostsByPageIndex(params.current, [
    "title",
    "date",
    "slug",
  ]);
  const pageIndexes = getPageIndexes();
  const allPosts = getAllPosts([
    "title",
    "date",
    "slug",
    "author",
    "coverImage",
    "excerpt",
  ]);
  return {
    props: {
      allPosts,
      postsByPageIndex,
      current: params.current,
      totalPage: pageIndexes.length,
    },
  };
}

export async function getStaticPaths() {
  const pageIndexes = getPageIndexes();

  const result = {
    paths: pageIndexes.map((index) => {
      return {
        params: {
          current: `${index}`,
        },
      };
    }),
    fallback: false,
  };
  return result;
}
