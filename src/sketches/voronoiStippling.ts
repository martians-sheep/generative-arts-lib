import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

/**
 * Voronoi Stippling (Lloyd's Relaxation)
 *
 * Iteratively moves points to the centroids of their Voronoi cells,
 * creating evenly distributed point patterns. Can be weighted by
 * image brightness for artistic stippling effects.
 *
 * Controls:
 * - Click: Add more points
 * - Space: Toggle relaxation
 * - 1-3: Change point count
 * - +/-: Adjust point size
 */
const voronoiStippling: Sketch = (p: p5) => {
  interface Point {
    x: number;
    y: number;
  }

  let points: Point[] = [];
  let numPoints = 500;
  let pointSize = 4;
  let isRelaxing = true;
  let iterations = 0;
  let densityMap: number[][] = [];

  const initPoints = () => {
    points = [];
    iterations = 0;

    // Generate weighted random points based on density map
    for (let i = 0; i < numPoints; i++) {
      let x, y;
      let tries = 0;

      do {
        x = p.random(p.width);
        y = p.random(p.height);
        tries++;
      } while (
        densityMap.length > 0 &&
        p.random() > getDensity(x, y) &&
        tries < 100
      );

      points.push({ x, y });
    }
  };

  const generateDensityMap = () => {
    densityMap = [];
    const resolution = 10;

    for (let x = 0; x < p.width; x += resolution) {
      const col: number[] = [];
      for (let y = 0; y < p.height; y += resolution) {
        // Create interesting density pattern with noise
        const n1 = p.noise(x * 0.005, y * 0.005);
        const n2 = p.noise(x * 0.02, y * 0.02);
        const centerDist = p.dist(x, y, p.width / 2, p.height / 2);
        const maxDist = Math.min(p.width, p.height) / 2;
        const centerWeight = 1 - Math.min(centerDist / maxDist, 1);

        // Combine noise and center weight
        const density = (n1 * 0.5 + n2 * 0.3 + centerWeight * 0.2);
        col.push(density);
      }
      densityMap.push(col);
    }
  };

  const getDensity = (x: number, y: number): number => {
    const resolution = 10;
    const xi = Math.floor(x / resolution);
    const yi = Math.floor(y / resolution);

    if (xi >= 0 && xi < densityMap.length && yi >= 0 && yi < densityMap[0].length) {
      return densityMap[xi][yi];
    }
    return 0.5;
  };

  // Simple approximation of Voronoi centroids using closest point search
  const relaxPoints = () => {
    // Create a grid to speed up nearest neighbor search
    const cellSize = 50;
    const gridCols = Math.ceil(p.width / cellSize);
    const gridRows = Math.ceil(p.height / cellSize);
    const grid: number[][][] = [];

    for (let i = 0; i < gridCols; i++) {
      grid[i] = [];
      for (let j = 0; j < gridRows; j++) {
        grid[i][j] = [];
      }
    }

    // Assign points to grid cells
    for (let i = 0; i < points.length; i++) {
      const gx = Math.floor(points[i].x / cellSize);
      const gy = Math.floor(points[i].y / cellSize);
      if (gx >= 0 && gx < gridCols && gy >= 0 && gy < gridRows) {
        grid[gx][gy].push(i);
      }
    }

    // For each point, find the centroid of nearby samples
    const newPoints: Point[] = [];
    const sampleResolution = 5;

    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      let sumX = 0;
      let sumY = 0;
      let count = 0;

      // Sample points in a region around this point
      const searchRadius = cellSize * 2;

      for (let dx = -searchRadius; dx <= searchRadius; dx += sampleResolution) {
        for (let dy = -searchRadius; dy <= searchRadius; dy += sampleResolution) {
          const sx = pt.x + dx;
          const sy = pt.y + dy;

          if (sx < 0 || sx >= p.width || sy < 0 || sy >= p.height) continue;

          // Find nearest point to this sample
          let nearestDist = Infinity;
          let nearestIdx = i;

          const gx = Math.floor(sx / cellSize);
          const gy = Math.floor(sy / cellSize);

          // Check neighboring cells
          for (let cgx = gx - 1; cgx <= gx + 1; cgx++) {
            for (let cgy = gy - 1; cgy <= gy + 1; cgy++) {
              if (cgx < 0 || cgx >= gridCols || cgy < 0 || cgy >= gridRows) continue;

              for (const idx of grid[cgx][cgy]) {
                const d = p.dist(sx, sy, points[idx].x, points[idx].y);
                if (d < nearestDist) {
                  nearestDist = d;
                  nearestIdx = idx;
                }
              }
            }
          }

          // If this point owns this sample, add to centroid calculation
          if (nearestIdx === i) {
            const weight = getDensity(sx, sy);
            sumX += sx * weight;
            sumY += sy * weight;
            count += weight;
          }
        }
      }

      // Move point toward weighted centroid
      if (count > 0) {
        const centroidX = sumX / count;
        const centroidY = sumY / count;
        newPoints.push({
          x: p.lerp(pt.x, centroidX, 0.3),
          y: p.lerp(pt.y, centroidY, 0.3),
        });
      } else {
        newPoints.push(pt);
      }
    }

    points = newPoints;
    iterations++;
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    generateDensityMap();
    initPoints();
  };

  p.draw = () => {
    p.background(245, 240, 235);

    // Draw density map visualization (faint)
    p.noStroke();
    const resolution = 10;
    for (let xi = 0; xi < densityMap.length; xi++) {
      for (let yi = 0; yi < densityMap[xi].length; yi++) {
        const density = densityMap[xi][yi];
        const gray = p.map(density, 0, 1, 240, 200);
        p.fill(gray);
        p.rect(xi * resolution, yi * resolution, resolution, resolution);
      }
    }

    // Draw points
    p.fill(20, 30, 40);
    p.noStroke();
    for (const pt of points) {
      const density = getDensity(pt.x, pt.y);
      const size = pointSize * (0.5 + density * 1);
      p.ellipse(pt.x, pt.y, size, size);
    }

    // Relax points
    if (isRelaxing) {
      relaxPoints();
    }

    // Instructions
    p.fill(60);
    p.textSize(14);
    p.textAlign(p.LEFT, p.BOTTOM);
    const status = isRelaxing ? `Relaxing (${iterations})...` : 'Paused';
    p.text(
      `Points: ${numPoints} | Size: ${pointSize}px | ${status} | Click: add points | Space: toggle | +/-: size`,
      20,
      p.height - 20
    );
  };

  p.mousePressed = () => {
    // Add more points near mouse
    for (let i = 0; i < 50; i++) {
      points.push({
        x: p.mouseX + p.random(-50, 50),
        y: p.mouseY + p.random(-50, 50),
      });
    }
    numPoints = points.length;
  };

  p.keyPressed = () => {
    if (p.key === ' ') {
      isRelaxing = !isRelaxing;
    } else if (p.key === '1') {
      numPoints = 200;
      initPoints();
    } else if (p.key === '2') {
      numPoints = 500;
      initPoints();
    } else if (p.key === '3') {
      numPoints = 1000;
      initPoints();
    } else if (p.key === '+' || p.key === '=') {
      pointSize = Math.min(10, pointSize + 1);
    } else if (p.key === '-' || p.key === '_') {
      pointSize = Math.max(1, pointSize - 1);
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    generateDensityMap();
    initPoints();
  };
};

export default voronoiStippling;
