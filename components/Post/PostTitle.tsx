import type { ReactNode } from "react";

interface PostTitleProps {
  children: ReactNode;
}

export default function PostTitle({ children }: PostTitleProps) {
  return (
    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter leading-tight md:leading-none mb-4 text-center md:text-left">
      {children}
    </h1>
  );
}
