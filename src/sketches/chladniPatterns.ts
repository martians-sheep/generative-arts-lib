import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

/**
 * Chladni Patterns
 * Simulates the geometric patterns formed by vibrating plates
 * Based on the wave equation: Z = sin(n*π*x/L) * sin(m*π*y/L)
 * Points where Z = 0 form the nodal lines
 */
const chladniPatternsSketch: Sketch = (p: p5) => {
  let n = 3; // Mode number for x
  let m = 4; // Mode number for y
  let phase = 0;
  let animating = true;

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
  }

  let particles: Particle[] = [];
  const numParticles = 3000;
  let showParticles = true;
  let showField = true;

  // Chladni function: vibration amplitude at (x, y)
  const chladni = (x: number, y: number, n: number, m: number, phase: number): number => {
    // Normalize coordinates to [0, 1]
    const nx = x / p.width;
    const ny = y / p.height;

    // Two superposed modes create interesting patterns
    const mode1 = Math.sin(n * Math.PI * nx) * Math.sin(m * Math.PI * ny);
    const mode2 = Math.sin(m * Math.PI * nx) * Math.sin(n * Math.PI * ny);

    // Combine with phase
    return mode1 * Math.cos(phase) + mode2 * Math.sin(phase);
  };

  // Gradient of Chladni function (direction of steepest descent)
  const chladniGradient = (x: number, y: number, n: number, m: number, phase: number) => {
    const eps = 2;
    const z = chladni(x, y, n, m, phase);
    const zx = chladni(x + eps, y, n, m, phase);
    const zy = chladni(x, y + eps, n, m, phase);

    return {
      dx: (zx - z) / eps,
      dy: (zy - z) / eps,
      z: z
    };
  };

  const initParticles = () => {
    particles = [];
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: p.random(p.width),
        y: p.random(p.height),
        vx: 0,
        vy: 0,
      });
    }
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    initParticles();
  };

  p.draw = () => {
    // Semi-transparent background for trails
    p.background(15, 30, 10, showParticles ? 10 : 100);

    if (animating) {
      phase += 0.02;
    }

    // Interactive mode control
    n = Math.floor(p.map(p.mouseX, 0, p.width, 1, 8));
    m = Math.floor(p.map(p.mouseY, 0, p.height, 1, 8));

    // Draw the field visualization
    if (showField) {
      drawField();
    }

    // Update and draw particles
    if (showParticles) {
      updateParticles();
      drawParticles();
    }

    // Draw nodal lines (where Z ≈ 0)
    drawNodalLines();

    // UI
    p.fill(0, 0, 100);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`Mode: n=${n}, m=${m}`, 20, 20);
    p.text('Move mouse to change vibration modes', 20, 40);
    p.text('F: Toggle field | P: Toggle particles | Space: Pause | Click: Reset particles', 20, 60);
  };

  const drawField = () => {
    const step = 8;
    p.noStroke();

    for (let x = 0; x < p.width; x += step) {
      for (let y = 0; y < p.height; y += step) {
        const z = chladni(x, y, n, m, phase);

        // Color based on amplitude
        const hue = z > 0 ? 200 : 20; // Blue for positive, orange for negative
        const brightness = Math.abs(z) * 60 + 20;
        const alpha = Math.abs(z) * 40 + 10;

        p.fill(hue, 70, brightness, alpha);
        p.rect(x, y, step, step);
      }
    }
  };

  const drawNodalLines = () => {
    // Draw lines where the amplitude is close to zero
    p.stroke(60, 100, 100, 80);
    p.strokeWeight(2);

    const step = 4;
    for (let x = 0; x < p.width - step; x += step) {
      for (let y = 0; y < p.height - step; y += step) {
        const z1 = chladni(x, y, n, m, phase);
        const z2 = chladni(x + step, y, n, m, phase);
        const z3 = chladni(x, y + step, n, m, phase);

        // Check for sign changes (zero crossing)
        if ((z1 > 0 && z2 < 0) || (z1 < 0 && z2 > 0)) {
          const t = Math.abs(z1) / (Math.abs(z1) + Math.abs(z2));
          p.point(x + t * step, y);
        }
        if ((z1 > 0 && z3 < 0) || (z1 < 0 && z3 > 0)) {
          const t = Math.abs(z1) / (Math.abs(z1) + Math.abs(z3));
          p.point(x, y + t * step);
        }
      }
    }
  };

  const updateParticles = () => {
    for (const particle of particles) {
      const grad = chladniGradient(particle.x, particle.y, n, m, phase);

      // Move toward zero (nodal lines)
      // Particles are pushed where |Z| is smaller
      const force = -grad.z * 0.5;
      particle.vx += grad.dx * force;
      particle.vy += grad.dy * force;

      // Add slight random motion
      particle.vx += p.random(-0.1, 0.1);
      particle.vy += p.random(-0.1, 0.1);

      // Damping
      particle.vx *= 0.95;
      particle.vy *= 0.95;

      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Wrap around edges
      if (particle.x < 0) particle.x += p.width;
      if (particle.x > p.width) particle.x -= p.width;
      if (particle.y < 0) particle.y += p.height;
      if (particle.y > p.height) particle.y -= p.height;
    }
  };

  const drawParticles = () => {
    p.noStroke();

    for (const particle of particles) {
      const z = chladni(particle.x, particle.y, n, m, phase);
      // Particles near nodal lines are brighter
      const brightness = p.map(Math.abs(z), 0, 1, 100, 30);
      const hue = (60 + Math.abs(z) * 100) % 360;

      p.fill(hue, 60, brightness, 80);
      p.ellipse(particle.x, particle.y, 3);
    }
  };

  p.keyPressed = () => {
    if (p.key === ' ') {
      animating = !animating;
    } else if (p.key === 'f' || p.key === 'F') {
      showField = !showField;
    } else if (p.key === 'p' || p.key === 'P') {
      showParticles = !showParticles;
    }
  };

  p.mousePressed = () => {
    initParticles();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    initParticles();
  };
};

export default chladniPatternsSketch;
