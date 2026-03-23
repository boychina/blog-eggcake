import { useEffect, useRef } from "react";
import "github-markdown-css";
import styles from "./PostBody.module.css";

interface PostBodyProps {
  content: string;
}

type MermaidWindow = Window & {
  mermaid?: {
    initialize: (options: Record<string, unknown>) => void;
    run: (options: { nodes: Element[] }) => Promise<void>;
  };
  __mermaidLoading__?: Promise<MermaidWindow["mermaid"]>;
};

async function loadMermaidScript(): Promise<MermaidWindow["mermaid"]> {
  if (typeof window === "undefined") {
    return undefined;
  }
  const w = window as MermaidWindow;
  if (w.mermaid) {
    return w.mermaid;
  }
  if (w.__mermaidLoading__) {
    return w.__mermaidLoading__;
  }
  w.__mermaidLoading__ = new Promise((resolve, reject) => {
    const existing = document.getElementById("mermaid-cdn-script") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(w.mermaid));
      existing.addEventListener("error", () => reject(new Error("加载 mermaid 脚本失败")));
      return;
    }
    const script = document.createElement("script");
    script.id = "mermaid-cdn-script";
    script.src = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";
    script.async = true;
    script.onload = () => resolve(w.mermaid);
    script.onerror = () => reject(new Error("加载 mermaid 脚本失败"));
    document.body.appendChild(script);
  });
  return w.__mermaidLoading__;
}

export default function PostBody({ content }: PostBodyProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    const renderMermaid = async () => {
      try {
        const mermaid = await loadMermaidScript();
        if (!mermaid || disposed) {
          return;
        }
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
        });
        const container = contentRef.current;
        if (!container) {
          return;
        }
        const nodes = Array.from(container.querySelectorAll("pre.mermaid"));
        if (!nodes.length) {
          return;
        }
        await mermaid.run({ nodes });
      } catch {
        return;
      }
    };
    void renderMermaid();
    return () => {
      disposed = true;
    };
  }, [content]);

  return (
    <div className={`markdown-body ${styles.markdownBody}`}>
      <div
        ref={contentRef}
        className={styles.markdown}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
