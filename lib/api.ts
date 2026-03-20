import fs from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { chunk, findIndex, range } from "lodash";
import dayjs from "dayjs";
import { DATE_FORMAT, DEFAULT_PAGE_SIZE } from "@/config";
import type { PostRecord, PrevNextPost, TagsMap } from "@/types/post";

const postsDirectory = join(process.cwd(), "_posts");

export function getPostSlugs(): string[] {
  return fs.readdirSync(postsDirectory);
}

export function getPostBySlug(slug: string, fields: string[] = []): PostRecord {
  if (slug.includes(".DS_Store")) {
    return {};
  }
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(postsDirectory, `${realSlug}.md`);
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
  const slugs = getPostSlugs().filter((slug) => !slug.includes(".DS_Store"));
  return slugs
    .map((slug) => getPostBySlug(slug, fields))
    .sort((post1, post2) => String(post1.date ?? "") > String(post2.date ?? "") ? -1 : 1);
}

export function getPostsByPageIndex(current: number | string, fields: string[] = [], pageSize = DEFAULT_PAGE_SIZE): PostRecord[] {
  const allPosts = getAllPosts(fields);
  return chunk(allPosts, pageSize)[Number(current) - 1] ?? [];
}

export function getPageIndexes(pageSize = DEFAULT_PAGE_SIZE): number[] {
  const slugs = getPostSlugs().filter((slug) => !slug.includes(".DS_Store"));
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
