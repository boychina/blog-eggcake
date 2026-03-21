import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import dayjs from "dayjs";

interface PostMeta {
  sourcePath: string;
  fileName: string;
  title: string;
  keyword: string;
  tag: string;
  date: string;
}

const POSTS_DIR = path.join(process.cwd(), "_posts");
const APPLY = process.argv.includes("--apply");

function readMarkdownFiles(dirPath: string): string[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files: string[] = [];
  entries.forEach((entry) => {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...readMarkdownFiles(fullPath));
      return;
    }
    if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  });
  return files;
}

function normalizeSeriesName(input: string): string {
  const value = input
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return value || "misc";
}

function cleanFileBaseName(raw: string): string {
  return raw
    .replace(/^\d{4}-\d{2}-\d{2}-/, "")
    .replace(/^\d+\./, "")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePostMeta(filePath: string): PostMeta {
  const content = fs.readFileSync(filePath, "utf8");
  const { data } = matter(content);
  const fileName = path.basename(filePath);
  const baseName = fileName.replace(/\.md$/, "");
  const title = String(data.title ?? cleanFileBaseName(baseName));
  const keyword = String(data.keyword ?? "");
  const tag = String(data.tag ?? "");
  const date = String(data.date ?? "");
  return {
    sourcePath: filePath,
    fileName,
    title,
    keyword,
    tag,
    date,
  };
}

function decideSeries(post: PostMeta): string {
  const title = post.title.toLowerCase();
  const keyword = post.keyword.toLowerCase();
  const tag = post.tag.toLowerCase();
  const source = `${title} ${keyword} ${tag}`;
  if (source.includes("vue3") || source.includes("核心源码解读") || source.includes("vue")) {
    return "vue3";
  }
  if (source.includes("react")) {
    return "react";
  }
  if (source.includes("ecmascript")) {
    return "ecmascript";
  }
  if (source.includes("typescript")) {
    return "typescript";
  }
  if (source.includes("pwa")) {
    return "pwa";
  }
  const firstKeyword = post.keyword
    .split(",")
    .map((item) => item.trim())
    .find(Boolean);
  if (firstKeyword) {
    return normalizeSeriesName(firstKeyword);
  }
  if (post.tag.trim()) {
    return normalizeSeriesName(post.tag.trim());
  }
  return "misc";
}

function getSortedPostsBySeries(posts: PostMeta[]): Map<string, PostMeta[]> {
  const grouped = new Map<string, PostMeta[]>();
  posts.forEach((post) => {
    const series = decideSeries(post);
    if (!grouped.has(series)) {
      grouped.set(series, []);
    }
    grouped.get(series)?.push(post);
  });
  grouped.forEach((group) => {
    group.sort((a, b) => {
      const aTime = dayjs(a.date).valueOf() || 0;
      const bTime = dayjs(b.date).valueOf() || 0;
      if (aTime !== bTime) {
        return aTime - bTime;
      }
      return a.fileName.localeCompare(b.fileName);
    });
  });
  return grouped;
}

function buildMovePlan(postsBySeries: Map<string, PostMeta[]>): Array<{ from: string; to: string }> {
  const plan: Array<{ from: string; to: string }> = [];
  const usedTargets = new Set<string>();
  postsBySeries.forEach((posts, series) => {
    const targetDir = path.join(POSTS_DIR, series);
    posts.forEach((post, index) => {
      const baseTitle = cleanFileBaseName(post.title);
      const numberedFileName = `${index + 1}.${baseTitle}.md`;
      let targetPath = path.join(targetDir, numberedFileName);
      let suffix = 1;
      while (
        usedTargets.has(targetPath) ||
        (fs.existsSync(targetPath) && path.resolve(targetPath) !== path.resolve(post.sourcePath))
      ) {
        suffix += 1;
        targetPath = path.join(targetDir, `${index + 1}.${baseTitle}-${suffix}.md`);
      }
      usedTargets.add(targetPath);
      if (path.resolve(post.sourcePath) !== path.resolve(targetPath)) {
        plan.push({ from: post.sourcePath, to: targetPath });
      }
    });
  });
  return plan;
}

function applyMovePlan(plan: Array<{ from: string; to: string }>) {
  plan.forEach((item) => {
    fs.mkdirSync(path.dirname(item.to), { recursive: true });
    fs.renameSync(item.from, item.to);
  });
}

function main() {
  const files = readMarkdownFiles(POSTS_DIR);
  const posts = files.map((filePath) => parsePostMeta(filePath));
  const grouped = getSortedPostsBySeries(posts);
  const movePlan = buildMovePlan(grouped);
  console.log(`Detected ${files.length} markdown files.`);
  console.log(`Generated ${movePlan.length} move operations.`);
  movePlan.slice(0, 20).forEach((item) => {
    const from = path.relative(POSTS_DIR, item.from);
    const to = path.relative(POSTS_DIR, item.to);
    console.log(`${from} -> ${to}`);
  });
  if (!APPLY) {
    console.log("Dry run mode. Re-run with --apply to execute moves.");
    return;
  }
  applyMovePlan(movePlan);
  console.log("Completed post organization.");
}

main();
