import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

const strangeAttractorsSketch: Sketch = (p: p5) => {
  let x = 0.01;
  let y = 0;
  let z = 0;

  const points: { x: number; y: number; z: number }[] = [];
  const maxPoints = 10000;

  // Lorenz parameters
  const sigma = 10;
  const rho = 28;
  const beta = 8 / 3;
  const dt = 0.01;

  let rotationX = 0;
  let rotationY = 0;
  let zoom = 5;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
    p.colorMode(p.HSB, 360, 100, 100, 100);
  };

  p.draw = () => {
    p.background(10);

    // Calculate new points
    for (let i = 0; i < 10; i++) {
      const dx = sigma * (y - x) * dt;
      const dy = (x * (rho - z) - y) * dt;
      const dz = (x * y - beta * z) * dt;

      x += dx;
      y += dy;
      z += dz;

      points.push({ x, y, z });

      if (points.length > maxPoints) {
        points.shift();
      }
    }

    // Camera controls
    rotationY += 0.003;

    p.scale(zoom);
    p.rotateX(rotationX);
    p.rotateY(rotationY);
    p.translate(0, 0, -25);

    // Draw the attractor
    p.strokeWeight(1);
    p.noFill();

    p.beginShape();
    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      const hue = (i / points.length) * 360;
      const alpha = p.map(i, 0, points.length, 20, 100);
      p.stroke(hue, 80, 90, alpha);
      p.vertex(pt.x, pt.y, pt.z);
    }
    p.endShape();

    // Draw current point
    if (points.length > 0) {
      const lastPt = points[points.length - 1];
      p.push();
      p.translate(lastPt.x, lastPt.y, lastPt.z);
      p.noStroke();
      p.fill(0, 0, 100);
      p.sphere(0.5);
      p.pop();
    }
  };

  p.mouseDragged = () => {
    rotationY += (p.mouseX - p.pmouseX) * 0.01;
    rotationX += (p.mouseY - p.pmouseY) * 0.01;
  };

  p.mouseWheel = (event: WheelEvent) => {
    zoom -= event.deltaY * 0.005;
    zoom = p.constrain(zoom, 2, 15);
    return false;
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  p.mousePressed = () => {
    // Reset with slightly different initial conditions
    x = p.random(-0.1, 0.1);
    y = p.random(-0.1, 0.1);
    z = p.random(-0.1, 0.1);
    points.length = 0;
  };
};

export default strangeAttractorsSketch;
