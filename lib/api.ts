import fs from "node:fs";
import { join, relative } from "node:path";
import matter from "gray-matter";
import { chunk, findIndex, range } from "lodash";
import dayjs from "dayjs";
import { DATE_FORMAT, DEFAULT_PAGE_SIZE } from "@/config";
import { normalizeAssetFileName, toPostAssetPublicPath } from "@/lib/postAssets";
import type { PostRecord, PrevNextPost, TagsMap } from "@/types/post";

const postsDirectory = join(process.cwd(), "_posts");
const legacyAssetBasePattern = /(?:https?:\/\/assets\.eggcake\.cn\/context\/|\/assets\/blog\/(?:context|cover|authors)\/)[^\s)"']+/g;
const postAssetBasePattern = /\/assets\/posts\/[^\s)"']+/g;
let postFilePathMapCache: Map<string, string> | null = null;

function normalizeLegacyAssetPath(url: string): string | null {
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
    return `author/${url.slice("/assets/blog/authors/".length)}`;
  }
  return null;
}

function legacyAssetUrlToPostAssetUrl(url: string, slug: string): string {
  const normalized = normalizeLegacyAssetPath(url);
  if (!normalized) {
    return url;
  }
  const normalizedPath = normalized
    .split("/")
    .filter(Boolean)
    .map((segment, index) => {
      if (index > 1 && normalized.startsWith("context/")) {
        return segment;
      }
      return decodeURIComponent(segment);
    });
  const targetPath = normalized.startsWith("context/")
    ? ["context", normalizeAssetFileName(normalizedPath[normalizedPath.length - 1])]
    : [...normalizedPath.slice(0, -1), normalizeAssetFileName(normalizedPath[normalizedPath.length - 1])];
  return toPostAssetPublicPath(slug, targetPath.join("/"));
}

function canonicalizePostAssetUrl(url: string, slug: string): string {
  if (!url.startsWith("/assets/posts/")) {
    return url;
  }
  const parts = url.slice("/assets/posts/".length).split("/").filter(Boolean);
  const typeIndex = parts.findIndex((part) => part === "cover" || part === "author" || part === "context");
  if (typeIndex < 0 || typeIndex + 1 >= parts.length) {
    return url;
  }
  const relativePath = `${parts[typeIndex]}/${parts.slice(typeIndex + 1).join("/")}`;
  const relativeParts = relativePath.split("/").filter(Boolean);
  const normalizedRelativePath = [...relativeParts.slice(0, -1), normalizeAssetFileName(relativeParts[relativeParts.length - 1])].join("/");
  return toPostAssetPublicPath(slug, normalizedRelativePath);
}

function normalizePostDataAssets(data: Record<string, unknown>, slug: string): Record<string, unknown> {
  const nextData = { ...data };
  const coverImage = nextData.coverImage;
  if (typeof coverImage === "string") {
    nextData.coverImage = canonicalizePostAssetUrl(legacyAssetUrlToPostAssetUrl(coverImage, slug), slug);
  }
  const author = nextData.author;
  if (author && typeof author === "object" && "picture" in author) {
    const picture = (author as { picture?: unknown }).picture;
    if (typeof picture === "string") {
      nextData.author = {
        ...(author as Record<string, unknown>),
        picture: canonicalizePostAssetUrl(legacyAssetUrlToPostAssetUrl(picture, slug), slug),
      };
    }
  }
  const ogImage = nextData.ogImage;
  if (ogImage && typeof ogImage === "object" && "url" in ogImage) {
    const url = (ogImage as { url?: unknown }).url;
    if (typeof url === "string") {
      nextData.ogImage = {
        ...(ogImage as Record<string, unknown>),
        url: canonicalizePostAssetUrl(legacyAssetUrlToPostAssetUrl(url, slug), slug),
      };
    }
  }
  return nextData;
}

function normalizePostContentAssets(content: string, slug: string): string {
  const withLegacyNormalized = content.replace(legacyAssetBasePattern, (url) => legacyAssetUrlToPostAssetUrl(url, slug));
  return withLegacyNormalized.replace(postAssetBasePattern, (url) => canonicalizePostAssetUrl(url, slug));
}

function getMarkdownFilePaths(directory: string): string[] {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const filePaths: string[] = [];
  entries.forEach((entry) => {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      filePaths.push(...getMarkdownFilePaths(fullPath));
      return;
    }
    if (entry.isFile() && entry.name.endsWith(".md")) {
      filePaths.push(fullPath);
    }
  });
  return filePaths;
}

function getPostSlugByPath(filePath: string): string {
  const relativePath = relative(postsDirectory, filePath).replace(/\\/g, "/");
  if (relativePath.endsWith("/index.md")) {
    return relativePath.slice(0, -"/index.md".length);
  }
  return relativePath.replace(/\.md$/, "");
}

