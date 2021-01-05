import { createCanvas, loadImage } from 'canvas';
import cloud from "d3-cloud";

const words = ["Hello", "world", "normally", "you", "want", "more", "words", "than", "this"]
    .map(function(d) {
      return {text: d, size: 10 + Math.random() * 90};
    });

cloud().size([960, 500])
    .canvas(function() { return createCanvas(1, 1); })
    .words(words)
    .padding(5)
    .rotate(function() { return ~~(Math.random() * 2) * 90; })
    .font("Impact")
    .fontSize(function(d) { return d.size; })
    .on("end", end)
    .start();

function end(words) { console.log(JSON.stringify(words)); } 

export default function ReactWordcloud() {
  return (
    <div>Hello World!</div>
  )
}

// export default function ReactWordcloud() {
//     return (
//       <Stage width={100} height={100}>
//         <Layer>
//           <Text text="Try click on rect" />
//           <Rect
//             x={20}
//             y={20}
//             width={50}
//             height={50}
//             fill="green"
//             shadowBlur={5}
//           />
//         </Layer>
//       </Stage>
//     );
// }