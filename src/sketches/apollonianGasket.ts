import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

/**
 * Apollonian Gasket (Circle Inversion Fractal)
 * A fractal created by recursively filling the space between
 * mutually tangent circles with more tangent circles
 */
const apollonianGasketSketch: Sketch = (p: p5) => {
  interface Circle {
    x: number;
    y: number;
    r: number;
    curvature: number;
    hue: number;
    depth: number;
  }

  let circles: Circle[] = [];
  let queue: Circle[][] = [];
  let maxDepth = 6;
  let animationStep = 0;
  let animating = true;
  let time = 0;

  // Descartes Circle Theorem:
  // Given three mutually tangent circles with curvatures k1, k2, k3,
  // the fourth tangent circle has curvature:
  // k4 = k1 + k2 + k3 ± 2*sqrt(k1*k2 + k2*k3 + k3*k1)

  const complexFromCircle = (c: Circle) => {
    // Curvature * center as complex number
    return { re: c.curvature * c.x, im: c.curvature * c.y };
  };

  const descartes = (c1: Circle, c2: Circle, c3: Circle): Circle[] => {
    // Calculate curvature of fourth circle using Descartes theorem
    const k1 = c1.curvature;
    const k2 = c2.curvature;
    const k3 = c3.curvature;

    const sum = k1 + k2 + k3;
    const product = k1 * k2 + k2 * k3 + k3 * k1;
    const sqrtProduct = Math.sqrt(Math.abs(product));

    // Two possible curvatures (outer and inner solutions)
    const k4a = sum + 2 * sqrtProduct;
    const k4b = sum - 2 * sqrtProduct;

    const results: Circle[] = [];

    for (const k4 of [k4a, k4b]) {
      if (Math.abs(k4) < 0.001) continue;
      if (k4 < 0) continue; // Skip outer circle solution

      // Complex Descartes theorem for center
      const z1 = complexFromCircle(c1);
      const z2 = complexFromCircle(c2);
      const z3 = complexFromCircle(c3);

      const zSum = { re: z1.re + z2.re + z3.re, im: z1.im + z2.im + z3.im };
      const z1z2 = { re: z1.re * z2.re - z1.im * z2.im, im: z1.re * z2.im + z1.im * z2.re };
      const z2z3 = { re: z2.re * z3.re - z2.im * z3.im, im: z2.re * z3.im + z2.im * z3.re };
      const z3z1 = { re: z3.re * z1.re - z3.im * z1.im, im: z3.re * z1.im + z3.im * z1.re };

      const productSum = {
        re: z1z2.re + z2z3.re + z3z1.re,
        im: z1z2.im + z2z3.im + z3z1.im
      };

      // sqrt of complex number
      const mag = Math.sqrt(productSum.re * productSum.re + productSum.im * productSum.im);
      const arg = Math.atan2(productSum.im, productSum.re);
      const sqrtZ = { re: Math.sqrt(mag) * Math.cos(arg / 2), im: Math.sqrt(mag) * Math.sin(arg / 2) };

      for (const sign of [1, -1]) {
        const z4 = {
          re: (zSum.re + sign * 2 * sqrtZ.re) / k4,
          im: (zSum.im + sign * 2 * sqrtZ.im) / k4
        };

        const newCircle: Circle = {
          x: z4.re,
          y: z4.im,
          r: Math.abs(1 / k4),
          curvature: k4,
          hue: p.random(360),
          depth: Math.max(c1.depth, c2.depth, c3.depth) + 1
        };

        // Validate circle
        if (isValidCircle(newCircle, [c1, c2, c3])) {
          results.push(newCircle);
        }
      }
    }

    return results;
  };

  const isValidCircle = (newCircle: Circle, existingCircles: Circle[]): boolean => {
    if (newCircle.r < 2) return false;
    if (newCircle.r > p.width) return false;
    if (!isFinite(newCircle.x) || !isFinite(newCircle.y)) return false;

    // Check it's not too far from existing circles
    for (const c of existingCircles) {
      const d = p.dist(newCircle.x, newCircle.y, c.x, c.y);
      const expectedDist = Math.abs(newCircle.r + c.r); // Should be tangent
      if (Math.abs(d - expectedDist) > newCircle.r * 0.5) return false;
    }

    // Check not duplicate
    for (const c of circles) {
      const d = p.dist(newCircle.x, newCircle.y, c.x, c.y);
      if (d < 1 && Math.abs(newCircle.r - c.r) < 1) return false;
    }

    return true;
  };

  const initGasket = () => {
    circles = [];
    queue = [];
    animationStep = 0;

    const size = p.min(p.width, p.height) * 0.45;
    const cx = p.width / 2;
    const cy = p.height / 2;

    // Create initial configuration: one large circle containing three tangent circles
    // Outer circle (with negative curvature - contains the others)
    const outerR = size;
    const outer: Circle = {
      x: cx,
      y: cy,
      r: outerR,
      curvature: -1 / outerR,
      hue: 0,
      depth: 0
    };

    // Three inner tangent circles
    // Use Soddy circles configuration
    const r = outerR / (1 + 2 / Math.sqrt(3));
    const angle = -Math.PI / 2;

    const c1: Circle = {
      x: cx + (outerR - r) * Math.cos(angle),
      y: cy + (outerR - r) * Math.sin(angle),
      r: r,
      curvature: 1 / r,
      hue: 200,
      depth: 0
    };

    const c2: Circle = {
      x: cx + (outerR - r) * Math.cos(angle + 2 * Math.PI / 3),
      y: cy + (outerR - r) * Math.sin(angle + 2 * Math.PI / 3),
      r: r,
      curvature: 1 / r,
      hue: 120,
      depth: 0
    };

    const c3: Circle = {
      x: cx + (outerR - r) * Math.cos(angle + 4 * Math.PI / 3),
      y: cy + (outerR - r) * Math.sin(angle + 4 * Math.PI / 3),
      r: r,
      curvature: 1 / r,
      hue: 300,
      depth: 0
    };

    circles.push(outer, c1, c2, c3);

    // Initial triplets to process
    queue.push([outer, c1, c2]);
    queue.push([outer, c2, c3]);
    queue.push([outer, c3, c1]);
    queue.push([c1, c2, c3]);
  };

  const generateNextLevel = () => {
    if (queue.length === 0) return;

    const newQueue: Circle[][] = [];
    const processed = new Set<string>();

    for (const triplet of queue) {
      const [c1, c2, c3] = triplet;

      const newCircles = descartes(c1, c2, c3);

      for (const newCircle of newCircles) {
        if (newCircle.depth > maxDepth) continue;

        const key = `${Math.round(newCircle.x)},${Math.round(newCircle.y)},${Math.round(newCircle.r)}`;
        if (processed.has(key)) continue;
        processed.add(key);

        circles.push(newCircle);

        // Add new triplets for next iteration
        newQueue.push([c1, c2, newCircle]);
        newQueue.push([c2, c3, newCircle]);
        newQueue.push([c3, c1, newCircle]);
      }
    }

    queue = newQueue;
    animationStep++;
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    initGasket();
  };

  p.draw = () => {
    p.background(10, 20, 8);
    time += 0.01;

    // Animate construction
    if (animating && queue.length > 0) {
      generateNextLevel();
    }

    // Draw all circles
    for (let i = 0; i < circles.length; i++) {
      const c = circles[i];

      // Skip the outer bounding circle for cleaner look
      if (c.curvature < 0) {
        p.noFill();
        p.stroke(0, 0, 50, 50);
        p.strokeWeight(2);
        p.ellipse(c.x, c.y, c.r * 2);
        continue;
      }

      // Color based on depth and time
      const hue = (c.hue + time * 20 + c.depth * 30) % 360;
      const sat = 70 + c.depth * 3;
      const bri = 90 - c.depth * 8;

      // Glow effect
      p.noStroke();
      p.fill(hue, sat - 20, bri, 20);
      p.ellipse(c.x, c.y, c.r * 2.3);

      // Main circle
      p.stroke(hue, sat, bri + 10, 80);
      p.strokeWeight(Math.max(1, 3 - c.depth * 0.4));
      p.fill(hue, sat, bri * 0.3, 60);
      p.ellipse(c.x, c.y, c.r * 2);
    }

    // UI
    p.fill(0, 0, 100);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`Circles: ${circles.length} | Depth: ${animationStep}`, 20, 20);
    p.text('Click to restart | Space to pause', 20, 40);
    p.text('↑↓: Change max depth', 20, 60);
  };

  p.mousePressed = () => {
    initGasket();
  };

  p.keyPressed = () => {
    if (p.key === ' ') {
      animating = !animating;
    } else if (p.keyCode === 38) { // UP_ARROW
      maxDepth = Math.min(maxDepth + 1, 10);
      initGasket();
    } else if (p.keyCode === 40) { // DOWN_ARROW
      maxDepth = Math.max(maxDepth - 1, 2);
      initGasket();
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    initGasket();
  };
};

export default apollonianGasketSketch;
