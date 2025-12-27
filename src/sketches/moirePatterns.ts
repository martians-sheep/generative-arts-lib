import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

/**
 * Moiré Patterns
 *
 * Creates optical illusions through the interference of overlapping
 * geometric patterns. The patterns appear to move and shimmer.
 *
 * Controls:
 * - Mouse: Control the offset/rotation of the second pattern
 * - 1-4: Change pattern type (lines, circles, radial, grid)
 * - +/-: Adjust line spacing
 */
const moirePatterns: Sketch = (p: p5) => {
  let patternType = 1;
  let spacing = 8;
  let time = 0;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.strokeCap(p.SQUARE);
  };

  const drawLinePattern = (offsetX: number, offsetY: number, rotation: number) => {
    p.push();
    p.translate(p.width / 2 + offsetX, p.height / 2 + offsetY);
    p.rotate(rotation);

    const diagonal = Math.sqrt(p.width * p.width + p.height * p.height);

    for (let i = -diagonal; i < diagonal; i += spacing) {
      p.line(i, -diagonal, i, diagonal);
    }

    p.pop();
  };

  const drawCirclePattern = (offsetX: number, offsetY: number) => {
    p.push();
    p.translate(p.width / 2 + offsetX, p.height / 2 + offsetY);
    p.noFill();

    const maxRadius = Math.sqrt(p.width * p.width + p.height * p.height);

    for (let r = spacing; r < maxRadius; r += spacing) {
      p.ellipse(0, 0, r * 2, r * 2);
    }

    p.pop();
  };

  const drawRadialPattern = (offsetX: number, offsetY: number, rotationOffset: number) => {
    p.push();
    p.translate(p.width / 2 + offsetX, p.height / 2 + offsetY);

    const diagonal = Math.sqrt(p.width * p.width + p.height * p.height);
    const numLines = Math.floor(360 / (spacing / 2));

    for (let i = 0; i < numLines; i++) {
      const angle = (p.TWO_PI / numLines) * i + rotationOffset;
      const x = Math.cos(angle) * diagonal;
      const y = Math.sin(angle) * diagonal;
      p.line(0, 0, x, y);
    }

    p.pop();
  };

  const drawGridPattern = (offsetX: number, offsetY: number, rotation: number) => {
    p.push();
    p.translate(p.width / 2 + offsetX, p.height / 2 + offsetY);
    p.rotate(rotation);

    const diagonal = Math.sqrt(p.width * p.width + p.height * p.height);

    // Horizontal lines
    for (let i = -diagonal; i < diagonal; i += spacing) {
      p.line(-diagonal, i, diagonal, i);
    }

    // Vertical lines
    for (let i = -diagonal; i < diagonal; i += spacing) {
      p.line(i, -diagonal, i, diagonal);
    }

    p.pop();
  };

  p.draw = () => {
    p.background(0);
    p.stroke(255);
    p.strokeWeight(1);
    p.noFill();

    // Calculate mouse-based offsets
    const mouseOffsetX = (p.mouseX - p.width / 2) * 0.1;
    const mouseOffsetY = (p.mouseY - p.height / 2) * 0.1;
    const mouseRotation = p.map(p.mouseX, 0, p.width, -0.1, 0.1);

    // Add subtle animation
    const animOffset = Math.sin(time * 0.5) * 2;

    switch (patternType) {
      case 1: // Lines
        // First pattern (static)
        drawLinePattern(0, 0, 0);
        // Second pattern (mouse-controlled)
        drawLinePattern(mouseOffsetX + animOffset, mouseOffsetY, mouseRotation);
        break;

      case 2: // Concentric circles
        drawCirclePattern(0, 0);
        drawCirclePattern(mouseOffsetX + animOffset, mouseOffsetY);
        break;

      case 3: // Radial lines
        drawRadialPattern(0, 0, 0);
        drawRadialPattern(mouseOffsetX, mouseOffsetY, mouseRotation + time * 0.02);
        break;

      case 4: // Grid
        drawGridPattern(0, 0, 0);
        drawGridPattern(mouseOffsetX, mouseOffsetY, mouseRotation);
        break;
    }

    // Add color variation based on distance from center
    p.blendMode(p.ADD);
    p.noStroke();

    const cx = p.width / 2;
    const cy = p.height / 2;

    // Subtle color overlay
    for (let i = 0; i < 3; i++) {
      const hue = (time * 20 + i * 120) % 360;
      p.colorMode(p.HSB, 360, 100, 100, 100);
      p.fill(hue, 60, 20, 10);
      p.ellipse(
        cx + Math.cos(time + i) * 100,
        cy + Math.sin(time + i) * 100,
        p.width * 0.8,
        p.height * 0.8
      );
    }

    p.blendMode(p.BLEND);
    p.colorMode(p.RGB, 255);

    time += 0.01;

    // Instructions
    p.fill(255);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.LEFT, p.BOTTOM);
    const patternName = ['Lines', 'Circles', 'Radial', 'Grid'][patternType - 1];
    p.text(`Pattern: ${patternName} | Spacing: ${spacing}px | Move mouse to control | 1-4: pattern | +/-: spacing`, 20, p.height - 20);
  };

  p.keyPressed = () => {
    if (p.key === '1') {
      patternType = 1;
    } else if (p.key === '2') {
      patternType = 2;
    } else if (p.key === '3') {
      patternType = 3;
    } else if (p.key === '4') {
      patternType = 4;
    } else if (p.key === '+' || p.key === '=') {
      spacing = Math.min(30, spacing + 2);
    } else if (p.key === '-' || p.key === '_') {
      spacing = Math.max(4, spacing - 2);
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};

export default moirePatterns;
