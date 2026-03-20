import styles from "./PostBody.module.css";
import "github-markdown-css/github-markdown.css";

export default function PostBody({ content }) {
  return (
    <div className="mx-auto markdown-body">
      <div
        className={styles.markdown}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
