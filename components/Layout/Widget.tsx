import dynamic from "next/dynamic";
import Calendars from "../Common/Calendars";
import WidgetItem from "../Common/WidgetItem";
import type { PostRecord, TagsMap } from "@/types/post";

const WordCloud = dynamic(() => import("../Common/WordCloud"), { ssr: false });

interface WidgetProps {
  allPosts: PostRecord[];
  tags: TagsMap;
}

export default function Widget({ allPosts, tags }: WidgetProps) {
  return (
    <div className="col-span-12 md:col-span-2 lg:col-span-3">
      <WordCloud title="标签" tags={tags} />
      <Calendars title="博客日历" allPosts={allPosts} />
      <WidgetItem title="最近更新" data={allPosts.slice(0, 5)} />
      <WidgetItem title="更多" data={allPosts.slice(5)} />
    </div>
  );
}
