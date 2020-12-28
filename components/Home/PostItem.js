import DateFormatter from "../Common/DateFormatter";
import Link from "next/link";

export default function HeroPost({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
}) {
  return (
    <section className="md:flex bg-gray-100 md:rounded-xl p-8 md:p-0 mb-4">
      <img
        className="w-64 h-64 md:h-auto rounded-xl md:rounded-l-xl md:rounded-r-none mx-auto"
        src={coverImage}
        alt={title}
        width="384"
        height="512"
      />
      <div className="pt-6 md:p-8 text-center md:text-left space-y-4 flex-auto">
        <blockquote>
          <p className="text-lg font-semibold">
            <Link as={`/posts/${slug}`} href="/posts/[slug]">
              {title}
            </Link>
          </p>
        </blockquote>
        <figcaption className="font-medium">
          <div className="flex items-center">
            <img
              src={author.picture}
              className="w-8 h-8 rounded-full mr-2"
              alt={author.name}
            />
            <div className="text-gray-800">{author.name}</div>
            <span className="ml-1 text-gray-500">
              <DateFormatter dateString={date} />
            </span>
          </div>
          <div className="text-gray-500">{excerpt}</div>
        </figcaption>
      </div>
    </section>
  );
}
