import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

/**
 * Dithering
 *
 * Classic image processing technique that uses patterns of dots
 * to simulate continuous tones with limited colors. Creates retro,
 * halftone-style aesthetics.
 *
 * Controls:
 * - Click: Regenerate source image
 * - 1-4: Change dithering algorithm
 * - +/-: Adjust color depth
 */
const dithering: Sketch = (p: p5) => {
  let sourceImg: p5.Graphics;
  let ditheredImg: p5.Graphics;
  let algorithm = 0;
  let colorLevels = 2; // Number of gray levels

  const algorithms = ['Floyd-Steinberg', 'Atkinson', 'Ordered', 'Random'];

  // Bayer matrix for ordered dithering
  const bayerMatrix = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
  ];

  const generateSource = () => {
    sourceImg = p.createGraphics(p.width, p.height);
    sourceImg.background(128);

    // Create gradient background
    for (let y = 0; y < sourceImg.height; y++) {
      const gray = p.map(y, 0, sourceImg.height, 0, 255);
      sourceImg.stroke(gray);
      sourceImg.line(0, y, sourceImg.width, y);
    }

    // Add some shapes
    sourceImg.noStroke();
    for (let i = 0; i < 5; i++) {
      const gray = p.random(255);
      sourceImg.fill(gray);
      const x = p.random(sourceImg.width);
      const y = p.random(sourceImg.height);
      const size = p.random(100, 300);
      sourceImg.ellipse(x, y, size, size);
    }

    // Add noise texture
    sourceImg.loadPixels();
    for (let i = 0; i < sourceImg.pixels.length; i += 4) {
      const noise = p.random(-20, 20);
      sourceImg.pixels[i] = p.constrain(sourceImg.pixels[i] + noise, 0, 255);
      sourceImg.pixels[i + 1] = p.constrain(sourceImg.pixels[i + 1] + noise, 0, 255);
      sourceImg.pixels[i + 2] = p.constrain(sourceImg.pixels[i + 2] + noise, 0, 255);
    }
    sourceImg.updatePixels();

    applyDithering();
  };

  const findClosestColor = (value: number): number => {
    const step = 255 / (colorLevels - 1);
    return Math.round(value / step) * step;
  };

  const applyFloydSteinberg = () => {
    ditheredImg = p.createGraphics(p.width, p.height);
    ditheredImg.image(sourceImg, 0, 0);
    ditheredImg.loadPixels();

    const w = ditheredImg.width;
    const h = ditheredImg.height;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const oldPixel = ditheredImg.pixels[idx];
        const newPixel = findClosestColor(oldPixel);
        const error = oldPixel - newPixel;

        ditheredImg.pixels[idx] = newPixel;
        ditheredImg.pixels[idx + 1] = newPixel;
        ditheredImg.pixels[idx + 2] = newPixel;

        // Distribute error to neighbors
        if (x + 1 < w) {
          const idx1 = (y * w + x + 1) * 4;
          ditheredImg.pixels[idx1] += (error * 7) / 16;
        }
        if (y + 1 < h) {
          if (x > 0) {
            const idx2 = ((y + 1) * w + x - 1) * 4;
            ditheredImg.pixels[idx2] += (error * 3) / 16;
          }
          const idx3 = ((y + 1) * w + x) * 4;
          ditheredImg.pixels[idx3] += (error * 5) / 16;
          if (x + 1 < w) {
            const idx4 = ((y + 1) * w + x + 1) * 4;
            ditheredImg.pixels[idx4] += (error * 1) / 16;
          }
        }
      }
    }

    ditheredImg.updatePixels();
  };

  const applyAtkinson = () => {
    ditheredImg = p.createGraphics(p.width, p.height);
    ditheredImg.image(sourceImg, 0, 0);
    ditheredImg.loadPixels();

    const w = ditheredImg.width;
    const h = ditheredImg.height;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const oldPixel = ditheredImg.pixels[idx];
        const newPixel = findClosestColor(oldPixel);
        const error = (oldPixel - newPixel) / 8;

        ditheredImg.pixels[idx] = newPixel;
        ditheredImg.pixels[idx + 1] = newPixel;
        ditheredImg.pixels[idx + 2] = newPixel;

        // Atkinson distribution (only 3/4 of error is distributed)
        const neighbors = [
          [1, 0],
          [2, 0],
          [-1, 1],
          [0, 1],
          [1, 1],
          [0, 2],
        ];

        for (const [dx, dy] of neighbors) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            const nidx = (ny * w + nx) * 4;
            ditheredImg.pixels[nidx] += error;
          }
        }
      }
    }

    ditheredImg.updatePixels();
  };

  const applyOrdered = () => {
    ditheredImg = p.createGraphics(p.width, p.height);
    ditheredImg.image(sourceImg, 0, 0);
    ditheredImg.loadPixels();

    const matrixSize = 4;
    const w = ditheredImg.width;
    const h = ditheredImg.height;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const oldPixel = ditheredImg.pixels[idx];

        const threshold = (bayerMatrix[y % matrixSize][x % matrixSize] / 16) * 255;
        const adjusted = oldPixel + (threshold - 128) * (255 / colorLevels);
        const newPixel = findClosestColor(adjusted);

        ditheredImg.pixels[idx] = newPixel;
        ditheredImg.pixels[idx + 1] = newPixel;
        ditheredImg.pixels[idx + 2] = newPixel;
      }
    }

    ditheredImg.updatePixels();
  };

  const applyRandom = () => {
    ditheredImg = p.createGraphics(p.width, p.height);
    ditheredImg.image(sourceImg, 0, 0);
    ditheredImg.loadPixels();

    const w = ditheredImg.width;
    const h = ditheredImg.height;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const oldPixel = ditheredImg.pixels[idx];

        const threshold = p.random(-64, 64);
        const adjusted = oldPixel + threshold;
        const newPixel = findClosestColor(adjusted);

        ditheredImg.pixels[idx] = newPixel;
        ditheredImg.pixels[idx + 1] = newPixel;
        ditheredImg.pixels[idx + 2] = newPixel;
      }
    }

    ditheredImg.updatePixels();
  };

  const applyDithering = () => {
    switch (algorithm) {
      case 0:
        applyFloydSteinberg();
        break;
      case 1:
        applyAtkinson();
        break;
      case 2:
        applyOrdered();
        break;
      case 3:
        applyRandom();
        break;
    }
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    generateSource();
  };

  p.draw = () => {
    p.background(0);
    p.image(ditheredImg, 0, 0);

    // Instructions
    p.fill(255);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.LEFT, p.BOTTOM);
    p.text(
      `Algorithm: ${algorithms[algorithm]} | Levels: ${colorLevels} | Click: new image | 1-4: algorithm | +/-: levels`,
      20,
      p.height - 20
    );
  };

  p.mousePressed = () => {
    generateSource();
  };

  p.keyPressed = () => {
    if (p.key === '1') {
      algorithm = 0;
      applyDithering();
    } else if (p.key === '2') {
      algorithm = 1;
      applyDithering();
    } else if (p.key === '3') {
      algorithm = 2;
      applyDithering();
    } else if (p.key === '4') {
      algorithm = 3;
      applyDithering();
    } else if (p.key === '+' || p.key === '=') {
      colorLevels = Math.min(16, colorLevels + 1);
      applyDithering();
    } else if (p.key === '-' || p.key === '_') {
      colorLevels = Math.max(2, colorLevels - 1);
      applyDithering();
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    generateSource();
  };
};

export default dithering;
