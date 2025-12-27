import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

/**
 * Circle Inversion Art
 *
 * Uses circle inversion (Möbius transformation) to create fractal-like
 * patterns. Related to Apollonian gaskets but with unique visual properties.
 *
 * Controls:
 * - Mouse: Move the inversion center
 * - 1-3: Change pattern type
 * - +/-: Adjust inversion radius
 * - Click: Toggle animation
 */
const circleInversion: Sketch = (p: p5) => {
  let inversionRadius = 200;
  let patternType = 1;
  let animating = true;
  let time = 0;

  interface Circle {
    x: number;
    y: number;
    r: number;
    hue: number;
  }

  let baseCircles: Circle[] = [];

  const invertPoint = (
    px: number,
    py: number,
    cx: number,
    cy: number,
    r: number
  ): { x: number; y: number } => {
    const dx = px - cx;
    const dy = py - cy;
    const distSq = dx * dx + dy * dy;

    if (distSq < 0.001) return { x: cx, y: cy };

    const factor = (r * r) / distSq;
    return {
      x: cx + dx * factor,
      y: cy + dy * factor,
    };
  };

  const invertCircle = (
    circle: Circle,
    cx: number,
    cy: number,
    r: number
  ): Circle | null => {
    const dx = circle.x - cx;
    const dy = circle.y - cy;
    const d = Math.sqrt(dx * dx + dy * dy);

    if (d < 0.001) return null;

    // Special case: circle passes through inversion center
    if (Math.abs(d - circle.r) < 0.001) {
      return null; // Results in a line, skip for now
    }

    // Calculate inverted circle
    const rSquared = r * r;
    const a = d - circle.r;
    const b = d + circle.r;

    if (Math.abs(a) < 0.001 || Math.abs(b) < 0.001) return null;

    const newR = Math.abs(rSquared / (2 * (d - circle.r)) - rSquared / (2 * (d + circle.r)));
    const newD = (rSquared * d) / (d * d - circle.r * circle.r);

    if (isNaN(newR) || isNaN(newD) || !isFinite(newR) || !isFinite(newD)) return null;

    const angle = Math.atan2(dy, dx);
    return {
      x: cx + newD * Math.cos(angle),
      y: cy + newD * Math.sin(angle),
      r: newR,
      hue: circle.hue,
    };
  };

  const generatePattern1 = () => {
    // Grid of circles
    baseCircles = [];
    const spacing = 60;
    const baseR = 20;

    for (let x = -p.width; x < p.width * 2; x += spacing) {
      for (let y = -p.height; y < p.height * 2; y += spacing) {
        baseCircles.push({
          x,
          y,
          r: baseR,
          hue: (x + y) * 0.5 % 360,
        });
      }
    }
  };

  const generatePattern2 = () => {
    // Concentric rings
    baseCircles = [];
    const cx = p.width / 2;
    const cy = p.height / 2;

    for (let r = 30; r < Math.max(p.width, p.height); r += 40) {
      const numCircles = Math.floor((2 * Math.PI * r) / 30);
      for (let i = 0; i < numCircles; i++) {
        const angle = (p.TWO_PI / numCircles) * i;
        baseCircles.push({
          x: cx + r * Math.cos(angle),
          y: cy + r * Math.sin(angle),
          r: 10,
          hue: (r * 2) % 360,
        });
      }
    }
  };

  const generatePattern3 = () => {
    // Spiral pattern
    baseCircles = [];
    const cx = p.width / 2;
    const cy = p.height / 2;

    for (let i = 0; i < 500; i++) {
      const angle = i * 0.3;
      const r = i * 1.5;
      baseCircles.push({
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        r: 8 + i * 0.02,
        hue: (i * 3) % 360,
      });
    }
  };

  const generateBasePattern = () => {
    switch (patternType) {
      case 1:
        generatePattern1();
        break;
      case 2:
        generatePattern2();
        break;
      case 3:
        generatePattern3();
        break;
    }
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    generateBasePattern();
  };

  p.draw = () => {
    p.background(0, 0, 10);

    // Inversion center follows mouse with smoothing
    let invCenterX = p.mouseX;
    let invCenterY = p.mouseY;

    if (animating) {
      // Add circular motion when animating
      const animRadius = 100;
      invCenterX = p.width / 2 + Math.cos(time) * animRadius;
      invCenterY = p.height / 2 + Math.sin(time * 0.7) * animRadius;
    }

    // Draw inversion circle
    p.noFill();
    p.stroke(0, 0, 50);
    p.strokeWeight(2);
    p.ellipse(invCenterX, invCenterY, inversionRadius * 2, inversionRadius * 2);

    // Draw inverted circles
    p.strokeWeight(1);
    for (const circle of baseCircles) {
      const inverted = invertCircle(circle, invCenterX, invCenterY, inversionRadius);

      if (inverted && inverted.r > 1 && inverted.r < 1000) {
        // Check if circle is visible
        if (
          inverted.x + inverted.r > 0 &&
          inverted.x - inverted.r < p.width &&
          inverted.y + inverted.r > 0 &&
          inverted.y - inverted.r < p.height
        ) {
          const alpha = p.map(inverted.r, 1, 500, 80, 20);
          p.stroke((inverted.hue + time * 10) % 360, 70, 90, alpha);
          p.noFill();
          p.ellipse(inverted.x, inverted.y, inverted.r * 2, inverted.r * 2);
        }
      }
    }

    // Draw base circles (semi-transparent)
    p.strokeWeight(0.5);
    for (const circle of baseCircles) {
      if (
        circle.x + circle.r > 0 &&
        circle.x - circle.r < p.width &&
        circle.y + circle.r > 0 &&
        circle.y - circle.r < p.height
      ) {
        p.stroke(circle.hue, 50, 50, 30);
        p.noFill();
        p.ellipse(circle.x, circle.y, circle.r * 2, circle.r * 2);
      }
    }

    if (animating) {
      time += 0.01;
    }

    // Instructions
    p.colorMode(p.RGB, 255);
    p.fill(255);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.LEFT, p.BOTTOM);
    const patternName = ['Grid', 'Rings', 'Spiral'][patternType - 1];
    const animState = animating ? 'ON' : 'OFF';
    p.text(`Pattern: ${patternName} | Radius: ${inversionRadius}px | Animation: ${animState} | 1-3: pattern | +/-: radius | Click: toggle anim`, 20, p.height - 20);
    p.colorMode(p.HSB, 360, 100, 100, 100);
  };

  p.mousePressed = () => {
    animating = !animating;
  };

  p.keyPressed = () => {
    if (p.key === '1') {
      patternType = 1;
      generateBasePattern();
    } else if (p.key === '2') {
      patternType = 2;
      generateBasePattern();
    } else if (p.key === '3') {
      patternType = 3;
      generateBasePattern();
    } else if (p.key === '+' || p.key === '=') {
      inversionRadius = Math.min(500, inversionRadius + 20);
    } else if (p.key === '-' || p.key === '_') {
      inversionRadius = Math.max(50, inversionRadius - 20);
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    generateBasePattern();
  };
};

export default circleInversion;
