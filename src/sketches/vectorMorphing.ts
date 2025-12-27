import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

const vectorMorphingSketch: Sketch = (p: p5) => {
  const numPoints = 100;
  let currentShape: p5.Vector[] = [];
  let targetShape: p5.Vector[] = [];
  let morphProgress = 0;
  let shapeIndex = 0;
  const morphSpeed = 0.02;

  const shapes = ['circle', 'star', 'square', 'triangle', 'heart'];

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);

    currentShape = generateShape(shapes[0]);
    targetShape = generateShape(shapes[1]);
  };

  const generateShape = (shape: string): p5.Vector[] => {
    const points: p5.Vector[] = [];
    const size = Math.min(p.width, p.height) * 0.35;
    const cx = p.width / 2;
    const cy = p.height / 2;

    for (let i = 0; i < numPoints; i++) {
      const t = i / numPoints;
      const angle = t * p.TWO_PI;
      let x = 0, y = 0;

      switch (shape) {
        case 'circle':
          x = cx + p.cos(angle) * size;
          y = cy + p.sin(angle) * size;
          break;

        case 'star':
          const starPoints = 5;
          const innerRadius = size * 0.4;
          const outerRadius = size;
          const starAngle = angle;
          const pointIndex = Math.floor(t * starPoints * 2);
          const isOuter = pointIndex % 2 === 0;
          const r = isOuter ? outerRadius : innerRadius;
          x = cx + p.cos(starAngle) * r;
          y = cy + p.sin(starAngle) * r;
          break;

        case 'square':
          const side = size * 2;
          const perimeter = side * 4;
          const pos = t * perimeter;
          if (pos < side) {
            x = cx - size + pos;
            y = cy - size;
          } else if (pos < side * 2) {
            x = cx + size;
            y = cy - size + (pos - side);
          } else if (pos < side * 3) {
            x = cx + size - (pos - side * 2);
            y = cy + size;
          } else {
            x = cx - size;
            y = cy + size - (pos - side * 3);
          }
          break;

        case 'triangle':
          const triSize = size * 1.5;
          const triPerimeter = triSize * 3;
          const triPos = t * triPerimeter;
          const p1 = { x: cx, y: cy - triSize };
          const p2 = { x: cx - triSize * 0.866, y: cy + triSize * 0.5 };
          const p3 = { x: cx + triSize * 0.866, y: cy + triSize * 0.5 };

          if (triPos < triSize) {
            const tt = triPos / triSize;
            x = p.lerp(p1.x, p2.x, tt);
            y = p.lerp(p1.y, p2.y, tt);
          } else if (triPos < triSize * 2) {
            const tt = (triPos - triSize) / triSize;
            x = p.lerp(p2.x, p3.x, tt);
            y = p.lerp(p2.y, p3.y, tt);
          } else {
            const tt = (triPos - triSize * 2) / triSize;
            x = p.lerp(p3.x, p1.x, tt);
            y = p.lerp(p3.y, p1.y, tt);
          }
          break;

        case 'heart':
          const heartAngle = angle - p.HALF_PI;
          const heartScale = size * 0.06;
          x = cx + heartScale * 16 * Math.pow(p.sin(heartAngle), 3);
          y = cy - heartScale * (13 * p.cos(heartAngle) - 5 * p.cos(2 * heartAngle) - 2 * p.cos(3 * heartAngle) - p.cos(4 * heartAngle));
          break;
      }

      points.push(p.createVector(x, y));
    }

    return points;
  };

  p.draw = () => {
    p.background(20);

    // Interpolate between shapes
    morphProgress += morphSpeed;

    if (morphProgress >= 1) {
      morphProgress = 0;
      shapeIndex = (shapeIndex + 1) % shapes.length;
      currentShape = targetShape;
      targetShape = generateShape(shapes[(shapeIndex + 1) % shapes.length]);
    }

    // Smooth easing
    const eased = easeInOutCubic(morphProgress);

    // Draw morphed shape
    p.noFill();
    p.strokeWeight(3);
    p.beginShape();

    for (let i = 0; i < numPoints; i++) {
      const current = currentShape[i];
      const target = targetShape[i];

      const x = p.lerp(current.x, target.x, eased);
      const y = p.lerp(current.y, target.y, eased);

      const hue = (i * 3.6 + p.frameCount) % 360;
      p.stroke(hue, 70, 90, 90);
      p.vertex(x, y);
    }
    p.endShape(p.CLOSE);

    // Draw points
    for (let i = 0; i < numPoints; i += 5) {
      const current = currentShape[i];
      const target = targetShape[i];

      const x = p.lerp(current.x, target.x, eased);
      const y = p.lerp(current.y, target.y, eased);

      const hue = (i * 3.6 + p.frameCount) % 360;
      p.fill(hue, 70, 100);
      p.noStroke();
      p.ellipse(x, y, 8);
    }

    // Draw shape name
    p.fill(255, 70);
    p.textSize(20);
    p.textAlign(p.CENTER);
    p.text(shapes[shapeIndex].toUpperCase() + ' → ' + shapes[(shapeIndex + 1) % shapes.length].toUpperCase(), p.width / 2, p.height - 40);
  };

  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    currentShape = generateShape(shapes[shapeIndex]);
    targetShape = generateShape(shapes[(shapeIndex + 1) % shapes.length]);
  };

  p.mousePressed = () => {
    // Skip to next shape
    morphProgress = 0;
    shapeIndex = (shapeIndex + 1) % shapes.length;
    currentShape = generateShape(shapes[shapeIndex]);
    targetShape = generateShape(shapes[(shapeIndex + 1) % shapes.length]);
  };
};

export default vectorMorphingSketch;
