import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

/**
 * Spirograph / Roulettes
 *
 * Creates beautiful curves by simulating a small circle rolling
 * inside or outside a larger circle (hypotrochoids and epitrochoids).
 *
 * Controls:
 * - Mouse X: Change inner circle radius
 * - Mouse Y: Change pen distance
 * - Click: Toggle inside/outside mode
 * - +/-: Adjust drawing speed
 */
const spirograph: Sketch = (p: p5) => {
  let R = 200; // Fixed circle radius
  let r = 80; // Rolling circle radius
  let d = 100; // Pen distance from center of rolling circle
  let theta = 0;
  let points: { x: number; y: number; hue: number }[] = [];
  let isInside = true; // hypotrochoid (inside) vs epitrochoid (outside)
  let speed = 0.05;
  let maxTheta = 0;
  let isDrawing = true;

  const calculateMaxTheta = () => {
    // Find when the curve closes (LCM of R and r)
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const lcm = (R * r) / gcd(R, r);
    maxTheta = (p.TWO_PI * lcm) / r;
  };

  const resetDrawing = () => {
    points = [];
    theta = 0;
    isDrawing = true;
    calculateMaxTheta();
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    calculateMaxTheta();
  };

  p.draw = () => {
    p.background(15, 20, 15);

    const cx = p.width / 2;
    const cy = p.height / 2;

    // Update parameters based on mouse position
    r = p.map(p.mouseX, 0, p.width, 20, R - 10);
    d = p.map(p.mouseY, 0, p.height, 10, r + 50);

    // Draw fixed circle
    p.noFill();
    p.stroke(0, 0, 40);
    p.strokeWeight(2);
    p.ellipse(cx, cy, R * 2, R * 2);

    // Calculate current position of rolling circle center
    const effectiveR = isInside ? R - r : R + r;
    const rollingCenterX = cx + effectiveR * Math.cos(theta);
    const rollingCenterY = cy + effectiveR * Math.sin(theta);

    // Draw rolling circle
    p.stroke(0, 0, 60);
    p.strokeWeight(1);
    p.ellipse(rollingCenterX, rollingCenterY, r * 2, r * 2);

    // Calculate pen position using roulette equations
    let x, y;
    if (isInside) {
      // Hypotrochoid
      x = cx + (R - r) * Math.cos(theta) + d * Math.cos(((R - r) / r) * theta);
      y = cy + (R - r) * Math.sin(theta) - d * Math.sin(((R - r) / r) * theta);
    } else {
      // Epitrochoid
      x = cx + (R + r) * Math.cos(theta) - d * Math.cos(((R + r) / r) * theta);
      y = cy + (R + r) * Math.sin(theta) - d * Math.sin(((R + r) / r) * theta);
    }

    // Add point to trail
    if (isDrawing) {
      const hue = (theta * 30) % 360;
      points.push({ x, y, hue });

      theta += speed;

      // Check if curve is complete (approximately)
      if (theta > maxTheta * 1.1) {
        isDrawing = false;
      }
    }

    // Draw the curve
    p.strokeWeight(2);
    p.noFill();
    for (let i = 1; i < points.length; i++) {
      const pt1 = points[i - 1];
      const pt2 = points[i];
      p.stroke(pt2.hue, 70, 90, 80);
      p.line(pt1.x, pt1.y, pt2.x, pt2.y);
    }

    // Draw pen position
    p.fill(0, 100, 100);
    p.noStroke();
    p.ellipse(x, y, 8, 8);

    // Draw line from rolling circle center to pen
    p.stroke(0, 0, 80);
    p.strokeWeight(1);
    p.line(rollingCenterX, rollingCenterY, x, y);

    // Instructions
    p.colorMode(p.RGB, 255);
    p.fill(255);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.LEFT, p.BOTTOM);
    const mode = isInside ? 'Hypotrochoid' : 'Epitrochoid';
    const status = isDrawing ? 'Drawing...' : 'Complete';
    p.text(
      `${mode} | R: ${R} r: ${Math.round(r)} d: ${Math.round(d)} | ${status} | Click: toggle mode | Space: reset | +/-: speed`,
      20,
      p.height - 20
    );
    p.colorMode(p.HSB, 360, 100, 100, 100);
  };

  p.mousePressed = () => {
    isInside = !isInside;
    resetDrawing();
  };

  p.keyPressed = () => {
    if (p.key === ' ') {
      resetDrawing();
    } else if (p.key === '+' || p.key === '=') {
      speed = Math.min(0.2, speed + 0.01);
    } else if (p.key === '-' || p.key === '_') {
      speed = Math.max(0.01, speed - 0.01);
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    R = Math.min(p.width, p.height) * 0.3;
    resetDrawing();
  };
};

export default spirograph;
