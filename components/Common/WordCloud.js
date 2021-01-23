import { useMemo, useState } from "react";
import { createCanvas } from "canvas";
import cloud from "d3-cloud";
import { random, sortBy } from "lodash";
import Link from "next/link";
import { SendOutlined } from "@ant-design/icons";
import { COLORS } from "@/config/constant";

const layout = cloud()
  .size([330, 300])
  .canvas(() => createCanvas(330, 300))
  .padding(2)
  .rotate(() => ~~(Math.random() * 2) * 90)
  .fontSize((d) => d.size);

export default function WordCloud({ title, tags }) {
  if (!tags || !Object.keys(tags).length) return null;

  const [hoveringWord, setHoveringWord] = useState('');

  let maxSize = 1;

  Object.values(tags).forEach(({ value }) => {
    if (value > maxSize) {
      maxSize = value;
    }
  });

  const words = useMemo(() => {
    //构建传入layout的words
    let result = [];
    Object.keys(tags).forEach((word) => {
     const wordObj = tags[word];
     result.push({
       ...wordObj,
       text: word,
       size:
         ((Math.log(wordObj.value) * 4) / (Math.log(maxSize) - Math.log(1))) *
           4 +
         20,
     });
    });
    layout.words(result);
    layout.start();
    return result;
  }, []);

  return (
    <div>
      <div className="flex items-center" style={{ padding: "12px 0" }}>
        <SendOutlined />
        <span className="ml-1">{title}</span>
      </div>
      <svg width="330" height="300" className="mx-auto md:m-0">
        <g transform="translate(160, 150)">
          {sortBy(words, ['value']).map((word, index) => (
            <Link as={`/search/${word.text}`} href="/search/[tag]" key={word.text}>
              <text
                textAnchor="middle"
                fill={hoveringWord === word.text ? '#1890ff' : COLORS[index % 11]}
                transform={`translate(${word.x}, ${word.y})rotate(${word.rotate})`}
                style={{ fontSize: word.size }}
                onMouseOver={() => setHoveringWord(word.text)}
                onMouseLeave={() => setHoveringWord('')}
              >
                <a>{word.text}</a>
              </text>
            </Link>
          ))}
        </g>
      </svg>
    </div>
  );
}
