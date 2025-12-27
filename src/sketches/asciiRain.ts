import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

interface Drop {
  x: number;
  y: number;
  speed: number;
  chars: string[];
  length: number;
  charIndex: number;
}

const asciiRainSketch: Sketch = (p: p5) => {
  const drops: Drop[] = [];
  const fontSize = 16;
  let cols: number;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>[]{}';

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.textFont('monospace');
    p.textSize(fontSize);
    p.textAlign(p.CENTER, p.CENTER);
    initDrops();
  };

  const initDrops = () => {
    drops.length = 0;
    cols = Math.ceil(p.width / fontSize);

    for (let i = 0; i < cols; i++) {
      createDrop(i * fontSize + fontSize / 2, p.random(-p.height, 0));
    }
  };

  const createDrop = (x: number, y: number) => {
    const length = Math.floor(p.random(10, 25));
    const dropChars: string[] = [];
    for (let i = 0; i < length; i++) {
      dropChars.push(chars[Math.floor(p.random(chars.length))]);
    }

    drops.push({
      x,
      y,
      speed: p.random(3, 8),
      chars: dropChars,
      length,
      charIndex: 0,
    });
  };

  p.draw = () => {
    p.background(140, 80, 8, 30);

    // Mouse glow effect
    const mouseGlowRadius = 150;

    for (let i = drops.length - 1; i >= 0; i--) {
      const drop = drops[i];

      // Draw the trail of characters
      for (let j = 0; j < drop.length; j++) {
        const charY = drop.y - j * fontSize;

        if (charY < -fontSize || charY > p.height + fontSize) continue;

        // Distance from mouse
        const distToMouse = p.dist(drop.x, charY, p.mouseX, p.mouseY);
        const mouseInfluence = p.constrain(1 - distToMouse / mouseGlowRadius, 0, 1);

        // Fade based on position in trail
        const trailFade = p.map(j, 0, drop.length, 100, 0);

        // Head character is brightest
        if (j === 0) {
          const hue = mouseInfluence > 0.3 ? 60 : 140;
          p.fill(hue, 50, 100);
        } else {
          const hue = 140 + mouseInfluence * 40;
          const brightness = trailFade + mouseInfluence * 30;
          const saturation = 80 - mouseInfluence * 30;
          p.fill(hue, saturation, brightness, trailFade);
        }

        // Randomly change characters
        if (p.random() < 0.02) {
          drop.chars[j] = chars[Math.floor(p.random(chars.length))];
        }

        p.text(drop.chars[j], drop.x, charY);
      }

      // Move drop
      drop.y += drop.speed;

      // Reset drop when it goes off screen
      if (drop.y - drop.length * fontSize > p.height) {
        drop.y = -drop.length * fontSize;
        drop.speed = p.random(3, 8);
      }
    }

    // Add subtle scanlines
    p.stroke(140, 50, 20, 10);
    p.strokeWeight(1);
    for (let y = 0; y < p.height; y += 3) {
      p.line(0, y, p.width, y);
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    initDrops();
  };

  p.mousePressed = () => {
    initDrops();
  };
};

export default asciiRainSketch;
