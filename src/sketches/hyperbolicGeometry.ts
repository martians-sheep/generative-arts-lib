import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

/**
 * Hyperbolic Geometry (Poincaré Disk)
 *
 * Visualizes hyperbolic tiling in the Poincaré disk model,
 * inspired by M.C. Escher's "Circle Limit" series.
 *
 * Controls:
 * - Mouse: Rotate the pattern
 * - 1-3: Change tessellation type (p,q)
 * - +/-: Adjust recursion depth
 */
const hyperbolicGeometry: Sketch = (p: p5) => {
  let diskRadius = 0;
  let tessellation = { p: 6, q: 4 }; // {p, q} tessellation: p-gons meeting q at each vertex
  let maxDepth = 5;
  let rotation = 0;

  // Complex number operations for Möbius transformations
  const complexMult = (a: { re: number; im: number }, b: { re: number; im: number }) => ({
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  });

  const complexDiv = (a: { re: number; im: number }, b: { re: number; im: number }) => {
    const denom = b.re * b.re + b.im * b.im;
    return {
      re: (a.re * b.re + a.im * b.im) / denom,
      im: (a.im * b.re - a.re * b.im) / denom,
    };
  };

  const complexAbs = (z: { re: number; im: number }) => Math.sqrt(z.re * z.re + z.im * z.im);

  // Möbius transformation for hyperbolic rotation
  const mobiusTransform = (
    z: { re: number; im: number },
    center: { re: number; im: number }
  ): { re: number; im: number } => {
    // T(z) = (z - center) / (1 - conj(center) * z)
    const num = { re: z.re - center.re, im: z.im - center.im };
    const conj = { re: center.re, im: -center.im };
    const prod = complexMult(conj, z);
    const denom = { re: 1 - prod.re, im: -prod.im };
    return complexDiv(num, denom);
  };

  // Convert disk coordinates to screen coordinates
  const toScreen = (z: { re: number; im: number }): { x: number; y: number } => ({
    x: p.width / 2 + z.re * diskRadius,
    y: p.height / 2 + z.im * diskRadius,
  });

  // Draw a hyperbolic line segment (geodesic) between two points
  const drawHyperbolicLine = (
    z1: { re: number; im: number },
    z2: { re: number; im: number },
    hue: number
  ) => {
    // For the Poincaré disk, geodesics are circular arcs orthogonal to the boundary
    const p1 = toScreen(z1);
    const p2 = toScreen(z2);

    // Check if points are valid
    if (complexAbs(z1) >= 0.999 || complexAbs(z2) >= 0.999) return;

    // For points close to center or on diameter, use straight line
    const cross = z1.re * z2.im - z1.im * z2.re;
    if (Math.abs(cross) < 0.001) {
      p.stroke(hue, 70, 80);
      p.line(p1.x, p1.y, p2.x, p2.y);
      return;
    }

    // Calculate the circle center for the geodesic arc
    const d1 = z1.re * z1.re + z1.im * z1.im;
    const d2 = z2.re * z2.re + z2.im * z2.im;

    const cx = ((1 + d1) * z2.im - (1 + d2) * z1.im) / (2 * cross);
    const cy = ((1 + d2) * z1.re - (1 + d1) * z2.re) / (2 * cross);
    const r = Math.sqrt((z1.re - cx) * (z1.re - cx) + (z1.im - cy) * (z1.im - cy));

    // Convert to screen coordinates
    const screenCx = p.width / 2 + cx * diskRadius;
    const screenCy = p.height / 2 + cy * diskRadius;
    const screenR = r * diskRadius;

    // Calculate angles
    const angle1 = Math.atan2(p1.y - screenCy, p1.x - screenCx);
    const angle2 = Math.atan2(p2.y - screenCy, p2.x - screenCx);

    // Draw the arc
    p.stroke(hue, 70, 80);
    p.noFill();

    // Determine the shorter arc
    let startAngle = angle1;
    let endAngle = angle2;
    let diff = endAngle - startAngle;

    if (diff > Math.PI) {
      diff -= p.TWO_PI;
    } else if (diff < -Math.PI) {
      diff += p.TWO_PI;
    }

    if (diff < 0) {
      p.arc(screenCx, screenCy, screenR * 2, screenR * 2, endAngle, startAngle);
    } else {
      p.arc(screenCx, screenCy, screenR * 2, screenR * 2, startAngle, endAngle);
    }
  };

  // Generate regular polygon vertices in hyperbolic space
  const generatePolygon = (
    center: { re: number; im: number },
    radius: number,
    n: number,
    startAngle: number
  ): { re: number; im: number }[] => {
    const vertices: { re: number; im: number }[] = [];

    for (let i = 0; i < n; i++) {
      const angle = startAngle + (p.TWO_PI / n) * i;
      const vertex = {
        re: center.re + radius * Math.cos(angle),
        im: center.im + radius * Math.sin(angle),
      };
      vertices.push(vertex);
    }

    return vertices;
  };

  // Recursive tessellation
  const tessellate = (
    center: { re: number; im: number },
    radius: number,
    startAngle: number,
    depth: number,
    parentAngle: number
  ) => {
    if (depth > maxDepth) return;
    if (complexAbs(center) > 0.99) return;

    const { p: sides, q } = tessellation;
    const vertices = generatePolygon(center, radius, sides, startAngle + rotation);

    // Draw the polygon
    const hue = (depth * 60 + complexAbs(center) * 180) % 360;
    p.strokeWeight(Math.max(0.5, 2 - depth * 0.3));

    for (let i = 0; i < sides; i++) {
      drawHyperbolicLine(vertices[i], vertices[(i + 1) % sides], hue);
    }

    // Fill with color based on depth
    if (depth < 3) {
      const screenCenter = toScreen(center);
      p.noStroke();
      p.fill(hue, 40, 30, 30);
      p.ellipse(screenCenter.x, screenCenter.y, radius * diskRadius * 0.8, radius * diskRadius * 0.8);
    }

    // Recursively draw adjacent polygons
    if (depth < maxDepth) {
      for (let i = 0; i < sides; i++) {
        const edgeMid = {
          re: (vertices[i].re + vertices[(i + 1) % sides].re) / 2,
          im: (vertices[i].im + vertices[(i + 1) % sides].im) / 2,
        };

        // Calculate new center for adjacent polygon
        const edgeAngle = Math.atan2(
          vertices[(i + 1) % sides].im - vertices[i].im,
          vertices[(i + 1) % sides].re - vertices[i].re
        );

        // Skip going back to parent
        const angleDiff = Math.abs(edgeAngle - parentAngle);
        if (angleDiff < 0.5 || Math.abs(angleDiff - p.PI) < 0.5) continue;

        const perpAngle = edgeAngle + p.HALF_PI;
        const newRadius = radius * 0.6;
        const dist = radius * 1.1;

        const newCenter = {
          re: edgeMid.re + dist * Math.cos(perpAngle),
          im: edgeMid.im + dist * Math.sin(perpAngle),
        };

        if (complexAbs(newCenter) < 0.95) {
          tessellate(newCenter, newRadius, edgeAngle + p.PI, depth + 1, perpAngle + p.PI);
        }
      }
    }
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    diskRadius = Math.min(p.width, p.height) * 0.4;
  };

  p.draw = () => {
    p.background(0, 0, 10);

    // Draw the boundary circle
    p.noFill();
    p.stroke(0, 0, 100);
    p.strokeWeight(2);
    p.ellipse(p.width / 2, p.height / 2, diskRadius * 2, diskRadius * 2);

    // Draw the tessellation
    const initialRadius = 0.3;
    tessellate({ re: 0, im: 0 }, initialRadius, 0, 0, 0);

    // Update rotation based on mouse
    const targetRotation = p.map(p.mouseX, 0, p.width, -p.PI, p.PI);
    rotation = p.lerp(rotation, targetRotation, 0.05);

    // Instructions
    p.colorMode(p.RGB, 255);
    p.fill(255);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.LEFT, p.BOTTOM);
    p.text(`Tessellation: {${tessellation.p}, ${tessellation.q}} | Depth: ${maxDepth} | Move mouse to rotate | 1-3: type | +/-: depth`, 20, p.height - 20);
    p.colorMode(p.HSB, 360, 100, 100, 100);
  };

  p.keyPressed = () => {
    if (p.key === '1') {
      tessellation = { p: 4, q: 5 }; // Square tessellation
    } else if (p.key === '2') {
      tessellation = { p: 6, q: 4 }; // Hexagonal tessellation
    } else if (p.key === '3') {
      tessellation = { p: 3, q: 7 }; // Triangular tessellation
    } else if (p.key === '+' || p.key === '=') {
      maxDepth = Math.min(8, maxDepth + 1);
    } else if (p.key === '-' || p.key === '_') {
      maxDepth = Math.max(2, maxDepth - 1);
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    diskRadius = Math.min(p.width, p.height) * 0.4;
  };
};

export default hyperbolicGeometry;
