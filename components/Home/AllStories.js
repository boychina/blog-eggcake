import PostItem from "./PostItem";

export default function AllStories({ posts }) {
  return (
    <section>
      <div className="mb-32">
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
    </section>
  );
}
