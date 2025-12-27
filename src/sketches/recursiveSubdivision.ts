import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

const recursiveSubdivisionSketch: Sketch = (p: p5) => {
  const colors: string[] = [
    '#FF0000', '#FFFF00', '#0000FF', '#FFFFFF', '#000000',
  ];

  const minSize = 30;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noLoop();
    drawMondrian();
  };

  const drawMondrian = () => {
    p.background(255);
    subdivide(0, 0, p.width, p.height, 0);
  };

  const subdivide = (x: number, y: number, w: number, h: number, depth: number) => {
    // Draw the rectangle
    p.stroke(0);
    p.strokeWeight(depth < 2 ? 8 : depth < 4 ? 4 : 2);

    // Choose color (white more often for Mondrian style)
    let col: string;
    const colorRoll = p.random();
    if (colorRoll < 0.65) {
      col = '#FFFFFF';
    } else if (colorRoll < 0.75) {
      col = '#FF0000';
    } else if (colorRoll < 0.85) {
      col = '#FFFF00';
    } else if (colorRoll < 0.95) {
      col = '#0000FF';
    } else {
      col = '#000000';
    }

    p.fill(col);
    p.rect(x, y, w, h);

    // Decide whether to subdivide
    const shouldSubdivide = p.random() > 0.3 && w > minSize * 2 && h > minSize * 2;

    if (!shouldSubdivide) {
      return;
    }

    // Decide split direction
    const splitHorizontal = p.random() > 0.5;

    if (splitHorizontal && h > minSize * 2) {
      const splitY = y + p.random(minSize, h - minSize);
      subdivide(x, y, w, splitY - y, depth + 1);
      subdivide(x, splitY, w, h - (splitY - y), depth + 1);
    } else if (w > minSize * 2) {
      const splitX = x + p.random(minSize, w - minSize);
      subdivide(x, y, splitX - x, h, depth + 1);
      subdivide(splitX, y, w - (splitX - x), h, depth + 1);
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    drawMondrian();
  };

  p.mousePressed = () => {
    drawMondrian();
  };
};

export default recursiveSubdivisionSketch;
