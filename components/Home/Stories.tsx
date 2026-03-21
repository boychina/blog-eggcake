import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_PAGE_SIZE } from "@/config/constant";
import type { PostRecord } from "@/types/post";
import PostItem from "./PostItem";

interface StoriesProps {
  posts: PostRecord[];
  feedPosts?: PostRecord[];
  current: number;
  totalPage: number;
  enableInfiniteScroll?: boolean;
}

export default function Stories({
  posts,
  feedPosts,
  current,
  totalPage,
  enableInfiniteScroll = false,
}: StoriesProps) {
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const sourcePosts = useMemo(() => {
    return feedPosts && feedPosts.length > 0 ? feedPosts : posts;
  }, [feedPosts, posts]);
  const shouldUseInfiniteScroll = enableInfiniteScroll && current === 1 && totalPage > 1;
  const initialVisibleCount = shouldUseInfiniteScroll ? posts.length : sourcePosts.length;
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);

  useEffect(() => {
    setVisibleCount(initialVisibleCount);
  }, [initialVisibleCount]);

  const hasMore = shouldUseInfiniteScroll && visibleCount < sourcePosts.length;
  const visiblePosts = shouldUseInfiniteScroll ? sourcePosts.slice(0, visibleCount) : posts;

  const loadMore = useCallback(() => {
    if (!hasMore) return;
    setVisibleCount((prev) => Math.min(prev + DEFAULT_PAGE_SIZE, sourcePosts.length));
  }, [hasMore, sourcePosts.length]);

  useEffect(() => {
    if (!hasMore) return;
    const target = loaderRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <section>
      <div className="mb-8">
        {visiblePosts.map((post) => (
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
      {shouldUseInfiniteScroll ? (
        <div className="my-12 flex items-center justify-center">
          {hasMore ? (
            <div ref={loaderRef} className="px-6 py-3 text-sm font-semibold text-[#64748b]">
              正在加载更多文章...
            </div>
          ) : (
            <div className="px-6 py-3 text-sm font-semibold text-[#94a3b8]">
              没有更多文章了
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
