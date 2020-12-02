import Avatar from "./avatar";
import DateFormatter from "./date-formatter";
import CoverImage from "./cover-image";
import Link from "next/link";

export default function HeroPost({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug
}) {
  return (
    <section>
      <div className="mb-2 md:mb-4">
        <CoverImage title={title} src={coverImage} slug={slug} />
      </div>
      <div className="mb-8 md:mb-0 md:grid md:grid-cols-2 md:col-gap-8 lg:col-gap-12 mb-14 md:mb-8">
        <div>
          <h3 className="mb-2 text-xl lg:text-2xl leading-tight">
            <Link as={`/posts/${slug}`} href="/posts/[slug]">
              <a className="hover:underline">{title}</a>
            </Link>
          </h3>
          <div className="mb-2 md:mb-0 text-sm">
            <DateFormatter dateString={date} />
          </div>
        </div>
        <div>
          <p className="lg:text-lg leading-relaxed mb-2">{excerpt}</p>
          <Avatar name={author.name} picture={author.picture} />
        </div>
      </div>
    </section>
  );
}
