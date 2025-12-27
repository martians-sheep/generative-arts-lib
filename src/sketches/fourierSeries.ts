import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

/**
 * Fourier Series Visualization
 * Any complex closed curve can be represented as a sum of rotating circles (epicycles)
 * f(t) = a0/2 + Σ(an*cos(nωt) + bn*sin(nωt))
 */
const fourierSeriesSketch: Sketch = (p: p5) => {
  interface Epicycle {
    freq: number;
    amp: number;
    phase: number;
  }

  let time = 0;
  let path: p5.Vector[] = [];
  let epicyclesX: Epicycle[] = [];
  let epicyclesY: Epicycle[] = [];
  let drawing: p5.Vector[] = [];
  let userDrawing: p5.Vector[] = [];
  let isDrawing = false;
  let mode: 'preset' | 'custom' = 'preset';

  // Discrete Fourier Transform
  const dft = (x: number[]): Epicycle[] => {
    const N = x.length;
    const X: Epicycle[] = [];

    for (let k = 0; k < N; k++) {
      let re = 0;
      let im = 0;
      for (let n = 0; n < N; n++) {
        const phi = (p.TWO_PI * k * n) / N;
        re += x[n] * p.cos(phi);
        im -= x[n] * p.sin(phi);
      }
      re = re / N;
      im = im / N;

      const freq = k;
      const amp = p.sqrt(re * re + im * im);
      const phase = p.atan2(im, re);

      X.push({ freq, amp, phase });
    }

    // Sort by amplitude (largest first)
    return X.sort((a, b) => b.amp - a.amp);
  };

  const generatePresetShape = () => {
    drawing = [];
    const points = 128;

    // Create a complex shape (combination of shapes)
    for (let i = 0; i < points; i++) {
      const angle = p.map(i, 0, points, 0, p.TWO_PI);

      // Star shape with variations
      const r = 100 +
                50 * p.sin(5 * angle) +
                30 * p.sin(3 * angle + p.PI/4) +
                20 * p.cos(7 * angle);

      const x = r * p.cos(angle);
      const y = r * p.sin(angle);
      drawing.push(p.createVector(x, y));
    }

    computeFourier();
  };

  const computeFourier = () => {
    const x = drawing.map(v => v.x);
    const y = drawing.map(v => v.y);

    epicyclesX = dft(x);
    epicyclesY = dft(y);

    time = 0;
    path = [];
  };

  const drawEpicycles = (x: number, y: number, rotation: number, epicycles: Epicycle[]): p5.Vector => {
    for (let i = 0; i < Math.min(epicycles.length, 50); i++) {
      const prevX = x;
      const prevY = y;

      const { freq, amp, phase } = epicycles[i];
      x += amp * p.cos(freq * time + phase + rotation);
      y += amp * p.sin(freq * time + phase + rotation);

      // Draw circle
      p.stroke(255, 100);
      p.strokeWeight(1);
      p.noFill();
      p.ellipse(prevX, prevY, amp * 2);

      // Draw radius
      p.stroke(255, 150);
      p.line(prevX, prevY, x, y);

      // Draw point at end
      p.fill((i * 30) % 360, 80, 100);
      p.noStroke();
      p.ellipse(x, y, 4);
    }

    return p.createVector(x, y);
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    generatePresetShape();
  };

  p.draw = () => {
    p.background(15, 30, 10);

    const centerX = p.width / 2;
    const centerY = p.height / 2;

    // Draw epicycles for X (horizontal, placed at top)
    p.push();
    p.translate(centerX, 150);
    const vX = drawEpicycles(0, 0, 0, epicyclesX);
    p.pop();

    // Draw epicycles for Y (vertical, placed at left)
    p.push();
    p.translate(150, centerY);
    const vY = drawEpicycles(0, 0, p.HALF_PI, epicyclesY);
    p.pop();

    // Calculate the drawing point
    const drawX = centerX + vX.x;
    const drawY = centerY + vY.y;

    // Draw connection lines
    p.stroke(100, 50, 100, 30);
    p.strokeWeight(1);
    p.line(150 + vY.x, centerY + vY.y, drawX, drawY);
    p.line(centerX + vX.x, 150 + vX.y, drawX, drawY);

    // Add point to path
    path.unshift(p.createVector(drawX, drawY));

    // Draw the traced path
    p.beginShape();
    p.noFill();
    for (let i = 0; i < path.length; i++) {
      const hue = (i * 0.5) % 360;
      const alpha = p.map(i, 0, path.length, 100, 0);
      p.stroke(hue, 80, 100, alpha);
      p.strokeWeight(2);
      p.vertex(path[i].x, path[i].y);
    }
    p.endShape();

    // Draw current point
    p.fill(60, 100, 100);
    p.noStroke();
    p.ellipse(drawX, drawY, 10);

    // Update time
    const dt = p.TWO_PI / drawing.length;
    time += dt;

    // Limit path length
    if (path.length > drawing.length) {
      path.pop();
    }

    // Reset when complete
    if (time > p.TWO_PI) {
      time = 0;
      path = [];
    }

    // Instructions
    p.fill(0, 0, 100);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.LEFT, p.TOP);
    p.text('Click and drag to draw a custom shape, or click to regenerate', 20, 20);
    p.text(`Mode: ${mode} | Epicycles: ${Math.min(epicyclesX.length, 50)}`, 20, 40);
  };

  p.mousePressed = () => {
    if (p.mouseX > 250 && p.mouseY > 200) {
      userDrawing = [];
      isDrawing = true;
      mode = 'custom';
    } else {
      generatePresetShape();
      mode = 'preset';
    }
  };

  p.mouseDragged = () => {
    if (isDrawing && p.mouseX > 250 && p.mouseY > 200) {
      const x = p.mouseX - p.width / 2;
      const y = p.mouseY - p.height / 2;
      userDrawing.push(p.createVector(x, y));
    }
  };

  p.mouseReleased = () => {
    if (isDrawing && userDrawing.length > 10) {
      // Resample to fixed number of points
      const resampled: p5.Vector[] = [];
      const targetPoints = 128;

      for (let i = 0; i < targetPoints; i++) {
        const index = Math.floor((i / targetPoints) * userDrawing.length);
        resampled.push(userDrawing[index].copy());
      }

      drawing = resampled;
      computeFourier();
    }
    isDrawing = false;
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};

export default fourierSeriesSketch;
