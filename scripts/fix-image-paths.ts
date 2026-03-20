import fs from "node:fs";
import path from "node:path";

const POSTS_DIR = path.join(__dirname, "..", "_posts");

function fixInlineImagePaths() {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  files.forEach((file) => {
    const slug = file.replace(/\.md$/, "");
    const fullPath = path.join(POSTS_DIR, file);
    let content = fs.readFileSync(fullPath, "utf8");

    content = content.replace(/https?:\/\/assets\.eggcake\.cn\/context\/([^\s)"']+)/gi, (_, rest: string) => `/assets/blog/context/${rest}`);

    content = content.replace(/https?:\/\/assets\.eggcake\.cn\/(?!cover\/)([\w\-+&.%@?=()]+\.(?:png|jpg|jpeg|gif))/gi, (_, filename: string) => {
      return `/assets/blog/context/${slug}/${filename}`;
    });

    fs.writeFileSync(fullPath, content, "utf8");
    console.log(`Updated inline images in: ${file}`);
  });
}

fixInlineImagePaths();
