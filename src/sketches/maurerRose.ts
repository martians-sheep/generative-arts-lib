import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

/**
 * Maurer Rose
 * A geometric pattern created by connecting points on a rose curve
 * Rose curve: r = sin(n * θ)
 * Connect points at angles k, 2k, 3k, ... degrees
 */
const maurerRoseSketch: Sketch = (p: p5) => {
  let n = 6;  // Number of petals (if n is even) or 2n petals (if n is odd)
  let d = 71; // Angular step in degrees

  let animatedN = n;
  let animatedD = d;
  let animating = true;
  let time = 0;

  // Multiple roses for layered effect
  interface Rose {
    n: number;
    d: number;
    hue: number;
    scale: number;
    rotation: number;
  }

  let roses: Rose[] = [];

  const generateRoses = () => {
    roses = [
      { n: 6, d: 71, hue: 0, scale: 1, rotation: 0 },
      { n: 5, d: 97, hue: 60, scale: 0.8, rotation: p.PI / 6 },
      { n: 7, d: 29, hue: 180, scale: 0.6, rotation: p.PI / 4 },
    ];
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.angleMode(p.DEGREES);
    generateRoses();
  };

  p.draw = () => {
    p.background(10, 20, 8);
    p.translate(p.width / 2, p.height / 2);

    time += 0.5;

    // Interactive parameters based on mouse
    if (animating) {
      animatedN = p.map(p.mouseX, 0, p.width, 2, 10);
      animatedD = p.map(p.mouseY, 0, p.height, 1, 180);
    }

    const baseRadius = p.min(p.width, p.height) * 0.35;

    // Draw background roses
    for (const rose of roses) {
      p.push();
      p.rotate(rose.rotation + time * 0.1);
      drawMaurerRose(
        rose.n + p.sin(time * 0.02) * 0.5,
        rose.d,
        baseRadius * rose.scale,
        (rose.hue + time * 0.5) % 360,
        20
      );
      p.pop();
    }

    // Draw main interactive rose
    drawMaurerRose(animatedN, animatedD, baseRadius, (time * 2) % 360, 80);

    // Draw the underlying rose curve
    drawRoseCurve(animatedN, baseRadius, time);

    // Display parameters
    p.push();
    p.resetMatrix();
    p.fill(0, 0, 100);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`n: ${animatedN.toFixed(2)} (petals)`, 20, 20);
    p.text(`d: ${animatedD.toFixed(1)}° (step angle)`, 20, 40);
    p.text('Move mouse to change parameters', 20, 60);
    p.text('Click to toggle animation', 20, 80);
    p.pop();
  };

  const drawMaurerRose = (n: number, d: number, radius: number, hueBase: number, alpha: number) => {
    p.noFill();
    p.strokeWeight(1);

    p.beginShape();
    for (let i = 0; i <= 360; i++) {
      const k = i * d;
      const r = radius * p.sin(n * k);
      const x = r * p.cos(k);
      const y = r * p.sin(k);

      // Rainbow color along the path
      const hue = (hueBase + i * 0.5) % 360;
      p.stroke(hue, 80, 90, alpha);
      p.vertex(x, y);
    }
    p.endShape();

    // Add glow effect at vertices
    p.noStroke();
    for (let i = 0; i <= 360; i += 10) {
      const k = i * d;
      const r = radius * p.sin(n * k);
      const x = r * p.cos(k);
      const y = r * p.sin(k);

      const hue = (hueBase + i * 0.5) % 360;
      p.fill(hue, 60, 100, alpha * 0.3);
      p.ellipse(x, y, 6);
    }
  };

  const drawRoseCurve = (n: number, radius: number, time: number) => {
    // Draw the actual rose curve (the underlying pattern)
    p.noFill();
    p.strokeWeight(2);

    p.beginShape();
    for (let theta = 0; theta <= 360; theta += 1) {
      const r = radius * p.sin(n * theta);
      const x = r * p.cos(theta);
      const y = r * p.sin(theta);

      const hue = (120 + theta * 0.3 + time) % 360;
      p.stroke(hue, 70, 100, 40);
      p.vertex(x, y);
    }
    p.endShape();
  };

  p.mousePressed = () => {
    animating = !animating;
    if (!animating) {
      n = animatedN;
      d = animatedD;
    }
  };

  p.keyPressed = () => {
    // Number keys for quick presets
    const presets: { n: number; d: number }[] = [
      { n: 2, d: 29 },
      { n: 3, d: 47 },
      { n: 4, d: 31 },
      { n: 5, d: 97 },
      { n: 6, d: 71 },
      { n: 7, d: 19 },
      { n: 8, d: 83 },
      { n: 9, d: 37 },
    ];

    const num = parseInt(p.key);
    if (num >= 1 && num <= 8) {
      animatedN = presets[num - 1].n;
      animatedD = presets[num - 1].d;
      animating = false;
    } else if (p.key === 'r' || p.key === 'R') {
      animatedN = p.random(2, 10);
      animatedD = p.random(1, 180);
      animating = false;
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};

export default maurerRoseSketch;
