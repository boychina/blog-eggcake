import { createHash } from "node:crypto";

function decodePathSegment(segment: string): string {
  let result = segment;
  for (let i = 0; i < 3; i += 1) {
    try {
      const decoded = decodeURIComponent(result);
      if (decoded === result) {
        break;
      }
      result = decoded;
    } catch {
      break;
    }
  }
  return result;
}

export function encodePathForUrl(value: string): string {
  return value
    .split("/")
    .map((segment) => encodeURIComponent(decodePathSegment(segment)))
    .join("/");
}

function stripLeadingNumberPrefix(value: string): string {
  return value.replace(/^\d+\./, "").trim();
}

function stripDatePrefix(value: string): string {
  return value.replace(/^\d{4}-\d{2}-\d{2}-/, "").trim();
}

function normalizeSegmentForPath(value: string): string {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeAssetFileName(fileName: string): string {
  const extensionIndex = fileName.lastIndexOf(".");
  if (extensionIndex <= 0) {
    const normalized = normalizeSegmentForPath(stripDatePrefix(fileName));
    return normalized || fileName;
  }
  const name = fileName.slice(0, extensionIndex);
  const extension = fileName.slice(extensionIndex);
  const normalizedName = normalizeSegmentForPath(stripDatePrefix(name));
  return `${normalizedName || name}${extension}`;
}

export function getPostAssetKey(slug: string): string {
  const segment = decodePathSegment(slug.split("/").filter(Boolean).pop() ?? slug);
  const base = normalizeSegmentForPath(stripDatePrefix(stripLeadingNumberPrefix(segment)));
  if (base) {
    return base;
  }
  return `post-${createHash("sha1").update(slug).digest("hex").slice(0, 8)}`;
}

export function toPostAssetPublicPath(slug: string, relativePath: string): string {
  return `/assets/posts/${getPostAssetKey(slug)}/${encodePathForUrl(relativePath.replace(/\\/g, "/"))}`;
}
