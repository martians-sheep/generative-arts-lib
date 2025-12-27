import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

interface Particle {
  pos: p5.Vector;
  vel: p5.Vector;
  acc: p5.Vector;
  trail: p5.Vector[];
  hue: number;
  mass: number;
}

interface Attractor {
  pos: p5.Vector;
  mass: number;
}

const gravitationalAttractorSketch: Sketch = (p: p5) => {
  let particles: Particle[] = [];
  let attractors: Attractor[] = [];
  const numParticles = 200;
  const numAttractors = 3;
  const G = 1; // Gravitational constant
  const maxTrailLength = 100;
  let time = 0;

  // Helper function: subtract vectors
  const vectorSub = (a: p5.Vector, b: p5.Vector) => {
    return p.createVector(a.x - b.x, a.y - b.y);
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.background(240, 20, 8);

    initializeSystem();
  };

  const initializeSystem = () => {
    particles = [];
    attractors = [];

    // Create attractors at strategic positions
    const centerX = p.width / 2;
    const centerY = p.height / 2;
    const radius = Math.min(p.width, p.height) * 0.25;

    for (let i = 0; i < numAttractors; i++) {
      const angle = (p.TWO_PI / numAttractors) * i + p.random(-0.3, 0.3);
      attractors.push({
        pos: p.createVector(
          centerX + Math.cos(angle) * radius,
          centerY + Math.sin(angle) * radius
        ),
        mass: p.random(800, 1500)
      });
    }

    // Create particles in orbital ring
    for (let i = 0; i < numParticles; i++) {
      const angle = p.random(p.TWO_PI);
      const dist = p.random(radius * 0.5, radius * 2);
      const x = centerX + Math.cos(angle) * dist;
      const y = centerY + Math.sin(angle) * dist;

      // Give particles initial velocity perpendicular to center
      const speed = p.random(1, 3);
      const velAngle = angle + p.HALF_PI + p.random(-0.3, 0.3);

      particles.push({
        pos: p.createVector(x, y),
        vel: p.createVector(Math.cos(velAngle) * speed, Math.sin(velAngle) * speed),
        acc: p.createVector(0, 0),
        trail: [],
        hue: p.map(i, 0, numParticles, 180, 300),
        mass: p.random(1, 3)
      });
    }
  };

  const applyGravity = (particle: Particle) => {
    particle.acc.set(0, 0);

    for (const attractor of attractors) {
      const force = vectorSub(attractor.pos, particle.pos);
      let distance = force.mag();
      distance = p.constrain(distance, 20, 500); // Prevent extreme forces

      const strength = (G * attractor.mass * particle.mass) / (distance * distance);
      force.setMag(strength);
      particle.acc.add(force);
    }
  };

  const updateParticle = (particle: Particle) => {
    // Apply gravity
    applyGravity(particle);

    // Update velocity and position
    particle.vel.add(particle.acc);
    particle.vel.limit(10); // Speed limit
    particle.pos.add(particle.vel);

    // Add current position to trail
    particle.trail.push(particle.pos.copy());
    if (particle.trail.length > maxTrailLength) {
      particle.trail.shift();
    }

    // Wrap around edges
    if (particle.pos.x < 0) particle.pos.x = p.width;
    if (particle.pos.x > p.width) particle.pos.x = 0;
    if (particle.pos.y < 0) particle.pos.y = p.height;
    if (particle.pos.y > p.height) particle.pos.y = 0;
  };

  const drawParticle = (particle: Particle) => {
    // Draw trail
    p.noFill();
    for (let i = 1; i < particle.trail.length; i++) {
      const alpha = p.map(i, 0, particle.trail.length, 0, 50);
      const weight = p.map(i, 0, particle.trail.length, 0.5, 2);

      // Check if points wrap around (don't draw line across screen)
      const prev = particle.trail[i - 1];
      const curr = particle.trail[i];
      if (Math.abs(curr.x - prev.x) < p.width / 2 && Math.abs(curr.y - prev.y) < p.height / 2) {
        p.stroke(particle.hue, 70, 90, alpha);
        p.strokeWeight(weight);
        p.line(prev.x, prev.y, curr.x, curr.y);
      }
    }

    // Draw particle
    p.noStroke();
    p.fill(particle.hue, 80, 100, 80);
    p.circle(particle.pos.x, particle.pos.y, 3);
  };

  const drawAttractor = (attractor: Attractor, index: number) => {
    // Pulsing glow effect
    const pulse = Math.sin(time * 0.02 + index) * 0.2 + 1;
    const size = p.map(attractor.mass, 800, 1500, 15, 30) * pulse;

    // Outer glow
    for (let i = 5; i > 0; i--) {
      const glowSize = size + i * 8;
      const alpha = p.map(i, 5, 0, 5, 20);
      p.noStroke();
      p.fill(40, 80, 100, alpha);
      p.circle(attractor.pos.x, attractor.pos.y, glowSize);
    }

    // Core
    p.fill(40, 90, 100, 90);
    p.circle(attractor.pos.x, attractor.pos.y, size);
    p.fill(60, 30, 100, 80);
    p.circle(attractor.pos.x, attractor.pos.y, size * 0.5);
  };

  p.draw = () => {
    // Semi-transparent background for trail effect
    p.fill(240, 20, 8, 10);
    p.noStroke();
    p.rect(0, 0, p.width, p.height);

    time++;

    // Slowly move attractors for dynamic patterns
    for (let i = 0; i < attractors.length; i++) {
      const attractor = attractors[i];
      const angle = time * 0.001 + (p.TWO_PI / numAttractors) * i;
      const radius = Math.min(p.width, p.height) * 0.2;
      const targetX = p.width / 2 + Math.cos(angle) * radius;
      const targetY = p.height / 2 + Math.sin(angle) * radius;
      attractor.pos.x = p.lerp(attractor.pos.x, targetX, 0.01);
      attractor.pos.y = p.lerp(attractor.pos.y, targetY, 0.01);
    }

    // Update and draw particles
    for (const particle of particles) {
      updateParticle(particle);
      drawParticle(particle);
    }

    // Draw attractors on top
    for (let i = 0; i < attractors.length; i++) {
      drawAttractor(attractors[i], i);
    }
  };

  p.mousePressed = () => {
    // Add new attractor at mouse position
    if (attractors.length < 6) {
      attractors.push({
        pos: p.createVector(p.mouseX, p.mouseY),
        mass: p.random(800, 1500)
      });
    } else {
      // Reset system if too many attractors
      initializeSystem();
    }
  };

  p.keyPressed = () => {
    if (p.key === 'r' || p.key === 'R') {
      p.background(240, 20, 8);
      initializeSystem();
    }
    if (p.key === 'c' || p.key === 'C') {
      // Clear trails
      for (const particle of particles) {
        particle.trail = [];
      }
      p.background(240, 20, 8);
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.background(240, 20, 8);
    initializeSystem();
  };
};

export default gravitationalAttractorSketch;
