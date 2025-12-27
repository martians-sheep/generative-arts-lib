import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

const constellationSketch: Sketch = (p: p5) => {
  const particles: Particle[] = [];
  const numParticles = 120;
  const connectionDistance = 120;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);

    for (let i = 0; i < numParticles; i++) {
      const angle = p.random(p.TWO_PI);
      const speed = p.random(0.3, 1.0);
      particles.push({
        x: p.random(p.width),
        y: p.random(p.height),
        vx: p.cos(angle) * speed,
        vy: p.sin(angle) * speed,
        size: p.random(2, 5),
      });
    }
  };

  p.draw = () => {
    p.background(220, 30, 15);

    const mouseX = p.mouseX;
    const mouseY = p.mouseY;

    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];

      // Mouse interaction - repel particles
      const dx = particle.x - mouseX;
      const dy = particle.y - mouseY;
      const d = p.sqrt(dx * dx + dy * dy);
      if (d < 150 && d > 0) {
        const repelStrength = 0.8;
        particle.x += (dx / d) * repelStrength;
        particle.y += (dy / d) * repelStrength;
      }

      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Bounce off edges
      if (particle.x < 0 || particle.x > p.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > p.height) particle.vy *= -1;

      // Keep in bounds
      particle.x = p.constrain(particle.x, 0, p.width);
      particle.y = p.constrain(particle.y, 0, p.height);

      // Draw connections
      for (let j = i + 1; j < particles.length; j++) {
        const other = particles[j];
        const dist = p.dist(particle.x, particle.y, other.x, other.y);

        if (dist < connectionDistance) {
          const alpha = p.map(dist, 0, connectionDistance, 80, 0);
          p.stroke(200, 60, 90, alpha);
          p.strokeWeight(1);
          p.line(particle.x, particle.y, other.x, other.y);
        }
      }

      // Draw particle
      p.noStroke();
      p.fill(200, 50, 100, 80);
      p.ellipse(particle.x, particle.y, particle.size);
    }

    // Draw connection to mouse
    for (const particle of particles) {
      const dist = p.dist(particle.x, particle.y, mouseX, mouseY);
      if (dist < connectionDistance * 1.5) {
        const alpha = p.map(dist, 0, connectionDistance * 1.5, 60, 0);
        p.stroke(180, 70, 100, alpha);
        p.strokeWeight(0.5);
        p.line(particle.x, particle.y, mouseX, mouseY);
      }
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  p.mousePressed = () => {
    // Reset particles
    for (let i = 0; i < particles.length; i++) {
      const angle = p.random(p.TWO_PI);
      const speed = p.random(0.3, 1.0);
      particles[i].x = p.random(p.width);
      particles[i].y = p.random(p.height);
      particles[i].vx = p.cos(angle) * speed;
      particles[i].vy = p.sin(angle) * speed;
    }
  };
};

export default constellationSketch;
