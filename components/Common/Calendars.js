import Router from "next/router";
import { Calendar } from "antd";
import * as dayjs from "dayjs";
import { SendOutlined } from "@ant-design/icons";
import { DATE_FORMAT } from "@/config";

export default function Calendars({ title, allPosts }) {
  const onPanelChange = (value, mode) => {
    console.log(value, mode);
  };
  return (
    <div>
      <div className="flex items-center" style={{ padding: "12px 0" }}>
        <SendOutlined />
        <span className="ml-1">{title}</span>
      </div>
      <div
        style={{ width: 320, border: "1px solid #f0f0f0", borderRadius: "2px" }}
        className="mx-auto md:m-0"
      >
        <Calendar
          fullscreen={false}
          onPanelChange={onPanelChange}
          disabledDate={(current) =>
            !allPosts.find((post) => dayjs(post.date).isSame(current, "days"))
          }
          onSelect={(date) => {
            if (
              allPosts.find((post) => dayjs(post.date).isSame(date, "days"))
            ) {
              Router.push(
                { pathname: "/date/[date]" },
                `/date/${date.format(DATE_FORMAT)}`
              );
            }
          }}
        />
      </div>
    </div>
  );
}
