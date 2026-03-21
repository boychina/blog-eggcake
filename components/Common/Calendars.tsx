import Router from "next/router";
import { Calendar, Col, Row } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { LeftOutlined, RightOutlined, SendOutlined } from "@ant-design/icons";
import { DATE_FORMAT } from "@/config";
import styles from "./Calendars.module.css";
import type { PostRecord } from "@/types/post";

interface CalendarsProps {
  title?: string;
  allPosts: PostRecord[];
}

export default function Calendars({ title, allPosts }: CalendarsProps) {
  const onPanelChange = () => {
    return undefined;
  };

  return (
    <div className={styles.calendars}>
      {title ? (
        <div className="flex items-center" style={{ padding: "12px 0" }}>
          <SendOutlined />
          <span className="ml-1">{title}</span>
        </div>
      ) : null}
      <div
        style={{ width: 320, border: "1px solid #f0f0f0", borderRadius: "2px" }}
        className="mx-auto md:m-0"
      >
        <Calendar
          fullscreen={false}
          onPanelChange={onPanelChange}
          headerRender={({ value, onChange }: { value: Dayjs; onChange: (value: Dayjs) => void }) => (
            <div style={{ padding: 8 }}>
              <Row gutter={8} justify="space-between" align="middle">
                <Col>
                  <a
                    onClick={() => {
                      const newValue = value.clone();
                      onChange(newValue.month(value.get("month") - 1));
                    }}
                    className="flex justify-center items-center px-2"
                  >
                    <LeftOutlined />
                  </a>
                </Col>
                <Col>
                  <span>{dayjs(value).format("YYYY年MM月")}</span>
                </Col>
                <Col>
                  <a
                    onClick={() => {
                      const newValue = value.clone();
                      onChange(newValue.month(value.get("month") + 1));
                    }}
                    className="flex justify-center items-center px-2"
                  >
                    <RightOutlined />
                  </a>
                </Col>
              </Row>
            </div>
          )}
          disabledDate={(current) =>
            !allPosts.find((post) => dayjs(String(post.date ?? "")).isSame(current, "days"))
          }
          onSelect={(date) => {
            if (allPosts.find((post) => dayjs(String(post.date ?? "")).isSame(date, "days"))) {
              Router.push({ pathname: "/date/[date]" }, `/date/${date.format(DATE_FORMAT)}`);
            }
          }}
        />
      </div>
    </div>
  );
}
