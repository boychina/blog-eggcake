// // 弃用
// import React, { useEffect } from "react";
// import Avatar from "../Common/Avatar";
// import DateFormatter from "../Common/DateFormatter";
// import CoverImage from "../Common/CoverImage";
// import Link from "next/link";

// export default function PostPreview({
//   title,
//   coverImage,
//   date,
//   excerpt,
//   author,
//   slug
// }) {
//   return (
//     <div>
//       <div className="mb-5">
//         <CoverImage slug={slug} title={title} src={coverImage} />
//       </div>
//       <h3 className="text-xl mb-2 leading-snug">
//         <Link as={`/posts/${slug}`} href="/posts/[slug]">
//           <a className="hover:underline">{title}</a>
//         </Link>
//       </h3>
//       <div className="text-sm mb-2">
//         <DateFormatter dateString={date} />
//       </div>
//       <p className="text-base leading-relaxed mb-2">{excerpt}</p>
//       <Avatar name={author.name} picture={author.picture} />
//     </div>
//   );
// }
