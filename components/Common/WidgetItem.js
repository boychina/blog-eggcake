import { List } from 'antd';
import Link from "next/link";
import {
  SendOutlined,
} from '@ant-design/icons';
import DateFormatter from '../Common/DateFormatter';

export default function WidgetItem({ title, data }) {
  return (
    <List
      size="small"
      header={<div className="flex items-center"><SendOutlined /><span className="ml-1">{title}</span></div>}
      dataSource={data}
      renderItem={item => <List.Item className="flex-wrap" style={{ padding: '8px 4px' }}>
        <div className="block truncate">
          <Link as={`/posts/${item.slug}`} href="/posts/[slug]">
            {item.title}
          </Link>
        </div>
        <div className="text-gray-500 w-full text-right">
          --
          <DateFormatter dateString={item.date} />
        </div>
      </List.Item>}
      />
  );
}
