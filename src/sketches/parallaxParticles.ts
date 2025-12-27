import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

interface Particle {
  x: number;
  y: number;
  z: number; // Depth layer (0-1, where 1 is closest)
  size: number;
  baseX: number;
  baseY: number;
  shape: 'circle' | 'square' | 'ring';
  hue: number;
}

const parallaxParticlesSketch: Sketch = (p: p5) => {
  const particles: Particle[] = [];
  const numParticles = 80;
  const maxOffset = 100;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    initParticles();
  };

  const initParticles = () => {
    particles.length = 0;
    const shapes: ('circle' | 'square' | 'ring')[] = ['circle', 'square', 'ring'];

    for (let i = 0; i < numParticles; i++) {
      const z = p.random(0.1, 1);
      particles.push({
        x: p.random(p.width),
        y: p.random(p.height),
        z,
        size: p.map(z, 0.1, 1, 5, 40),
        baseX: p.random(p.width),
        baseY: p.random(p.height),
        shape: shapes[Math.floor(p.random(shapes.length))],
        hue: p.random(180, 280),
      });
    }

    // Sort by z so distant particles are drawn first
    particles.sort((a, b) => a.z - b.z);
  };

  p.draw = () => {
    p.background(240, 20, 12);

    // Calculate offset based on mouse position
    const centerX = p.width / 2;
    const centerY = p.height / 2;
    const mouseOffsetX = (p.mouseX - centerX) / centerX;
    const mouseOffsetY = (p.mouseY - centerY) / centerY;

    for (const particle of particles) {
      // Parallax effect - deeper particles move less
      const parallaxX = mouseOffsetX * maxOffset * particle.z;
      const parallaxY = mouseOffsetY * maxOffset * particle.z;

      const displayX = particle.baseX - parallaxX;
      const displayY = particle.baseY - parallaxY;

      // Wrap around screen
      const wrappedX = ((displayX % p.width) + p.width) % p.width;
      const wrappedY = ((displayY % p.height) + p.height) % p.height;

      // Opacity based on depth
      const alpha = p.map(particle.z, 0.1, 1, 20, 70);
      const saturation = p.map(particle.z, 0.1, 1, 30, 60);
      const brightness = p.map(particle.z, 0.1, 1, 50, 90);

      p.noStroke();
      p.fill(particle.hue, saturation, brightness, alpha);

      p.push();
      p.translate(wrappedX, wrappedY);

      // Subtle rotation based on time and depth
      const rotation = p.frameCount * 0.01 * particle.z;
      p.rotate(rotation);

      switch (particle.shape) {
        case 'circle':
          p.ellipse(0, 0, particle.size, particle.size);
          break;
        case 'square':
          p.rectMode(p.CENTER);
          p.rect(0, 0, particle.size, particle.size);
          break;
        case 'ring':
          p.noFill();
          p.stroke(particle.hue, saturation, brightness, alpha);
          p.strokeWeight(2);
          p.ellipse(0, 0, particle.size, particle.size);
          break;
      }

      p.pop();
    }

    // Add subtle gradient overlay for depth
    drawDepthGradient();
  };

  const drawDepthGradient = () => {
    p.noStroke();
    // Bottom gradient
    for (let i = 0; i < 100; i++) {
      const y = p.height - i;
      const alpha = p.map(i, 0, 100, 15, 0);
      p.fill(240, 30, 8, alpha);
      p.rect(0, y, p.width, 1);
    }
    // Top gradient
    for (let i = 0; i < 50; i++) {
      const alpha = p.map(i, 0, 50, 10, 0);
      p.fill(260, 30, 5, alpha);
      p.rect(0, i, p.width, 1);
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    initParticles();
  };

  p.mousePressed = () => {
    initParticles();
  };
};

export default parallaxParticlesSketch;
