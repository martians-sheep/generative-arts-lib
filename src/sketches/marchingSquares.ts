import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

/**
 * Marching Squares
 * An algorithm to generate contour lines (isosurfaces) from scalar fields
 * Uses 3D Perlin noise to create animated organic patterns
 */
const marchingSquaresSketch: Sketch = (p: p5) => {
  let cols: number;
  let rows: number;
  const resolution = 10;
  let field: number[][] = [];
  let zOffset = 0;
  let threshold = 0;
  let numContours = 8;
  let showField = false;
  let noiseScale = 0.02;
  let animating = true;

  const initField = () => {
    cols = Math.floor(p.width / resolution) + 1;
    rows = Math.floor(p.height / resolution) + 1;
    field = [];
    for (let i = 0; i < cols; i++) {
      field[i] = [];
    }
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    initField();
  };

  p.draw = () => {
    p.background(10, 30, 8);

    // Update noise field
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * resolution;
        const y = j * resolution;
        // Use mouse position to influence the field
        const distToMouse = p.dist(x, y, p.mouseX, p.mouseY);
        const mouseInfluence = p.map(distToMouse, 0, 300, 0.5, 0, true);

        field[i][j] = p.noise(i * noiseScale, j * noiseScale, zOffset) + mouseInfluence;
      }
    }

    if (animating) {
      zOffset += 0.01;
    }

    // Draw scalar field visualization
    if (showField) {
      drawField();
    }

    // Draw multiple contour lines at different threshold levels
    for (let level = 0; level < numContours; level++) {
      const t = p.map(level, 0, numContours, 0.2, 0.8);
      const hue = (level * 360 / numContours + zOffset * 100) % 360;
      p.stroke(hue, 70, 90, 80);
      p.strokeWeight(2);
      drawContour(t);
    }

    // UI
    p.fill(0, 0, 100);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`Contours: ${numContours} | Noise scale: ${noiseScale.toFixed(3)}`, 20, 20);
    p.text('↑↓: Contours | ←→: Noise scale | F: Toggle field | Space: Pause', 20, 40);
    p.text('Move mouse to interact with the field', 20, 60);
  };

  const drawField = () => {
    p.noStroke();
    for (let i = 0; i < cols - 1; i++) {
      for (let j = 0; j < rows - 1; j++) {
        const x = i * resolution;
        const y = j * resolution;
        const val = field[i][j];

        const hue = val * 360;
        const brightness = val * 100;
        p.fill(hue, 60, brightness, 30);
        p.rect(x, y, resolution, resolution);
      }
    }
  };

  const drawContour = (threshold: number) => {
    for (let i = 0; i < cols - 1; i++) {
      for (let j = 0; j < rows - 1; j++) {
        const x = i * resolution;
        const y = j * resolution;

        // Get corner values
        const a = field[i][j];
        const b = field[i + 1][j];
        const c = field[i + 1][j + 1];
        const d = field[i][j + 1];

        // Calculate state (4 bits)
        const state = getState(a, b, c, d, threshold);

        // Get line segments for this state
        const lines = getContourLines(state, x, y, resolution, a, b, c, d, threshold);

        for (const line of lines) {
          p.line(line.x1, line.y1, line.x2, line.y2);
        }
      }
    }
  };

  const getState = (a: number, b: number, c: number, d: number, threshold: number): number => {
    let state = 0;
    if (a > threshold) state += 8;
    if (b > threshold) state += 4;
    if (c > threshold) state += 2;
    if (d > threshold) state += 1;
    return state;
  };

  interface Line {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }

  const lerp = (v1: number, v2: number, t: number): number => {
    return v1 + (v2 - v1) * t;
  };

  const getContourLines = (
    state: number,
    x: number,
    y: number,
    res: number,
    a: number,
    b: number,
    c: number,
    d: number,
    threshold: number
  ): Line[] => {
    // Interpolate edge crossings
    const top = lerp(x, x + res, (threshold - a) / (b - a));
    const bottom = lerp(x, x + res, (threshold - d) / (c - d));
    const left = lerp(y, y + res, (threshold - a) / (d - a));
    const right = lerp(y, y + res, (threshold - b) / (c - b));

    // Marching squares lookup table
    // 16 possible states based on corner configurations
    switch (state) {
      case 0:
      case 15:
        return [];

      case 1:
      case 14:
        return [{ x1: x, y1: left, x2: bottom, y2: y + res }];

      case 2:
      case 13:
        return [{ x1: bottom, y1: y + res, x2: x + res, y2: right }];

      case 3:
      case 12:
        return [{ x1: x, y1: left, x2: x + res, y2: right }];

      case 4:
      case 11:
        return [{ x1: top, y1: y, x2: x + res, y2: right }];

      case 5:
        return [
          { x1: x, y1: left, x2: top, y2: y },
          { x1: bottom, y1: y + res, x2: x + res, y2: right }
        ];

      case 6:
      case 9:
        return [{ x1: top, y1: y, x2: bottom, y2: y + res }];

      case 7:
      case 8:
        return [{ x1: x, y1: left, x2: top, y2: y }];

      case 10:
        return [
          { x1: top, y1: y, x2: x + res, y2: right },
          { x1: x, y1: left, x2: bottom, y2: y + res }
        ];

      default:
        return [];
    }
  };

  p.keyPressed = () => {
    if (p.key === ' ') {
      animating = !animating;
    } else if (p.key === 'f' || p.key === 'F') {
      showField = !showField;
    } else if (p.keyCode === 38) { // UP_ARROW
      numContours = Math.min(numContours + 1, 20);
    } else if (p.keyCode === 40) { // DOWN_ARROW
      numContours = Math.max(numContours - 1, 1);
    } else if (p.keyCode === 37) { // LEFT_ARROW
      noiseScale = Math.max(noiseScale - 0.005, 0.005);
    } else if (p.keyCode === 39) { // RIGHT_ARROW
      noiseScale = Math.min(noiseScale + 0.005, 0.1);
    }
  };

  p.mousePressed = () => {
    zOffset += 0.5; // Jump to a new slice
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    initField();
  };
};

export default marchingSquaresSketch;
