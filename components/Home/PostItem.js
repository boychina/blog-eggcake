import Link from "next/link";
import dayjs from "dayjs";

export default function HeroPost({
  index,
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
  tag,
}) {
  const isReverse = index % 2 === 1;
  const readMinutes = Math.max(8, Math.round((excerpt?.length || 0) / 7));

  return (
    <Link as={`/posts/${slug}`} href="/posts/[slug]" className="block">
      <section className="rounded-2xl border border-transparent bg-white px-5 py-6 transition hover:border-[#dbe5ef] hover:shadow-sm md:px-6">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div className={isReverse ? "md:order-2" : ""}>
            <div className="relative aspect-[16/8] overflow-hidden rounded-md bg-[#e5e7eb]">
              <img
                className="h-full w-full object-cover"
                src={coverImage}
                alt={title}
                width="960"
                height="480"
              />
            </div>
          </div>
          <div className={isReverse ? "md:order-1" : ""}>
            <div className="mb-4 flex items-center gap-6 text-xs font-bold uppercase tracking-[0.16em] text-[#0f4d6f]">
              <span>/ {tag?.split(",")[0] || "ARCHITECTURE"}</span>
              <span className="text-[#64748b]">{dayjs(date).format("MMM DD, YYYY").toUpperCase()}</span>
            </div>
            <h3 className="text-[36px] font-black leading-[1.08] tracking-tight text-[#0f172a] md:text-[54px]">
              {title}
            </h3>
            <p className="mt-4 line-clamp-2 text-lg leading-8 text-[#334155]">{excerpt}</p>
            <div className="mt-6 flex items-center gap-4">
              <img
                src={author.picture}
                className="h-9 w-9 rounded-full object-cover"
                alt={author.name}
              />
              <span className="text-base font-bold text-[#0f172a]">{author.name}</span>
              <span className="text-sm font-semibold text-[#64748b]">{readMinutes} min read</span>
            </div>
          </div>
        </div>
      </section>
    </Link>
  );
}
