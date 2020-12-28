import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function CoverImage({ title, src, slug }) {
  const image = (
    <img
      src={src}
      alt={`Cover Image for ${title}`}
      className="h-64 rounded-xl mx-auto"
    />
  );
  return (
    <div className="sm:mx-0">
      {slug ? (
        <Link as={`/posts/${slug}`} href="/posts/[slug]">
          <a aria-label={title}>{image}</a>
        </Link>
      ) : (
        image
      )}
    </div>
  );
}
