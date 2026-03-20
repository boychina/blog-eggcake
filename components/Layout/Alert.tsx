import cn from "classnames";

interface AlertProps {
  preview?: boolean;
}

export default function Alert({ preview }: AlertProps) {
  return (
    <div
      className={cn("border-b", {
        "bg-accent-7 border-accent-7 text-white": preview,
        "bg-accent-1 border-accent-2": !preview,
      })}
    >
      <div className="mx-auto">
        <div className="py-2 text-center text-sm">
          {preview ? (
            <>
              This page is a preview.{" "}
              <a
                href="/api/exit-preview"
                className="underline hover:text-cyan duration-200 transition-colors"
                target="_blank"
                rel="noreferrer"
              >
                Click here
              </a>{" "}
              to exit preview mode.
            </>
          ) : (
            <>
              The source code for this blog is{" "}
              <a
                href="https://github.com/boychina/blog-eggcake"
                className="underline hover:text-success duration-200 transition-colors"
                target="_blank"
                rel="noreferrer"
              >
                available on GitHub
              </a>
              .
            </>
          )}
        </div>
      </div>
    </div>
  );
}
