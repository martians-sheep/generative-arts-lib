import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

interface Pendulum {
  r1: number; // Length of first arm
  r2: number; // Length of second arm
  m1: number; // Mass of first bob
  m2: number; // Mass of second bob
  a1: number; // Angle of first arm
  a2: number; // Angle of second arm
  a1_v: number; // Angular velocity of first arm
  a2_v: number; // Angular velocity of second arm
  trail: { x: number; y: number }[];
  hue: number;
  originX: number;
  originY: number;
}

const doublePendulumSketch: Sketch = (p: p5) => {
  let pendulums: Pendulum[] = [];
  const numPendulums = 5;
  const g = 1; // Gravity
  const maxTrailLength = 500;
  let showArms = true;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.background(0, 0, 8);

    initializePendulums();
  };

  const initializePendulums = () => {
    pendulums = [];
    const baseLength = Math.min(p.width, p.height) * 0.15;

    for (let i = 0; i < numPendulums; i++) {
      // Slight variations in initial angle create vastly different trajectories
      const angleOffset = i * 0.001;
      pendulums.push({
        r1: baseLength + p.random(-10, 10),
        r2: baseLength + p.random(-10, 10),
        m1: 10,
        m2: 10,
        a1: p.PI / 2 + angleOffset,
        a2: p.PI / 2 + angleOffset * 2,
        a1_v: 0,
        a2_v: 0,
        trail: [],
        hue: (i * 360 / numPendulums) % 360,
        originX: p.width / 2,
        originY: p.height * 0.35
      });
    }
  };

  const updatePendulum = (pend: Pendulum) => {
    const { r1, r2, m1, m2, a1, a2 } = pend;

    // Calculate angular accelerations using Lagrangian mechanics
    const num1 = -g * (2 * m1 + m2) * Math.sin(a1);
    const num2 = -m2 * g * Math.sin(a1 - 2 * a2);
    const num3 = -2 * Math.sin(a1 - a2) * m2;
    const num4 = pend.a2_v * pend.a2_v * r2 + pend.a1_v * pend.a1_v * r1 * Math.cos(a1 - a2);
    const den = r1 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2));

    const a1_a = (num1 + num2 + num3 * num4) / den;

    const num5 = 2 * Math.sin(a1 - a2);
    const num6 = pend.a1_v * pend.a1_v * r1 * (m1 + m2);
    const num7 = g * (m1 + m2) * Math.cos(a1);
    const num8 = pend.a2_v * pend.a2_v * r2 * m2 * Math.cos(a1 - a2);
    const den2 = r2 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2));

    const a2_a = (num5 * (num6 + num7 + num8)) / den2;

    // Update velocities with damping
    pend.a1_v += a1_a;
    pend.a2_v += a2_a;
    pend.a1_v *= 0.9999; // Very slight damping
    pend.a2_v *= 0.9999;

    // Update angles
    pend.a1 += pend.a1_v;
    pend.a2 += pend.a2_v;

    // Calculate end point position
    const x2 = pend.originX + r1 * Math.sin(pend.a1) + r2 * Math.sin(pend.a2);
    const y2 = pend.originY + r1 * Math.cos(pend.a1) + r2 * Math.cos(pend.a2);

    // Add to trail
    pend.trail.push({ x: x2, y: y2 });
    if (pend.trail.length > maxTrailLength) {
      pend.trail.shift();
    }
  };

  const drawPendulum = (pend: Pendulum) => {
    const { r1, r2, originX, originY } = pend;

    // Calculate bob positions
    const x1 = originX + r1 * Math.sin(pend.a1);
    const y1 = originY + r1 * Math.cos(pend.a1);
    const x2 = x1 + r2 * Math.sin(pend.a2);
    const y2 = y1 + r2 * Math.cos(pend.a2);

    // Draw trail
    p.noFill();
    for (let i = 1; i < pend.trail.length; i++) {
      const alpha = p.map(i, 0, pend.trail.length, 0, 60);
      const weight = p.map(i, 0, pend.trail.length, 0.5, 3);
      const hueShift = p.map(i, 0, pend.trail.length, 0, 60);

      p.stroke((pend.hue + hueShift) % 360, 80, 90, alpha);
      p.strokeWeight(weight);
      p.line(pend.trail[i - 1].x, pend.trail[i - 1].y, pend.trail[i].x, pend.trail[i].y);
    }

    // Draw arms and bobs
    if (showArms) {
      // Arm 1
      p.stroke(0, 0, 60, 60);
      p.strokeWeight(2);
      p.line(originX, originY, x1, y1);

      // Arm 2
      p.stroke(0, 0, 60, 60);
      p.line(x1, y1, x2, y2);

      // Bob 1
      p.noStroke();
      p.fill(pend.hue, 60, 80, 80);
      p.circle(x1, y1, 15);

      // Bob 2 (paint brush)
      p.fill(pend.hue, 80, 100, 90);
      p.circle(x2, y2, 12);

      // Origin pivot
      p.fill(0, 0, 80, 60);
      p.circle(originX, originY, 8);
    }
  };

  p.draw = () => {
    // Semi-transparent background for trail persistence
    p.fill(0, 0, 8, 8);
    p.noStroke();
    p.rect(0, 0, p.width, p.height);

    // Update and draw each pendulum
    for (const pend of pendulums) {
      updatePendulum(pend);
      drawPendulum(pend);
    }

    // Draw legend
    p.push();
    p.fill(0, 0, 80, 60);
    p.noStroke();
    p.textSize(12);
    p.textAlign(p.LEFT, p.TOP);
    p.text('Click: Reset | Space: Toggle arms | R: Randomize', 15, 15);
    p.pop();
  };

  p.mousePressed = () => {
    // Reset with new random initial conditions
    p.background(0, 0, 8);
    initializePendulums();
  };

  p.keyPressed = () => {
    if (p.key === ' ') {
      showArms = !showArms;
    }
    if (p.key === 'r' || p.key === 'R') {
      p.background(0, 0, 8);
      pendulums = [];
      const baseLength = Math.min(p.width, p.height) * 0.15;

      for (let i = 0; i < numPendulums; i++) {
        pendulums.push({
          r1: baseLength + p.random(-20, 20),
          r2: baseLength + p.random(-20, 20),
          m1: p.random(5, 15),
          m2: p.random(5, 15),
          a1: p.random(p.PI * 0.3, p.PI * 0.7),
          a2: p.random(p.PI * 0.3, p.PI * 0.7),
          a1_v: p.random(-0.05, 0.05),
          a2_v: p.random(-0.05, 0.05),
          trail: [],
          hue: (i * 360 / numPendulums) % 360,
          originX: p.width / 2,
          originY: p.height * 0.35
        });
      }
    }
    if (p.key === 'c' || p.key === 'C') {
      p.background(0, 0, 8);
      for (const pend of pendulums) {
        pend.trail = [];
      }
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.background(0, 0, 8);
    initializePendulums();
  };
};

export default doublePendulumSketch;
