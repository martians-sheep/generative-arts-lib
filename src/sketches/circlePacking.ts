import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

interface Circle {
  x: number;
  y: number;
  r: number;
  growing: boolean;
  color: p5.Color;
}

const circlePackingSketch: Sketch = (p: p5) => {
  const circles: Circle[] = [];
  const maxCircles = 1000;
  const maxAttempts = 100;
  let finished = false;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.noStroke();
    finished = false;
    circles.length = 0;
  };

  const addNewCircle = (): Circle | null => {
    for (let attempts = 0; attempts < maxAttempts; attempts++) {
      const x = p.random(p.width);
      const y = p.random(p.height);

      let valid = true;
      for (const c of circles) {
        const d = p.dist(x, y, c.x, c.y);
        if (d < c.r + 2) {
          valid = false;
          break;
        }
      }

      if (valid) {
        const hue = p.random(360);
        return {
          x,
          y,
          r: 1,
          growing: true,
          color: p.color(hue, 70, 90, 80),
        };
      }
    }
    return null;
  };

  const isColliding = (circle: Circle): boolean => {
    // Check edges
    if (circle.x - circle.r < 0 || circle.x + circle.r > p.width) return true;
    if (circle.y - circle.r < 0 || circle.y + circle.r > p.height) return true;

    // Check other circles
    for (const other of circles) {
      if (other === circle) continue;
      const d = p.dist(circle.x, circle.y, other.x, other.y);
      if (d < circle.r + other.r + 1) {
        return true;
      }
    }
    return false;
  };

  p.draw = () => {
    p.background(20);

    if (!finished) {
      // Try to add new circles
      for (let i = 0; i < 5; i++) {
        if (circles.length < maxCircles) {
          const newCircle = addNewCircle();
          if (newCircle) {
            circles.push(newCircle);
          }
        }
      }

      // Grow circles
      let stillGrowing = false;
      for (const circle of circles) {
        if (circle.growing) {
          circle.r += 0.5;
          if (isColliding(circle)) {
            circle.r -= 0.5;
            circle.growing = false;
          } else {
            stillGrowing = true;
          }
        }
      }

      if (!stillGrowing && circles.length >= maxCircles) {
        finished = true;
      }
    }

    // Draw circles
    for (const circle of circles) {
      p.fill(circle.color);
      p.ellipse(circle.x, circle.y, circle.r * 2);

      // Add highlight
      p.fill(0, 0, 100, 30);
      p.ellipse(circle.x - circle.r * 0.3, circle.y - circle.r * 0.3, circle.r * 0.5);
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    circles.length = 0;
    finished = false;
  };

  p.mousePressed = () => {
    circles.length = 0;
    finished = false;
  };
};

export default circlePackingSketch;
