export default function Container({ children }) {
  return <div className="container mx-auto px-5 flex justify-center max-w-screen-md flex-wrap">{children}</div>;
}
