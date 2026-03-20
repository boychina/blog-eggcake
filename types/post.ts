export interface Author {
  name: string;
  picture: string;
}

export interface OgImage {
  url: string;
}

export interface PostBase {
  title?: string;
  description?: string;
  keyword?: string;
  date?: string;
  slug?: string;
  author?: Author;
  coverImage?: string;
  excerpt?: string;
  content?: string;
  tag?: string;
  ogImage?: OgImage;
}

export interface PostRecord extends PostBase {
  [key: string]: unknown;
}

export interface TagMeta {
  value: number;
  posts: PostRecord[];
}

export type TagsMap = Record<string, TagMeta>;

export interface PrevNextPost {
  prevPost: PostRecord | null;
  nextPost: PostRecord | null;
}
