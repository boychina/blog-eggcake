import { createCanvas, loadImage } from 'canvas';
import cloud from "d3-cloud";
// var d3 = require("d3");

const layout = cloud().size([300, 200])
  .canvas(function () { return createCanvas(1, 1); })
  .padding(5)
  .rotate(function () { return ~~(Math.random() * 2) * 90; })
  .font("Impact")
  .fontSize(function (d) { return d.size; });

// const fill = d3.scale.category20();

const data = ["Hello", "world", "normally", "you", "want", "more", "words", "than", "this"]
  .map(function (d) {
    return { name: d, size: 10 + Math.random() * 90 };
  });

export default function ReactWordcloud() {
  let maxSize = 1;

  let tags = data;
  tags = tags.filter((tag) => {
    return tag.size;
  });

  tags.forEach(function (tag) {
    var size = tag.size;
    if (size > maxSize)
      maxSize = size;
  });

  //构建传入layout的words
  let arr = [];
  let words;
  tags.forEach((tag) => {
    arr.push({ name: tag.name, num: tag.size });
  });
  words = arr.map(function (d) {
    const text = d.name.replace(/[^\x00-\xff]/g, "ab");//对中文的投机处理，用ab代替中文字符
    return { name: d.name, text: text, size: Math.log(d.num) / (Math.log(maxSize) - Math.log(1)) * 15 + 30 };//size的计算取对数，是为了让标签之间的大小相对平均一些。因为博客侧重前端内容，所以某一些标签会比较多，标签最大最小次数的差距会比较大。
  });
  layout.words(words);
  layout.start();

  return (
    <div>
      <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg" version="1.1">
        <g transform="translate(300,200)">
          {words.map((word, i) => <text text-anchor="middle" transform={`translate(${word.x}, ${word.y})rotate(${word.rotate})`} style={{ fontSize: word.size, fontFamily: 'Impact' }}>{word.name}</text>)}
        </g>
      </svg>
    </div>
  );
}