import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

interface Boid {
  pos: p5.Vector;
  vel: p5.Vector;
  acc: p5.Vector;
  maxSpeed: number;
  maxForce: number;
  hue: number;
}

const flockingSketch: Sketch = (p: p5) => {
  let boids: Boid[] = [];
  const numBoids = 200;
  let showMesh = true;
  let connectionDistance = 50;

  // Flocking parameters
  let alignWeight = 1.0;
  let cohesionWeight = 1.0;
  let separationWeight = 1.5;

  const perceptionRadius = 50;
  const separationRadius = 25;

  // Helper functions
  const randomVector = () => {
    const angle = p.random(p.TWO_PI);
    return p.createVector(Math.cos(angle), Math.sin(angle));
  };

  const vectorSub = (a: p5.Vector, b: p5.Vector) => {
    return p.createVector(a.x - b.x, a.y - b.y);
  };

  const vectorDist = (a: p5.Vector, b: p5.Vector) => {
    return p.dist(a.x, a.y, b.x, b.y);
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.background(210, 40, 12);

    initializeBoids();
  };

  const initializeBoids = () => {
    boids = [];
    for (let i = 0; i < numBoids; i++) {
      const vel = randomVector();
      vel.mult(p.random(2, 4));
      boids.push({
        pos: p.createVector(p.random(p.width), p.random(p.height)),
        vel: vel,
        acc: p.createVector(0, 0),
        maxSpeed: p.random(3, 5),
        maxForce: 0.2,
        hue: p.random(180, 240)
      });
    }
  };

  // Alignment: steer towards average heading of local flockmates
  const align = (boid: Boid): p5.Vector => {
    const steering = p.createVector(0, 0);
    let total = 0;

    for (const other of boids) {
      const d = vectorDist(boid.pos, other.pos);
      if (other !== boid && d < perceptionRadius) {
        steering.add(other.vel);
        total++;
      }
    }

    if (total > 0) {
      steering.div(total);
      steering.setMag(boid.maxSpeed);
      steering.sub(boid.vel);
      steering.limit(boid.maxForce);
    }

    return steering;
  };

  // Cohesion: steer towards center of mass of local flockmates
  const cohesion = (boid: Boid): p5.Vector => {
    const steering = p.createVector(0, 0);
    let total = 0;

    for (const other of boids) {
      const d = vectorDist(boid.pos, other.pos);
      if (other !== boid && d < perceptionRadius) {
        steering.add(other.pos);
        total++;
      }
    }

    if (total > 0) {
      steering.div(total);
      steering.sub(boid.pos);
      steering.setMag(boid.maxSpeed);
      steering.sub(boid.vel);
      steering.limit(boid.maxForce);
    }

    return steering;
  };

  // Separation: steer to avoid crowding local flockmates
  const separation = (boid: Boid): p5.Vector => {
    const steering = p.createVector(0, 0);
    let total = 0;

    for (const other of boids) {
      const d = vectorDist(boid.pos, other.pos);
      if (other !== boid && d < separationRadius) {
        const diff = vectorSub(boid.pos, other.pos);
        diff.div(d * d); // Weight by distance squared
        steering.add(diff);
        total++;
      }
    }

    if (total > 0) {
      steering.div(total);
      steering.setMag(boid.maxSpeed);
      steering.sub(boid.vel);
      steering.limit(boid.maxForce);
    }

    return steering;
  };

  // Flee from mouse
  const flee = (boid: Boid): p5.Vector => {
    const mouse = p.createVector(p.mouseX, p.mouseY);
    const d = vectorDist(boid.pos, mouse);
    const fleeRadius = 100;

    if (d < fleeRadius) {
      const desired = vectorSub(boid.pos, mouse);
      const strength = p.map(d, 0, fleeRadius, boid.maxSpeed * 2, 0);
      desired.setMag(strength);
      const steer = vectorSub(desired, boid.vel);
      steer.limit(boid.maxForce * 3);
      return steer;
    }

    return p.createVector(0, 0);
  };

  const updateBoid = (boid: Boid) => {
    // Reset acceleration
    boid.acc.mult(0);

    // Apply flocking behaviors
    const alignForce = align(boid);
    const cohesionForce = cohesion(boid);
    const separationForce = separation(boid);
    const fleeForce = flee(boid);

    alignForce.mult(alignWeight);
    cohesionForce.mult(cohesionWeight);
    separationForce.mult(separationWeight);

    boid.acc.add(alignForce);
    boid.acc.add(cohesionForce);
    boid.acc.add(separationForce);
    boid.acc.add(fleeForce);

    // Update velocity and position
    boid.vel.add(boid.acc);
    boid.vel.limit(boid.maxSpeed);
    boid.pos.add(boid.vel);

    // Wrap around edges
    if (boid.pos.x < 0) boid.pos.x = p.width;
    if (boid.pos.x > p.width) boid.pos.x = 0;
    if (boid.pos.y < 0) boid.pos.y = p.height;
    if (boid.pos.y > p.height) boid.pos.y = 0;

    // Adjust hue based on neighbors
    let neighborHue = 0;
    let neighborCount = 0;
    for (const other of boids) {
      const d = vectorDist(boid.pos, other.pos);
      if (other !== boid && d < perceptionRadius) {
        neighborHue += other.hue;
        neighborCount++;
      }
    }
    if (neighborCount > 0) {
      const avgHue = neighborHue / neighborCount;
      boid.hue = p.lerp(boid.hue, avgHue, 0.01);
    }
  };

  const drawBoid = (boid: Boid) => {
    p.push();
    p.translate(boid.pos.x, boid.pos.y);
    p.rotate(boid.vel.heading() + p.HALF_PI);

    // Draw boid as triangle
    p.noStroke();
    p.fill(boid.hue, 70, 90, 90);
    p.triangle(0, -8, -4, 6, 4, 6);

    p.pop();
  };

  const drawConnections = () => {
    for (let i = 0; i < boids.length; i++) {
      for (let j = i + 1; j < boids.length; j++) {
        const d = vectorDist(boids[i].pos, boids[j].pos);
        if (d < connectionDistance) {
          const alpha = p.map(d, 0, connectionDistance, 40, 0);
          p.stroke((boids[i].hue + boids[j].hue) / 2, 50, 80, alpha);
          p.strokeWeight(0.5);
          p.line(boids[i].pos.x, boids[i].pos.y, boids[j].pos.x, boids[j].pos.y);
        }
      }
    }
  };

  p.draw = () => {
    // Semi-transparent background for trail effect
    p.fill(210, 40, 12, 40);
    p.noStroke();
    p.rect(0, 0, p.width, p.height);

    // Draw connections first (behind boids)
    if (showMesh) {
      drawConnections();
    }

    // Update and draw all boids
    for (const boid of boids) {
      updateBoid(boid);
      drawBoid(boid);
    }

    // Draw mouse repel indicator
    p.noFill();
    p.stroke(0, 80, 100, 20);
    p.strokeWeight(1);
    p.circle(p.mouseX, p.mouseY, 200);

    // UI
    p.push();
    p.fill(0, 0, 80, 70);
    p.noStroke();
    p.textSize(12);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`Boids: ${boids.length} | M: Toggle mesh | R: Reset | +/-: Connection distance`, 15, 15);
    p.text(`Align: ${alignWeight.toFixed(1)} | Cohesion: ${cohesionWeight.toFixed(1)} | Separation: ${separationWeight.toFixed(1)}`, 15, 32);
    p.pop();
  };

  p.mousePressed = () => {
    // Add boids at mouse position
    for (let i = 0; i < 10; i++) {
      const vel = randomVector();
      vel.mult(p.random(2, 4));
      boids.push({
        pos: p.createVector(p.mouseX + p.random(-20, 20), p.mouseY + p.random(-20, 20)),
        vel: vel,
        acc: p.createVector(0, 0),
        maxSpeed: p.random(3, 5),
        maxForce: 0.2,
        hue: p.random(180, 240)
      });
    }

    // Limit total boids
    if (boids.length > 500) {
      boids.splice(0, boids.length - 500);
    }
  };

  p.keyPressed = () => {
    if (p.key === 'm' || p.key === 'M') {
      showMesh = !showMesh;
    }
    if (p.key === 'r' || p.key === 'R') {
      p.background(210, 40, 12);
      initializeBoids();
    }
    if (p.key === '=' || p.key === '+') {
      connectionDistance = Math.min(connectionDistance + 10, 150);
    }
    if (p.key === '-' || p.key === '_') {
      connectionDistance = Math.max(connectionDistance - 10, 20);
    }
    // Adjust weights
    if (p.key === '1') {
      alignWeight = alignWeight === 1.0 ? 2.0 : 1.0;
    }
    if (p.key === '2') {
      cohesionWeight = cohesionWeight === 1.0 ? 2.0 : 1.0;
    }
    if (p.key === '3') {
      separationWeight = separationWeight === 1.5 ? 3.0 : 1.5;
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.background(210, 40, 12);
  };
};

export default flockingSketch;
