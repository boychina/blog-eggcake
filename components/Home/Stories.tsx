import PostItem from "./PostItem";
import PageTurn from "./PageTurn";
import type { PostRecord } from "@/types/post";

interface StoriesProps {
  posts: PostRecord[];
  current: number;
  totalPage: number;
}

export default function Stories({ posts, current, totalPage }: StoriesProps) {
  return (
    <section>
      <div className="mb-8">
        {posts.map((post) => (
          <PostItem
            key={String(post.slug)}
            title={String(post.title ?? "")}
            coverImage={String(post.coverImage ?? "")}
            date={String(post.date ?? "")}
            author={post.author as { name: string; picture: string }}
            slug={String(post.slug ?? "")}
            excerpt={String(post.excerpt ?? "")}
          />
        ))}
      </div>
      <PageTurn current={current} totalPage={totalPage} />
    </section>
  );
}
