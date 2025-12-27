import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

const magneticGridSketch: Sketch = (p: p5) => {
  const spacing = 30;
  const lineLength = 15;
  let cols: number;
  let rows: number;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    calculateGrid();
  };

  const calculateGrid = () => {
    cols = Math.ceil(p.width / spacing) + 1;
    rows = Math.ceil(p.height / spacing) + 1;
  };

  p.draw = () => {
    p.background(0, 0, 10);

    const mouseX = p.mouseX;
    const mouseY = p.mouseY;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * spacing;
        const y = j * spacing;

        // Calculate direction and angle to mouse
        const dx = mouseX - x;
        const dy = mouseY - y;
        const angle = p.atan2(dy, dx);
        const dist = p.sqrt(dx * dx + dy * dy);

        // Influence based on distance
        const maxDist = 300;
        const influence = p.constrain(p.map(dist, 0, maxDist, 1, 0), 0, 1);

        // Color based on angle and distance
        const hue = (p.degrees(angle) + 360) % 360;
        const saturation = p.map(influence, 0, 1, 20, 80);
        const brightness = p.map(influence, 0, 1, 40, 100);
        const alpha = p.map(influence, 0, 1, 40, 100);

        p.push();
        p.translate(x, y);
        p.rotate(angle);

        // Draw the needle
        p.stroke(hue, saturation, brightness, alpha);
        p.strokeWeight(p.map(influence, 0, 1, 1, 2.5));

        const len = lineLength * (0.5 + influence * 0.5);
        p.line(-len / 2, 0, len / 2, 0);

        // Draw a small dot at the tip pointing toward mouse
        p.noStroke();
        p.fill(hue, saturation, brightness, alpha);
        p.ellipse(len / 2, 0, 3 * influence + 1, 3 * influence + 1);

        p.pop();
      }
    }

    // Draw subtle glow around mouse
    p.noStroke();
    for (let i = 5; i > 0; i--) {
      const alpha = p.map(i, 5, 0, 5, 0);
      p.fill(200, 50, 100, alpha);
      p.ellipse(mouseX, mouseY, i * 30, i * 30);
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    calculateGrid();
  };

  p.mousePressed = () => {
    // No specific reset needed, just a visual pulse could be added
  };
};

export default magneticGridSketch;
