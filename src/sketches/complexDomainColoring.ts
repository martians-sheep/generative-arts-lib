import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

/**
 * Complex Domain Coloring
 * Visualizes complex functions f(z) using color
 * Argument (angle) → Hue
 * Magnitude → Brightness
 */
const complexDomainColoringSketch: Sketch = (p: p5) => {
  let currentFunction = 0;
  let zoom = 3;
  let centerX = 0;
  let centerY = 0;
  let time = 0;
  let animating = true;

  const functionNames = [
    'z² - 1',
    'z³ - 1',
    'sin(z)',
    '1/z',
    'z⁴ - 1',
    'e^z',
    'z² + c (Julia)',
    'tan(z)',
  ];

  // Complex number operations
  const cAdd = (a: number[], b: number[]): number[] => [a[0] + b[0], a[1] + b[1]];
  const cSub = (a: number[], b: number[]): number[] => [a[0] - b[0], a[1] - b[1]];
  const cMul = (a: number[], b: number[]): number[] => [
    a[0] * b[0] - a[1] * b[1],
    a[0] * b[1] + a[1] * b[0]
  ];
  const cDiv = (a: number[], b: number[]): number[] => {
    const denom = b[0] * b[0] + b[1] * b[1];
    if (denom === 0) return [Infinity, Infinity];
    return [(a[0] * b[0] + a[1] * b[1]) / denom, (a[1] * b[0] - a[0] * b[1]) / denom];
  };
  const cAbs = (z: number[]): number => Math.sqrt(z[0] * z[0] + z[1] * z[1]);
  const cArg = (z: number[]): number => Math.atan2(z[1], z[0]);
  const cExp = (z: number[]): number[] => {
    const r = Math.exp(z[0]);
    return [r * Math.cos(z[1]), r * Math.sin(z[1])];
  };
  const cSin = (z: number[]): number[] => {
    return [
      Math.sin(z[0]) * Math.cosh(z[1]),
      Math.cos(z[0]) * Math.sinh(z[1])
    ];
  };
  const cCos = (z: number[]): number[] => {
    return [
      Math.cos(z[0]) * Math.cosh(z[1]),
      -Math.sin(z[0]) * Math.sinh(z[1])
    ];
  };
  const cTan = (z: number[]): number[] => {
    return cDiv(cSin(z), cCos(z));
  };
  const cPow = (z: number[], n: number): number[] => {
    let result: number[] = [1, 0];
    for (let i = 0; i < n; i++) {
      result = cMul(result, z);
    }
    return result;
  };

  // Complex functions
  const evalFunction = (z: number[], funcIndex: number, t: number): number[] => {
    switch (funcIndex) {
      case 0: // z² - 1
        return cSub(cPow(z, 2), [1, 0]);
      case 1: // z³ - 1
        return cSub(cPow(z, 3), [1, 0]);
      case 2: // sin(z)
        return cSin(z);
      case 3: // 1/z
        return cDiv([1, 0], z);
      case 4: // z⁴ - 1
        return cSub(cPow(z, 4), [1, 0]);
      case 5: // e^z
        return cExp(z);
      case 6: // z² + c (Julia set style)
        const c = [0.285 * Math.cos(t), 0.285 * Math.sin(t)];
        return cAdd(cPow(z, 2), c);
      case 7: // tan(z)
        return cTan(z);
      default:
        return z;
    }
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.pixelDensity(1);
    p.noStroke();
  };

  p.draw = () => {
    if (animating) {
      time += 0.01;
    }

    p.loadPixels();

    const step = 2; // Pixel step for performance

    for (let px = 0; px < p.width; px += step) {
      for (let py = 0; py < p.height; py += step) {
        // Map pixel to complex plane
        const x = centerX + (px - p.width / 2) / (p.width / 2) * zoom;
        const y = centerY + (py - p.height / 2) / (p.height / 2) * zoom;

        const z: number[] = [x, y];
        const w = evalFunction(z, currentFunction, time);

        // Get hue from argument (angle)
        let hue = (cArg(w) / Math.PI / 2 + 0.5) * 360;
        if (hue < 0) hue += 360;

        // Get brightness from magnitude
        const mag = cAbs(w);
        // Use cyclic brightness to show contours
        const logMag = Math.log(mag + 1);
        const brightness = 50 + 40 * Math.sin(logMag * 3);

        // Saturation based on magnitude
        const saturation = 80 - 30 * Math.exp(-mag * 0.5);

        // Check for poles/zeros
        const alpha = mag > 100 || mag < 0.01 ? 50 : 100;

        // Convert HSB to RGB
        const rgb = hsbToRgb(hue, saturation, brightness);

        // Fill pixels
        for (let i = 0; i < step; i++) {
          for (let j = 0; j < step; j++) {
            const idx = ((py + j) * p.width + (px + i)) * 4;
            p.pixels[idx] = rgb.r;
            p.pixels[idx + 1] = rgb.g;
            p.pixels[idx + 2] = rgb.b;
            p.pixels[idx + 3] = alpha * 2.55;
          }
        }
      }
    }

    p.updatePixels();

    // Draw reference axes
    p.stroke(255, 30);
    p.strokeWeight(1);
    const originX = p.width / 2 - centerX * (p.width / 2) / zoom;
    const originY = p.height / 2 - centerY * (p.height / 2) / zoom;
    if (originX > 0 && originX < p.width) {
      p.line(originX, 0, originX, p.height);
    }
    if (originY > 0 && originY < p.height) {
      p.line(0, originY, p.width, originY);
    }

    // UI
    p.noStroke();
    p.fill(0, 0, 0, 70);
    p.rect(10, 10, 350, 100);

    p.fill(0, 0, 100);
    p.textSize(16);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`f(z) = ${functionNames[currentFunction]}`, 20, 20);
    p.text(`Zoom: ${zoom.toFixed(2)} | Center: (${centerX.toFixed(2)}, ${centerY.toFixed(2)})`, 20, 45);
    p.textSize(12);
    p.text('←→: Change function | Scroll: Zoom | Drag: Pan | Space: Animate', 20, 75);
  };

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

  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;

  p.mousePressed = () => {
    isDragging = true;
    lastMouseX = p.mouseX;
    lastMouseY = p.mouseY;
  };

  p.mouseDragged = () => {
    if (isDragging) {
      const dx = (p.mouseX - lastMouseX) / (p.width / 2) * zoom;
      const dy = (p.mouseY - lastMouseY) / (p.height / 2) * zoom;
      centerX -= dx;
      centerY -= dy;
      lastMouseX = p.mouseX;
      lastMouseY = p.mouseY;
    }
  };

  p.mouseReleased = () => {
    isDragging = false;
  };

  p.mouseWheel = (event: WheelEvent) => {
    const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9;
    zoom *= zoomFactor;
    zoom = p.constrain(zoom, 0.1, 20);
    return false;
  };

  p.keyPressed = () => {
    if (p.keyCode === 37) { // LEFT_ARROW
      currentFunction = (currentFunction - 1 + functionNames.length) % functionNames.length;
    } else if (p.keyCode === 39) { // RIGHT_ARROW
      currentFunction = (currentFunction + 1) % functionNames.length;
    } else if (p.key === ' ') {
      animating = !animating;
    } else if (p.key === 'r' || p.key === 'R') {
      zoom = 3;
      centerX = 0;
      centerY = 0;
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};

export default complexDomainColoringSketch;
