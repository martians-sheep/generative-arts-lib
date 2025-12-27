import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

interface Cell {
  a: number;
  b: number;
}

const reactionDiffusionSketch: Sketch = (p: p5) => {
  let grid: Cell[][];
  let next: Cell[][];
  const dA = 1.0;
  const dB = 0.5;
  const feed = 0.055;
  const kill = 0.062;
  const scale = 4;
  let cols: number;
  let rows: number;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.pixelDensity(1);

    cols = Math.floor(p.width / scale);
    rows = Math.floor(p.height / scale);

    initGrid();
  };

  const initGrid = () => {
    grid = [];
    next = [];

    for (let x = 0; x < cols; x++) {
      grid[x] = [];
      next[x] = [];
      for (let y = 0; y < rows; y++) {
        grid[x][y] = { a: 1, b: 0 };
        next[x][y] = { a: 1, b: 0 };
      }
    }

    // Seed with some B in the center
    const centerX = Math.floor(cols / 2);
    const centerY = Math.floor(rows / 2);
    const seedRadius = 10;

    for (let i = -seedRadius; i <= seedRadius; i++) {
      for (let j = -seedRadius; j <= seedRadius; j++) {
        const x = centerX + i;
        const y = centerY + j;
        if (x >= 0 && x < cols && y >= 0 && y < rows) {
          grid[x][y].b = 1;
        }
      }
    }
  };

  const laplacianA = (x: number, y: number): number => {
    let sum = 0;
    sum += grid[x][y].a * -1;
    sum += (grid[(x + 1) % cols][y].a || 0) * 0.2;
    sum += (grid[(x - 1 + cols) % cols][y].a || 0) * 0.2;
    sum += (grid[x][(y + 1) % rows].a || 0) * 0.2;
    sum += (grid[x][(y - 1 + rows) % rows].a || 0) * 0.2;
    sum += (grid[(x + 1) % cols][(y + 1) % rows].a || 0) * 0.05;
    sum += (grid[(x - 1 + cols) % cols][(y + 1) % rows].a || 0) * 0.05;
    sum += (grid[(x + 1) % cols][(y - 1 + rows) % rows].a || 0) * 0.05;
    sum += (grid[(x - 1 + cols) % cols][(y - 1 + rows) % rows].a || 0) * 0.05;
    return sum;
  };

  const laplacianB = (x: number, y: number): number => {
    let sum = 0;
    sum += grid[x][y].b * -1;
    sum += (grid[(x + 1) % cols][y].b || 0) * 0.2;
    sum += (grid[(x - 1 + cols) % cols][y].b || 0) * 0.2;
    sum += (grid[x][(y + 1) % rows].b || 0) * 0.2;
    sum += (grid[x][(y - 1 + rows) % rows].b || 0) * 0.2;
    sum += (grid[(x + 1) % cols][(y + 1) % rows].b || 0) * 0.05;
    sum += (grid[(x - 1 + cols) % cols][(y + 1) % rows].b || 0) * 0.05;
    sum += (grid[(x + 1) % cols][(y - 1 + rows) % rows].b || 0) * 0.05;
    sum += (grid[(x - 1 + cols) % cols][(y - 1 + rows) % rows].b || 0) * 0.05;
    return sum;
  };

  p.draw = () => {
    for (let i = 0; i < 5; i++) {
      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          const a = grid[x][y].a;
          const b = grid[x][y].b;

          const abb = a * b * b;

          next[x][y].a = a + (dA * laplacianA(x, y) - abb + feed * (1 - a));
          next[x][y].b = b + (dB * laplacianB(x, y) + abb - (kill + feed) * b);

          next[x][y].a = p.constrain(next[x][y].a, 0, 1);
          next[x][y].b = p.constrain(next[x][y].b, 0, 1);
        }
      }

      const temp = grid;
      grid = next;
      next = temp;
    }

    p.loadPixels();
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const a = grid[x][y].a;
        const b = grid[x][y].b;
        const c = Math.floor((a - b) * 255);
        const color = p.constrain(c, 0, 255);

        for (let i = 0; i < scale; i++) {
          for (let j = 0; j < scale; j++) {
            const px = x * scale + i;
            const py = y * scale + j;
            if (px < p.width && py < p.height) {
              const idx = (py * p.width + px) * 4;
              // Create a gradient from purple to teal
              const hue = p.map(color, 0, 255, 180, 300);
              const rgb = hslToRgb(hue / 360, 0.7, color / 255 * 0.5 + 0.25);
              p.pixels[idx] = rgb.r;
              p.pixels[idx + 1] = rgb.g;
              p.pixels[idx + 2] = rgb.b;
              p.pixels[idx + 3] = 255;
            }
          }
        }
      }
    }
    p.updatePixels();
  };

  const hslToRgb = (h: number, s: number, l: number) => {
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const pv = 2 * l - q;
      r = hue2rgb(pv, q, h + 1/3);
      g = hue2rgb(pv, q, h);
      b = hue2rgb(pv, q, h - 1/3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    cols = Math.floor(p.width / scale);
    rows = Math.floor(p.height / scale);
    initGrid();
  };

  p.mouseDragged = () => {
    const x = Math.floor(p.mouseX / scale);
    const y = Math.floor(p.mouseY / scale);
    const radius = 5;

    for (let i = -radius; i <= radius; i++) {
      for (let j = -radius; j <= radius; j++) {
        const px = x + i;
        const py = y + j;
        if (px >= 0 && px < cols && py >= 0 && py < rows) {
          grid[px][py].b = 1;
        }
      }
    }
  };
};

export default reactionDiffusionSketch;
