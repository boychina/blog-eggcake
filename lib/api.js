import fs from "fs";
import { join } from "path";
import matter from "gray-matter";
import { chunk, range } from "lodash";
import config from '@/config';

const { DEFAULT_PAGE_SIZE } = config;

const postsDirectory = join(process.cwd(), "_posts");

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory);
}

export function getPostBySlug(slug, fields = []) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath);
  const { data, content } = matter(fileContents);

  const items = {};

  // Ensure only the minimal needed data is exposed
  fields.forEach(field => {
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
  const slugs = getPostSlugs().filter(slug => !slug.includes('.DS_Store'));
  const posts = slugs.map(slug => getPostBySlug(slug, fields))
    .sort((post1, post2) => (post1.date > post2.date ? "-1" : "1"));
  return posts;
}

export function getPostsByPageIndex(current, fields = [], pageSize = DEFAULT_PAGE_SIZE) {
  const allPosts = getAllPosts(fields);
  const slugsByPageIndex = chunk(allPosts, pageSize)[current - 1];
  return slugsByPageIndex;
}

export function getPageIndexes(pageSize = DEFAULT_PAGE_SIZE) {
  const slugs = getPostSlugs().filter(slug => !slug.includes('.DS_Store'));
  const pageIndexes = range(1, chunk(slugs, pageSize).length + 1);
  return pageIndexes;
}