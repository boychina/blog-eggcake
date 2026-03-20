import { FloatButton } from 'antd';
import Alert from "./Alert";
import Header from "./Header";
import Footer from "./Footer";
import Meta from "./Meta";

export default function Layout({
  preview,
  children,
  hideHeader = false,
  hideFooter = false,
  backTop = true,
}) {
  return (
    <>
      <Meta />
      <div className="min-h-screen">
        {/* <Alert preview={preview} /> */}
        {!hideHeader && <Header />}
        <main className={hideHeader ? "" : "md:pt-20"}>{children}</main>
        {backTop && <FloatButton.BackTop />}
      </div>
      {!hideFooter && <Footer />}
    </>
  );
}
