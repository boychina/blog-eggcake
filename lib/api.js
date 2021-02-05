import fs from "fs";
import { join } from "path";
import matter from "gray-matter";
import { chunk, range, findIndex } from "lodash";
import * as dayjs from 'dayjs'
import { DEFAULT_PAGE_SIZE, DATE_FORMAT } from "@/config";

const postsDirectory = join(process.cwd(), "_posts");

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory);
}

export function getPostBySlug(slug, fields = []) {
  if (slug.includes(".DS_Store")) {
    return {};
  }
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath);
  const { data, content } = matter(fileContents);

  const items = {};

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (field === "slug") {
      items[field] = realSlug;
    }
    if (field === "content") {
      items[field] = content;
    }

    if (data[field]) {
      items[field] = data[field];
    }
  });
  return items;
}

export function getAllPosts(fields = []) {
  const slugs = getPostSlugs().filter((slug) => !slug.includes(".DS_Store"));
  const posts = slugs
    .map((slug) => getPostBySlug(slug, fields))
    .sort((post1, post2) => (post1.date > post2.date ? "-1" : "1"));
  return posts;
}

export function getPostsByPageIndex(
  current,
  fields = [],
  pageSize = DEFAULT_PAGE_SIZE
) {
  const allPosts = getAllPosts(fields);
  const slugsByPageIndex = chunk(allPosts, pageSize)[current - 1];
  return slugsByPageIndex;
}

export function getPageIndexes(pageSize = DEFAULT_PAGE_SIZE) {
  const slugs = getPostSlugs().filter((slug) => !slug.includes(".DS_Store"));
  const pageIndexes = range(1, chunk(slugs, pageSize).length + 1);
  return pageIndexes;
}

export function getPrevNextPost(slug, fields = []) {
  const allPosts = getAllPosts(fields);
  const result = { prevPost: null, nextPost: null };
  const curIndex = findIndex(allPosts, ["slug", slug]);
  if (curIndex > 0) {
    result.prevPost = allPosts[curIndex - 1];
  }
  if (curIndex + 1 < allPosts.length) {
    result.nextPost = allPosts[curIndex + 1];
  }
  return result;
}

export function getTagsMap(fields = ["tag", "slug"]) {
  const allPosts = getAllPosts(fields);
  const result = {};
  allPosts.forEach((post) => {
    const tags = post.tag.split(",");
    tags.forEach((kw) => {
      if (!result[kw]) {
        result[kw] = {
          value: 1,
          posts: [post],
        };
        return;
      }
      result[kw].value += 1;
      result[kw].posts.push(post);
    });
  });
  return result;
}

export function getPostsByTag(tag, fields = []) {
  const tags = getTagsMap(fields);
  return tags[tag].posts;
}

export function getDatesMap(fields = ["date", "slug"]) {
  const allPosts = getAllPosts(fields);
  const result = {};
  allPosts.forEach((post) => {
    const date = dayjs(post.date).format(DATE_FORMAT);
    if (!result[date]) {
      result[date] = [post];
      return;
    }
    result[date].push(post);
  });
  return result;
}

export function getPostsByDate(date, fields = []) {
  const datesMap = getDatesMap(fields);
  return datesMap[date];
}
