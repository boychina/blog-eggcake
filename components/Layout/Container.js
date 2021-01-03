export default function Container({ children }) {
  return <div className="container max-w-screen-xl mx-auto px-5 grid grid-cols-12 gap-2 md:gap-4 lg:gap-6 xl:gap-8">{children}</div>;
}
