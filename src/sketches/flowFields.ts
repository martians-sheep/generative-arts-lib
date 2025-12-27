import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

const flowFieldsSketch: Sketch = (p: p5) => {
  const particles: p5.Vector[] = [];
  const num = 2000;
  const noiseScale = 0.01;
  let time = 0;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.background(20);
    p.colorMode(p.HSB, 360, 100, 100, 100);

    for (let i = 0; i < num; i++) {
      particles.push(p.createVector(p.random(p.width), p.random(p.height)));
    }

    p.stroke(255, 50);
    p.strokeWeight(1);
  };

  p.draw = () => {
    time += 0.002;

    for (let i = 0; i < num; i++) {
      const particle = particles[i];
      const n = p.noise(particle.x * noiseScale, particle.y * noiseScale, time);
      const angle = p.TAU * n * 2;

      particle.x += p.cos(angle) * 1.5;
      particle.y += p.sin(angle) * 1.5;

      if (!onScreen(particle)) {
        particle.x = p.random(p.width);
        particle.y = p.random(p.height);
      }

      const hue = (n * 360 + p.frameCount * 0.1) % 360;
      p.stroke(hue, 70, 90, 15);
      p.point(particle.x, particle.y);
    }
  };

  const onScreen = (v: p5.Vector): boolean => {
    return v.x >= 0 && v.x <= p.width && v.y >= 0 && v.y <= p.height;
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.background(20);
  };

  p.mousePressed = () => {
    p.background(20);
    for (let i = 0; i < num; i++) {
      particles[i].x = p.random(p.width);
      particles[i].y = p.random(p.height);
    }
  };
};

export default flowFieldsSketch;
