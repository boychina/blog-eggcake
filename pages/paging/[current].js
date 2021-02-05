import { getAllPosts, getPageIndexes, getPostsByPageIndex, getTagsMap } from "@/lib/api";
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
  const allPosts = getAllPosts([
    "title",
    "date",
    "slug",
    "author",
  ]);
  const pageIndexes = getPageIndexes();
  const postsByPageIndex = getPostsByPageIndex(params.current, [
    "title",
    "date",
    "slug",
    "author",
    "coverImage",
    "excerpt",
  ]);
  const tags = getTagsMap();
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
