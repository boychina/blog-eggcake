export default function Container({ children }) {
  return <div className="container mx-auto px-5 flex max-w-screen-lg sm:flex-wrap">{children}</div>;
}
