import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

/**
 * Pixel Sorting
 *
 * A glitch art technique that sorts pixels in rows or columns
 * based on brightness, hue, or other criteria. Creates dripping,
 * cyberpunk visual effects.
 *
 * Controls:
 * - Click: Regenerate source pattern
 * - Space: Apply sorting
 * - 1-3: Change sort mode (brightness, hue, saturation)
 * - H/V: Toggle horizontal/vertical sorting
 */
const pixelSorting: Sketch = (p: p5) => {
  let img: p5.Graphics;
  let sortedImg: p5.Graphics;
  let sortMode = 0; // 0: brightness, 1: hue, 2: saturation
  let horizontal = true;
  let threshold = 0.3;
  let isSorted = false;

  const sortModes = ['Brightness', 'Hue', 'Saturation'];

  const generatePattern = () => {
    img = p.createGraphics(p.width, p.height);
    img.colorMode(p.HSB, 360, 100, 100);
    img.background(0, 0, 0);

    // Create an interesting pattern to sort
    const noiseScale = 0.02;
    const time = p.random(1000);

    img.loadPixels();
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const n1 = p.noise(x * noiseScale, y * noiseScale, time);
        const n2 = p.noise(x * noiseScale * 2, y * noiseScale * 2, time + 100);
        const n3 = p.noise(x * noiseScale * 0.5, y * noiseScale * 0.5, time + 200);

        const hue = (n1 * 360 + n2 * 60) % 360;
        const sat = 60 + n2 * 40;
        const bri = 30 + n3 * 70;

        const idx = (y * img.width + x) * 4;
        const c = p.color(hue, sat, bri);
        img.pixels[idx] = p.red(c);
        img.pixels[idx + 1] = p.green(c);
        img.pixels[idx + 2] = p.blue(c);
        img.pixels[idx + 3] = 255;
      }
    }
    img.updatePixels();

    // Add some geometric shapes
    img.noStroke();
    for (let i = 0; i < 10; i++) {
      img.fill(p.random(360), 80, 90);
      const x = p.random(img.width);
      const y = p.random(img.height);
      const size = p.random(50, 200);
      if (p.random() < 0.5) {
        img.ellipse(x, y, size, size);
      } else {
        img.rect(x - size / 2, y - size / 2, size, size);
      }
    }

    sortedImg = p.createGraphics(p.width, p.height);
    sortedImg.image(img, 0, 0);
    isSorted = false;
  };

  const getSortValue = (r: number, g: number, b: number): number => {
    const c = p.color(r, g, b);
    switch (sortMode) {
      case 0: // Brightness
        return p.brightness(c);
      case 1: // Hue
        return p.hue(c);
      case 2: // Saturation
        return p.saturation(c);
      default:
        return p.brightness(c);
    }
  };

  const applyPixelSort = () => {
    sortedImg = p.createGraphics(p.width, p.height);
    sortedImg.image(img, 0, 0);
    sortedImg.loadPixels();

    if (horizontal) {
      // Sort rows
      for (let y = 0; y < sortedImg.height; y++) {
        const row: { r: number; g: number; b: number; value: number }[] = [];

        // Extract row pixels
        for (let x = 0; x < sortedImg.width; x++) {
          const idx = (y * sortedImg.width + x) * 4;
          const r = sortedImg.pixels[idx];
          const g = sortedImg.pixels[idx + 1];
          const b = sortedImg.pixels[idx + 2];
          row.push({ r, g, b, value: getSortValue(r, g, b) });
        }

        // Find segments to sort (between threshold values)
        let sortStart = -1;
        for (let x = 0; x <= row.length; x++) {
          const normalized = x < row.length ? row[x].value / 100 : 0;

          if (normalized > threshold && sortStart === -1) {
            sortStart = x;
          } else if ((normalized <= threshold || x === row.length) && sortStart !== -1) {
            // Sort this segment
            const segment = row.slice(sortStart, x);
            segment.sort((a, b) => a.value - b.value);

            for (let i = 0; i < segment.length; i++) {
              row[sortStart + i] = segment[i];
            }
            sortStart = -1;
          }
        }

        // Write back to pixels
        for (let x = 0; x < sortedImg.width; x++) {
          const idx = (y * sortedImg.width + x) * 4;
          sortedImg.pixels[idx] = row[x].r;
          sortedImg.pixels[idx + 1] = row[x].g;
          sortedImg.pixels[idx + 2] = row[x].b;
        }
      }
    } else {
      // Sort columns
      for (let x = 0; x < sortedImg.width; x++) {
        const col: { r: number; g: number; b: number; value: number }[] = [];

        // Extract column pixels
        for (let y = 0; y < sortedImg.height; y++) {
          const idx = (y * sortedImg.width + x) * 4;
          const r = sortedImg.pixels[idx];
          const g = sortedImg.pixels[idx + 1];
          const b = sortedImg.pixels[idx + 2];
          col.push({ r, g, b, value: getSortValue(r, g, b) });
        }

        // Find segments to sort
        let sortStart = -1;
        for (let y = 0; y <= col.length; y++) {
          const normalized = y < col.length ? col[y].value / 100 : 0;

          if (normalized > threshold && sortStart === -1) {
            sortStart = y;
          } else if ((normalized <= threshold || y === col.length) && sortStart !== -1) {
            const segment = col.slice(sortStart, y);
            segment.sort((a, b) => a.value - b.value);

            for (let i = 0; i < segment.length; i++) {
              col[sortStart + i] = segment[i];
            }
            sortStart = -1;
          }
        }

        // Write back to pixels
        for (let y = 0; y < sortedImg.height; y++) {
          const idx = (y * sortedImg.width + x) * 4;
          sortedImg.pixels[idx] = col[y].r;
          sortedImg.pixels[idx + 1] = col[y].g;
          sortedImg.pixels[idx + 2] = col[y].b;
        }
      }
    }

    sortedImg.updatePixels();
    isSorted = true;
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100);
    generatePattern();
  };

  p.draw = () => {
    p.background(0);
    p.image(sortedImg, 0, 0);

    // Instructions
    p.colorMode(p.RGB, 255);
    p.fill(255);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.LEFT, p.BOTTOM);
    const direction = horizontal ? 'Horizontal' : 'Vertical';
    const status = isSorted ? 'Sorted' : 'Original';
    p.text(
      `Mode: ${sortModes[sortMode]} | Direction: ${direction} | Threshold: ${threshold.toFixed(1)} | ${status} | Space: sort | Click: new | 1-3: mode | H/V: direction`,
      20,
      p.height - 20
    );
  };

  p.mousePressed = () => {
    generatePattern();
  };

  p.keyPressed = () => {
    if (p.key === ' ') {
      applyPixelSort();
    } else if (p.key === '1') {
      sortMode = 0;
    } else if (p.key === '2') {
      sortMode = 1;
    } else if (p.key === '3') {
      sortMode = 2;
    } else if (p.key === 'h' || p.key === 'H') {
      horizontal = true;
    } else if (p.key === 'v' || p.key === 'V') {
      horizontal = false;
    } else if (p.key === '+' || p.key === '=') {
      threshold = Math.min(0.9, threshold + 0.1);
    } else if (p.key === '-' || p.key === '_') {
      threshold = Math.max(0.1, threshold - 0.1);
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    generatePattern();
  };
};

export default pixelSorting;
