import WidgetItem from '../Common/WidgetItem';
export default function Widget({ allPosts }) {
  return (
    <div className="flex-1 w-48 ml-4">
      <WidgetItem title="最近更新" data={allPosts.slice(0, 5)} />
      <WidgetItem title="更多" data={allPosts.slice(5)} />
    </div>
  );
}
