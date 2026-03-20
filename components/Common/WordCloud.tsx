import { useMemo, useState } from "react";
import Router from "next/router";
import cloud from "d3-cloud";
import { sortBy } from "lodash";
import { SendOutlined } from "@ant-design/icons";
import { COLORS } from "@/config/constant";
import type { TagsMap } from "@/types/post";

interface WordCloudWord {
  text: string;
  value: number;
  size: number;
  x?: number;
  y?: number;
  rotate?: number;
}

interface WordCloudProps {
  title: string;
  tags: TagsMap;
}

const layout = cloud()
  .size([330, 300])
  .canvas(() => document.createElement("canvas"))
  .padding(2)
  .rotate(() => ~~(Math.random() * 2) * 90)
  .fontSize((d: { size: number }) => d.size);

export default function WordCloud({ title, tags }: WordCloudProps) {
  if (!tags || !Object.keys(tags).length) return null;
  const [hoveringWord, setHoveringWord] = useState("");

  let maxSize = 1;
  Object.values(tags).forEach(({ value }) => {
    if (value > maxSize) {
      maxSize = value;
    }
  });

  const words = useMemo(() => {
    const result: WordCloudWord[] = [];
    Object.keys(tags).forEach((word) => {
      const wordObj = tags[word];
      result.push({
        ...wordObj,
        text: word,
        size: ((Math.log(wordObj.value) * 4) / (Math.log(maxSize) - Math.log(1))) * 4 + 20,
      });
    });
    layout.words(result as never);
    layout.start();
    return result;
  }, [tags, maxSize]);

  return (
    <div>
      <div className="flex items-center" style={{ padding: "12px 0" }}>
        <SendOutlined />
        <span className="ml-1">{title}</span>
      </div>
      <svg width="330" height="300" className="mx-auto md:m-0">
        <g transform="translate(160, 150)">
          {sortBy(words, ["value"]).map((word, index) => (
            <text
              key={word.text}
              textAnchor="middle"
              fill={hoveringWord === word.text ? "#1890ff" : COLORS[index % 11]}
              transform={`translate(${word.x ?? 0}, ${word.y ?? 0})rotate(${word.rotate ?? 0})`}
              style={{ fontSize: word.size, cursor: "pointer" }}
              onMouseOver={() => setHoveringWord(word.text)}
              onMouseLeave={() => setHoveringWord("")}
              onClick={() => {
                Router.push({ pathname: "/tag/[tag]" }, `/tag/${word.text}`);
              }}
            >
              {word.text}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
}
