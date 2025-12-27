import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

interface Vehicle {
  pos: p5.Vector;
  vel: p5.Vector;
  acc: p5.Vector;
  maxSpeed: number;
  maxForce: number;
  size: number;
  hue: number;
  trail: p5.Vector[];
}

interface Target {
  pos: p5.Vector;
  hue: number;
}

const autonomousAgentsSketch: Sketch = (p: p5) => {
  let vehicles: Vehicle[] = [];
  let targets: Target[] = [];
  const numVehicles = 150;
  const numTargets = 3;
  const maxTrailLength = 30;
  let showTrails = true;
  let wanderStrength = 0.5;

  // Helper function: create random 2D unit vector
  const randomVector = () => {
    const angle = p.random(p.TWO_PI);
    return p.createVector(Math.cos(angle), Math.sin(angle));
  };

  // Helper function: subtract vectors
  const vectorSub = (a: p5.Vector, b: p5.Vector) => {
    return p.createVector(a.x - b.x, a.y - b.y);
  };

  // Helper function: add vectors
  const vectorAdd = (a: p5.Vector, b: p5.Vector) => {
    return p.createVector(a.x + b.x, a.y + b.y);
  };

  // Helper function: distance between vectors
  const vectorDist = (a: p5.Vector, b: p5.Vector) => {
    return p.dist(a.x, a.y, b.x, b.y);
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.background(220, 30, 10);

    initializeSystem();
  };

  const initializeSystem = () => {
    vehicles = [];
    targets = [];

    // Create targets
    for (let i = 0; i < numTargets; i++) {
      targets.push({
        pos: p.createVector(
          p.random(p.width * 0.2, p.width * 0.8),
          p.random(p.height * 0.2, p.height * 0.8)
        ),
        hue: (i * 120) % 360
      });
    }

    // Create vehicles
    for (let i = 0; i < numVehicles; i++) {
      const vel = randomVector();
      vel.mult(p.random(1, 3));
      vehicles.push({
        pos: p.createVector(p.random(p.width), p.random(p.height)),
        vel: vel,
        acc: p.createVector(0, 0),
        maxSpeed: p.random(3, 5),
        maxForce: p.random(0.1, 0.3),
        size: p.random(8, 15),
        hue: p.random(160, 220),
        trail: []
      });
    }
  };

  // Steering behaviors
  const seek = (vehicle: Vehicle, target: p5.Vector): p5.Vector => {
    const desired = vectorSub(target, vehicle.pos);
    desired.setMag(vehicle.maxSpeed);
    const steer = vectorSub(desired, vehicle.vel);
    steer.limit(vehicle.maxForce);
    return steer;
  };

  const flee = (vehicle: Vehicle, target: p5.Vector, radius: number): p5.Vector => {
    const distance = vectorDist(vehicle.pos, target);
    if (distance < radius) {
      const desired = vectorSub(vehicle.pos, target);
      desired.setMag(vehicle.maxSpeed);
      const factor = p.map(distance, 0, radius, 2, 0.5);
      desired.mult(factor);
      const steer = vectorSub(desired, vehicle.vel);
      steer.limit(vehicle.maxForce * 2);
      return steer;
    }
    return p.createVector(0, 0);
  };

  const arrive = (vehicle: Vehicle, target: p5.Vector, slowRadius: number): p5.Vector => {
    const desired = vectorSub(target, vehicle.pos);
    const distance = desired.mag();

    let speed = vehicle.maxSpeed;
    if (distance < slowRadius) {
      speed = p.map(distance, 0, slowRadius, 0, vehicle.maxSpeed);
    }

    desired.setMag(speed);
    const steer = vectorSub(desired, vehicle.vel);
    steer.limit(vehicle.maxForce);
    return steer;
  };

  const wander = (vehicle: Vehicle): p5.Vector => {
    const wanderR = 25;
    const wanderD = 80;
    const change = 0.3;

    const wanderTheta = p.random(-change, change);

    const circlePos = vehicle.vel.copy();
    circlePos.setMag(wanderD);
    circlePos.add(vehicle.pos);

    const h = vehicle.vel.heading();
    const circleOffset = p.createVector(
      wanderR * Math.cos(wanderTheta + h),
      wanderR * Math.sin(wanderTheta + h)
    );

    const target = vectorAdd(circlePos, circleOffset);
    return seek(vehicle, target);
  };

  const separate = (vehicle: Vehicle, others: Vehicle[]): p5.Vector => {
    const desiredSeparation = vehicle.size * 2.5;
    const steer = p.createVector(0, 0);
    let count = 0;

    for (const other of others) {
      const d = vectorDist(vehicle.pos, other.pos);
      if (d > 0 && d < desiredSeparation) {
        const diff = vectorSub(vehicle.pos, other.pos);
        diff.normalize();
        diff.div(d);
        steer.add(diff);
        count++;
      }
    }

    if (count > 0) {
      steer.div(count);
      steer.setMag(vehicle.maxSpeed);
      steer.sub(vehicle.vel);
      steer.limit(vehicle.maxForce);
    }

    return steer;
  };

  const updateVehicle = (vehicle: Vehicle) => {
    // Save position for trail
    vehicle.trail.push(vehicle.pos.copy());
    if (vehicle.trail.length > maxTrailLength) {
      vehicle.trail.shift();
    }

    // Find closest target
    let closestTarget: Target | null = null;
    let closestDist = Infinity;
    for (const target of targets) {
      const d = vectorDist(vehicle.pos, target.pos);
      if (d < closestDist) {
        closestDist = d;
        closestTarget = target;
      }
    }

    // Reset acceleration
    vehicle.acc.mult(0);

    // Apply behaviors
    // 1. Flee from mouse
    const fleeForce = flee(vehicle, p.createVector(p.mouseX, p.mouseY), 150);
    fleeForce.mult(2);
    vehicle.acc.add(fleeForce);

    // 2. Seek/Arrive at closest target
    if (closestTarget) {
      const seekForce = arrive(vehicle, closestTarget.pos, 100);
      seekForce.mult(1);
      vehicle.acc.add(seekForce);

      // Update hue based on target
      vehicle.hue = p.lerp(vehicle.hue, closestTarget.hue, 0.02);
    }

    // 3. Wander
    const wanderForce = wander(vehicle);
    wanderForce.mult(wanderStrength);
    vehicle.acc.add(wanderForce);

    // 4. Separate from others
    const sepForce = separate(vehicle, vehicles);
    sepForce.mult(1.5);
    vehicle.acc.add(sepForce);

    // Update velocity and position
    vehicle.vel.add(vehicle.acc);
    vehicle.vel.limit(vehicle.maxSpeed);
    vehicle.pos.add(vehicle.vel);

    // Wrap around edges
    if (vehicle.pos.x < -vehicle.size) vehicle.pos.x = p.width + vehicle.size;
    if (vehicle.pos.x > p.width + vehicle.size) vehicle.pos.x = -vehicle.size;
    if (vehicle.pos.y < -vehicle.size) vehicle.pos.y = p.height + vehicle.size;
    if (vehicle.pos.y > p.height + vehicle.size) vehicle.pos.y = -vehicle.size;
  };

  const drawVehicle = (vehicle: Vehicle) => {
    // Draw trail
    if (showTrails) {
      p.noFill();
      for (let i = 1; i < vehicle.trail.length; i++) {
        const alpha = p.map(i, 0, vehicle.trail.length, 0, 30);
        p.stroke(vehicle.hue, 60, 80, alpha);
        p.strokeWeight(1);
        p.line(
          vehicle.trail[i - 1].x,
          vehicle.trail[i - 1].y,
          vehicle.trail[i].x,
          vehicle.trail[i].y
        );
      }
    }

    // Draw vehicle as triangle pointing in direction of velocity
    p.push();
    p.translate(vehicle.pos.x, vehicle.pos.y);
    p.rotate(vehicle.vel.heading() + p.HALF_PI);

    // Glow effect
    p.noStroke();
    p.fill(vehicle.hue, 60, 80, 20);
    p.triangle(
      0, -vehicle.size * 1.2,
      -vehicle.size * 0.7, vehicle.size * 0.6,
      vehicle.size * 0.7, vehicle.size * 0.6
    );

    // Main body
    p.fill(vehicle.hue, 70, 90, 80);
    p.triangle(
      0, -vehicle.size * 0.8,
      -vehicle.size * 0.4, vehicle.size * 0.4,
      vehicle.size * 0.4, vehicle.size * 0.4
    );

    p.pop();
  };

  const drawTarget = (target: Target) => {
    // Pulsing glow
    const pulse = Math.sin(p.frameCount * 0.05) * 0.3 + 1;
    const size = 20 * pulse;

    // Outer glow
    for (let i = 4; i > 0; i--) {
      const glowSize = size + i * 10;
      const alpha = p.map(i, 4, 0, 5, 25);
      p.noStroke();
      p.fill(target.hue, 80, 100, alpha);
      p.circle(target.pos.x, target.pos.y, glowSize);
    }

    // Core
    p.fill(target.hue, 90, 100, 90);
    p.circle(target.pos.x, target.pos.y, size);
    p.fill(0, 0, 100, 80);
    p.circle(target.pos.x, target.pos.y, size * 0.4);
  };

  p.draw = () => {
    // Semi-transparent background
    p.fill(220, 30, 10, 20);
    p.noStroke();
    p.rect(0, 0, p.width, p.height);

    // Move targets slowly
    for (const target of targets) {
      target.pos.x += p.map(p.noise(target.pos.x * 0.01, p.frameCount * 0.005), 0, 1, -0.5, 0.5);
      target.pos.y += p.map(p.noise(target.pos.y * 0.01, p.frameCount * 0.005 + 100), 0, 1, -0.5, 0.5);
      target.pos.x = p.constrain(target.pos.x, 50, p.width - 50);
      target.pos.y = p.constrain(target.pos.y, 50, p.height - 50);
    }

    // Update and draw vehicles
    for (const vehicle of vehicles) {
      updateVehicle(vehicle);
    }
    for (const vehicle of vehicles) {
      drawVehicle(vehicle);
    }

    // Draw targets
    for (const target of targets) {
      drawTarget(target);
    }

    // Draw mouse repeller indicator
    p.noFill();
    p.stroke(0, 80, 100, 30);
    p.strokeWeight(1);
    p.circle(p.mouseX, p.mouseY, 300);

    // UI
    p.push();
    p.fill(0, 0, 80, 70);
    p.noStroke();
    p.textSize(12);
    p.textAlign(p.LEFT, p.TOP);
    p.text('Move mouse to repel | Click: Add target | R: Reset | T: Toggle trails', 15, 15);
    p.pop();
  };

  p.mousePressed = () => {
    // Add new target at mouse position
    if (targets.length < 6) {
      targets.push({
        pos: p.createVector(p.mouseX, p.mouseY),
        hue: p.random(360)
      });
    } else {
      // Move oldest target to mouse position
      targets.shift();
      targets.push({
        pos: p.createVector(p.mouseX, p.mouseY),
        hue: p.random(360)
      });
    }
  };

  p.keyPressed = () => {
    if (p.key === 'r' || p.key === 'R') {
      p.background(220, 30, 10);
      initializeSystem();
    }
    if (p.key === 't' || p.key === 'T') {
      showTrails = !showTrails;
    }
    if (p.key === 'w' || p.key === 'W') {
      wanderStrength = wanderStrength === 0.5 ? 2 : 0.5;
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.background(220, 30, 10);
    initializeSystem();
  };
};

export default autonomousAgentsSketch;
