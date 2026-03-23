import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { normalizeAssetFileName, toPostAssetPublicPath } from "@/lib/postAssets";

const ROOT_DIR = process.cwd();
const POSTS_DIR = path.join(ROOT_DIR, "_posts");
const PUBLIC_BLOG_DIR = path.join(ROOT_DIR, "public", "assets", "blog");

const LEGACY_BASES = [
  "/assets/blog/context/",
  "/assets/blog/cover/",
  "/assets/blog/authors/",
  "https://assets.eggcake.cn/context/",
  "http://assets.eggcake.cn/context/",
];
const POST_ASSET_BASE = "/assets/posts/";

function walkMarkdownFiles(dirPath: string): string[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files: string[] = [];
  entries.forEach((entry) => {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkMarkdownFiles(fullPath));
      return;
    }
    if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  });
  return files;
}

function postSlugFromFilePath(filePath: string): string {
  return path.relative(POSTS_DIR, filePath).replace(/\\/g, "/").replace(/\.md$/, "");
}

function decodePathForFs(value: string): string {
  return value
    .split("/")
    .map((segment) => decodeURIComponent(segment))
    .join(path.sep);
}

function toPostAssetDir(markdownFilePath: string): string {
  return markdownFilePath.replace(/\.md$/, ".assets");
}

function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyFileIfExists(sourcePath: string, targetPath: string) {
  if (!fs.existsSync(sourcePath)) {
    return;
  }
  ensureDir(path.dirname(targetPath));
  fs.copyFileSync(sourcePath, targetPath);
}

function moveFileIfExists(sourcePath: string, targetPath: string) {
  if (!fs.existsSync(sourcePath)) {
    return;
  }
  ensureDir(path.dirname(targetPath));
  if (!fs.existsSync(targetPath)) {
    fs.renameSync(sourcePath, targetPath);
    return;
  }
  if (path.resolve(sourcePath) !== path.resolve(targetPath)) {
    fs.rmSync(sourcePath, { force: true });
  }
}

function isLegacyAssetUrl(value: string): boolean {
  return LEGACY_BASES.some((base) => value.startsWith(base));
}

function isPostAssetUrl(value: string): boolean {
  return value.startsWith(POST_ASSET_BASE);
}

function toRelativeLegacyAssetPath(url: string): string | null {
  if (url.startsWith("/assets/blog/context/")) {
    return `context/${url.slice("/assets/blog/context/".length)}`;
  }
  if (url.startsWith("https://assets.eggcake.cn/context/")) {
    return `context/${url.slice("https://assets.eggcake.cn/context/".length)}`;
  }
  if (url.startsWith("http://assets.eggcake.cn/context/")) {
    return `context/${url.slice("http://assets.eggcake.cn/context/".length)}`;
  }
  if (url.startsWith("/assets/blog/cover/")) {
    return `cover/${url.slice("/assets/blog/cover/".length)}`;
  }
  if (url.startsWith("/assets/blog/authors/")) {
    return `authors/${url.slice("/assets/blog/authors/".length)}`;
  }
  return null;
}

function migrateAssetUrl(url: string, markdownFilePath: string, postSlug: string): string {
  const assetDir = toPostAssetDir(markdownFilePath);
  const relativeLegacyPath = toRelativeLegacyAssetPath(url);
  if (!relativeLegacyPath) {
    if (!isPostAssetUrl(url)) {
      return url;
    }
    const postAssetPath = url.slice(POST_ASSET_BASE.length);
    const parts = postAssetPath.split("/").filter(Boolean);
    const typeIndex = parts.findIndex((part) => part === "cover" || part === "author" || part === "context");
    if (typeIndex < 0 || typeIndex + 1 >= parts.length) {
      return url;
    }
    const relativeParts = parts.slice(typeIndex);
    const fileName = relativeParts[relativeParts.length - 1];
    const normalizedFileName = normalizeAssetFileName(fileName);
    const targetRelativePath = [...relativeParts.slice(0, -1), normalizedFileName].join("/");
    const sourcePath = path.join(assetDir, ...relativeParts.map((part) => decodeURIComponent(part)));
    const targetPath = path.join(assetDir, ...targetRelativePath.split("/"));
    if (sourcePath !== targetPath) {
      moveFileIfExists(sourcePath, targetPath);
    }
    return toPostAssetPublicPath(postSlug, targetRelativePath);
  }

  const parts = relativeLegacyPath.split("/");
  const type = parts[0];
  const rest = parts.slice(1);
  const decodedRest = decodePathForFs(rest.join("/"));
  const sourcePath = path.join(PUBLIC_BLOG_DIR, type, decodedRest);

  let targetRelativePath = "";
  if (type === "context") {
    targetRelativePath = path.join("context", normalizeAssetFileName(path.basename(decodedRest)));
  } else if (type === "cover") {
    targetRelativePath = path.join("cover", normalizeAssetFileName(path.basename(decodedRest)));
  } else if (type === "authors") {
    targetRelativePath = path.join("author", normalizeAssetFileName(path.basename(decodedRest)));
  } else {
    targetRelativePath = normalizeAssetFileName(path.basename(decodedRest));
  }

  const targetPath = path.join(assetDir, targetRelativePath);
  copyFileIfExists(sourcePath, targetPath);

  return toPostAssetPublicPath(postSlug, targetRelativePath);
}

