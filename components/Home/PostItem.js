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
  const rowClass = isReverse
    ? "grid gap-8 md:grid-cols-[minmax(0,1fr)_320px] md:items-center"
    : "grid gap-8 md:grid-cols-[320px_minmax(0,1fr)] md:items-center";
  const imageBlock = (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden bg-[#e5e7eb] rounded-md">
        <img
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          src={coverImage}
          alt={title}
          width="960"
          height="480"
        />
      </div>
    </div>
  );
  const textBlock = (
    <div>
      <div className="mb-3 flex items-center gap-5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#0f4d6f]">
        <span>/ {tag?.split(",")[0] || "ARCHITECTURE"}</span>
        <span className="text-[#64748b]">{dayjs(date).format("MMM DD, YYYY").toUpperCase()}</span>
      </div>
      <h3 className="text-[20px] font-black leading-[1.3] tracking-tight text-[#0f172a] transition-colors duration-300 group-hover:text-[#2563eb]">
        {title}
      </h3>
      <p className="mt-3 line-clamp-2 text-[14px] leading-[1.6] text-[#64748b]">{excerpt}</p>
      <div className="mt-4 flex items-center gap-3">
        <img
          src={author.picture}
          className="h-8 w-8 rounded-full object-cover"
          alt={author.name}
        />
        <span className="text-[14px] font-bold text-[#0f172a]">{author.name}</span>
      </div>
    </div>
  );

  return (
    <Link as={`/posts/${slug}`} href="/posts/[slug]" className="block group">
      <section className="py-10 border-b border-[#f1f5f9] last:border-0">
        <div className={rowClass}>
          {isReverse ? textBlock : imageBlock}
          {isReverse ? imageBlock : textBlock}
        </div>
      </section>
    </Link>
  );
}
