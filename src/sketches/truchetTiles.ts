import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

/**
 * Truchet Tiles
 *
 * A tile-based generative art technique where simple tiles with arcs or lines
 * are randomly rotated to create complex maze-like patterns.
 *
 * Controls:
 * - Click: Regenerate pattern
 * - 1-4: Change tile style
 * - +/-: Adjust tile size
 */
const truchetTiles: Sketch = (p: p5) => {
  let tileSize = 40;
  let tileStyle = 1;
  let cols: number;
  let rows: number;
  let rotations: number[][];

  // Color palette
  const bgColor = { r: 20, g: 20, b: 30 };
  const strokeColors = [
    { r: 255, g: 100, b: 150 },
    { r: 100, g: 200, b: 255 },
    { r: 150, g: 255, b: 150 },
  ];

  const initGrid = () => {
    cols = Math.ceil(p.width / tileSize) + 1;
    rows = Math.ceil(p.height / tileSize) + 1;
    rotations = [];

    for (let i = 0; i < cols; i++) {
      rotations[i] = [];
      for (let j = 0; j < rows; j++) {
        rotations[i][j] = Math.floor(p.random(4));
      }
    }
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noLoop();
    p.strokeCap(p.ROUND);
    initGrid();
  };

  const drawTileStyle1 = () => {
    // Classic Truchet: Two quarter circles
    p.arc(0, 0, tileSize, tileSize, 0, p.HALF_PI);
    p.arc(tileSize, tileSize, tileSize, tileSize, p.PI, p.PI + p.HALF_PI);
  };

  const drawTileStyle2 = () => {
    // Diagonal lines
    p.line(0, 0, tileSize, tileSize);
    p.line(0, tileSize, tileSize, 0);
  };

  const drawTileStyle3 = () => {
    // Semi-circles on opposite edges
    p.arc(tileSize / 2, 0, tileSize, tileSize, 0, p.PI);
    p.arc(tileSize / 2, tileSize, tileSize, tileSize, p.PI, p.TWO_PI);
  };

  const drawTileStyle4 = () => {
    // Triangular pattern
    p.beginShape();
    p.vertex(0, 0);
    p.vertex(tileSize, 0);
    p.vertex(0, tileSize);
    p.endShape(p.CLOSE);

    p.beginShape();
    p.vertex(tileSize, 0);
    p.vertex(tileSize, tileSize);
    p.vertex(0, tileSize);
    p.endShape(p.CLOSE);
  };

  const drawTile = () => {
    switch (tileStyle) {
      case 1:
        drawTileStyle1();
        break;
      case 2:
        drawTileStyle2();
        break;
      case 3:
        drawTileStyle3();
        break;
      case 4:
        drawTileStyle4();
        break;
      default:
        drawTileStyle1();
    }
  };

  p.draw = () => {
    p.background(bgColor.r, bgColor.g, bgColor.b);
    p.noFill();
    p.strokeWeight(2);

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * tileSize;
        const y = j * tileSize;

        // Choose color based on position
        const colorIndex = (i + j) % strokeColors.length;
        const color = strokeColors[colorIndex];
        p.stroke(color.r, color.g, color.b);

        p.push();
        p.translate(x + tileSize / 2, y + tileSize / 2);

        // Rotate by 0, 90, 180, or 270 degrees
        const angle = rotations[i][j] * p.HALF_PI;
        p.rotate(angle);

        p.translate(-tileSize / 2, -tileSize / 2);

        if (tileStyle === 4) {
          p.noStroke();
          p.fill(color.r, color.g, color.b, 100);
        }

        drawTile();
        p.pop();
      }
    }

    // Instructions
    p.fill(255);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.LEFT, p.BOTTOM);
    p.text(`Style: ${tileStyle} | Size: ${tileSize}px | Click to regenerate | 1-4: styles | +/-: size`, 20, p.height - 20);
  };

  p.mousePressed = () => {
    initGrid();
    p.redraw();
  };

  p.keyPressed = () => {
    if (p.key === '1') {
      tileStyle = 1;
      p.noFill();
    } else if (p.key === '2') {
      tileStyle = 2;
      p.noFill();
    } else if (p.key === '3') {
      tileStyle = 3;
      p.noFill();
    } else if (p.key === '4') {
      tileStyle = 4;
    } else if (p.key === '+' || p.key === '=') {
      tileSize = Math.min(100, tileSize + 10);
      initGrid();
    } else if (p.key === '-' || p.key === '_') {
      tileSize = Math.max(20, tileSize - 10);
      initGrid();
    }
    p.redraw();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    initGrid();
    p.redraw();
  };
};

export default truchetTiles;
