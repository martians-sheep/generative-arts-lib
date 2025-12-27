import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

/**
 * Suprematism / Bauhaus Style
 *
 * Generates compositions using only basic geometric shapes (circles, squares, lines)
 * following constructivist design principles of balance, tension, and minimalism.
 *
 * Controls:
 * - Click: Generate new composition
 * - 1-3: Change style (Malevich, Kandinsky, Mondrian)
 * - +/-: Adjust element count
 */
const suprematism: Sketch = (p: p5) => {
  interface Shape {
    type: 'rect' | 'circle' | 'line' | 'triangle' | 'cross';
    x: number;
    y: number;
    w: number;
    h: number;
    rotation: number;
    color: { r: number; g: number; b: number };
    strokeOnly: boolean;
  }

  let shapes: Shape[] = [];
  let elementCount = 15;
  let styleIndex = 0;

  // Style palettes
  const styles = [
    {
      name: 'Malevich',
      bg: { r: 245, g: 240, b: 230 },
      colors: [
        { r: 0, g: 0, b: 0 },
        { r: 200, g: 50, b: 50 },
        { r: 50, g: 50, b: 150 },
        { r: 220, g: 180, b: 50 },
      ],
      shapes: ['rect', 'cross', 'circle'] as const,
      allowRotation: true,
    },
    {
      name: 'Kandinsky',
      bg: { r: 250, g: 248, b: 245 },
      colors: [
        { r: 30, g: 60, b: 120 },
        { r: 200, g: 80, b: 80 },
        { r: 220, g: 180, b: 60 },
        { r: 80, g: 150, b: 80 },
        { r: 150, g: 100, b: 160 },
      ],
      shapes: ['circle', 'triangle', 'line'] as const,
      allowRotation: true,
    },
    {
      name: 'Mondrian',
      bg: { r: 250, g: 250, b: 245 },
      colors: [
        { r: 255, g: 0, b: 0 },
        { r: 0, g: 0, b: 200 },
        { r: 255, g: 220, b: 0 },
        { r: 255, g: 255, b: 255 },
        { r: 20, g: 20, b: 20 },
      ],
      shapes: ['rect', 'line'] as const,
      allowRotation: false,
    },
  ];

  const generateComposition = () => {
    shapes = [];
    const style = styles[styleIndex];
    const margin = Math.min(p.width, p.height) * 0.1;

    // Golden ratio points for focal areas
    const goldenRatio = 0.618;
    const focalPoints = [
      { x: p.width * goldenRatio, y: p.height * goldenRatio },
      { x: p.width * (1 - goldenRatio), y: p.height * goldenRatio },
      { x: p.width * goldenRatio, y: p.height * (1 - goldenRatio) },
      { x: p.width * (1 - goldenRatio), y: p.height * (1 - goldenRatio) },
    ];

    // Generate shapes
    for (let i = 0; i < elementCount; i++) {
      const shapeType = style.shapes[Math.floor(p.random(style.shapes.length))];
      const color = style.colors[Math.floor(p.random(style.colors.length))];

      // Bias position towards focal points for better composition
      let x, y;
      if (p.random() < 0.6) {
        const focal = focalPoints[Math.floor(p.random(focalPoints.length))];
        x = focal.x + p.random(-200, 200);
        y = focal.y + p.random(-200, 200);
      } else {
        x = p.random(margin, p.width - margin);
        y = p.random(margin, p.height - margin);
      }

      // Size with some variety
      const baseSize = Math.min(p.width, p.height) * p.random(0.05, 0.2);
      const aspectRatio = shapeType === 'line' ? p.random(3, 8) : p.random(0.5, 2);

      shapes.push({
        type: shapeType,
        x,
        y,
        w: baseSize * (shapeType === 'line' ? aspectRatio : 1),
        h: baseSize / (shapeType === 'line' ? 1 : aspectRatio),
        rotation: style.allowRotation ? p.random(-p.PI / 4, p.PI / 4) : 0,
        color,
        strokeOnly: p.random() < 0.2,
      });
    }

    // Sort by size for proper layering (larger first)
    shapes.sort((a, b) => b.w * b.h - a.w * a.h);

    // Add accent lines for Kandinsky style
    if (styleIndex === 1) {
      for (let i = 0; i < 5; i++) {
        shapes.push({
          type: 'line',
          x: p.random(p.width),
          y: p.random(p.height),
          w: p.random(100, 400),
          h: 2,
          rotation: p.random(p.TWO_PI),
          color: { r: 20, g: 20, b: 20 },
          strokeOnly: false,
        });
      }
    }
  };

  const drawShape = (shape: Shape) => {
    p.push();
    p.translate(shape.x, shape.y);
    p.rotate(shape.rotation);

    if (shape.strokeOnly) {
      p.noFill();
      p.stroke(shape.color.r, shape.color.g, shape.color.b);
      p.strokeWeight(2);
    } else {
      p.fill(shape.color.r, shape.color.g, shape.color.b);
      p.noStroke();
    }

    switch (shape.type) {
      case 'rect':
        p.rectMode(p.CENTER);
        p.rect(0, 0, shape.w, shape.h);
        break;

      case 'circle':
        p.ellipse(0, 0, shape.w, shape.w);
        break;

      case 'line':
        p.stroke(shape.color.r, shape.color.g, shape.color.b);
        p.strokeWeight(shape.h);
        p.line(-shape.w / 2, 0, shape.w / 2, 0);
        break;

      case 'triangle':
        p.beginShape();
        p.vertex(0, -shape.h / 2);
        p.vertex(-shape.w / 2, shape.h / 2);
        p.vertex(shape.w / 2, shape.h / 2);
        p.endShape(p.CLOSE);
        break;

      case 'cross':
        p.rectMode(p.CENTER);
        const thickness = shape.w * 0.3;
        p.rect(0, 0, shape.w, thickness);
        p.rect(0, 0, thickness, shape.h);
        break;
    }

    p.pop();
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noLoop();
    generateComposition();
  };

  p.draw = () => {
    const style = styles[styleIndex];
    p.background(style.bg.r, style.bg.g, style.bg.b);

    // Draw grid lines for Mondrian style
    if (styleIndex === 2) {
      p.stroke(20);
      p.strokeWeight(8);

      // Vertical lines
      const verticals = [p.width * 0.3, p.width * 0.6, p.width * 0.8];
      for (const x of verticals) {
        p.line(x, 0, x, p.height);
      }

      // Horizontal lines
      const horizontals = [p.height * 0.25, p.height * 0.5, p.height * 0.75];
      for (const y of horizontals) {
        p.line(0, y, p.width, y);
      }
    }

    // Draw all shapes
    for (const shape of shapes) {
      drawShape(shape);
    }

    // Add subtle paper texture
    p.loadPixels();
    for (let i = 0; i < p.pixels.length; i += 4) {
      const noise = p.random(-5, 5);
      p.pixels[i] = p.constrain(p.pixels[i] + noise, 0, 255);
      p.pixels[i + 1] = p.constrain(p.pixels[i + 1] + noise, 0, 255);
      p.pixels[i + 2] = p.constrain(p.pixels[i + 2] + noise, 0, 255);
    }
    p.updatePixels();

    // Instructions
    p.fill(60);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.LEFT, p.BOTTOM);
    p.text(`Style: ${style.name} | Elements: ${elementCount} | Click to regenerate | 1-3: style | +/-: elements`, 20, p.height - 20);
  };

  p.mousePressed = () => {
    generateComposition();
    p.redraw();
  };

  p.keyPressed = () => {
    if (p.key === '1') {
      styleIndex = 0;
    } else if (p.key === '2') {
      styleIndex = 1;
    } else if (p.key === '3') {
      styleIndex = 2;
    } else if (p.key === '+' || p.key === '=') {
      elementCount = Math.min(30, elementCount + 3);
    } else if (p.key === '-' || p.key === '_') {
      elementCount = Math.max(5, elementCount - 3);
    }
    generateComposition();
    p.redraw();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    generateComposition();
    p.redraw();
  };
};

export default suprematism;