function getPostFilePathMap(): Map<string, string> {
  if (postFilePathMapCache) {
    return postFilePathMapCache;
  }
  const map = new Map<string, string>();
  const markdownFilePaths = getMarkdownFilePaths(postsDirectory);
  markdownFilePaths.forEach((filePath) => {
    const slug = getPostSlugByPath(filePath);
    if (map.has(slug)) {
      throw new Error(`Duplicate post slug found: ${slug}`);
    }
    map.set(slug, filePath);
  });
  postFilePathMapCache = map;
  return postFilePathMapCache;
}

export function getPostSlugs(): string[] {
  return Array.from(getPostFilePathMap().keys());
}

export function getPostBySlug(slug: string, fields: string[] = []): PostRecord {
  const realSlug = slug.replace(/\.md$/, "");
  const indexPath = join(postsDirectory, realSlug, "index.md");
  const flatPath = join(postsDirectory, `${realSlug}.md`);
  const fullPath = fs.existsSync(indexPath) ? indexPath : flatPath;
  if (!fullPath || !fs.existsSync(fullPath)) {
    return {};
  }
  const fileContents = fs.readFileSync(fullPath);
  const { data, content } = matter(fileContents);
  const normalizedData = normalizePostDataAssets(data as Record<string, unknown>, realSlug);
  const normalizedContent = normalizePostContentAssets(content, realSlug);

  const items: PostRecord = {};
  fields.forEach((field) => {
    if (field === "slug") {
      items[field] = realSlug;
    }
    if (field === "content") {
      items[field] = normalizedContent;
    }
    if (normalizedData[field] !== undefined) {
      items[field] = normalizedData[field];
    }
  });
  return items;
}

export function getAllPosts(fields: string[] = []): PostRecord[] {
  const slugs = getPostSlugs();
  return slugs
    .map((slug) => getPostBySlug(slug, fields))
    .filter((post) => Object.keys(post).length > 0)
    .sort((post1, post2) => {
      const time1 = dayjs(String(post1.date ?? "")).valueOf() || 0;
      const time2 = dayjs(String(post2.date ?? "")).valueOf() || 0;
      if (time1 !== time2) {
        return time2 - time1;
      }
      return String(post1.slug ?? "").localeCompare(String(post2.slug ?? ""));
    });
}

export function getPostsByPageIndex(current: number | string, fields: string[] = [], pageSize = DEFAULT_PAGE_SIZE): PostRecord[] {
  const allPosts = getAllPosts(fields);
  return chunk(allPosts, pageSize)[Number(current) - 1] ?? [];
}

export function getPageIndexes(pageSize = DEFAULT_PAGE_SIZE): number[] {
  const slugs = getPostSlugs();
  return range(1, chunk(slugs, pageSize).length + 1);
}

export function getPrevNextPost(slug: string, fields: string[] = []): PrevNextPost {
  const allPosts = getAllPosts(fields);
  const result: PrevNextPost = { prevPost: null, nextPost: null };
  const curIndex = findIndex(allPosts, ["slug", slug]);
  if (curIndex > 0) {
    result.prevPost = allPosts[curIndex - 1];
  }
  if (curIndex + 1 < allPosts.length) {
    result.nextPost = allPosts[curIndex + 1];
  }
  return result;
}

export function getTagsMap(fields: string[] = ["tag", "slug"]): TagsMap {
  const allPosts = getAllPosts(fields);
  const result: TagsMap = {};
  allPosts.forEach((post) => {
    const tags = String(post.tag ?? "").split(",").filter(Boolean);
    tags.forEach((kw) => {
      if (!result[kw]) {
        result[kw] = { value: 1, posts: [post] };
        return;
      }
      result[kw].value += 1;
      result[kw].posts.push(post);
    });
  });
  return result;
}

export function getPostsByTag(tag: string, fields: string[] = []): PostRecord[] {
  const tags = getTagsMap(fields);
  return tags[tag]?.posts ?? [];
}

export function getDatesMap(fields: string[] = ["date", "slug"]): Record<string, PostRecord[]> {
  const allPosts = getAllPosts(fields);
  const result: Record<string, PostRecord[]> = {};
  allPosts.forEach((post) => {
    const date = dayjs(String(post.date ?? "")).format(DATE_FORMAT);
    if (!result[date]) {
      result[date] = [post];
      return;
    }
    result[date].push(post);
  });
  return result;
}

export function getPostsByDate(date: string, fields: string[] = []): PostRecord[] {
  const datesMap = getDatesMap(fields);
  return datesMap[date] ?? [];
}
