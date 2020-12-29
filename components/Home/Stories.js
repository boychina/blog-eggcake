import PostItem from "./PostItem";
import PageTurn from "./PageTurn";

export default function Stories({ posts, current, totalPage }) {
  return (
    <section>
      <div className="mb-8">
        {posts.map(post => (
          <PostItem
            key={post.slug}
            title={post.title}
            coverImage={post.coverImage}
            date={post.date}
            author={post.author}
            slug={post.slug}
            excerpt={post.excerpt}
            />
        ))}
      </div>
      <PageTurn current={current} totalPage={totalPage}/>
    </section>
  );
}
