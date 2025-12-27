import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

/**
 * Metaballs
 *
 * Organic blobs that merge and separate based on a scalar field.
 * Uses marching squares to draw the isosurface where the field
 * equals a threshold value.
 *
 * Controls:
 * - Mouse: Add attraction point
 * - Click: Add new metaball
 * - +/-: Adjust threshold
 * - 1-3: Change color scheme
 */
const metaballs: Sketch = (p: p5) => {
  interface Ball {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
  }

  let balls: Ball[] = [];
  let threshold = 1;
  let colorScheme = 0;
  const resolution = 5;

  const colorSchemes = [
    { name: 'Lava', bg: [20, 10, 10], colors: [[255, 100, 50], [255, 200, 100]] },
    { name: 'Ocean', bg: [10, 20, 40], colors: [[50, 150, 255], [150, 255, 255]] },
    { name: 'Slime', bg: [10, 30, 10], colors: [[100, 255, 100], [200, 255, 150]] },
  ];

  const initBalls = () => {
    balls = [];
    const numBalls = 8;

    for (let i = 0; i < numBalls; i++) {
      balls.push({
        x: p.random(p.width * 0.2, p.width * 0.8),
        y: p.random(p.height * 0.2, p.height * 0.8),
        vx: p.random(-2, 2),
        vy: p.random(-2, 2),
        radius: p.random(60, 120),
      });
    }
  };

  const getFieldValue = (x: number, y: number): number => {
    let sum = 0;

    for (const ball of balls) {
      const dx = x - ball.x;
      const dy = y - ball.y;
      const distSq = dx * dx + dy * dy;
      if (distSq > 0) {
        sum += (ball.radius * ball.radius) / distSq;
      }
    }

    // Add mouse influence
    const mdx = x - p.mouseX;
    const mdy = y - p.mouseY;
    const mDistSq = mdx * mdx + mdy * mdy;
    if (mDistSq > 0) {
      sum += (80 * 80) / mDistSq;
    }

    return sum;
  };

  const updateBalls = () => {
    for (const ball of balls) {
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Bounce off walls
      if (ball.x < ball.radius * 0.5 || ball.x > p.width - ball.radius * 0.5) {
        ball.vx *= -1;
        ball.x = p.constrain(ball.x, ball.radius * 0.5, p.width - ball.radius * 0.5);
      }
      if (ball.y < ball.radius * 0.5 || ball.y > p.height - ball.radius * 0.5) {
        ball.vy *= -1;
        ball.y = p.constrain(ball.y, ball.radius * 0.5, p.height - ball.radius * 0.5);
      }

      // Slight random movement
      ball.vx += p.random(-0.1, 0.1);
      ball.vy += p.random(-0.1, 0.1);

      // Damping
      ball.vx *= 0.99;
      ball.vy *= 0.99;
    }
  };

  const drawMetaballs = () => {
    const scheme = colorSchemes[colorScheme];
    p.loadPixels();

    for (let y = 0; y < p.height; y += resolution) {
      for (let x = 0; x < p.width; x += resolution) {
        const value = getFieldValue(x, y);

        // Calculate color based on field value
        let r, g, b;
        if (value >= threshold) {
          const intensity = Math.min((value - threshold) / threshold, 1);
          r = p.lerp(scheme.colors[0][0], scheme.colors[1][0], intensity);
          g = p.lerp(scheme.colors[0][1], scheme.colors[1][1], intensity);
          b = p.lerp(scheme.colors[0][2], scheme.colors[1][2], intensity);
        } else {
          r = scheme.bg[0];
          g = scheme.bg[1];
          b = scheme.bg[2];
        }

        // Fill the resolution block
        for (let py = y; py < Math.min(y + resolution, p.height); py++) {
          for (let px = x; px < Math.min(x + resolution, p.width); px++) {
            const idx = (py * p.width + px) * 4;
            p.pixels[idx] = r;
            p.pixels[idx + 1] = g;
            p.pixels[idx + 2] = b;
            p.pixels[idx + 3] = 255;
          }
        }
      }
    }

    p.updatePixels();

    // Draw contour lines using marching squares
    p.stroke(255, 255, 255, 100);
    p.strokeWeight(2);
    p.noFill();

    const cols = Math.ceil(p.width / resolution);
    const rows = Math.ceil(p.height / resolution);

    for (let i = 0; i < cols - 1; i++) {
      for (let j = 0; j < rows - 1; j++) {
        const x = i * resolution;
        const y = j * resolution;

        // Sample corners
        const a = getFieldValue(x, y) >= threshold ? 1 : 0;
        const b = getFieldValue(x + resolution, y) >= threshold ? 1 : 0;
        const c = getFieldValue(x + resolution, y + resolution) >= threshold ? 1 : 0;
        const d = getFieldValue(x, y + resolution) >= threshold ? 1 : 0;

        const state = a * 8 + b * 4 + c * 2 + d;

        // Marching squares lookup
        const half = resolution / 2;

        switch (state) {
          case 1:
          case 14:
            p.line(x, y + half, x + half, y + resolution);
            break;
          case 2:
          case 13:
            p.line(x + half, y + resolution, x + resolution, y + half);
            break;
          case 3:
          case 12:
            p.line(x, y + half, x + resolution, y + half);
            break;
          case 4:
          case 11:
            p.line(x + half, y, x + resolution, y + half);
            break;
          case 5:
            p.line(x, y + half, x + half, y);
            p.line(x + half, y + resolution, x + resolution, y + half);
            break;
          case 6:
          case 9:
            p.line(x + half, y, x + half, y + resolution);
            break;
          case 7:
          case 8:
            p.line(x, y + half, x + half, y);
            break;
          case 10:
            p.line(x + half, y, x + resolution, y + half);
            p.line(x, y + half, x + half, y + resolution);
            break;
        }
      }
    }
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.pixelDensity(1);
    initBalls();
  };

  p.draw = () => {
    updateBalls();
    drawMetaballs();

    // Instructions
    p.fill(255);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.LEFT, p.BOTTOM);
    const scheme = colorSchemes[colorScheme];
    p.text(
      `Style: ${scheme.name} | Balls: ${balls.length} | Threshold: ${threshold.toFixed(1)} | Click: add ball | 1-3: style | +/-: threshold`,
      20,
      p.height - 20
    );
  };

  p.mousePressed = () => {
    balls.push({
      x: p.mouseX,
      y: p.mouseY,
      vx: p.random(-2, 2),
      vy: p.random(-2, 2),
      radius: p.random(50, 100),
    });
  };

  p.keyPressed = () => {
    if (p.key === '1') {
      colorScheme = 0;
    } else if (p.key === '2') {
      colorScheme = 1;
    } else if (p.key === '3') {
      colorScheme = 2;
    } else if (p.key === '+' || p.key === '=') {
      threshold = Math.min(3, threshold + 0.1);
    } else if (p.key === '-' || p.key === '_') {
      threshold = Math.max(0.3, threshold - 0.1);
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};

export default metaballs;
