import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

/**
 * Hilbert Curve
 *
 * A space-filling curve that visits every point in a square grid
 * using only 90-degree turns. Creates intricate maze-like patterns.
 *
 * Controls:
 * - Click: Toggle animation
 * - +/-: Adjust curve order (recursion depth)
 * - 1-3: Change color scheme
 */
const hilbertCurve: Sketch = (p: p5) => {
  let order = 5;
  let path: { x: number; y: number }[] = [];
  let drawIndex = 0;
  let animating = true;
  let colorScheme = 0;

  const colors = [
    { name: 'Rainbow', getColor: (t: number) => p.color((t * 360) % 360, 80, 90) },
    { name: 'Fire', getColor: (t: number) => p.color(t * 60, 90, 90) },
    { name: 'Ocean', getColor: (t: number) => p.color(180 + t * 60, 70, 80) },
  ];

  // Hilbert curve generation using iterative approach
  const hilbert = (n: number): { x: number; y: number }[] => {
    const points: { x: number; y: number }[] = [{ x: 0, y: 0 }];

    for (let s = 1; s < n; s *= 2) {
      const newPoints: { x: number; y: number }[] = [];

      for (const point of points) {
        // Rotate and flip existing points into 4 quadrants
        // Bottom-left quadrant (rotated)
        newPoints.push({ x: point.y, y: point.x });
      }

      for (const point of points) {
        // Top-left quadrant
        newPoints.push({ x: point.x, y: point.y + s });
      }

      for (const point of points) {
        // Top-right quadrant
        newPoints.push({ x: point.x + s, y: point.y + s });
      }

      for (const point of points) {
        // Bottom-right quadrant (rotated and flipped)
        newPoints.push({ x: 2 * s - 1 - point.y, y: s - 1 - point.x });
      }

      points.length = 0;
      points.push(...newPoints);
    }

    return points;
  };

  const generateCurve = () => {
    const n = Math.pow(2, order);
    const points = hilbert(n);

    const margin = 40;
    const size = Math.min(p.width, p.height) - margin * 2;
    const cellSize = size / n;
    const offsetX = (p.width - size) / 2;
    const offsetY = (p.height - size) / 2;

    path = points.map(pt => ({
      x: offsetX + pt.x * cellSize + cellSize / 2,
      y: offsetY + pt.y * cellSize + cellSize / 2,
    }));

    drawIndex = 0;
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100);
    generateCurve();
  };

  p.draw = () => {
    p.background(20, 10, 15);

    if (path.length === 0) return;

    // Draw completed portion
    p.noFill();
    p.strokeWeight(2);

    const maxDraw = animating ? drawIndex : path.length - 1;

    p.beginShape();
    for (let i = 0; i <= maxDraw && i < path.length; i++) {
      const t = i / path.length;
      const col = colors[colorScheme].getColor(t);
      p.stroke(col);

      if (i > 0) {
        // Draw segment
        p.line(path[i - 1].x, path[i - 1].y, path[i].x, path[i].y);
      }
    }
    p.endShape();

    // Draw current position marker
    if (animating && drawIndex < path.length) {
      const current = path[drawIndex];
      p.noStroke();
      p.fill(0, 0, 100);
      p.ellipse(current.x, current.y, 8, 8);

      // Animate
      const speed = Math.max(1, Math.floor(path.length / 500));
      drawIndex = Math.min(drawIndex + speed, path.length - 1);

      if (drawIndex >= path.length - 1) {
        animating = false;
      }
    }

    // Draw grid points
    p.noStroke();
    p.fill(0, 0, 40);
    for (const pt of path) {
      p.ellipse(pt.x, pt.y, 3, 3);
    }

    // Instructions
    p.colorMode(p.RGB, 255);
    p.fill(255);
    p.textSize(14);
    p.textAlign(p.LEFT, p.BOTTOM);
    const colorName = colors[colorScheme].name;
    const pointCount = path.length;
    const status = animating ? `Drawing... ${Math.floor((drawIndex / path.length) * 100)}%` : 'Complete';
    p.text(`Order: ${order} | Points: ${pointCount} | ${status} | Color: ${colorName} | +/-: order | 1-3: color | Click: restart`, 20, p.height - 20);
    p.colorMode(p.HSB, 360, 100, 100);
  };

  p.mousePressed = () => {
    animating = true;
    generateCurve();
  };

  p.keyPressed = () => {
    if (p.key === '+' || p.key === '=') {
      order = Math.min(8, order + 1);
      animating = true;
      generateCurve();
    } else if (p.key === '-' || p.key === '_') {
      order = Math.max(1, order - 1);
      animating = true;
      generateCurve();
    } else if (p.key === '1') {
      colorScheme = 0;
    } else if (p.key === '2') {
      colorScheme = 1;
    } else if (p.key === '3') {
      colorScheme = 2;
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    generateCurve();
  };
};

export default hilbertCurve;
