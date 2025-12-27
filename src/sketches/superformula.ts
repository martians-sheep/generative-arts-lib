import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

/**
 * Superformula - A generalization of the circle/ellipse equation
 * that can describe many natural shapes (flowers, starfish, crystals)
 *
 * r(θ) = (|cos(mθ/4)/a|^n2 + |sin(mθ/4)/b|^n3)^(-1/n1)
 */
const superformulaSketch: Sketch = (p: p5) => {
  // Superformula parameters
  let m = 6;      // Symmetry
  let n1 = 1;     // Overall shape
  let n2 = 1;     // Cosine exponent
  let n3 = 1;     // Sine exponent
  const a = 1;    // Scaling factor a
  const b = 1;    // Scaling factor b

  let time = 0;
  let shapes: SuperShape[] = [];

  interface SuperShape {
    m: number;
    n1: number;
    n2: number;
    n3: number;
    hue: number;
    scale: number;
    rotation: number;
    rotationSpeed: number;
  }

  // Calculate radius using superformula
  const superformula = (theta: number, m: number, n1: number, n2: number, n3: number): number => {
    const t = m * theta / 4;
    const term1 = Math.pow(Math.abs(Math.cos(t) / a), n2);
    const term2 = Math.pow(Math.abs(Math.sin(t) / b), n3);
    const r = Math.pow(term1 + term2, -1 / n1);
    return isFinite(r) ? r : 0;
  };

  const generateShapes = () => {
    shapes = [];
    const numShapes = 5;

    for (let i = 0; i < numShapes; i++) {
      shapes.push({
        m: p.random([3, 4, 5, 6, 7, 8]),
        n1: p.random(0.3, 5),
        n2: p.random(0.5, 5),
        n3: p.random(0.5, 5),
        hue: p.random(360),
        scale: p.random(50, 150) * (1 - i * 0.15),
        rotation: p.random(p.TWO_PI),
        rotationSpeed: p.random(-0.005, 0.005),
      });
    }
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.noFill();
    generateShapes();
  };

  p.draw = () => {
    p.background(10, 20, 15);
    p.translate(p.width / 2, p.height / 2);

    time += 0.01;

    // Animate parameters based on mouse position
    m = p.map(p.mouseX, 0, p.width, 2, 12);
    n1 = p.map(p.mouseY, 0, p.height, 0.2, 4);
    n2 = 1 + p.sin(time) * 2;
    n3 = 1 + p.cos(time * 0.7) * 2;

    // Draw main interactive shape
    const mainScale = p.min(p.width, p.height) * 0.35;
    drawSuperformula(m, n1, n2, n3, mainScale, 0, (time * 50) % 360, 2);

    // Draw background shapes
    for (const shape of shapes) {
      shape.rotation += shape.rotationSpeed;
      p.push();
      p.rotate(shape.rotation);
      drawSuperformula(
        shape.m + p.sin(time + shape.hue) * 0.5,
        shape.n1,
        shape.n2 + p.sin(time * 0.5) * 0.3,
        shape.n3 + p.cos(time * 0.5) * 0.3,
        shape.scale,
        0,
        (shape.hue + time * 20) % 360,
        0.5
      );
      p.pop();
    }

    // Display parameters
    p.push();
    p.resetMatrix();
    p.fill(0, 0, 100);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`m: ${m.toFixed(2)}  n1: ${n1.toFixed(2)}  n2: ${n2.toFixed(2)}  n3: ${n3.toFixed(2)}`, 20, 20);
    p.text('Move mouse to change shape parameters', 20, 40);
    p.pop();
  };

  const drawSuperformula = (
    m: number, n1: number, n2: number, n3: number,
    scale: number, rotation: number, hue: number, strokeW: number
  ) => {
    p.push();
    p.rotate(rotation);
    p.strokeWeight(strokeW);

    // Draw with gradient
    p.beginShape();
    const points = 360;
    for (let i = 0; i <= points; i++) {
      const theta = p.map(i, 0, points, 0, p.TWO_PI);
      const r = superformula(theta, m, n1, n2, n3) * scale;
      const x = r * p.cos(theta);
      const y = r * p.sin(theta);

      const h = (hue + i * 0.5) % 360;
      p.stroke(h, 80, 90, 80);
      p.vertex(x, y);
    }
    p.endShape(p.CLOSE);

    // Inner glow effect
    for (let j = 0; j < 3; j++) {
      const innerScale = scale * (0.9 - j * 0.1);
      p.beginShape();
      for (let i = 0; i <= points; i++) {
        const theta = p.map(i, 0, points, 0, p.TWO_PI);
        const r = superformula(theta, m, n1, n2, n3) * innerScale;
        const x = r * p.cos(theta);
        const y = r * p.sin(theta);

        const h = (hue + 30 + i * 0.3) % 360;
        p.stroke(h, 60, 100, 30 - j * 8);
        p.vertex(x, y);
      }
      p.endShape(p.CLOSE);
    }

    p.pop();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  p.mousePressed = () => {
    generateShapes();
  };
};

export default superformulaSketch;
