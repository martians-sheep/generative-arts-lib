import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  color: p5.Color;
}

const kineticTypographySketch: Sketch = (p: p5) => {
  let particles: Particle[] = [];
  const text = 'ART';
  const textSize = 200;
  const repelRadius = 150;
  const returnForce = 0.05;
  const friction = 0.9;
  let graphics: p5.Graphics;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);

    createTextParticles();
  };

  const createTextParticles = () => {
    particles = [];

    // Create offscreen graphics for text sampling
    graphics = p.createGraphics(p.width, p.height);
    graphics.background(0);
    graphics.fill(255);
    graphics.textSize(textSize);
    graphics.textAlign(p.CENTER, p.CENTER);
    graphics.textFont('Arial Black');
    graphics.text(text, p.width / 2, p.height / 2);

    graphics.loadPixels();

    // Sample pixels from text
    const density = 4;
    for (let y = 0; y < graphics.height; y += density) {
      for (let x = 0; x < graphics.width; x += density) {
        const idx = (y * graphics.width + x) * 4;
        if (graphics.pixels[idx] > 128) {
          const hue = p.map(x, 0, p.width, 180, 300);
          particles.push({
            x,
            y,
            originX: x,
            originY: y,
            vx: 0,
            vy: 0,
            size: p.random(2, 5),
            color: p.color(hue, 70, 90, 90),
          });
        }
      }
    }
  };

  p.draw = () => {
    p.background(20);

    for (const particle of particles) {
      // Calculate distance to mouse
      const dx = p.mouseX - particle.x;
      const dy = p.mouseY - particle.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Repel from mouse
      if (dist < repelRadius) {
        const force = (repelRadius - dist) / repelRadius;
        const angle = Math.atan2(dy, dx);
        particle.vx -= Math.cos(angle) * force * 10;
        particle.vy -= Math.sin(angle) * force * 10;
      }

      // Return to origin
      const returnDx = particle.originX - particle.x;
      const returnDy = particle.originY - particle.y;
      particle.vx += returnDx * returnForce;
      particle.vy += returnDy * returnForce;

      // Apply friction
      particle.vx *= friction;
      particle.vy *= friction;

      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Draw particle
      p.noStroke();
      p.fill(particle.color);
      p.ellipse(particle.x, particle.y, particle.size);
    }

    // Draw instruction
    p.fill(255, 50);
    p.textSize(14);
    p.textAlign(p.CENTER);
    p.text('Move your mouse over the text', p.width / 2, p.height - 30);
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    createTextParticles();
  };

  p.mousePressed = () => {
    // Explode particles
    for (const particle of particles) {
      particle.vx = p.random(-20, 20);
      particle.vy = p.random(-20, 20);
    }
  };
};

export default kineticTypographySketch;
