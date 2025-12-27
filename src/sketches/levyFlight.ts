import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

interface Walker {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  hue: number;
}

const levyFlightSketch: Sketch = (p: p5) => {
  let walkers: Walker[] = [];
  const numWalkers = 8;
  const maxSteps = 50000;
  let stepCount = 0;
  let isDrawing = true;

  // Levy flight parameters
  const mu = 1.5; // Levy exponent (1 < mu < 3, lower = more long jumps)
  const minStep = 1;
  const maxStep = 100;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.background(0, 0, 5);

    // Initialize walkers at random positions
    for (let i = 0; i < numWalkers; i++) {
      walkers.push({
        x: p.random(p.width * 0.3, p.width * 0.7),
        y: p.random(p.height * 0.3, p.height * 0.7),
        prevX: 0,
        prevY: 0,
        hue: (i * 360 / numWalkers + p.random(-20, 20)) % 360
      });
      walkers[i].prevX = walkers[i].x;
      walkers[i].prevY = walkers[i].y;
    }
  };

  // Generate Levy flight step size using inverse transform sampling
  const levyStep = (): number => {
    const u = p.random(0.001, 1);
    // Inverse of cumulative distribution for power law
    const step = minStep * Math.pow(u, -1 / mu);
    return Math.min(step, maxStep);
  };

  // Gaussian random number for direction bias
  const gaussianRandom = (): number => {
    let u = 0, v = 0;
    while (u === 0) u = p.random();
    while (v === 0) v = p.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };

  p.draw = () => {
    if (!isDrawing || stepCount >= maxSteps) {
      return;
    }

    // Draw multiple steps per frame for faster visualization
    const stepsPerFrame = 100;

    for (let s = 0; s < stepsPerFrame && stepCount < maxSteps; s++) {
      for (let i = 0; i < walkers.length; i++) {
        const walker = walkers[i];

        // Store previous position
        walker.prevX = walker.x;
        walker.prevY = walker.y;

        // Get Levy flight step size
        const stepSize = levyStep();

        // Direction with slight bias using Perlin noise for organic movement
        const noiseScale = 0.002;
        const noiseAngle = p.noise(walker.x * noiseScale, walker.y * noiseScale, stepCount * 0.0001) * p.TWO_PI * 2;
        const randomAngle = p.random(p.TWO_PI);
        const angle = p.lerp(randomAngle, noiseAngle, 0.3);

        // Move walker
        walker.x += Math.cos(angle) * stepSize;
        walker.y += Math.sin(angle) * stepSize;

        // Wrap around edges
        if (walker.x < 0) walker.x += p.width;
        if (walker.x > p.width) walker.x -= p.width;
        if (walker.y < 0) walker.y += p.height;
        if (walker.y > p.height) walker.y -= p.height;

        // Calculate stroke weight based on step size (thinner for long jumps)
        const strokeW = p.map(stepSize, minStep, maxStep, 1.5, 0.3);

        // Vary alpha based on step size (more transparent for long jumps)
        const alpha = p.map(stepSize, minStep, maxStep, 15, 5);

        // Slightly vary hue based on step size
        const hueShift = p.map(stepSize, minStep, maxStep, 0, 30);
        const currentHue = (walker.hue + hueShift) % 360;

        // Draw line from previous to current position
        // Only draw if not wrapping around
        const dx = Math.abs(walker.x - walker.prevX);
        const dy = Math.abs(walker.y - walker.prevY);

        if (dx < p.width / 2 && dy < p.height / 2) {
          p.stroke(currentHue, 70, 90, alpha);
          p.strokeWeight(strokeW);
          p.line(walker.prevX, walker.prevY, walker.x, walker.y);
        }
      }
      stepCount++;
    }

    // Display step counter
    if (stepCount % 1000 === 0) {
      // Draw subtle progress indicator
      p.push();
      p.fill(0, 0, 5);
      p.noStroke();
      p.rect(10, p.height - 30, 200, 25);
      p.fill(0, 0, 80);
      p.textSize(12);
      p.textAlign(p.LEFT, p.CENTER);
      p.text(`Steps: ${stepCount.toLocaleString()} / ${maxSteps.toLocaleString()}`, 15, p.height - 18);
      p.pop();
    }
  };

  p.mousePressed = () => {
    // Reset on click
    p.background(0, 0, 5);
    stepCount = 0;
    walkers = [];

    for (let i = 0; i < numWalkers; i++) {
      walkers.push({
        x: p.mouseX,
        y: p.mouseY,
        prevX: p.mouseX,
        prevY: p.mouseY,
        hue: (i * 360 / numWalkers + p.random(-20, 20)) % 360
      });
    }
    isDrawing = true;
  };

  p.keyPressed = () => {
    if (p.key === ' ') {
      isDrawing = !isDrawing;
    }
    if (p.key === 'r' || p.key === 'R') {
      p.background(0, 0, 5);
      stepCount = 0;
      walkers = [];

      for (let i = 0; i < numWalkers; i++) {
        walkers.push({
          x: p.random(p.width * 0.3, p.width * 0.7),
          y: p.random(p.height * 0.3, p.height * 0.7),
          prevX: 0,
          prevY: 0,
          hue: (i * 360 / numWalkers + p.random(-20, 20)) % 360
        });
        walkers[i].prevX = walkers[i].x;
        walkers[i].prevY = walkers[i].y;
      }
      isDrawing = true;
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.background(0, 0, 5);
    stepCount = 0;
    walkers = [];

    for (let i = 0; i < numWalkers; i++) {
      walkers.push({
        x: p.random(p.width * 0.3, p.width * 0.7),
        y: p.random(p.height * 0.3, p.height * 0.7),
        prevX: 0,
        prevY: 0,
        hue: (i * 360 / numWalkers + p.random(-20, 20)) % 360
      });
      walkers[i].prevX = walkers[i].x;
      walkers[i].prevY = walkers[i].y;
    }
  };
};

export default levyFlightSketch;
