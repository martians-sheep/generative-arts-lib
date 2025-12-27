import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

/**
 * De Jong Attractor
 * A chaotic mapping system that creates fabric-like textures
 *
 * x_{n+1} = sin(a * y_n) - cos(b * x_n)
 * y_{n+1} = sin(c * x_n) - cos(d * y_n)
 */
const deJongAttractorSketch: Sketch = (p: p5) => {
  // Attractor parameters
  let a = 1.4;
  let b = -2.3;
  let c = 2.4;
  let d = -2.1;

  // Rendering parameters
  let x = 0;
  let y = 0;
  const iterationsPerFrame = 5000;
  let totalIterations = 0;
  const maxIterations = 2000000;

  // Pixel accumulator for density visualization
  let densityBuffer: number[][] = [];
  let maxDensity = 1;

  // Color parameters
  let hueBase = 0;
  let isAnimating = true;

  const presets = [
    { a: 1.4, b: -2.3, c: 2.4, d: -2.1 },
    { a: -2.7, b: -0.09, c: -0.86, d: -2.2 },
    { a: -2.0, b: -2.0, c: -1.2, d: 2.0 },
    { a: 1.641, b: 1.902, c: 0.316, d: 1.525 },
    { a: 2.01, b: -2.53, c: 1.61, d: -0.33 },
    { a: -0.827, b: -1.637, c: 1.659, d: -0.943 },
  ];
  let currentPreset = 0;

  const initBuffer = () => {
    densityBuffer = [];
    for (let i = 0; i < p.width; i++) {
      densityBuffer[i] = [];
      for (let j = 0; j < p.height; j++) {
        densityBuffer[i][j] = 0;
      }
    }
    maxDensity = 1;
  };

  const reset = () => {
    x = 0;
    y = 0;
    totalIterations = 0;
    initBuffer();
    p.background(10, 10, 15);
    hueBase = p.random(360);
  };

  const applyPreset = (index: number) => {
    const preset = presets[index];
    a = preset.a;
    b = preset.b;
    c = preset.c;
    d = preset.d;
    reset();
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.pixelDensity(1);
    initBuffer();
    p.background(10, 10, 15);
    applyPreset(0);
  };

  p.draw = () => {
    if (!isAnimating || totalIterations >= maxIterations) return;

    // Iterate the attractor
    for (let i = 0; i < iterationsPerFrame; i++) {
      // De Jong equations
      const xNew = Math.sin(a * y) - Math.cos(b * x);
      const yNew = Math.sin(c * x) - Math.cos(d * y);

      x = xNew;
      y = yNew;

      // Map to screen coordinates
      const screenX = Math.floor(p.map(x, -2.5, 2.5, 0, p.width));
      const screenY = Math.floor(p.map(y, -2.5, 2.5, 0, p.height));

      // Accumulate density
      if (screenX >= 0 && screenX < p.width && screenY >= 0 && screenY < p.height) {
        densityBuffer[screenX][screenY]++;
        if (densityBuffer[screenX][screenY] > maxDensity) {
          maxDensity = densityBuffer[screenX][screenY];
        }
      }

      totalIterations++;
    }

    // Render the density map
    p.loadPixels();
    for (let i = 0; i < p.width; i++) {
      for (let j = 0; j < p.height; j++) {
        const density = densityBuffer[i][j];
        if (density > 0) {
          // Use log scale for better visibility
          const logDensity = Math.log(density + 1) / Math.log(maxDensity + 1);

          // Color based on density
          const hue = (hueBase + logDensity * 60) % 360;
          const sat = 70 + logDensity * 20;
          const bri = Math.min(100, logDensity * 150);
          const alpha = Math.min(255, logDensity * 255);

          const pixelIndex = (i + j * p.width) * 4;

          // Convert HSB to RGB for pixel manipulation
          const rgb = hsbToRgb(hue, sat, bri);
          p.pixels[pixelIndex] = rgb.r;
          p.pixels[pixelIndex + 1] = rgb.g;
          p.pixels[pixelIndex + 2] = rgb.b;
          p.pixels[pixelIndex + 3] = alpha;
        }
      }
    }
    p.updatePixels();

    // Display info
    p.fill(0, 0, 100);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`Iterations: ${(totalIterations / 1000000).toFixed(2)}M`, 20, 20);
    p.text(`a: ${a.toFixed(3)} b: ${b.toFixed(3)} c: ${c.toFixed(3)} d: ${d.toFixed(3)}`, 20, 40);
    p.text(`Preset: ${currentPreset + 1}/${presets.length} | Press 1-6 for presets, R for random, SPACE to pause`, 20, 60);
  };

  // Helper function to convert HSB to RGB
  const hsbToRgb = (h: number, s: number, b: number) => {
    s /= 100;
    b /= 100;
    const k = (n: number) => (n + h / 60) % 6;
    const f = (n: number) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
    return {
      r: Math.round(255 * f(5)),
      g: Math.round(255 * f(3)),
      b: Math.round(255 * f(1))
    };
  };

  p.keyPressed = () => {
    if (p.key === ' ') {
      isAnimating = !isAnimating;
    } else if (p.key === 'r' || p.key === 'R') {
      a = p.random(-3, 3);
      b = p.random(-3, 3);
      c = p.random(-3, 3);
      d = p.random(-3, 3);
      reset();
    } else if (p.key >= '1' && p.key <= '6') {
      currentPreset = parseInt(p.key) - 1;
      applyPreset(currentPreset);
    }
  };

  p.mousePressed = () => {
    // Mouse position affects parameters
    a = p.map(p.mouseX, 0, p.width, -3, 3);
    b = p.map(p.mouseY, 0, p.height, -3, 3);
    reset();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    reset();
  };
};

export default deJongAttractorSketch;
