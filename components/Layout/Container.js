export default function Container({ children }) {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 grid grid-cols-12 gap-1 md:gap-2 lg:gap-3 xl:gap-4 xxl:gap-5">
      {children}
    </div>
  );
}
