export default function Container({ children }) {
  return <div className="container max-w-screen-xl mx-auto px-5 grid grid-cols-12 gap-4">{children}</div>;
}
