import PostPreview from '../components/post-preview'

export default function MoreStories({ posts }) {
  return (
    <section>
      <h2 className="mb-4 text-base md:text-lg text-gray-500 tracking-tighter leading-tight">
          更多内容 &gt;&gt;
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 md:col-gap-8 lg:col-gap-12 row-gap-8 md:row-gap-12 mb-32">
        {posts.map((post) => (
          <PostPreview
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
  )
}
