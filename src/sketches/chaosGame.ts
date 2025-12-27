import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

/**
 * Chaos Game
 *
 * A fractal generation technique where random jumps toward polygon
 * vertices create emergent patterns like Sierpinski's Triangle.
 *
 * Controls:
 * - Click: Reset and regenerate
 * - 3-8: Change number of vertices
 * - +/-: Adjust jump ratio
 * - R: Toggle restriction rule
 */
const chaosGame: Sketch = (p: p5) => {
  let vertices: p5.Vector[] = [];
  let current: p5.Vector;
  let numVertices = 3;
  let jumpRatio = 0.5;
  let pointCount = 0;
  let lastVertex = -1;
  let restrictSameVertex = false;
  let hue = 0;

  const initGame = () => {
    vertices = [];
    const radius = Math.min(p.width, p.height) / 2 - 40;
    const centerX = p.width / 2;
    const centerY = p.height / 2;

    for (let i = 0; i < numVertices; i++) {
      const angle = -p.HALF_PI + (p.TWO_PI / numVertices) * i;
      vertices.push(
        p.createVector(
          centerX + Math.cos(angle) * radius,
          centerY + Math.sin(angle) * radius
        )
      );
    }

    current = p.createVector(p.random(p.width), p.random(p.height));
    pointCount = 0;
    lastVertex = -1;

    p.background(15, 20, 30);

    // Draw vertices
    p.noStroke();
    for (let i = 0; i < vertices.length; i++) {
      p.colorMode(p.HSB, 360, 100, 100);
      p.fill((i * 360) / numVertices, 80, 100);
      p.ellipse(vertices[i].x, vertices[i].y, 12, 12);
    }
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    initGame();
  };

  p.draw = () => {
    p.colorMode(p.HSB, 360, 100, 100, 100);

    // Run many iterations per frame for faster visualization
    for (let i = 0; i < 500; i++) {
      // Choose a random vertex
      let vertexIndex = Math.floor(p.random(numVertices));

      // Apply restriction if enabled (don't pick same vertex twice)
      if (restrictSameVertex && vertexIndex === lastVertex) {
        vertexIndex = (vertexIndex + 1) % numVertices;
      }

      lastVertex = vertexIndex;
      const target = vertices[vertexIndex];

      // Move toward the chosen vertex
      current.x = p.lerp(current.x, target.x, jumpRatio);
      current.y = p.lerp(current.y, target.y, jumpRatio);

      // Color based on which vertex was chosen
      const vertexHue = (vertexIndex * 360) / numVertices;

      // Skip initial points to let pattern stabilize
      if (pointCount > 10) {
        p.stroke(vertexHue, 70, 90, 60);
        p.strokeWeight(1);
        p.point(current.x, current.y);
      }

      pointCount++;
    }

    // Instructions
    p.colorMode(p.RGB, 255);
    p.fill(255);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.LEFT, p.BOTTOM);
    const restriction = restrictSameVertex ? 'ON' : 'OFF';
    p.text(
      `Vertices: ${numVertices} | Ratio: ${jumpRatio.toFixed(2)} | Points: ${pointCount} | Restrict: ${restriction} | 3-8: vertices | +/-: ratio | R: restrict`,
      20,
      p.height - 20
    );

    hue = (hue + 0.5) % 360;
  };

  p.mousePressed = () => {
    initGame();
  };

  p.keyPressed = () => {
    const key = p.key;
    if (key >= '3' && key <= '8') {
      numVertices = parseInt(key);
      initGame();
    } else if (key === '+' || key === '=') {
      jumpRatio = Math.min(0.9, jumpRatio + 0.05);
      initGame();
    } else if (key === '-' || key === '_') {
      jumpRatio = Math.max(0.1, jumpRatio - 0.05);
      initGame();
    } else if (key === 'r' || key === 'R') {
      restrictSameVertex = !restrictSameVertex;
      initGame();
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    initGame();
  };
};

export default chaosGame;
