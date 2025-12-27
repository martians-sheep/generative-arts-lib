import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

/**
 * Penrose Tiling
 *
 * Creates aperiodic tilings using the golden ratio. The pattern never
 * repeats but can tile the infinite plane. Uses deflation algorithm.
 *
 * Controls:
 * - Click: Regenerate with new starting configuration
 * - 1-3: Change color scheme
 * - +/-: Adjust subdivision level
 */
const penroseTiling: Sketch = (p: p5) => {
  const PHI = (1 + Math.sqrt(5)) / 2; // Golden ratio ≈ 1.618
  let subdivisions = 5;
  let colorScheme = 0;

  interface Triangle {
    type: 0 | 1; // 0 = thin (36°), 1 = thick (72°)
    A: { x: number; y: number };
    B: { x: number; y: number };
    C: { x: number; y: number };
  }

  let triangles: Triangle[] = [];

  const colorSchemes = [
    {
      name: 'Classic',
      thin: { r: 180, g: 120, b: 80 },
      thick: { r: 80, g: 120, b: 180 },
      stroke: { r: 40, g: 40, b: 40 },
      bg: { r: 30, g: 35, b: 45 },
    },
    {
      name: 'Sunset',
      thin: { r: 255, g: 150, b: 100 },
      thick: { r: 200, g: 80, b: 120 },
      stroke: { r: 60, g: 30, b: 40 },
      bg: { r: 40, g: 25, b: 35 },
    },
    {
      name: 'Forest',
      thin: { r: 150, g: 200, b: 120 },
      thick: { r: 80, g: 150, b: 100 },
      stroke: { r: 30, g: 50, b: 30 },
      bg: { r: 20, g: 35, b: 25 },
    },
  ];

  // Initialize with a "sun" configuration - 10 triangles around center
  const initializeSun = () => {
    triangles = [];
    const cx = p.width / 2;
    const cy = p.height / 2;
    const size = Math.min(p.width, p.height) * 0.45;

    for (let i = 0; i < 10; i++) {
      const angle = (p.TWO_PI / 10) * i - p.HALF_PI;
      const nextAngle = (p.TWO_PI / 10) * (i + 1) - p.HALF_PI;

      const B = { x: cx, y: cy };
      const C = {
        x: cx + size * Math.cos(angle),
        y: cy + size * Math.sin(angle),
      };
      const A = {
        x: cx + size * Math.cos(nextAngle),
        y: cy + size * Math.sin(nextAngle),
      };

      // Alternate between the two types
      triangles.push({
        type: i % 2 === 0 ? 0 : 1,
        A,
        B,
        C,
      });
    }
  };

  // Subdivide triangles using the deflation algorithm
  const subdivide = () => {
    const newTriangles: Triangle[] = [];

    for (const tri of triangles) {
      if (tri.type === 0) {
        // Thin rhombus (36-72-72 triangle)
        // Split into one thin and one thick
        const P = {
          x: tri.A.x + (tri.B.x - tri.A.x) / PHI,
          y: tri.A.y + (tri.B.y - tri.A.y) / PHI,
        };

        newTriangles.push({
          type: 0,
          A: tri.C,
          B: P,
          C: tri.B,
        });

        newTriangles.push({
          type: 1,
          A: P,
          B: tri.C,
          C: tri.A,
        });
      } else {
        // Thick rhombus (36-36-108 triangle)
        // Split into two thick and one thin
        const Q = {
          x: tri.B.x + (tri.A.x - tri.B.x) / PHI,
          y: tri.B.y + (tri.A.y - tri.B.y) / PHI,
        };
        const R = {
          x: tri.B.x + (tri.C.x - tri.B.x) / PHI,
          y: tri.B.y + (tri.C.y - tri.B.y) / PHI,
        };

        newTriangles.push({
          type: 1,
          A: R,
          B: tri.C,
          C: tri.A,
        });

        newTriangles.push({
          type: 1,
          A: Q,
          B: R,
          C: tri.B,
        });

        newTriangles.push({
          type: 0,
          A: R,
          B: Q,
          C: tri.A,
        });
      }
    }

    triangles = newTriangles;
  };

  const generateTiling = () => {
    initializeSun();
    for (let i = 0; i < subdivisions; i++) {
      subdivide();
    }
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noLoop();
    generateTiling();
  };

  p.draw = () => {
    const scheme = colorSchemes[colorScheme];
    p.background(scheme.bg.r, scheme.bg.g, scheme.bg.b);

    p.stroke(scheme.stroke.r, scheme.stroke.g, scheme.stroke.b);
    p.strokeWeight(0.5);

    // Draw triangles, grouping them as rhombi
    const drawn = new Set<number>();

    for (let i = 0; i < triangles.length; i++) {
      if (drawn.has(i)) continue;

      const tri = triangles[i];

      // Find matching triangle to form a rhombus
      let match = -1;
      for (let j = i + 1; j < triangles.length; j++) {
        if (drawn.has(j)) continue;
        const other = triangles[j];

        // Check if they share edge B-C and have same type
        if (
          tri.type === other.type &&
          Math.abs(tri.B.x - other.B.x) < 0.1 &&
          Math.abs(tri.B.y - other.B.y) < 0.1 &&
          Math.abs(tri.C.x - other.C.x) < 0.1 &&
          Math.abs(tri.C.y - other.C.y) < 0.1
        ) {
          match = j;
          break;
        }
      }

      if (match !== -1) {
        const other = triangles[match];

        // Draw as rhombus
        const color = tri.type === 0 ? scheme.thin : scheme.thick;
        p.fill(color.r, color.g, color.b);

        p.beginShape();
        p.vertex(tri.A.x, tri.A.y);
        p.vertex(tri.B.x, tri.B.y);
        p.vertex(other.A.x, other.A.y);
        p.vertex(tri.C.x, tri.C.y);
        p.endShape(p.CLOSE);

        drawn.add(i);
        drawn.add(match);
      } else {
        // Draw single triangle
        const color = tri.type === 0 ? scheme.thin : scheme.thick;
        p.fill(color.r, color.g, color.b);

        p.beginShape();
        p.vertex(tri.A.x, tri.A.y);
        p.vertex(tri.B.x, tri.B.y);
        p.vertex(tri.C.x, tri.C.y);
        p.endShape(p.CLOSE);

        drawn.add(i);
      }
    }

    // Draw decorative arcs (matching arc pattern)
    p.noFill();
    p.strokeWeight(1);
    p.stroke(255, 255, 255, 40);

    for (const tri of triangles) {
      if (tri.type === 1) {
        // Thick rhombus gets arcs
        const cx = (tri.A.x + tri.B.x + tri.C.x) / 3;
        const cy = (tri.A.y + tri.B.y + tri.C.y) / 3;
        const r = p.dist(tri.A.x, tri.A.y, tri.B.x, tri.B.y) * 0.2;
        p.ellipse(cx, cy, r, r);
      }
    }

    // Instructions
    p.fill(255);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.LEFT, p.BOTTOM);
    p.text(`Style: ${scheme.name} | Subdivisions: ${subdivisions} | Tiles: ${triangles.length} | 1-3: colors | +/-: subdivisions`, 20, p.height - 20);
  };

  p.mousePressed = () => {
    generateTiling();
    p.redraw();
  };

  p.keyPressed = () => {
    if (p.key === '1') {
      colorScheme = 0;
      p.redraw();
    } else if (p.key === '2') {
      colorScheme = 1;
      p.redraw();
    } else if (p.key === '3') {
      colorScheme = 2;
      p.redraw();
    } else if (p.key === '+' || p.key === '=') {
      subdivisions = Math.min(8, subdivisions + 1);
      generateTiling();
      p.redraw();
    } else if (p.key === '-' || p.key === '_') {
      subdivisions = Math.max(2, subdivisions - 1);
      generateTiling();
      p.redraw();
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    generateTiling();
    p.redraw();
  };
};

export default penroseTiling;
