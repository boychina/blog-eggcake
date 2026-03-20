import { FloatButton } from "antd";
import type { ReactNode } from "react";
import Footer from "./Footer";
import Header from "./Header";
import Meta from "./Meta";

interface LayoutProps {
  preview?: boolean;
  children: ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
  backTop?: boolean;
}

export default function Layout({
  children,
  hideHeader = false,
  hideFooter = false,
  backTop = true,
}: LayoutProps) {
  return (
    <>
      <Meta />
      <div className="min-h-screen">
        {!hideHeader && <Header />}
        <main className={hideHeader ? "" : "md:pt-20"}>{children}</main>
        {backTop && <FloatButton.BackTop />}
      </div>
      {!hideFooter && <Footer />}
    </>
  );
}
