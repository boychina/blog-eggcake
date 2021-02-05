import { useRouter } from "next/router";
import { getAllPosts, getTagsMap, getDatesMap, getPostsByDate } from "@/lib/api";
import Content from "@/components/Home/Content";

export default function TagPost({ allPosts, postsByDate, tags }) {
  const router = useRouter();
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

export async function getStaticProps({ params }) {
  const allPosts = getAllPosts([
    "title",
    "date",
    "slug",
    "author",
  ]);
  const postsByDate = getPostsByDate(params.date, [
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
    props: {
      allPosts,
      postsByDate,
      tags,
    },
  };
}

export async function getStaticPaths() {
  const dates = getDatesMap();
  const result = {
    paths: Object.keys(dates).map((date) => {
      return {
        params: {
          date,
        },
      };
    }),
    fallback: false,
  };
  return result;
}
