import Link from "next/link";
import { Calendar } from "antd";
import { SendOutlined } from "@ant-design/icons";

export default function Calendars({ title }) {
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
        style={{ width: 330, border: "1px solid #f0f0f0", borderRadius: "2px" }}
      >
        <Calendar fullscreen={false} onPanelChange={onPanelChange} />
      </div>
    </div>
  );
}
