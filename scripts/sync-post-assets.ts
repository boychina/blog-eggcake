import fs from "node:fs";
import path from "node:path";
import { getPostAssetKey } from "@/lib/postAssets";

const ROOT_DIR = process.cwd();
const POSTS_DIR = path.join(ROOT_DIR, "_posts");
const PUBLIC_POST_ASSETS_DIR = path.join(ROOT_DIR, "public", "assets", "posts");

function walk(dirPath: string): string[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files: string[] = [];
  entries.forEach((entry) => {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      return;
    }
    files.push(fullPath);
  });
  return files;
}

function removeDirIfExists(dirPath: string) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyDir(sourceDir: string, targetDir: string) {
  const files = walk(sourceDir);
  files.forEach((filePath) => {
    const relativePath = path.relative(sourceDir, filePath);
    const targetPath = path.join(targetDir, relativePath);
    ensureDir(path.dirname(targetPath));
    fs.copyFileSync(filePath, targetPath);
  });
}

function findPostAssetDirs(dirPath: string): string[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const dirs: string[] = [];
  entries.forEach((entry) => {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.endsWith(".assets")) {
        dirs.push(fullPath);
        return;
      }
      dirs.push(...findPostAssetDirs(fullPath));
    }
  });
  return dirs;
}

function postSlugFromAssetDir(assetDirPath: string): string {
  const relativePath = path.relative(POSTS_DIR, assetDirPath).replace(/\\/g, "/");
  return relativePath.replace(/\.assets$/, "");
}

function main() {
  ensureDir(path.dirname(PUBLIC_POST_ASSETS_DIR));
  removeDirIfExists(PUBLIC_POST_ASSETS_DIR);
  ensureDir(PUBLIC_POST_ASSETS_DIR);

  const postAssetDirs = findPostAssetDirs(POSTS_DIR);
  let copyCount = 0;

  postAssetDirs.forEach((assetDirPath) => {
    const postSlug = postSlugFromAssetDir(assetDirPath);
    const assetKey = getPostAssetKey(postSlug);
    const targetDir = path.join(PUBLIC_POST_ASSETS_DIR, assetKey);
    copyDir(assetDirPath, targetDir);
    copyCount += 1;
  });

  console.log(`Synced ${copyCount} post asset directories to public/assets/posts.`);
}

main();
