import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = process.cwd();
const POSTS_DIR = path.join(ROOT_DIR, "_posts");

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

function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function removeDirIfEmpty(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    return;
  }
  const items = fs.readdirSync(dirPath);
  if (!items.length) {
    fs.rmdirSync(dirPath);
  }
}

function walkFiles(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files: string[] = [];
  entries.forEach((entry) => {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
      return;
    }
    if (entry.isFile()) {
      files.push(fullPath);
    }
  });
  return files;
}

function mergeMoveDir(sourceDir: string, targetDir: string) {
  if (!fs.existsSync(sourceDir)) {
    return;
  }
  ensureDir(targetDir);
  const sourceFiles = walkFiles(sourceDir);
  sourceFiles.forEach((sourceFilePath) => {
    const relativePath = path.relative(sourceDir, sourceFilePath);
    const targetPath = path.join(targetDir, relativePath);
    ensureDir(path.dirname(targetPath));
    if (!fs.existsSync(targetPath)) {
      fs.renameSync(sourceFilePath, targetPath);
      return;
    }
    if (path.resolve(sourceFilePath) !== path.resolve(targetPath)) {
      fs.rmSync(sourceFilePath, { force: true });
    }
  });
  fs.rmSync(sourceDir, { recursive: true, force: true });
}

function restructureOne(markdownFilePath: string): boolean {
  if (path.basename(markdownFilePath) === "index.md") {
    return false;
  }
  const parentDir = path.dirname(markdownFilePath);
  const baseName = path.basename(markdownFilePath, ".md");
  const targetPostDir = path.join(parentDir, baseName);
  const targetMarkdownPath = path.join(targetPostDir, "index.md");

  ensureDir(targetPostDir);
  if (path.resolve(markdownFilePath) !== path.resolve(targetMarkdownPath)) {
    if (!fs.existsSync(targetMarkdownPath)) {
      fs.renameSync(markdownFilePath, targetMarkdownPath);
    }
  }

  const legacyAssetsDir = path.join(parentDir, `${baseName}.assets`);
  const targetAssetsDir = path.join(targetPostDir, "assets");
  mergeMoveDir(legacyAssetsDir, targetAssetsDir);
  removeDirIfEmpty(parentDir);
  return true;
}

function main() {
  const markdownFiles = walkMarkdownFiles(POSTS_DIR);
  let movedCount = 0;
  markdownFiles.forEach((markdownFilePath) => {
    const moved = restructureOne(markdownFilePath);
    if (moved) {
      movedCount += 1;
      console.log(`Restructured: ${path.relative(ROOT_DIR, markdownFilePath)}`);
    }
  });
  console.log(`Processed ${markdownFiles.length} markdown files.`);
  console.log(`Restructured ${movedCount} markdown files.`);
}

main();
