import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

interface TrailPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
  type: 'circle' | 'square' | 'triangle';
}

const cursorTrailSketch: Sketch = (p: p5) => {
  const trail: TrailPoint[] = [];
  const maxTrailLength = 100;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let hueOffset = 0;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.noStroke();
    lastMouseX = p.mouseX;
    lastMouseY = p.mouseY;
  };

  p.draw = () => {
    p.background(250, 10, 15, 15);
    hueOffset += 0.5;

    // Calculate mouse velocity
    const vx = p.mouseX - lastMouseX;
    const vy = p.mouseY - lastMouseY;
    const speed = p.sqrt(vx * vx + vy * vy);

    // Add new trail points based on mouse movement
    if (speed > 1) {
      const numPoints = Math.min(Math.ceil(speed / 3), 5);
      for (let i = 0; i < numPoints; i++) {
        if (trail.length < maxTrailLength) {
          const types: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle'];
          trail.push({
            x: p.mouseX + p.random(-5, 5),
            y: p.mouseY + p.random(-5, 5),
            vx: vx * 0.2 + p.random(-2, 2),
            vy: vy * 0.2 + p.random(-2, 2),
            life: 1,
            maxLife: p.random(40, 80),
            size: p.map(speed, 0, 50, 5, 20),
            hue: (hueOffset + p.random(-30, 30)) % 360,
            type: types[Math.floor(p.random(types.length))],
          });
        }
      }
    }

    // Update and draw trail points
    for (let i = trail.length - 1; i >= 0; i--) {
      const point = trail[i];

      // Apply physics
      point.x += point.vx;
      point.y += point.vy;
      point.vy += 0.1; // Gravity
      point.vx *= 0.98; // Friction
      point.vy *= 0.98;
      point.life -= 1 / point.maxLife;

      if (point.life <= 0) {
        trail.splice(i, 1);
        continue;
      }

      // Draw point
      const alpha = point.life * 80;
      const size = point.size * point.life;

      p.fill(point.hue, 70, 90, alpha);

      p.push();
      p.translate(point.x, point.y);
      p.rotate(p.frameCount * 0.05 + i);

      switch (point.type) {
        case 'circle':
          p.ellipse(0, 0, size, size);
          break;
        case 'square':
          p.rectMode(p.CENTER);
          p.rect(0, 0, size, size);
          break;
        case 'triangle':
          const s = size / 2;
          p.triangle(0, -s, -s, s, s, s);
          break;
      }

      p.pop();
    }

    // Draw cursor glow
    p.noStroke();
    for (let i = 3; i > 0; i--) {
      const alpha = p.map(i, 3, 0, 20, 0);
      p.fill(hueOffset % 360, 60, 100, alpha);
      p.ellipse(p.mouseX, p.mouseY, i * 20, i * 20);
    }

    lastMouseX = p.mouseX;
    lastMouseY = p.mouseY;
  };

  p.mousePressed = () => {
    // Burst effect on click
    for (let i = 0; i < 30; i++) {
      const angle = p.random(p.TWO_PI);
      const speed = p.random(5, 15);
      const types: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle'];
      trail.push({
        x: p.mouseX,
        y: p.mouseY,
        vx: p.cos(angle) * speed,
        vy: p.sin(angle) * speed,
        life: 1,
        maxLife: p.random(50, 100),
        size: p.random(10, 25),
        hue: (hueOffset + p.random(-60, 60)) % 360,
        type: types[Math.floor(p.random(types.length))],
      });
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};

export default cursorTrailSketch;
