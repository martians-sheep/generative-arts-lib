import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

interface Agent {
  x: number;
  y: number;
  angle: number;
}

const physarumSketch: Sketch = (p: p5) => {
  let agents: Agent[] = [];
  const numAgents = 5000;
  const sensorAngle = p.PI / 4;
  const sensorDistance = 9;
  const rotationAngle = p.PI / 4;
  const stepSize = 1;
  const depositAmount = 255;
  const decayFactor = 0.95;

  let trailMap: number[];
  let pixelWidth: number;
  let pixelHeight: number;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.pixelDensity(1);
    pixelWidth = p.width;
    pixelHeight = p.height;

    trailMap = new Array(pixelWidth * pixelHeight).fill(0);

    for (let i = 0; i < numAgents; i++) {
      const angle = p.random(p.TWO_PI);
      const radius = p.random(p.min(p.width, p.height) * 0.3);
      agents.push({
        x: p.width / 2 + p.cos(angle) * radius,
        y: p.height / 2 + p.sin(angle) * radius,
        angle: p.random(p.TWO_PI),
      });
    }

    p.background(0);
  };

  const sense = (agent: Agent, angleOffset: number): number => {
    const senseAngle = agent.angle + angleOffset;
    const senseX = Math.floor(agent.x + p.cos(senseAngle) * sensorDistance);
    const senseY = Math.floor(agent.y + p.sin(senseAngle) * sensorDistance);

    if (senseX >= 0 && senseX < pixelWidth && senseY >= 0 && senseY < pixelHeight) {
      return trailMap[senseY * pixelWidth + senseX];
    }
    return 0;
  };

  p.draw = () => {
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];

      const senseForward = sense(agent, 0);
      const senseLeft = sense(agent, sensorAngle);
      const senseRight = sense(agent, -sensorAngle);

      if (senseForward > senseLeft && senseForward > senseRight) {
        // Continue straight
      } else if (senseForward < senseLeft && senseForward < senseRight) {
        agent.angle += (p.random() > 0.5 ? 1 : -1) * rotationAngle;
      } else if (senseRight > senseLeft) {
        agent.angle -= rotationAngle;
      } else if (senseLeft > senseRight) {
        agent.angle += rotationAngle;
      }

      agent.x += p.cos(agent.angle) * stepSize;
      agent.y += p.sin(agent.angle) * stepSize;

      // Wrap around edges
      if (agent.x < 0) agent.x = pixelWidth - 1;
      if (agent.x >= pixelWidth) agent.x = 0;
      if (agent.y < 0) agent.y = pixelHeight - 1;
      if (agent.y >= pixelHeight) agent.y = 0;

      const idx = Math.floor(agent.y) * pixelWidth + Math.floor(agent.x);
      trailMap[idx] = Math.min(trailMap[idx] + depositAmount, 255);
    }

    // Diffuse and decay
    const newTrailMap = new Array(pixelWidth * pixelHeight).fill(0);
    for (let y = 1; y < pixelHeight - 1; y++) {
      for (let x = 1; x < pixelWidth - 1; x++) {
        let sum = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            sum += trailMap[(y + dy) * pixelWidth + (x + dx)];
          }
        }
        newTrailMap[y * pixelWidth + x] = (sum / 9) * decayFactor;
      }
    }
    trailMap = newTrailMap;

    // Render
    p.loadPixels();
    for (let i = 0; i < trailMap.length; i++) {
      const brightness = trailMap[i];
      const idx = i * 4;
      p.pixels[idx] = brightness * 0.3;
      p.pixels[idx + 1] = brightness * 0.8;
      p.pixels[idx + 2] = brightness;
      p.pixels[idx + 3] = 255;
    }
    p.updatePixels();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    pixelWidth = p.width;
    pixelHeight = p.height;
    trailMap = new Array(pixelWidth * pixelHeight).fill(0);
    agents = [];
    for (let i = 0; i < numAgents; i++) {
      const angle = p.random(p.TWO_PI);
      const radius = p.random(p.min(p.width, p.height) * 0.3);
      agents.push({
        x: p.width / 2 + p.cos(angle) * radius,
        y: p.height / 2 + p.sin(angle) * radius,
        angle: p.random(p.TWO_PI),
      });
    }
  };

  p.mousePressed = () => {
    trailMap = new Array(pixelWidth * pixelHeight).fill(0);
    agents = [];
    for (let i = 0; i < numAgents; i++) {
      agents.push({
        x: p.mouseX + p.random(-50, 50),
        y: p.mouseY + p.random(-50, 50),
        angle: p.random(p.TWO_PI),
      });
    }
  };
};

export default physarumSketch;
