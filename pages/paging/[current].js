import { getAllPosts, getPageIndexes, getPostsByPageIndex, getTags } from "@/lib/api";
import Content from "@/components/Home/Content";

export default function Paging({
  allPosts,
  postsByPageIndex,
  current,
  totalPage,
  tags,
}) {
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

export async function getStaticProps({ params }) {
  const postsByPageIndex = getPostsByPageIndex(params.current, [
    "title",
    "date",
    "slug",
    "author",
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
  const tags = getTags();
  return {
    props: {
      allPosts,
      postsByPageIndex,
      current: params.current,
      totalPage: pageIndexes.length,
      tags,
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
