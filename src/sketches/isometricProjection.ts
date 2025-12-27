import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

/**
 * Isometric Projection
 *
 * Creates a 3D illusion of stacked cubes using isometric projection,
 * inspired by Escher's impossible architecture.
 *
 * Controls:
 * - Click: Regenerate structure
 * - 1-3: Change color scheme
 * - +/-: Adjust grid size
 */
const isometricProjection: Sketch = (p: p5) => {
  interface Cube {
    gridX: number;
    gridY: number;
    height: number;
    color: number;
  }

  let cubes: Cube[] = [];
  let cubeSize = 30;
  let gridWidth = 8;
  let gridDepth = 8;
  let colorScheme = 0;

  // Color schemes: [top, right, left]
  const colorSchemes = [
    // Pastel
    [
      [{ r: 180, g: 220, b: 255 }, { r: 120, g: 160, b: 200 }, { r: 80, g: 120, b: 160 }],
      [{ r: 255, g: 200, b: 200 }, { r: 200, g: 140, b: 140 }, { r: 150, g: 100, b: 100 }],
      [{ r: 200, g: 255, b: 200 }, { r: 140, g: 200, b: 140 }, { r: 100, g: 150, b: 100 }],
      [{ r: 255, g: 255, b: 200 }, { r: 200, g: 200, b: 140 }, { r: 150, g: 150, b: 100 }],
    ],
    // Neon
    [
      [{ r: 0, g: 255, b: 255 }, { r: 0, g: 180, b: 180 }, { r: 0, g: 120, b: 120 }],
      [{ r: 255, g: 0, b: 255 }, { r: 180, g: 0, b: 180 }, { r: 120, g: 0, b: 120 }],
      [{ r: 255, g: 255, b: 0 }, { r: 180, g: 180, b: 0 }, { r: 120, g: 120, b: 0 }],
      [{ r: 0, g: 255, b: 128 }, { r: 0, g: 180, b: 90 }, { r: 0, g: 120, b: 60 }],
    ],
    // Monochrome
    [
      [{ r: 240, g: 240, b: 240 }, { r: 180, g: 180, b: 180 }, { r: 120, g: 120, b: 120 }],
      [{ r: 200, g: 200, b: 200 }, { r: 150, g: 150, b: 150 }, { r: 100, g: 100, b: 100 }],
      [{ r: 220, g: 220, b: 220 }, { r: 165, g: 165, b: 165 }, { r: 110, g: 110, b: 110 }],
      [{ r: 230, g: 230, b: 230 }, { r: 172, g: 172, b: 172 }, { r: 115, g: 115, b: 115 }],
    ],
  ];

  const toIso = (x: number, y: number, z: number): { x: number; y: number } => {
    // Convert 3D coordinates to 2D isometric projection
    const isoX = (x - y) * cubeSize * 0.866; // cos(30°) ≈ 0.866
    const isoY = (x + y) * cubeSize * 0.5 - z * cubeSize;
    return { x: isoX, y: isoY };
  };

  const drawCube = (gridX: number, gridY: number, z: number, colorIndex: number) => {
    const colors = colorSchemes[colorScheme][colorIndex % colorSchemes[colorScheme].length];
    const topColor = colors[0];
    const rightColor = colors[1];
    const leftColor = colors[2];

    // Get the 8 vertices of the cube
    const p1 = toIso(gridX, gridY, z);
    const p2 = toIso(gridX + 1, gridY, z);
    const p3 = toIso(gridX + 1, gridY + 1, z);
    const p4 = toIso(gridX, gridY + 1, z);
    const p5 = toIso(gridX, gridY, z + 1);
    const p6 = toIso(gridX + 1, gridY, z + 1);
    const p7 = toIso(gridX + 1, gridY + 1, z + 1);
    const p8 = toIso(gridX, gridY + 1, z + 1);

    p.stroke(40);
    p.strokeWeight(1);

    // Top face
    p.fill(topColor.r, topColor.g, topColor.b);
    p.beginShape();
    p.vertex(p5.x, p5.y);
    p.vertex(p6.x, p6.y);
    p.vertex(p7.x, p7.y);
    p.vertex(p8.x, p8.y);
    p.endShape(p.CLOSE);

    // Right face
    p.fill(rightColor.r, rightColor.g, rightColor.b);
    p.beginShape();
    p.vertex(p2.x, p2.y);
    p.vertex(p6.x, p6.y);
    p.vertex(p7.x, p7.y);
    p.vertex(p3.x, p3.y);
    p.endShape(p.CLOSE);

    // Left face
    p.fill(leftColor.r, leftColor.g, leftColor.b);
    p.beginShape();
    p.vertex(p3.x, p3.y);
    p.vertex(p7.x, p7.y);
    p.vertex(p8.x, p8.y);
    p.vertex(p4.x, p4.y);
    p.endShape(p.CLOSE);
  };

  const generateStructure = () => {
    cubes = [];

    // Create a heightmap using noise
    const heights: number[][] = [];
    const noiseScale = 0.3;

    for (let x = 0; x < gridWidth; x++) {
      heights[x] = [];
      for (let y = 0; y < gridDepth; y++) {
        // Base height from noise
        let h = Math.floor(p.noise(x * noiseScale, y * noiseScale) * 5) + 1;

        // Create some interesting patterns
        if (p.random() < 0.3) {
          h += Math.floor(p.random(3));
        }

        // Create towers at corners
        if ((x === 0 || x === gridWidth - 1) && (y === 0 || y === gridDepth - 1)) {
          h = Math.max(h, 5);
        }

        heights[x][y] = h;
      }
    }

    // Create cube objects for each cell
    for (let x = 0; x < gridWidth; x++) {
      for (let y = 0; y < gridDepth; y++) {
        const h = heights[x][y];
        cubes.push({
          gridX: x,
          gridY: y,
          height: h,
          color: Math.floor(p.random(colorSchemes[colorScheme].length)),
        });
      }
    }

    // Sort cubes for proper drawing order (painter's algorithm)
    cubes.sort((a, b) => {
      const sumA = a.gridX + a.gridY;
      const sumB = b.gridX + b.gridY;
      if (sumA !== sumB) return sumA - sumB;
      return a.gridX - b.gridX;
    });
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noLoop();
    p.noiseSeed(p.random(1000));
    generateStructure();
  };

  p.draw = () => {
    p.background(30, 35, 45);

    // Center the isometric view
    p.push();
    p.translate(p.width / 2, p.height / 2 - (gridWidth + gridDepth) * cubeSize * 0.25);

    // Draw cubes from back to front
    for (const cube of cubes) {
      // Draw all levels of each column
      for (let z = 0; z < cube.height; z++) {
        drawCube(cube.gridX - gridWidth / 2, cube.gridY - gridDepth / 2, z, cube.color);
      }
    }

    p.pop();

    // Instructions
    p.fill(255);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.LEFT, p.BOTTOM);
    const schemeName = ['Pastel', 'Neon', 'Monochrome'][colorScheme];
    p.text(`Style: ${schemeName} | Grid: ${gridWidth}x${gridDepth} | Click to regenerate | 1-3: colors | +/-: size`, 20, p.height - 20);
  };

  p.mousePressed = () => {
    p.noiseSeed(p.random(1000));
    generateStructure();
    p.redraw();
  };

  p.keyPressed = () => {
    if (p.key === '1') {
      colorScheme = 0;
    } else if (p.key === '2') {
      colorScheme = 1;
    } else if (p.key === '3') {
      colorScheme = 2;
    } else if (p.key === '+' || p.key === '=') {
      gridWidth = Math.min(15, gridWidth + 1);
      gridDepth = Math.min(15, gridDepth + 1);
      generateStructure();
    } else if (p.key === '-' || p.key === '_') {
      gridWidth = Math.max(4, gridWidth - 1);
      gridDepth = Math.max(4, gridDepth - 1);
      generateStructure();
    }
    p.redraw();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.redraw();
  };
};

export default isometricProjection;
