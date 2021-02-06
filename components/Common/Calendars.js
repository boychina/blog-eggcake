import Router from "next/router";
import { Calendar, Button, Row, Col } from "antd";
import * as dayjs from "dayjs";
import { SendOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
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
          headerRender={({ value, onChange }) => {
            return (
              <div style={{ padding: 8 }}>
                <Row gutter={8} justify="space-between" align="middle">
                  <Col>
                    <Button
                      onClick={() => {
                        const newValue = value.clone();
                        newValue.month(value.get('month') - 1);
                        onChange(newValue);
                      }}
                      type="link"
                      size="small"
                      icon={<LeftOutlined />}
                      style={{ display: "flex" }}
                      className="justify-center items-center"
                    />
                  </Col>
                  <Col>
                    <span>{dayjs(value).format("YYYY年MM月")}</span>
                  </Col>
                  <Col>
                    <Button
                      onClick={() => {
                        const newValue = value.clone();
                        newValue.month(value.get('month') + 1);
                        onChange(newValue);
                      }}
                      type="link"
                      size="small"
                      icon={<RightOutlined />}
                      style={{ display: "flex" }}
                      className="justify-center items-center"
                    />
                  </Col>
                </Row>
              </div>
            );
          }}
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
