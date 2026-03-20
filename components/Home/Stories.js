import PostItem from "./PostItem";
import PageTurn from "./PageTurn";

export default function Stories({ posts, current, totalPage }) {
  return (
    <section className="space-y-8">
      <div className="space-y-8">
        {posts.map((post, index) => (
          <PostItem
            key={post.slug}
            index={index}
            title={post.title}
            coverImage={post.coverImage}
            date={post.date}
            author={post.author}
            slug={post.slug}
            excerpt={post.excerpt}
            tag={post.tag}
            />
        ))}
      </div>
      <PageTurn current={current} totalPage={totalPage}/>
    </section>
  );
}
