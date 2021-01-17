import { BackTop } from 'antd';
import Alert from "./Alert";
import Header from "./Header";
import Footer from "./Footer";
import Meta from "./Meta";

export default function Layout({ preview, children }) {
  return (
    <>
      <Meta />
      <div className="min-h-screen">
        {/* <Alert preview={preview} /> */}
        <Header />
        <main className="md:pt-20">{children}</main>
        <BackTop />
      </div>
      <Footer />
    </>
  );
}
