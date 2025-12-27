import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

interface Particle {
  pos: p5.Vector;
  vel: p5.Vector;
  acc: p5.Vector;
  lifespan: number;
  maxLife: number;
  size: number;
  hue: number;
  saturation: number;
  type: 'spark' | 'smoke' | 'ember';
}

const particlePaintingSketch: Sketch = (p: p5) => {
  let particles: Particle[] = [];
  let prevMouseX = 0;
  let prevMouseY = 0;
  let currentHue = 0;
  let brushMode: 'fire' | 'smoke' | 'magic' = 'fire';
  let isEmitting = false;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.background(0, 0, 5);
    prevMouseX = p.mouseX;
    prevMouseY = p.mouseY;
  };

  const createParticle = (x: number, y: number, velX: number, velY: number): Particle => {
    let type: 'spark' | 'smoke' | 'ember';
    let hue: number;
    let saturation: number;
    let size: number;
    let maxLife: number;

    switch (brushMode) {
      case 'fire':
        type = p.random() < 0.7 ? 'spark' : 'ember';
        hue = p.random(10, 40); // Orange to yellow
        saturation = type === 'spark' ? 90 : 70;
        size = type === 'spark' ? p.random(2, 6) : p.random(4, 10);
        maxLife = type === 'spark' ? p.random(30, 60) : p.random(60, 120);
        break;
      case 'smoke':
        type = 'smoke';
        hue = 0;
        saturation = 0;
        size = p.random(10, 30);
        maxLife = p.random(80, 150);
        break;
      case 'magic':
        type = p.random() < 0.5 ? 'spark' : 'ember';
        hue = (currentHue + p.random(-30, 30)) % 360;
        saturation = 80;
        size = p.random(3, 8);
        maxLife = p.random(50, 100);
        break;
    }

    return {
      pos: p.createVector(x + p.random(-5, 5), y + p.random(-5, 5)),
      vel: p.createVector(
        velX * 0.3 + p.random(-1, 1),
        velY * 0.3 + p.random(-2, 0)
      ),
      acc: p.createVector(0, 0),
      lifespan: maxLife,
      maxLife: maxLife,
      size: size,
      hue: hue,
      saturation: saturation,
      type: type
    };
  };

  const emitParticles = (x: number, y: number, velX: number, velY: number) => {
    const speed = Math.sqrt(velX * velX + velY * velY);
    const numParticles = Math.floor(p.map(speed, 0, 50, 2, 15));

    for (let i = 0; i < numParticles; i++) {
      particles.push(createParticle(x, y, velX, velY));
    }
  };

  const updateParticle = (particle: Particle): boolean => {
    // Apply forces based on type
    switch (particle.type) {
      case 'spark':
        particle.acc.y = -0.08; // Rise quickly
        particle.acc.x = p.random(-0.1, 0.1);
        particle.vel.mult(0.96);
        break;
      case 'ember':
        particle.acc.y = -0.03; // Rise slowly
        const wobble = p.noise(particle.pos.x * 0.01, particle.pos.y * 0.01, p.frameCount * 0.02);
        particle.acc.x = p.map(wobble, 0, 1, -0.1, 0.1);
        particle.vel.mult(0.98);
        break;
      case 'smoke':
        particle.acc.y = -0.02; // Rise very slowly
        particle.acc.x = p.map(p.noise(particle.pos.y * 0.005, p.frameCount * 0.01), 0, 1, -0.05, 0.05);
        particle.vel.mult(0.99);
        break;
    }

    // Update physics
    particle.vel.add(particle.acc);
    particle.pos.add(particle.vel);
    particle.acc.mult(0);

    // Decrease lifespan
    particle.lifespan--;

    return particle.lifespan > 0;
  };

  const drawParticle = (particle: Particle) => {
    const lifeRatio = particle.lifespan / particle.maxLife;
    let alpha: number;
    let brightness: number;
    let size: number;

    switch (particle.type) {
      case 'spark':
        alpha = lifeRatio * 80;
        brightness = 100;
        size = particle.size * lifeRatio;
        break;
      case 'ember':
        alpha = lifeRatio * 60;
        brightness = p.map(lifeRatio, 0, 1, 40, 100);
        size = particle.size * (0.5 + lifeRatio * 0.5);
        // Shift hue towards red as it cools
        particle.hue = p.lerp(particle.hue, 10, 0.02);
        break;
      case 'smoke':
        alpha = lifeRatio * 25;
        brightness = p.map(lifeRatio, 0, 1, 30, 60);
        size = particle.size * (2 - lifeRatio); // Expands as it rises
        break;
    }

    p.noStroke();

    // Draw glow effect
    if (particle.type === 'spark' || particle.type === 'ember') {
      const glowSize = size * 2.5;
      p.fill(particle.hue, particle.saturation * 0.5, brightness, alpha * 0.3);
      p.circle(particle.pos.x, particle.pos.y, glowSize);
    }

    // Draw particle
    p.fill(particle.hue, particle.saturation, brightness, alpha);
    p.circle(particle.pos.x, particle.pos.y, size);
  };

  p.draw = () => {
    // Subtle fade for trail effect
    p.fill(0, 0, 5, 15);
    p.noStroke();
    p.rect(0, 0, p.width, p.height);

    // Calculate mouse velocity
    const velX = p.mouseX - prevMouseX;
    const velY = p.mouseY - prevMouseY;

    // Emit particles while mouse is pressed
    if (isEmitting) {
      emitParticles(p.mouseX, p.mouseY, velX, velY);
    }

    // Update hue for magic mode
    currentHue = (currentHue + 0.5) % 360;

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const alive = updateParticle(particles[i]);
      if (!alive) {
        particles.splice(i, 1);
      } else {
        drawParticle(particles[i]);
      }
    }

    // Limit particle count for performance
    if (particles.length > 3000) {
      particles.splice(0, particles.length - 3000);
    }

    // Store previous mouse position
    prevMouseX = p.mouseX;
    prevMouseY = p.mouseY;

    // Draw UI
    p.push();
    p.fill(0, 0, 80, 70);
    p.noStroke();
    p.textSize(12);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`Mode: ${brushMode.toUpperCase()} | Particles: ${particles.length}`, 15, 15);
    p.text('Click & Drag to paint | 1-3: Change brush | C: Clear', 15, 32);
    p.pop();
  };

  p.mousePressed = () => {
    isEmitting = true;
    prevMouseX = p.mouseX;
    prevMouseY = p.mouseY;

    // Burst effect on click
    for (let i = 0; i < 20; i++) {
      const angle = p.random(p.TWO_PI);
      const speed = p.random(2, 6);
      particles.push(createParticle(
        p.mouseX,
        p.mouseY,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      ));
    }
  };

  p.mouseReleased = () => {
    isEmitting = false;
  };

  p.mouseDragged = () => {
    const velX = p.mouseX - prevMouseX;
    const velY = p.mouseY - prevMouseY;
    emitParticles(p.mouseX, p.mouseY, velX, velY);
  };

  p.keyPressed = () => {
    if (p.key === '1') {
      brushMode = 'fire';
    } else if (p.key === '2') {
      brushMode = 'smoke';
    } else if (p.key === '3') {
      brushMode = 'magic';
    } else if (p.key === 'c' || p.key === 'C') {
      particles = [];
      p.background(0, 0, 5);
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.background(0, 0, 5);
  };
};

export default particlePaintingSketch;
