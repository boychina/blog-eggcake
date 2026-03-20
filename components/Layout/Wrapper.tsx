import type { ReactNode } from "react";

interface WrapperProps {
  children: ReactNode;
}

export default function Wrapper({ children }: WrapperProps) {
  return (
    <div className="mb-5 col-span-12 md:col-span-10 lg:col-span-9">
      {children}
    </div>
  );
}
