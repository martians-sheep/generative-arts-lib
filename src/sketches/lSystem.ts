import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

/**
 * L-System (Lindenmayer System)
 *
 * A grammar-based approach to drawing fractals using turtle graphics.
 * Famous fractals like Dragon Curve, Koch Snowflake, and Sierpinski's Triangle.
 *
 * Controls:
 * - 1-6: Change L-System pattern
 * - +/-: Adjust iteration depth
 * - Click: Regenerate
 */
const lSystem: Sketch = (p: p5) => {
  interface LSystemRule {
    name: string;
    axiom: string;
    rules: Record<string, string>;
    angle: number;
    startAngle: number;
    iterations: number;
    scale: number;
  }

  const systems: LSystemRule[] = [
    {
      name: 'Dragon Curve',
      axiom: 'FX',
      rules: {
        X: 'X+YF+',
        Y: '-FX-Y',
      },
      angle: 90,
      startAngle: 0,
      iterations: 12,
      scale: 5,
    },
    {
      name: 'Koch Snowflake',
      axiom: 'F++F++F',
      rules: {
        F: 'F-F++F-F',
      },
      angle: 60,
      startAngle: 0,
      iterations: 4,
      scale: 3,
    },
    {
      name: 'Sierpinski Triangle',
      axiom: 'F-G-G',
      rules: {
        F: 'F-G+F+G-F',
        G: 'GG',
      },
      angle: 120,
      startAngle: 0,
      iterations: 6,
      scale: 4,
    },
    {
      name: 'Hilbert Curve',
      axiom: 'A',
      rules: {
        A: '-BF+AFA+FB-',
        B: '+AF-BFB-FA+',
      },
      angle: 90,
      startAngle: 0,
      iterations: 6,
      scale: 8,
    },
    {
      name: 'Gosper Curve',
      axiom: 'A',
      rules: {
        A: 'A-B--B+A++AA+B-',
        B: '+A-BB--B-A++A+B',
      },
      angle: 60,
      startAngle: 0,
      iterations: 4,
      scale: 6,
    },
    {
      name: 'Peano Curve',
      axiom: 'X',
      rules: {
        X: 'XFYFX+F+YFXFY-F-XFYFX',
        Y: 'YFXFY-F-XFYFX+F+YFXFY',
      },
      angle: 90,
      startAngle: 0,
      iterations: 3,
      scale: 8,
    },
  ];

  let currentSystemIndex = 0;
  let currentIteration = systems[0].iterations;
  let sentence = '';
  let segmentLength = 5;

  const generateSentence = () => {
    const system = systems[currentSystemIndex];
    sentence = system.axiom;

    for (let i = 0; i < currentIteration; i++) {
      let nextSentence = '';
      for (const char of sentence) {
        if (system.rules[char]) {
          nextSentence += system.rules[char];
        } else {
          nextSentence += char;
        }
      }
      sentence = nextSentence;
    }

    // Calculate segment length based on sentence length
    const numSegments = sentence.split('').filter(c => c === 'F' || c === 'G').length;
    if (numSegments > 0) {
      const maxDim = Math.min(p.width, p.height) * 0.8;
      segmentLength = Math.max(1, maxDim / Math.sqrt(numSegments) / system.scale);
    }
  };

  const drawLSystem = () => {
    const system = systems[currentSystemIndex];
    const angleRad = p.radians(system.angle);

    // Calculate bounds first
    let x = 0, y = 0;
    let currentAngle = p.radians(system.startAngle);
    let minX = 0, maxX = 0, minY = 0, maxY = 0;
    const stack: { x: number; y: number; angle: number }[] = [];

    for (const char of sentence) {
      switch (char) {
        case 'F':
        case 'G':
          x += Math.cos(currentAngle) * segmentLength;
          y += Math.sin(currentAngle) * segmentLength;
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
          break;
        case '+':
          currentAngle += angleRad;
          break;
        case '-':
          currentAngle -= angleRad;
          break;
        case '[':
          stack.push({ x, y, angle: currentAngle });
          break;
        case ']':
          const state = stack.pop();
          if (state) {
            x = state.x;
            y = state.y;
            currentAngle = state.angle;
          }
          break;
      }
    }

    // Center the drawing
    const offsetX = (p.width - (maxX - minX)) / 2 - minX;
    const offsetY = (p.height - (maxY - minY)) / 2 - minY;

    // Draw the L-system
    p.push();
    p.translate(offsetX, offsetY);

    x = 0;
    y = 0;
    currentAngle = p.radians(system.startAngle);
    let hue = 0;
    const hueStep = 360 / sentence.length;

    for (const char of sentence) {
      switch (char) {
        case 'F':
        case 'G':
          const newX = x + Math.cos(currentAngle) * segmentLength;
          const newY = y + Math.sin(currentAngle) * segmentLength;

          // Gradient color
          p.colorMode(p.HSB, 360, 100, 100);
          p.stroke((hue + 180) % 360, 70, 90);
          p.line(x, y, newX, newY);
          p.colorMode(p.RGB, 255);

          x = newX;
          y = newY;
          hue += hueStep * 10;
          break;
        case '+':
          currentAngle += angleRad;
          break;
        case '-':
          currentAngle -= angleRad;
          break;
        case '[':
          stack.push({ x, y, angle: currentAngle });
          break;
        case ']':
          const state = stack.pop();
          if (state) {
            x = state.x;
            y = state.y;
            currentAngle = state.angle;
          }
          break;
      }
    }

    p.pop();
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noLoop();
    generateSentence();
  };

  p.draw = () => {
    p.background(20, 25, 35);
    p.strokeWeight(1);

    drawLSystem();

    // Instructions
    p.fill(255);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.LEFT, p.BOTTOM);
    const system = systems[currentSystemIndex];
    p.text(`${system.name} | Iterations: ${currentIteration} | 1-6: patterns | +/-: iterations`, 20, p.height - 20);
  };

  p.mousePressed = () => {
    generateSentence();
    p.redraw();
  };

  p.keyPressed = () => {
    const system = systems[currentSystemIndex];

    if (p.key >= '1' && p.key <= '6') {
      currentSystemIndex = parseInt(p.key) - 1;
      currentIteration = systems[currentSystemIndex].iterations;
      generateSentence();
      p.redraw();
    } else if (p.key === '+' || p.key === '=') {
      const maxIter = system.name === 'Dragon Curve' ? 15 : system.name === 'Hilbert Curve' ? 8 : 7;
      currentIteration = Math.min(maxIter, currentIteration + 1);
      generateSentence();
      p.redraw();
    } else if (p.key === '-' || p.key === '_') {
      currentIteration = Math.max(1, currentIteration - 1);
      generateSentence();
      p.redraw();
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    generateSentence();
    p.redraw();
  };
};

export default lSystem;
