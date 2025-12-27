import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

/**
 * Quadtree Subdivision
 *
 * Recursively divides the canvas into four quadrants based on probability,
 * creating Mondrian-style compositions with balanced asymmetry.
 *
 * Controls:
 * - Click: Regenerate pattern
 * - 1-4: Change color palette
 * - +/-: Adjust subdivision probability
 */
const quadtreeSubdivision: Sketch = (p: p5) => {
  let subdivisionProbability = 0.75;
  let minSize = 40;
  let paletteIndex = 0;

  interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
    color: { r: number; g: number; b: number };
    depth: number;
  }

  let rectangles: Rect[] = [];

  // Color palettes
  const palettes = [
    // Mondrian classic
    [
      { r: 255, g: 255, b: 255 },
      { r: 255, g: 0, b: 0 },
      { r: 0, g: 0, b: 255 },
      { r: 255, g: 255, b: 0 },
      { r: 30, g: 30, b: 30 },
    ],
    // Pastel modern
    [
      { r: 255, g: 230, b: 230 },
      { r: 230, g: 255, b: 230 },
      { r: 230, g: 230, b: 255 },
      { r: 255, g: 255, b: 230 },
      { r: 240, g: 240, b: 240 },
    ],
    // Deep ocean
    [
      { r: 15, g: 32, b: 55 },
      { r: 40, g: 80, b: 120 },
      { r: 70, g: 130, b: 180 },
      { r: 100, g: 180, b: 220 },
      { r: 200, g: 230, b: 250 },
    ],
    // Sunset
    [
      { r: 255, g: 100, b: 100 },
      { r: 255, g: 150, b: 80 },
      { r: 255, g: 200, b: 100 },
      { r: 100, g: 50, b: 80 },
      { r: 50, g: 30, b: 50 },
    ],
  ];

  const getRandomColor = (depth: number): { r: number; g: number; b: number } => {
    const palette = palettes[paletteIndex];
    // Higher depth = more likely to be colorful
    if (p.random() < 0.3 + depth * 0.1) {
      return palette[Math.floor(p.random(palette.length))];
    }
    return palette[0]; // Primary background color
  };

  const subdivide = (x: number, y: number, w: number, h: number, depth: number) => {
    // Decide whether to subdivide based on probability and minimum size
    const shouldSubdivide =
      p.random() < subdivisionProbability * Math.pow(0.85, depth) &&
      w > minSize * 2 &&
      h > minSize * 2;

    if (!shouldSubdivide) {
      // Add this rectangle as a leaf node
      rectangles.push({
        x,
        y,
        w,
        h,
        color: getRandomColor(depth),
        depth,
      });
      return;
    }

    // Calculate split point with some randomness
    const splitX = x + w * p.random(0.3, 0.7);
    const splitY = y + h * p.random(0.3, 0.7);

    // Recursively subdivide each quadrant
    subdivide(x, y, splitX - x, splitY - y, depth + 1); // Top-left
    subdivide(splitX, y, x + w - splitX, splitY - y, depth + 1); // Top-right
    subdivide(x, splitY, splitX - x, y + h - splitY, depth + 1); // Bottom-left
    subdivide(splitX, splitY, x + w - splitX, y + h - splitY, depth + 1); // Bottom-right
  };

  const generatePattern = () => {
    rectangles = [];
    subdivide(0, 0, p.width, p.height, 0);
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noLoop();
    generatePattern();
  };

  p.draw = () => {
    p.background(30);

    // Draw all rectangles
    for (const rect of rectangles) {
      // Fill
      p.fill(rect.color.r, rect.color.g, rect.color.b);

      // Border
      p.stroke(20);
      p.strokeWeight(Math.max(2, 6 - rect.depth));

      p.rect(rect.x, rect.y, rect.w, rect.h);
    }

    // Optional: Add some geometric decorations
    p.noFill();
    p.strokeWeight(1);
    for (const rect of rectangles) {
      if (p.random() < 0.2 && rect.w > 60 && rect.h > 60) {
        const cx = rect.x + rect.w / 2;
        const cy = rect.y + rect.h / 2;
        const r = Math.min(rect.w, rect.h) * 0.3;

        // Subtle contrast color
        p.stroke(255 - rect.color.r, 255 - rect.color.g, 255 - rect.color.b, 50);

        if (p.random() < 0.5) {
          p.ellipse(cx, cy, r * 2, r * 2);
        } else {
          p.rectMode(p.CENTER);
          p.push();
          p.translate(cx, cy);
          p.rotate(p.PI / 4);
          p.rect(0, 0, r * 1.4, r * 1.4);
          p.pop();
          p.rectMode(p.CORNER);
        }
      }
    }

    // Instructions
    p.fill(255);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.LEFT, p.BOTTOM);
    const paletteName = ['Mondrian', 'Pastel', 'Ocean', 'Sunset'][paletteIndex];
    p.text(`Palette: ${paletteName} | Probability: ${Math.round(subdivisionProbability * 100)}% | Click to regenerate | 1-4: palette | +/-: probability`, 20, p.height - 20);
  };

  p.mousePressed = () => {
    generatePattern();
    p.redraw();
  };

  p.keyPressed = () => {
    if (p.key === '1') {
      paletteIndex = 0;
    } else if (p.key === '2') {
      paletteIndex = 1;
    } else if (p.key === '3') {
      paletteIndex = 2;
    } else if (p.key === '4') {
      paletteIndex = 3;
    } else if (p.key === '+' || p.key === '=') {
      subdivisionProbability = Math.min(0.95, subdivisionProbability + 0.05);
    } else if (p.key === '-' || p.key === '_') {
      subdivisionProbability = Math.max(0.3, subdivisionProbability - 0.05);
    }
    generatePattern();
    p.redraw();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    generatePattern();
    p.redraw();
  };
};

export default quadtreeSubdivision;
