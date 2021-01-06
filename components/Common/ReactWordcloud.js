import { createCanvas } from "canvas";
import cloud from "d3-cloud";
import { random } from 'lodash';
import { COLORS } from "@/config/constant";
import { getKeywords } from "@/lib/api";

const layout = cloud()
  .size([400, 300])
  .canvas(() => createCanvas(400, 300))
  .padding(5)
  .rotate(() => ~~(Math.random() * 2) * 90)
  .font("Impact")
  .fontSize((d) => d.size);

export default function ReactWordcloud({ keywords }) {
  if (!keywords || !Object.keys(keywords).length) return null;

  let maxSize = 1;

  Object.values(keywords).forEach(({ value }) => {
    if (value > maxSize) {
      maxSize = value;
    };
  });

  //构建传入layout的words
  let words = [];
  Object.keys(keywords).forEach((word) => {
    const wordObj = keywords[word];
    words.push({ ...wordObj, name: word, size: (Math.log(wordObj.value) / (Math.log(maxSize) - Math.log(1))) * 8 + 20 });
  });
  layout.words(words);
  layout.start();

  return (
    <div>
      <svg
        width="400"
        height="300"
      >
        <g transform="translate(200, 150)">
          {words.map((word) => (
            <text
              key={word}
              text-anchor="middle"
              fill={COLORS[random(22)]}
              transform={`translate(${word.x}, ${word.y})rotate(${word.rotate})`}
              style={{ fontSize: word.size, fontFamily: "Impact" }}
            >
              {word.name}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
}
