import Link from 'next/link'

export default function Header() {
  return (
    <h2 className="text-base md:text-lg tracking-tight md:tracking-tighter leading-tight mb-4 mt-2">
      <Link href="/">
        <a className="hover:underline">淡烘糕</a>
      </Link>
      .
    </h2>
  )
}
