import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

interface Blob {
  x: number;
  y: number;
  baseRadius: number;
  noiseOffset: number;
  speedX: number;
  speedY: number;
  hue: number;
  noiseScale: number;
}

const liquidBlobsSketch: Sketch = (p: p5) => {
  const blobs: Blob[] = [];
  const numBlobs = 5;
  let time = 0;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.noStroke();
    initBlobs();
  };

  const initBlobs = () => {
    blobs.length = 0;
    for (let i = 0; i < numBlobs; i++) {
      blobs.push({
        x: p.random(p.width * 0.2, p.width * 0.8),
        y: p.random(p.height * 0.2, p.height * 0.8),
        baseRadius: p.random(80, 150),
        noiseOffset: p.random(1000),
        speedX: p.random(-0.5, 0.5),
        speedY: p.random(-0.5, 0.5),
        hue: p.random(180, 320),
        noiseScale: p.random(0.5, 1.5),
      });
    }
  };

  p.draw = () => {
    p.background(250, 15, 95);
    time += 0.01;

    const mouseX = p.mouseX;
    const mouseY = p.mouseY;

    for (const blob of blobs) {
      // Move blob
      blob.x += blob.speedX;
      blob.y += blob.speedY;

      // Mouse attraction
      const dx = mouseX - blob.x;
      const dy = mouseY - blob.y;
      const dist = p.sqrt(dx * dx + dy * dy);
      if (dist < 300 && dist > 0) {
        blob.x += (dx / dist) * 0.3;
        blob.y += (dy / dist) * 0.3;
      }

      // Bounce off edges with padding
      const padding = blob.baseRadius;
      if (blob.x < padding || blob.x > p.width - padding) blob.speedX *= -1;
      if (blob.y < padding || blob.y > p.height - padding) blob.speedY *= -1;

      blob.x = p.constrain(blob.x, padding, p.width - padding);
      blob.y = p.constrain(blob.y, padding, p.height - padding);

      // Draw blob with noise-deformed vertices
      drawBlob(blob);
    }
  };

  const drawBlob = (blob: Blob) => {
    const numPoints = 60;
    const angleStep = p.TWO_PI / numPoints;

    // Draw multiple layers for a glassy effect
    for (let layer = 3; layer >= 0; layer--) {
      const layerScale = 1 - layer * 0.1;
      const alpha = layer === 0 ? 60 : 20 - layer * 5;

      p.fill(blob.hue, 50 - layer * 10, 80 + layer * 5, alpha);

      p.beginShape();
      for (let i = 0; i <= numPoints; i++) {
        const angle = i * angleStep;
        const noiseVal = p.noise(
          p.cos(angle) * blob.noiseScale + blob.noiseOffset,
          p.sin(angle) * blob.noiseScale + blob.noiseOffset,
          time * 0.5
        );
        const radius = blob.baseRadius * layerScale * (0.7 + noiseVal * 0.6);

        const x = blob.x + p.cos(angle) * radius;
        const y = blob.y + p.sin(angle) * radius;

        p.vertex(x, y);
      }
      p.endShape(p.CLOSE);
    }

    // Add highlight
    p.fill(blob.hue - 20, 20, 100, 30);
    p.ellipse(
      blob.x - blob.baseRadius * 0.2,
      blob.y - blob.baseRadius * 0.2,
      blob.baseRadius * 0.3,
      blob.baseRadius * 0.2
    );
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    initBlobs();
  };

  p.mousePressed = () => {
    initBlobs();
  };
};

export default liquidBlobsSketch;
