import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

/**
 * Celtic Knots
 *
 * Generates interlacing patterns inspired by Celtic art.
 * Uses grid-based crossing rules to create endless knot patterns.
 *
 * Controls:
 * - Click: Regenerate pattern
 * - 1-3: Change knot complexity
 * - +/-: Adjust grid size
 */
const celticKnots: Sketch = (p: p5) => {
  let gridSize = 60;
  let complexity = 2;
  let cols: number;
  let rows: number;
  let crossings: boolean[][];

  const initGrid = () => {
    cols = Math.floor(p.width / gridSize);
    rows = Math.floor(p.height / gridSize);
    crossings = [];

    for (let i = 0; i < cols; i++) {
      crossings[i] = [];
      for (let j = 0; j < rows; j++) {
        // Alternate crossings for interlacing effect
        crossings[i][j] = (i + j) % 2 === 0;
      }
    }
  };

  const drawKnotSegment = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    isOver: boolean,
    hue: number
  ) => {
    const thickness = gridSize * 0.3;
    const gap = thickness * 1.2;

    p.colorMode(p.HSB, 360, 100, 100);

    if (isOver) {
      // Draw the full curve on top
      p.stroke(hue, 60, 80);
      p.strokeWeight(thickness);
      p.noFill();
      p.beginShape();
      p.curveVertex(x1, y1);
      p.curveVertex(x1, y1);
      p.curveVertex(x2, y2);
      p.curveVertex(x3, y3);
      p.curveVertex(x3, y3);
      p.endShape();

      // Highlight
      p.stroke(hue, 40, 95);
      p.strokeWeight(thickness * 0.3);
      p.beginShape();
      p.curveVertex(x1, y1);
      p.curveVertex(x1, y1);
      p.curveVertex(x2, y2);
      p.curveVertex(x3, y3);
      p.curveVertex(x3, y3);
      p.endShape();
    } else {
      // Draw with gap in the middle (going under)
      p.stroke(hue, 60, 60);
      p.strokeWeight(thickness);
      p.noFill();

      // First half
      p.beginShape();
      p.curveVertex(x1, y1);
      p.curveVertex(x1, y1);
      const mx1 = x1 + (x2 - x1) * 0.4;
      const my1 = y1 + (y2 - y1) * 0.4;
      p.curveVertex(mx1, my1);
      p.curveVertex(mx1, my1);
      p.endShape();

      // Second half
      p.beginShape();
      const mx2 = x2 + (x3 - x2) * 0.6;
      const my2 = y2 + (y3 - y2) * 0.6;
      p.curveVertex(mx2, my2);
      p.curveVertex(mx2, my2);
      p.curveVertex(x3, y3);
      p.curveVertex(x3, y3);
      p.endShape();
    }
  };

  const drawKnotPattern = () => {
    const offsetX = (p.width - cols * gridSize) / 2;
    const offsetY = (p.height - rows * gridSize) / 2;

    // First pass: draw all "under" segments
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const cx = offsetX + i * gridSize + gridSize / 2;
        const cy = offsetY + j * gridSize + gridSize / 2;
        const isOver = crossings[i][j];
        const hue = ((i + j) * 30) % 360;

        // Draw the four curve segments at each crossing
        const half = gridSize / 2;

        // Segment going NE to SW
        if (!isOver) {
          drawKnotSegment(
            cx - half, cy - half,
            cx, cy,
            cx + half, cy + half,
            false,
            hue
          );
        }

        // Segment going NW to SE
        if (isOver) {
          drawKnotSegment(
            cx + half, cy - half,
            cx, cy,
            cx - half, cy + half,
            false,
            (hue + 180) % 360
          );
        }
      }
    }

    // Second pass: draw all "over" segments
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const cx = offsetX + i * gridSize + gridSize / 2;
        const cy = offsetY + j * gridSize + gridSize / 2;
        const isOver = crossings[i][j];
        const hue = ((i + j) * 30) % 360;

        const half = gridSize / 2;

        // Segment going NE to SW
        if (isOver) {
          drawKnotSegment(
            cx - half, cy - half,
            cx, cy,
            cx + half, cy + half,
            true,
            hue
          );
        }

        // Segment going NW to SE
        if (!isOver) {
          drawKnotSegment(
            cx + half, cy - half,
            cx, cy,
            cx - half, cy + half,
            true,
            (hue + 180) % 360
          );
        }
      }
    }

    // Draw border knot
    p.noFill();
    p.stroke(30, 60, 70);
    p.strokeWeight(gridSize * 0.15);
    p.rect(
      offsetX - gridSize * 0.3,
      offsetY - gridSize * 0.3,
      cols * gridSize + gridSize * 0.6,
      rows * gridSize + gridSize * 0.6,
      gridSize * 0.2
    );
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noLoop();
    initGrid();
  };

  p.draw = () => {
    p.background(20, 15, 25);
    drawKnotPattern();

    // Instructions
    p.colorMode(p.RGB, 255);
    p.fill(255);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.LEFT, p.BOTTOM);
    p.text(
      `Grid: ${cols}x${rows} | Size: ${gridSize}px | Click: regenerate | +/-: grid size`,
      20,
      p.height - 20
    );
  };

  p.mousePressed = () => {
    // Randomize some crossings
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (p.random() < 0.3) {
          crossings[i][j] = !crossings[i][j];
        }
      }
    }
    p.redraw();
  };

  p.keyPressed = () => {
    if (p.key === '+' || p.key === '=') {
      gridSize = Math.min(100, gridSize + 10);
      initGrid();
      p.redraw();
    } else if (p.key === '-' || p.key === '_') {
      gridSize = Math.max(30, gridSize - 10);
      initGrid();
      p.redraw();
    } else if (p.key === '1') {
      complexity = 1;
      initGrid();
      p.redraw();
    } else if (p.key === '2') {
      complexity = 2;
      initGrid();
      p.redraw();
    } else if (p.key === '3') {
      complexity = 3;
      initGrid();
      p.redraw();
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    initGrid();
    p.redraw();
  };
};

export default celticKnots;
