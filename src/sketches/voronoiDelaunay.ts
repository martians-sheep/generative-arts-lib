import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

/**
 * Voronoi Diagram & Delaunay Triangulation
 * Divides space based on distance to seed points
 * Voronoi: Regions closest to each point
 * Delaunay: Triangulation connecting the points
 */
const voronoiDelaunaySketch: Sketch = (p: p5) => {
  interface Point {
    x: number;
    y: number;
    vx: number;
    vy: number;
    hue: number;
  }

  let points: Point[] = [];
  const numPoints = 30;
  let showVoronoi = true;
  let showDelaunay = true;
  let showPoints = true;
  let animating = true;
  let time = 0;

  const initPoints = () => {
    points = [];
    for (let i = 0; i < numPoints; i++) {
      points.push({
        x: p.random(50, p.width - 50),
        y: p.random(50, p.height - 50),
        vx: p.random(-1, 1),
        vy: p.random(-1, 1),
        hue: p.random(360),
      });
    }
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.pixelDensity(1);
    initPoints();
  };

  p.draw = () => {
    p.background(15, 25, 12);
    time += 0.01;

    // Update points
    if (animating) {
      for (const pt of points) {
        pt.x += pt.vx;
        pt.y += pt.vy;

        // Bounce off walls
        if (pt.x < 0 || pt.x > p.width) pt.vx *= -1;
        if (pt.y < 0 || pt.y > p.height) pt.vy *= -1;

        // Keep in bounds
        pt.x = p.constrain(pt.x, 0, p.width);
        pt.y = p.constrain(pt.y, 0, p.height);

        // Add mouse attraction
        const dx = p.mouseX - pt.x;
        const dy = p.mouseY - pt.y;
        const dist = p.sqrt(dx * dx + dy * dy);
        if (dist < 200 && dist > 0) {
          pt.vx += (dx / dist) * 0.1;
          pt.vy += (dy / dist) * 0.1;
        }

        // Damping
        pt.vx *= 0.99;
        pt.vy *= 0.99;
      }
    }

    // Draw Voronoi diagram using pixel-based approach
    if (showVoronoi) {
      drawVoronoi();
    }

    // Draw Delaunay triangulation
    if (showDelaunay) {
      drawDelaunay();
    }

    // Draw points
    if (showPoints) {
      for (const pt of points) {
        p.noStroke();
        // Glow
        p.fill(pt.hue, 70, 100, 30);
        p.ellipse(pt.x, pt.y, 20);
        // Core
        p.fill(pt.hue, 80, 100);
        p.ellipse(pt.x, pt.y, 8);
      }
    }

    // Instructions
    p.fill(0, 0, 100);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.LEFT, p.TOP);
    p.text('V: Toggle Voronoi | D: Toggle Delaunay | P: Toggle Points | Space: Pause', 20, 20);
    p.text('Click to add point | R: Reset', 20, 40);
  };

  const drawVoronoi = () => {
    // Fast approximate Voronoi using pixel sampling
    const step = 4;
    p.noStroke();

    for (let x = 0; x < p.width; x += step) {
      for (let y = 0; y < p.height; y += step) {
        let minDist = Infinity;
        let closestPoint: Point | null = null;
        let secondDist = Infinity;

        for (const pt of points) {
          const dist = p.dist(x, y, pt.x, pt.y);
          if (dist < minDist) {
            secondDist = minDist;
            minDist = dist;
            closestPoint = pt;
          } else if (dist < secondDist) {
            secondDist = dist;
          }
        }

        if (closestPoint) {
          // Color based on distance to boundary
          const edgeDist = secondDist - minDist;
          const alpha = p.map(edgeDist, 0, 50, 100, 30);
          const brightness = p.map(minDist, 0, 200, 70, 30);

          p.fill(closestPoint.hue, 60, brightness, alpha);
          p.rect(x, y, step, step);
        }
      }
    }

    // Draw edges (boundaries)
    for (let x = 0; x < p.width; x += 2) {
      for (let y = 0; y < p.height; y += 2) {
        let minDist = Infinity;
        let secondDist = Infinity;

        for (const pt of points) {
          const dist = p.dist(x, y, pt.x, pt.y);
          if (dist < minDist) {
            secondDist = minDist;
            minDist = dist;
          } else if (dist < secondDist) {
            secondDist = dist;
          }
        }

        const edgeDist = secondDist - minDist;
        if (edgeDist < 3) {
          p.fill(0, 0, 100, 80);
          p.rect(x, y, 2, 2);
        }
      }
    }
  };

  const drawDelaunay = () => {
    // Simple Delaunay using circumcircle test
    const triangles = computeDelaunay();

    p.strokeWeight(1);
    for (const tri of triangles) {
      const hue = (tri.p1.hue + tri.p2.hue + tri.p3.hue) / 3;
      p.stroke(hue, 70, 90, 60);
      p.line(tri.p1.x, tri.p1.y, tri.p2.x, tri.p2.y);
      p.line(tri.p2.x, tri.p2.y, tri.p3.x, tri.p3.y);
      p.line(tri.p3.x, tri.p3.y, tri.p1.x, tri.p1.y);
    }
  };

  interface Triangle {
    p1: Point;
    p2: Point;
    p3: Point;
  }

  const computeDelaunay = (): Triangle[] => {
    // Simple O(n^3) Delaunay triangulation
    // For production, use a proper library
    const triangles: Triangle[] = [];

    for (let i = 0; i < points.length - 2; i++) {
      for (let j = i + 1; j < points.length - 1; j++) {
        for (let k = j + 1; k < points.length; k++) {
          const p1 = points[i];
          const p2 = points[j];
          const p3 = points[k];

          // Check if any other point is inside the circumcircle
          const cc = circumcircle(p1, p2, p3);
          if (!cc) continue;

          let valid = true;
          for (let l = 0; l < points.length; l++) {
            if (l === i || l === j || l === k) continue;
            const dist = p.dist(points[l].x, points[l].y, cc.x, cc.y);
            if (dist < cc.r - 0.001) {
              valid = false;
              break;
            }
          }

          if (valid) {
            triangles.push({ p1, p2, p3 });
          }
        }
      }
    }

    return triangles;
  };

  const circumcircle = (p1: Point, p2: Point, p3: Point): { x: number; y: number; r: number } | null => {
    const ax = p2.x - p1.x;
    const ay = p2.y - p1.y;
    const bx = p3.x - p1.x;
    const by = p3.y - p1.y;

    const d = 2 * (ax * by - ay * bx);
    if (Math.abs(d) < 0.0001) return null;

    const ua = (by * (ax * ax + ay * ay) - ay * (bx * bx + by * by)) / d;
    const ub = (ax * (bx * bx + by * by) - bx * (ax * ax + ay * ay)) / d;

    const x = p1.x + ua;
    const y = p1.y + ub;
    const r = Math.sqrt(ua * ua + ub * ub);

    return { x, y, r };
  };

  p.mousePressed = () => {
    points.push({
      x: p.mouseX,
      y: p.mouseY,
      vx: p.random(-1, 1),
      vy: p.random(-1, 1),
      hue: p.random(360),
    });
  };

  p.keyPressed = () => {
    if (p.key === 'v' || p.key === 'V') showVoronoi = !showVoronoi;
    if (p.key === 'd' || p.key === 'D') showDelaunay = !showDelaunay;
    if (p.key === 'p' || p.key === 'P') showPoints = !showPoints;
    if (p.key === 'r' || p.key === 'R') initPoints();
    if (p.key === ' ') animating = !animating;
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    initPoints();
  };
};

export default voronoiDelaunaySketch;
