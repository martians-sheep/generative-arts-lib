import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hue: number;
}

const voronoiSketch: Sketch = (p: p5) => {
  const points: Point[] = [];
  const numPoints = 30;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.pixelDensity(1);
    initPoints();
  };

  const initPoints = () => {
    points.length = 0;
    for (let i = 0; i < numPoints; i++) {
      points.push({
        x: p.random(p.width),
        y: p.random(p.height),
        vx: p.random(-0.5, 0.5),
        vy: p.random(-0.5, 0.5),
        hue: p.random(180, 260),
      });
    }
  };

  p.draw = () => {
    // Add mouse as a dynamic point
    const allPoints = [...points];
    if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
      allPoints.push({
        x: p.mouseX,
        y: p.mouseY,
        vx: 0,
        vy: 0,
        hue: 60,
      });
    }

    // Update point positions
    for (const point of points) {
      point.x += point.vx;
      point.y += point.vy;

      // Bounce off edges
      if (point.x < 0 || point.x > p.width) point.vx *= -1;
      if (point.y < 0 || point.y > p.height) point.vy *= -1;

      point.x = p.constrain(point.x, 0, p.width);
      point.y = p.constrain(point.y, 0, p.height);
    }

    // Draw Voronoi cells using pixel-based approach
    p.loadPixels();

    const step = 4; // Skip pixels for performance
    for (let x = 0; x < p.width; x += step) {
      for (let y = 0; y < p.height; y += step) {
        let minDist = Infinity;
        let secondMinDist = Infinity;
        let closestPoint: Point | null = null;

        for (const point of allPoints) {
          const d = p.dist(x, y, point.x, point.y);
          if (d < minDist) {
            secondMinDist = minDist;
            minDist = d;
            closestPoint = point;
          } else if (d < secondMinDist) {
            secondMinDist = d;
          }
        }

        // Edge detection - darker near cell boundaries
        const edgeFactor = secondMinDist - minDist;
        const brightness = p.map(edgeFactor, 0, 30, 20, 40);
        const saturation = p.map(minDist, 0, 200, 40, 20);

        const hue = closestPoint ? closestPoint.hue : 200;
        const c = p.color(hue, saturation, brightness);

        // Fill block of pixels
        for (let dx = 0; dx < step && x + dx < p.width; dx++) {
          for (let dy = 0; dy < step && y + dy < p.height; dy++) {
            const idx = 4 * ((y + dy) * p.width + (x + dx));
            p.pixels[idx] = p.red(c);
            p.pixels[idx + 1] = p.green(c);
            p.pixels[idx + 2] = p.blue(c);
            p.pixels[idx + 3] = 255;
          }
        }
      }
    }

    p.updatePixels();

    // Draw cell centers
    p.noStroke();
    for (const point of allPoints) {
      p.fill(point.hue, 80, 90);
      p.ellipse(point.x, point.y, 6, 6);
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    initPoints();
  };

  p.mousePressed = () => {
    initPoints();
  };
};

export default voronoiSketch;
