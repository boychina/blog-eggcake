// import WordCloud from "react-d3-cloud";

// const data = [
//   { text: "Hey", value: 1000 },
//   { text: "lol", value: 200 },
//   { text: "first impression", value: 800 },
//   { text: "very cool", value: 1000000 },
//   { text: "duck", value: 10 },
// ];

// export default function WordCloudItem({ keywords }) {

//   const fontSizeMapper = (word) => Math.log2(word.value) * 5;
//   const rotate = (word) => word.value % 360;
//   try {
//     return (
//       <div>
//         <span>Hello World!</span>
//         <WordCloud data={data} fontSizeMapper={fontSizeMapper} rotate={rotate} />
//       </div>
//     );
//   } catch (error) {
//     console.error(error);
//   }
// }

var Canvas = require("canvas");
var cloud = require("d3-cloud");
var d3 = require("d3");

var layout = cloud()//利用d3-cloud计算每个标签的位置
    .size([600, 400])
    .canvas(function() { return new Canvas(1, 1); })
    .padding(7)
    .rotate(function() { return ~~(Math.random() * 2) * 90; })
    .font("Impact")
    .fontSize(function(d) { return d.size; });
var fill = d3.scale.category20();//利用d3的接口给每个标签颜色

const words = [
  "Hello",
  "world",
  "normally",
  "you",
  "want",
  "more",
  "words",
  "than",
  "this",
].map(function (d) {
  return { text: d, size: 10 + Math.random() * 90 };
});

export default function WorldCloud({}) {
  cloud()
    .size([960, 500])
    .canvas(function () {
      return new Canvas(1, 1);
    })
    .words(words)
    .padding(5)
    .rotate(function () {
      return ~~(Math.random() * 2) * 90;
    })
    .font("Impact")
    .fontSize(function (d) {
      return d.size;
    })
    .on("end", end)
    .start();

  const end = (words) => {
    console.log(JSON.stringify(words));
  };
}
