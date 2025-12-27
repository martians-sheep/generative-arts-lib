import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

/**
 * Islamic Geometric Patterns
 *
 * Creates intricate star patterns using the traditional technique of
 * dividing circles into equal parts and connecting vertices.
 * Implements a simplified Hankin's method for generating girih patterns.
 *
 * Controls:
 * - Click: Regenerate pattern
 * - 1-3: Change symmetry (6, 8, 12-fold)
 * - +/-: Adjust pattern scale
 */
const islamicGeometry: Sketch = (p: p5) => {
  let symmetry = 8;
  let tileSize = 150;
  let angle = 0;

  const bgColor = { r: 15, g: 25, b: 45 };
  const lineColor = { r: 218, g: 165, b: 32 }; // Gold

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.angleMode(p.RADIANS);
  };

  const drawRosette = (cx: number, cy: number, radius: number, n: number) => {
    const innerRadius = radius * 0.4;
    const midRadius = radius * 0.7;

    // Draw outer star
    p.push();
    p.translate(cx, cy);
    p.rotate(angle);

    // Main star polygon
    p.beginShape();
    for (let i = 0; i < n * 2; i++) {
      const a = (p.TWO_PI / (n * 2)) * i - p.HALF_PI;
      const r = i % 2 === 0 ? radius : innerRadius;
      p.vertex(r * Math.cos(a), r * Math.sin(a));
    }
    p.endShape(p.CLOSE);

    // Inner connecting lines
    for (let i = 0; i < n; i++) {
      const a1 = (p.TWO_PI / n) * i - p.HALF_PI;
      const a2 = (p.TWO_PI / n) * ((i + 1) % n) - p.HALF_PI;

      // Outer vertex
      const x1 = radius * Math.cos(a1);
      const y1 = radius * Math.sin(a1);

      // Inner vertex
      const x2 = innerRadius * Math.cos((a1 + a2) / 2);
      const y2 = innerRadius * Math.sin((a1 + a2) / 2);

      // Mid-point connections
      const mx1 = midRadius * Math.cos(a1);
      const my1 = midRadius * Math.sin(a1);
      const mx2 = midRadius * Math.cos(a2);
      const my2 = midRadius * Math.sin(a2);

      p.line(x1, y1, mx1, my1);
      p.line(x2, y2, mx1, my1);
      p.line(x2, y2, mx2, my2);
    }

    // Central circle pattern
    const centerRadius = innerRadius * 0.6;
    p.beginShape();
    for (let i = 0; i < n; i++) {
      const a = (p.TWO_PI / n) * i - p.HALF_PI;
      p.vertex(centerRadius * Math.cos(a), centerRadius * Math.sin(a));
    }
    p.endShape(p.CLOSE);

    p.pop();
  };

  const drawInterlacePattern = (cx: number, cy: number, radius: number, n: number) => {
    p.push();
    p.translate(cx, cy);
    p.rotate(angle);

    // Create interlacing girih pattern
    for (let i = 0; i < n; i++) {
      const a1 = (p.TWO_PI / n) * i;
      const a2 = (p.TWO_PI / n) * ((i + 2) % n);
      const a3 = (p.TWO_PI / n) * ((i + 1) % n);

      const r1 = radius;
      const r2 = radius * 0.5;

      // Outer points
      const x1 = r1 * Math.cos(a1);
      const y1 = r1 * Math.sin(a1);
      const x2 = r1 * Math.cos(a2);
      const y2 = r1 * Math.sin(a2);

      // Inner point
      const ix = r2 * Math.cos(a3);
      const iy = r2 * Math.sin(a3);

      p.line(x1, y1, ix, iy);
      p.line(ix, iy, x2, y2);
    }

    // Inner decorative polygon
    const innerR = radius * 0.3;
    p.beginShape();
    for (let i = 0; i < n; i++) {
      const a = (p.TWO_PI / n) * i + p.PI / n;
      p.vertex(innerR * Math.cos(a), innerR * Math.sin(a));
    }
    p.endShape(p.CLOSE);

    p.pop();
  };

  const drawConnectingGeometry = (x1: number, y1: number, x2: number, y2: number) => {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const dist = p.dist(x1, y1, x2, y2);
    const angle = Math.atan2(y2 - y1, x2 - x1);

    p.push();
    p.translate(mx, my);
    p.rotate(angle);

    // Diamond connector
    const w = dist * 0.3;
    const h = dist * 0.15;
    p.beginShape();
    p.vertex(-w / 2, 0);
    p.vertex(0, -h);
    p.vertex(w / 2, 0);
    p.vertex(0, h);
    p.endShape(p.CLOSE);

    p.pop();
  };

  p.draw = () => {
    p.background(bgColor.r, bgColor.g, bgColor.b);
    p.stroke(lineColor.r, lineColor.g, lineColor.b);
    p.strokeWeight(1.5);
    p.noFill();

    // Calculate grid layout
    const horizontalSpacing = tileSize * 1.5;
    const verticalSpacing = tileSize * Math.sqrt(3) * 0.75;

    const cols = Math.ceil(p.width / horizontalSpacing) + 2;
    const rows = Math.ceil(p.height / verticalSpacing) + 2;

    // Draw rosettes in hexagonal grid
    for (let row = -1; row < rows; row++) {
      for (let col = -1; col < cols; col++) {
        const offsetX = row % 2 === 0 ? 0 : horizontalSpacing / 2;
        const x = col * horizontalSpacing + offsetX;
        const y = row * verticalSpacing;

        drawRosette(x, y, tileSize * 0.5, symmetry);

        // Draw secondary interlace patterns between rosettes
        if (col < cols - 1 && row % 2 === 0) {
          drawInterlacePattern(x + horizontalSpacing / 2, y + verticalSpacing / 2, tileSize * 0.25, symmetry / 2);
        }
      }
    }

    // Draw connecting geometry
    p.strokeWeight(0.5);
    p.stroke(lineColor.r, lineColor.g, lineColor.b, 150);
    for (let row = 0; row < rows - 1; row++) {
      for (let col = 0; col < cols - 1; col++) {
        const offsetX = row % 2 === 0 ? 0 : horizontalSpacing / 2;
        const x1 = col * horizontalSpacing + offsetX;
        const y1 = row * verticalSpacing;
        const offsetX2 = (row + 1) % 2 === 0 ? 0 : horizontalSpacing / 2;
        const x2 = col * horizontalSpacing + offsetX2;
        const y2 = (row + 1) * verticalSpacing;

        if (Math.abs(x2 - x1) < horizontalSpacing) {
          drawConnectingGeometry(x1, y1, x2, y2);
        }
      }
    }

    // Slow rotation for animation
    angle += 0.001;

    // Instructions
    p.fill(255);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.LEFT, p.BOTTOM);
    p.text(`Symmetry: ${symmetry}-fold | Size: ${tileSize}px | 1-3: symmetry | +/-: size`, 20, p.height - 20);
  };

  p.mousePressed = () => {
    angle = p.random(p.TWO_PI);
  };

  p.keyPressed = () => {
    if (p.key === '1') {
      symmetry = 6;
    } else if (p.key === '2') {
      symmetry = 8;
    } else if (p.key === '3') {
      symmetry = 12;
    } else if (p.key === '+' || p.key === '=') {
      tileSize = Math.min(300, tileSize + 20);
    } else if (p.key === '-' || p.key === '_') {
      tileSize = Math.max(60, tileSize - 20);
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};

export default islamicGeometry;