function collectLegacyUrls(frontmatter: Record<string, unknown>, content: string): string[] {
  const urls = new Set<string>();
  const dataCandidates: string[] = [];

  const coverImage = frontmatter.coverImage;
  if (typeof coverImage === "string") {
    dataCandidates.push(coverImage);
  }
  const ogImage = frontmatter.ogImage;
  if (ogImage && typeof ogImage === "object" && "url" in ogImage) {
    const url = (ogImage as { url?: unknown }).url;
    if (typeof url === "string") {
      dataCandidates.push(url);
    }
  }
  const author = frontmatter.author;
  if (author && typeof author === "object" && "picture" in author) {
    const picture = (author as { picture?: unknown }).picture;
    if (typeof picture === "string") {
      dataCandidates.push(picture);
    }
  }

  dataCandidates.forEach((value) => {
    if (isLegacyAssetUrl(value) || isPostAssetUrl(value)) {
      urls.add(value);
    }
  });

  const contentMatches = content.match(/(?:https?:\/\/assets\.eggcake\.cn\/context\/|\/assets\/blog\/(?:context|cover|authors)\/)[^\s)"']+/g) ?? [];
  contentMatches.forEach((match) => urls.add(match));
  const postAssetMatches = content.match(/\/assets\/posts\/[^\s)"']+/g) ?? [];
  postAssetMatches.forEach((match) => urls.add(match));

  return Array.from(urls);
}

function replaceAll(content: string, from: string, to: string): string {
  return content.split(from).join(to);
}

function migratePost(markdownFilePath: string): { updated: boolean; count: number } {
  const raw = fs.readFileSync(markdownFilePath, "utf8");
  const parsed = matter(raw);
  const postSlug = postSlugFromFilePath(markdownFilePath);
  const legacyUrls = collectLegacyUrls(parsed.data as Record<string, unknown>, parsed.content);

  if (!legacyUrls.length) {
    return { updated: false, count: 0 };
  }

  let nextRaw = raw;
  let updateCount = 0;
  const replacementMap = new Map<string, string>();

  legacyUrls.forEach((legacyUrl) => {
    const migratedUrl = migrateAssetUrl(legacyUrl, markdownFilePath, postSlug);
    if (migratedUrl !== legacyUrl) {
      replacementMap.set(legacyUrl, migratedUrl);
    }
  });

  replacementMap.forEach((to, from) => {
    const before = nextRaw;
    nextRaw = replaceAll(nextRaw, from, to);
    if (before !== nextRaw) {
      updateCount += 1;
    }
  });

  if (nextRaw === raw) {
    return { updated: false, count: 0 };
  }

  fs.writeFileSync(markdownFilePath, nextRaw, "utf8");
  return { updated: true, count: updateCount };
}

function main() {
  const files = walkMarkdownFiles(POSTS_DIR);
  let updatedFileCount = 0;
  let replacementCount = 0;

  files.forEach((filePath) => {
    const { updated, count } = migratePost(filePath);
    if (updated) {
      updatedFileCount += 1;
      replacementCount += count;
      console.log(`Migrated: ${path.relative(ROOT_DIR, filePath)} (${count} replacements)`);
    }
  });

  console.log(`Processed ${files.length} markdown files.`);
  console.log(`Updated ${updatedFileCount} files with ${replacementCount} replacement groups.`);
}

main();
