import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

/**
 * Fibonacci Phyllotaxis
 * The golden angle (137.5°) arrangement found in sunflowers, pinecones, and plants
 *
 * θ = n × 137.5° (golden angle)
 * r = c × √n (distance from center)
 */
const phyllotaxisSketch: Sketch = (p: p5) => {
  let n = 0;
  let c = 8; // Scale coefficient
  const goldenAngle = 137.5; // Golden angle in degrees
  let maxN = 0;
  let mode: 'dots' | 'petals' | 'spiral' = 'dots';
  let hueOffset = 0;
  let growing = true;

  // For spiral mode
  let spiralPoints: { x: number; y: number; n: number }[] = [];

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.angleMode(p.DEGREES);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.background(10, 20, 8);
    maxN = calculateMaxN();
  };

  const calculateMaxN = () => {
    const maxRadius = p.min(p.width, p.height) / 2 - 20;
    // r = c * sqrt(n) => n = (r/c)^2
    return Math.floor((maxRadius / c) * (maxRadius / c));
  };

  p.draw = () => {
    if (mode === 'spiral') {
      drawSpiralMode();
      return;
    }

    p.translate(p.width / 2, p.height / 2);

    if (growing && n < maxN) {
      // Draw multiple points per frame for faster filling
      const pointsPerFrame = 5;
      for (let i = 0; i < pointsPerFrame && n < maxN; i++) {
        drawPhyllotaxisPoint(n);
        n++;
      }
    }

    hueOffset += 0.1;

    // Display info
    p.push();
    p.resetMatrix();
    p.fill(0, 0, 100);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`n: ${n} | Golden angle: ${goldenAngle}°`, 20, 20);
    p.text(`Mode: ${mode} (Press 1-3 to change, click to restart)`, 20, 40);
    p.pop();
  };

  const drawPhyllotaxisPoint = (index: number) => {
    const angle = index * goldenAngle;
    const r = c * p.sqrt(index);

    const x = r * p.cos(angle);
    const y = r * p.sin(angle);

    // Color based on position and index
    const hue = (index * 0.5 + angle * 0.1 + hueOffset) % 360;
    const sat = 70 + p.sin(index * 0.1) * 20;
    const bri = 80 + p.sin(index * 0.05) * 15;

    if (mode === 'dots') {
      // Simple dots with glow
      const size = p.map(r, 0, p.min(p.width, p.height) / 2, 4, 12);

      // Glow
      p.noStroke();
      p.fill(hue, sat - 20, bri, 30);
      p.ellipse(x, y, size * 2);

      // Core
      p.fill(hue, sat, bri);
      p.ellipse(x, y, size);
    } else if (mode === 'petals') {
      // Petal shapes using ellipse
      p.push();
      p.translate(x, y);
      p.rotate(angle + 90);

      const petalLength = p.map(r, 0, p.min(p.width, p.height) / 2, 5, 20);
      const petalWidth = petalLength * 0.4;

      p.noStroke();
      p.fill(hue, sat, bri, 80);

      // Draw petal as rotated ellipse
      p.ellipse(0, -petalLength / 2, petalWidth * 2, petalLength);

      // Add highlight
      p.fill(hue, sat - 20, bri + 10, 40);
      p.ellipse(0, -petalLength / 2, petalWidth, petalLength * 0.6);

      p.pop();
    }
  };

  const drawSpiralMode = () => {
    p.background(10, 20, 8, 10);
    p.translate(p.width / 2, p.height / 2);

    // Add new points
    if (n < maxN) {
      const angle = n * goldenAngle;
      const r = c * p.sqrt(n);
      spiralPoints.push({
        x: r * p.cos(angle),
        y: r * p.sin(angle),
        n: n
      });
      n++;
    }

    // Draw connecting spiral
    p.noFill();
    p.strokeWeight(1);

    // Draw Fibonacci spirals (connect every 1, 2, 3, 5, 8, 13... points)
    const fibSequence = [1, 2, 3, 5, 8, 13, 21, 34, 55];

    for (let f = 0; f < fibSequence.length; f++) {
      const step = fibSequence[f];
      const hue = (f * 40 + hueOffset) % 360;
      p.stroke(hue, 80, 90, 60);

      p.beginShape();
      for (let i = 0; i < spiralPoints.length; i += step) {
        if (i < spiralPoints.length) {
          p.vertex(spiralPoints[i].x, spiralPoints[i].y);
        }
      }
      p.endShape();
    }

    // Draw points
    for (let i = 0; i < spiralPoints.length; i++) {
      const pt = spiralPoints[i];
      const hue = (pt.n * 0.3 + hueOffset) % 360;
      p.noStroke();
      p.fill(hue, 70, 90);
      p.ellipse(pt.x, pt.y, 4);
    }

    hueOffset += 0.5;

    // Display info
    p.push();
    p.resetMatrix();
    p.fill(0, 0, 100);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`n: ${n} | Fibonacci spirals visible`, 20, 20);
    p.text(`Mode: ${mode} (Press 1-3 to change, click to restart)`, 20, 40);
    p.pop();
  };

  p.keyPressed = () => {
    if (p.key === '1') {
      mode = 'dots';
      reset();
    } else if (p.key === '2') {
      mode = 'petals';
      reset();
    } else if (p.key === '3') {
      mode = 'spiral';
      reset();
    }
  };

  const reset = () => {
    n = 0;
    growing = true;
    spiralPoints = [];
    p.background(10, 20, 8);
    maxN = calculateMaxN();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    reset();
  };

  p.mousePressed = () => {
    reset();
  };
};

export default phyllotaxisSketch;
