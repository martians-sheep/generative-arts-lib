import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

const geometricWaveSketch: Sketch = (p: p5) => {
  const spacing = 40;
  let cols: number;
  let rows: number;
  let waveSpeed = 0.03;
  let waveAmplitude = 1;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.rectMode(p.CENTER);
    calculateGrid();
  };

  const calculateGrid = () => {
    cols = Math.ceil(p.width / spacing) + 2;
    rows = Math.ceil(p.height / spacing) + 2;
  };

  p.draw = () => {
    p.background(220, 15, 95);

    const time = p.millis() * 0.001;

    // Mouse influence
    const mouseDist = p.dist(p.mouseX, p.mouseY, p.width / 2, p.height / 2);
    const mouseInfluence = p.map(mouseDist, 0, p.width / 2, 1.5, 0.5);
    waveAmplitude = p.lerp(waveAmplitude, mouseInfluence, 0.05);

    const offsetX = (p.width - (cols - 1) * spacing) / 2;
    const offsetY = (p.height - (rows - 1) * spacing) / 2;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = offsetX + i * spacing;
        const y = offsetY + j * spacing;

        // Distance from center and mouse
        const distFromCenter = p.dist(x, y, p.width / 2, p.height / 2);
        const distFromMouse = p.dist(x, y, p.mouseX, p.mouseY);

        // Wave calculations
        const wave1 = p.sin(distFromCenter * 0.02 - time * 2) * waveAmplitude;
        const wave2 = p.sin(distFromMouse * 0.03 - time * 3) * 0.5;
        const wave3 = p.sin((i + j) * 0.3 + time) * 0.3;

        const combinedWave = wave1 + wave2 + wave3;

        // Rotation based on wave
        const rotation = combinedWave * p.PI * 0.25;

        // Size variation
        const sizeVar = p.map(combinedWave, -2, 2, 0.5, 1.2);
        const size = spacing * 0.5 * sizeVar;

        // Color based on position and wave
        const hue = (distFromCenter * 0.2 + time * 20) % 360;
        const saturation = p.map(p.abs(combinedWave), 0, 2, 20, 50);
        const brightness = p.map(combinedWave, -2, 2, 40, 80);

        p.push();
        p.translate(x, y);
        p.rotate(rotation);

        // Draw square
        p.noFill();
        p.stroke(hue, saturation, brightness, 80);
        p.strokeWeight(1.5);
        p.rect(0, 0, size, size);

        // Inner element
        const innerSize = size * 0.4;
        p.fill(hue, saturation + 20, brightness + 10, 60);
        p.noStroke();

        // Alternate between shapes
        if ((i + j) % 2 === 0) {
          p.ellipse(0, 0, innerSize, innerSize);
        } else {
          p.rect(0, 0, innerSize, innerSize);
        }

        p.pop();
      }
    }

    // Draw connecting lines for nearby elements that are in sync
    p.stroke(200, 30, 70, 15);
    p.strokeWeight(0.5);
    for (let i = 0; i < cols - 1; i++) {
      for (let j = 0; j < rows - 1; j++) {
        const x1 = offsetX + i * spacing;
        const y1 = offsetY + j * spacing;
        const x2 = offsetX + (i + 1) * spacing;
        const y2 = offsetY + (j + 1) * spacing;

        p.line(x1, y1, x2, y2);
      }
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    calculateGrid();
  };

  p.mousePressed = () => {
    waveSpeed = p.random(0.02, 0.05);
  };
};

export default geometricWaveSketch;
