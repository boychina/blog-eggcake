import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Router from "next/router";
import cloud from "d3-cloud";
import { SendOutlined } from "@ant-design/icons";
import { COLORS } from "@/config/constant";
import type { TagsMap } from "@/types/post";

interface WordCloudWord {
  text: string;
  value: number;
  size: number;
  x: number;
  y: number;
  rotate: number;
  color: string;
}

interface WordCloudProps {
  title?: string;
  tags: TagsMap;
}

const CANVAS_WIDTH = 330;
const CANVAS_HEIGHT = 300;
const DEFAULT_FONT_SIZE = 20;

export default function WordCloud({ title, tags }: WordCloudProps) {
  if (!tags || !Object.keys(tags).length) return null;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveringWord, setHoveringWord] = useState("");
  const [words, setWords] = useState<WordCloudWord[]>([]);

  let maxSize = 1;
  Object.values(tags).forEach(({ value }) => {
    if (value > maxSize) {
      maxSize = value;
    }
  });

  const sourceWords = useMemo(() => {
    const result: Array<{ text: string; value: number; size: number; color: string }> = [];
    Object.keys(tags).forEach((word) => {
      const wordObj = tags[word];
      result.push({
        text: word,
        value: wordObj.value,
        size: maxSize > 1
          ? ((Math.log(wordObj.value) * 4) / (Math.log(maxSize) - Math.log(1))) * 4 + DEFAULT_FONT_SIZE
          : DEFAULT_FONT_SIZE,
        color: COLORS[result.length % COLORS.length],
      });
    });
    return result;
  }, [tags, maxSize]);

  useEffect(() => {
    const layout = cloud()
      .size([CANVAS_WIDTH, CANVAS_HEIGHT])
      .canvas(() => {
        const canvas = document.createElement("canvas");
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        return canvas;
      })
      .padding(4)
      .rotate(() => ~~(Math.random() * 2) * 90)
      .fontSize((d: { size: number }) => d.size);
    layout.words(sourceWords as never);
    layout.on("end", (computedWords: Array<{ text: string; value: number; size: number; x: number; y: number; rotate: number; color: string }>) => {
      setWords(computedWords.map((item) => ({ ...item })));
    });
    layout.start();
    return () => {
      layout.stop();
    };
  }, [sourceWords]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    words.forEach((word) => {
      ctx.save();
      ctx.translate(word.x, word.y);
      ctx.rotate((word.rotate * Math.PI) / 180);
      ctx.fillStyle = hoveringWord === word.text ? "#1890ff" : word.color;
      ctx.font = `${word.size}px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(word.text, 0, 0);
      ctx.restore();
    });
    ctx.restore();
  }, [hoveringWord, words]);

  const hitTest = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    for (let i = words.length - 1; i >= 0; i -= 1) {
      const word = words[i];
      const rad = (-word.rotate * Math.PI) / 180;
      const dx = x - (cx + word.x);
      const dy = y - (cy + word.y);
      const rx = dx * Math.cos(rad) - dy * Math.sin(rad);
      const ry = dx * Math.sin(rad) + dy * Math.cos(rad);
      ctx.font = `${word.size}px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif`;
      const width = ctx.measureText(word.text).width;
      const height = word.size;
      if (Math.abs(rx) <= width / 2 && Math.abs(ry) <= height / 2) {
        return word;
      }
    }
    return null;
  }, [words]);

  return (
    <div>
      {title ? (
        <div className="flex items-center" style={{ padding: "12px 0" }}>
          <SendOutlined />
          <span className="ml-1">{title}</span>
        </div>
      ) : null}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="mx-auto md:m-0"
        onMouseMove={(event) => {
          const hitWord = hitTest(event.clientX, event.clientY);
          setHoveringWord(hitWord?.text ?? "");
        }}
        onMouseLeave={() => {
          setHoveringWord("");
        }}
        onClick={(event) => {
          const hitWord = hitTest(event.clientX, event.clientY);
          if (!hitWord) return;
          Router.push({ pathname: "/tag/[tag]" }, `/tag/${encodeURIComponent(hitWord.text)}`);
        }}
      />
    </div>
  );
}
