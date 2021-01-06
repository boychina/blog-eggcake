import ReactWordcloud from '../Common/ReactWordcloud';;
import WidgetItem from '../Common/WidgetItem';

export default function Widget({ allPosts, keywords }) {
  return (
    <div className="col-span-12 md:col-span-2 lg:col-span-3 xl:col-span-4">
      <WidgetItem title="最近更新" data={allPosts.slice(0, 5)} />
      <WidgetItem title="更多" data={allPosts.slice(5)} />
      <ReactWordcloud keywords={keywords} />
    </div>
  );
}
