import classNames from "classnames";
import Avatar from "../avatar";
import DateFormatter from "../date-formatter";
import CoverImage from "../cover-image";
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
    <section class="md:flex bg-gray-100 md:rounded-xl p-8 md:p-0 mb-4">
      <img class="w-64 h-64 md:w-94 md:h-auto rounded-xl md:rounded-l-xl md:rounded-r-none mx-auto" src={coverImage} alt={title} width="384" height="512" />
      <div class="pt-6 md:p-8 text-center md:text-left space-y-4 flex-auto">
        <blockquote>
          <p class="text-lg font-semibold">
            <Link as={`/posts/${slug}`} href="/posts/[slug]">
              {title}
            </Link>
          </p>
        </blockquote>
        <figcaption class="font-medium">
          <div className="flex items-center">
            <img src={author.picture} className="w-8 h-8 rounded-full mr-2" alt={author.name} />
            <div class="text-cyan-600">
              {author.name}
            </div>
          </div>
          <div class="text-gray-500">
            {excerpt}
          </div>
        </figcaption>
      </div>
    </section>
  )
};
