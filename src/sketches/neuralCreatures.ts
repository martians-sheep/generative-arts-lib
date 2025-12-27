import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

interface Creature {
  pos: p5.Vector;
  vel: p5.Vector;
  angle: number;
  brain: NeuralNetwork;
  fitness: number;
  alive: boolean;
  sensors: number[];
  hue: number;
  trail: p5.Vector[];
}

interface NeuralNetwork {
  inputWeights: number[][];  // 5 inputs -> 4 hidden
  hiddenWeights: number[][]; // 4 hidden -> 2 outputs
  hiddenBias: number[];
  outputBias: number[];
}

interface Obstacle {
  x: number;
  y: number;
  radius: number;
}

const neuralCreaturesSketch: Sketch = (p: p5) => {
  let creatures: Creature[] = [];
  let obstacles: Obstacle[] = [];
  const populationSize = 30;
  const numSensors = 5;
  const sensorRange = 100;
  const creatureRadius = 10;
  let generation = 1;
  let generationTimer = 0;
  const generationDuration = 600; // frames
  let showSensors = true;
  let showBrain = false;
  let bestFitness = 0;
  let target: p5.Vector;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    target = p.createVector(p.width * 0.8, p.height * 0.5);
    initializeWorld();
    initializePopulation();
  };

  const initializeWorld = () => {
    obstacles = [];
    // Create random obstacles
    const numObstacles = Math.floor(Math.min(p.width, p.height) / 100);
    for (let i = 0; i < numObstacles; i++) {
      obstacles.push({
        x: p.random(p.width * 0.2, p.width * 0.7),
        y: p.random(p.height * 0.1, p.height * 0.9),
        radius: p.random(30, 60)
      });
    }
  };

  const createRandomBrain = (): NeuralNetwork => {
    const inputWeights: number[][] = [];
    const hiddenWeights: number[][] = [];
    const hiddenBias: number[] = [];
    const outputBias: number[] = [];

    // Input to hidden (5 inputs -> 4 hidden)
    for (let i = 0; i < 4; i++) {
      inputWeights[i] = [];
      for (let j = 0; j < numSensors; j++) {
        inputWeights[i][j] = p.random(-1, 1);
      }
      hiddenBias[i] = p.random(-1, 1);
    }

    // Hidden to output (4 hidden -> 2 outputs)
    for (let i = 0; i < 2; i++) {
      hiddenWeights[i] = [];
      for (let j = 0; j < 4; j++) {
        hiddenWeights[i][j] = p.random(-1, 1);
      }
      outputBias[i] = p.random(-1, 1);
    }

    return { inputWeights, hiddenWeights, hiddenBias, outputBias };
  };

  const sigmoid = (x: number): number => 1 / (1 + Math.exp(-x));

  const feedForward = (brain: NeuralNetwork, inputs: number[]): number[] => {
    // Hidden layer
    const hidden: number[] = [];
    for (let i = 0; i < 4; i++) {
      let sum = brain.hiddenBias[i];
      for (let j = 0; j < inputs.length; j++) {
        sum += inputs[j] * brain.inputWeights[i][j];
      }
      hidden[i] = Math.tanh(sum);
    }

    // Output layer
    const outputs: number[] = [];
    for (let i = 0; i < 2; i++) {
      let sum = brain.outputBias[i];
      for (let j = 0; j < 4; j++) {
        sum += hidden[j] * brain.hiddenWeights[i][j];
      }
      outputs[i] = Math.tanh(sum);
    }

    return outputs;
  };

  const mutateBrain = (brain: NeuralNetwork, rate: number): NeuralNetwork => {
    const newBrain: NeuralNetwork = {
      inputWeights: brain.inputWeights.map(row =>
        row.map(w => p.random() < rate ? w + p.random(-0.5, 0.5) : w)
      ),
      hiddenWeights: brain.hiddenWeights.map(row =>
        row.map(w => p.random() < rate ? w + p.random(-0.5, 0.5) : w)
      ),
      hiddenBias: brain.hiddenBias.map(b =>
        p.random() < rate ? b + p.random(-0.5, 0.5) : b
      ),
      outputBias: brain.outputBias.map(b =>
        p.random() < rate ? b + p.random(-0.5, 0.5) : b
      )
    };
    return newBrain;
  };

  const createCreature = (brain?: NeuralNetwork): Creature => {
    return {
      pos: p.createVector(p.width * 0.1, p.random(p.height * 0.2, p.height * 0.8)),
      vel: p.createVector(2, 0),
      angle: 0,
      brain: brain || createRandomBrain(),
      fitness: 0,
      alive: true,
      sensors: new Array(numSensors).fill(1),
      hue: p.random(160, 280),
      trail: []
    };
  };

  const initializePopulation = () => {
    creatures = [];
    for (let i = 0; i < populationSize; i++) {
      creatures.push(createCreature());
    }
    generationTimer = 0;
  };

  const sense = (creature: Creature) => {
    const sensorAngles = [-p.PI / 3, -p.PI / 6, 0, p.PI / 6, p.PI / 3];

    for (let i = 0; i < numSensors; i++) {
      const sensorAngle = creature.angle + sensorAngles[i];
      let closest = sensorRange;

      // Check obstacles
      for (const obs of obstacles) {
        const dx = obs.x - creature.pos.x;
        const dy = obs.y - creature.pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Ray-circle intersection (simplified)
        const rayEndX = creature.pos.x + Math.cos(sensorAngle) * sensorRange;
        const rayEndY = creature.pos.y + Math.sin(sensorAngle) * sensorRange;

        // Check if ray passes near obstacle
        const nearestPoint = closestPointOnLine(
          creature.pos.x, creature.pos.y,
          rayEndX, rayEndY,
          obs.x, obs.y
        );

        const distToObs = Math.sqrt(
          (nearestPoint.x - obs.x) ** 2 + (nearestPoint.y - obs.y) ** 2
        );

        if (distToObs < obs.radius) {
          const hitDist = Math.sqrt(
            (nearestPoint.x - creature.pos.x) ** 2 +
            (nearestPoint.y - creature.pos.y) ** 2
          ) - obs.radius;
          closest = Math.min(closest, Math.max(0, hitDist));
        }
      }

      // Check walls
      const rayEndX = creature.pos.x + Math.cos(sensorAngle) * sensorRange;
      const rayEndY = creature.pos.y + Math.sin(sensorAngle) * sensorRange;

      if (rayEndX < 0) closest = Math.min(closest, creature.pos.x / Math.abs(Math.cos(sensorAngle)));
      if (rayEndX > p.width) closest = Math.min(closest, (p.width - creature.pos.x) / Math.abs(Math.cos(sensorAngle)));
      if (rayEndY < 0) closest = Math.min(closest, creature.pos.y / Math.abs(Math.sin(sensorAngle)));
      if (rayEndY > p.height) closest = Math.min(closest, (p.height - creature.pos.y) / Math.abs(Math.sin(sensorAngle)));

      creature.sensors[i] = closest / sensorRange; // Normalize
    }
  };

  const closestPointOnLine = (x1: number, y1: number, x2: number, y2: number, px: number, py: number) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
    return { x: x1 + t * dx, y: y1 + t * dy };
  };

  const updateCreature = (creature: Creature) => {
    if (!creature.alive) return;

    // Sense environment
    sense(creature);

    // Think (neural network)
    const outputs = feedForward(creature.brain, creature.sensors);
    const turnAmount = outputs[0] * 0.1; // Turn
    const speed = p.map(outputs[1], -1, 1, 1, 4); // Speed

    // Update angle and velocity
    creature.angle += turnAmount;
    creature.vel.x = Math.cos(creature.angle) * speed;
    creature.vel.y = Math.sin(creature.angle) * speed;
    creature.pos.add(creature.vel);

    // Add to trail
    creature.trail.push(creature.pos.copy());
    if (creature.trail.length > 50) creature.trail.shift();

    // Check collisions
    // Walls
    if (creature.pos.x < creatureRadius || creature.pos.x > p.width - creatureRadius ||
        creature.pos.y < creatureRadius || creature.pos.y > p.height - creatureRadius) {
      creature.alive = false;
    }

    // Obstacles
    for (const obs of obstacles) {
      const dist = p.dist(creature.pos.x, creature.pos.y, obs.x, obs.y);
      if (dist < obs.radius + creatureRadius) {
        creature.alive = false;
      }
    }

    // Calculate fitness (distance to target + survival time)
    const distToTarget = p.dist(creature.pos.x, creature.pos.y, target.x, target.y);
    creature.fitness = 1000 / (distToTarget + 1) + generationTimer * 0.1;

    // Bonus for reaching target
    if (distToTarget < 30) {
      creature.fitness += 5000;
    }
  };

  const drawCreature = (creature: Creature) => {
    const alpha = creature.alive ? 90 : 30;

    // Draw trail
    p.noFill();
    for (let i = 1; i < creature.trail.length; i++) {
      const trailAlpha = p.map(i, 0, creature.trail.length, 0, alpha * 0.3);
      p.stroke(creature.hue, 60, 80, trailAlpha);
      p.strokeWeight(2);
      p.line(
        creature.trail[i - 1].x, creature.trail[i - 1].y,
        creature.trail[i].x, creature.trail[i].y
      );
    }

    // Draw sensors
    if (showSensors && creature.alive) {
      const sensorAngles = [-p.PI / 3, -p.PI / 6, 0, p.PI / 6, p.PI / 3];
      for (let i = 0; i < numSensors; i++) {
        const sensorAngle = creature.angle + sensorAngles[i];
        const length = creature.sensors[i] * sensorRange;
        const endX = creature.pos.x + Math.cos(sensorAngle) * length;
        const endY = creature.pos.y + Math.sin(sensorAngle) * length;

        // Color based on distance (red = close, green = far)
        const hue = p.map(creature.sensors[i], 0, 1, 0, 120);
        p.stroke(hue, 80, 80, 40);
        p.strokeWeight(1);
        p.line(creature.pos.x, creature.pos.y, endX, endY);
      }
    }

    // Draw body
    p.push();
    p.translate(creature.pos.x, creature.pos.y);
    p.rotate(creature.angle);

    p.noStroke();
    p.fill(creature.hue, 70, creature.alive ? 90 : 40, alpha);

    // Triangle body
    p.triangle(
      creatureRadius, 0,
      -creatureRadius * 0.7, -creatureRadius * 0.6,
      -creatureRadius * 0.7, creatureRadius * 0.6
    );

    // Eye
    p.fill(0, 0, 100, alpha);
    p.circle(creatureRadius * 0.3, 0, 4);

    p.pop();
  };

  const evolvePopulation = () => {
    // Sort by fitness
    creatures.sort((a, b) => b.fitness - a.fitness);

    bestFitness = Math.max(bestFitness, creatures[0].fitness);

    // Select top performers
    const survivors = creatures.slice(0, Math.floor(populationSize * 0.3));

    // Create new population
    const newCreatures: Creature[] = [];

    // Keep best as-is
    newCreatures.push(createCreature(survivors[0].brain));

    // Breed the rest
    while (newCreatures.length < populationSize) {
      const parent = survivors[Math.floor(p.random(survivors.length))];
      const mutationRate = p.random(0.1, 0.3);
      const childBrain = mutateBrain(parent.brain, mutationRate);
      newCreatures.push(createCreature(childBrain));
    }

    creatures = newCreatures;
    generation++;
    generationTimer = 0;
  };

  p.draw = () => {
    p.background(220, 20, 10);

    generationTimer++;

    // Draw target
    p.noStroke();
    for (let i = 3; i > 0; i--) {
      p.fill(120, 80, 80, 20);
      p.circle(target.x, target.y, 60 + i * 20);
    }
    p.fill(120, 90, 90);
    p.circle(target.x, target.y, 30);

    // Draw obstacles
    for (const obs of obstacles) {
      p.fill(0, 0, 25);
      p.noStroke();
      p.circle(obs.x, obs.y, obs.radius * 2);
      p.fill(0, 0, 20);
      p.circle(obs.x, obs.y, obs.radius * 1.8);
    }

    // Update and draw creatures
    let aliveCount = 0;
    for (const creature of creatures) {
      updateCreature(creature);
      if (creature.alive) aliveCount++;
    }
    for (const creature of creatures) {
      drawCreature(creature);
    }

    // Evolve when time's up or all dead
    if (generationTimer >= generationDuration || aliveCount === 0) {
      evolvePopulation();
    }

    // UI
    p.push();
    p.fill(0, 0, 8, 70);
    p.noStroke();
    p.rect(10, 10, 280, 80, 5);

    p.fill(0, 0, 90);
    p.textSize(14);
    p.textAlign(p.LEFT, p.TOP);
    p.noStroke();
    p.text(`Generation: ${generation} | Alive: ${aliveCount}/${populationSize}`, 20, 18);
    p.text(`Best Fitness: ${bestFitness.toFixed(0)}`, 20, 38);
    p.text(`Time: ${generationTimer}/${generationDuration}`, 20, 58);

    p.textSize(11);
    p.fill(0, 0, 70);
    p.textAlign(p.LEFT, p.BOTTOM);
    p.text('S: Toggle sensors | R: Reset | Click: Move target', 15, p.height - 10);
    p.pop();
  };

  p.mousePressed = () => {
    target.x = p.mouseX;
    target.y = p.mouseY;
  };

  p.keyPressed = () => {
    if (p.key === 's' || p.key === 'S') {
      showSensors = !showSensors;
    }
    if (p.key === 'b' || p.key === 'B') {
      showBrain = !showBrain;
    }
    if (p.key === 'r' || p.key === 'R') {
      generation = 1;
      bestFitness = 0;
      initializeWorld();
      initializePopulation();
    }
    if (p.key === 'n' || p.key === 'N') {
      // Skip to next generation
      evolvePopulation();
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    target = p.createVector(p.width * 0.8, p.height * 0.5);
    initializeWorld();
    initializePopulation();
  };
};

export default neuralCreaturesSketch;
