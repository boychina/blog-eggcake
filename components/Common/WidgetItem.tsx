import Link from "next/link";
import { SendOutlined } from "@ant-design/icons";
import DateFormatter from "../Common/DateFormatter";
import styles from "./WidgetItem.module.css";
import type { PostRecord } from "@/types/post";

interface WidgetItemProps {
  title: string;
  data: PostRecord[];
  scrollable?: boolean;
}

export default function WidgetItem({ title, data, scrollable = false }: WidgetItemProps) {
  return (
    <div className={`${styles.widgetItem} md:max-w-xs`}>
      <div className="flex items-center" style={{ padding: "12px 0" }}>
        <SendOutlined />
        <span className="ml-1">{title}</span>
      </div>
      <div className={scrollable ? styles.scrollableList : ""}>
        {data.map((item) => (
          <div className="flex-wrap border-b border-gray-100" style={{ padding: "8px 4px" }} key={String(item.slug)}>
            <div className="block truncate">
              <Link href={`/posts/${item.slug as string}`}>
                {String(item.title ?? "")}
              </Link>
            </div>
            <div className="text-gray-500 w-full text-right">
              --
              <DateFormatter dateString={String(item.date ?? "")} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
