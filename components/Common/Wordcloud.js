import { createCanvas } from "canvas";
import cloud from "d3-cloud";
import { random } from "lodash";
import Link from "next/link";
import { SendOutlined } from "@ant-design/icons";
import { COLORS } from "@/config/constant";

const layout = cloud()
  .size([400, 300])
  .canvas(() => createCanvas(400, 300))
  .padding(2)
  .rotate(() => ~~(Math.random() * 2) * 90)
  .fontSize((d) => d.size);

export default function ReactWordcloud({ title, tags }) {
  if (!tags || !Object.keys(tags).length) return null;

  let maxSize = 1;

  Object.values(tags).forEach(({ value }) => {
    if (value > maxSize) {
      maxSize = value;
    }
  });

  //构建传入layout的words
  let words = [];
  Object.keys(tags).forEach((word) => {
    const wordObj = tags[word];
    words.push({
      ...wordObj,
      name: word,
      size:
        ((Math.log(wordObj.value) * 4) / (Math.log(maxSize) - Math.log(1))) *
          4 +
        20,
    });
  });
  layout.words(words);
  layout.start();

  return (
    <div>
      <div className="flex items-center">
        <SendOutlined />
        <span className="ml-1">{title}</span>
      </div>
      <svg width="400" height="300">
        <g transform="translate(190, 150)">
          {words.map((word) => (
            <text
              key={word.name}
              text-anchor="middle"
              fill={COLORS[random(10)]}
              transform={`translate(${word.x}, ${word.y})rotate(${word.rotate})`}
              style={{ fontSize: word.size }}
            >
              <Link as={`/search/${word.name}`} href="/search/[tag]">
                <a>{word.name}</a>
              </Link>
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
}
