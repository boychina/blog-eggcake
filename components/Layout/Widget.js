import dynamic from 'next/dynamic';
import WidgetItem from '../Common/WidgetItem';
// import WordCloud from '../Common/WordCloud';

// const WordCloud = dynamic(() => import('../Common/WordCloud'));

export default function Widget({ allPosts, keywords }) {
  return (
    <div className="col-span-12 md:col-span-2 lg:col-span-3 xl:col-span-4">
      <WidgetItem title="最近更新" data={allPosts.slice(0, 5)} />
      <WidgetItem title="更多" data={allPosts.slice(5)} />
      {/* <WordCloud /> */}
    </div>
  );
}
