import fs from "node:fs";
import { join, relative } from "node:path";
import matter from "gray-matter";
import { chunk, findIndex, range } from "lodash";
import dayjs from "dayjs";
import { DATE_FORMAT, DEFAULT_PAGE_SIZE } from "@/config";
import type { PostRecord, PrevNextPost, TagsMap } from "@/types/post";

const postsDirectory = join(process.cwd(), "_posts");
let postFilePathMapCache: Map<string, string> | null = null;

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
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  if (!fullPath || !fs.existsSync(fullPath)) {
    return {};
  }
  const fileContents = fs.readFileSync(fullPath);
  const { data, content } = matter(fileContents);

  const items: PostRecord = {};
  fields.forEach((field) => {
    if (field === "slug") {
      items[field] = realSlug;
    }
    if (field === "content") {
      items[field] = content;
    }
    if (data[field] !== undefined) {
      items[field] = data[field];
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
