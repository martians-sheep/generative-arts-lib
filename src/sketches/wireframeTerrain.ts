import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

const wireframeTerrainSketch: Sketch = (p: p5) => {
  const cols = 50;
  const rows = 50;
  const scl = 30;
  let terrain: number[][] = [];
  let flying = 0;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
    p.colorMode(p.HSB, 360, 100, 100, 100);

    // Initialize terrain array
    terrain = new Array(cols);
    for (let i = 0; i < cols; i++) {
      terrain[i] = new Array(rows);
    }
  };

  p.draw = () => {
    // Use mouse to control flight speed
    const speed = p.map(p.mouseY, 0, p.height, 0.02, 0.08);
    flying -= speed;

    // Generate terrain using Perlin noise
    let yoff = flying;
    for (let y = 0; y < rows; y++) {
      let xoff = 0;
      for (let x = 0; x < cols; x++) {
        terrain[x][y] = p.map(p.noise(xoff, yoff), 0, 1, -100, 100);
        xoff += 0.15;
      }
      yoff += 0.15;
    }

    p.background(240, 20, 10);

    // Tilt control with mouse X
    const rotX = p.map(p.mouseX, 0, p.width, p.PI / 2.5, p.PI / 3.5);

    p.push();
    p.translate(0, 50, -200);
    p.rotateX(rotX);
    p.translate(-cols * scl / 2, -rows * scl / 2);

    // Draw terrain mesh
    for (let y = 0; y < rows - 1; y++) {
      p.beginShape(p.TRIANGLE_STRIP);
      for (let x = 0; x < cols; x++) {
        const z1 = terrain[x][y];
        const z2 = terrain[x][y + 1];

        // Color based on height
        const hue1 = p.map(z1, -100, 100, 180, 300);
        const hue2 = p.map(z2, -100, 100, 180, 300);

        p.stroke(hue1, 60, 80, 70);
        p.noFill();
        p.strokeWeight(1);

        p.vertex(x * scl, y * scl, z1);
        p.stroke(hue2, 60, 80, 70);
        p.vertex(x * scl, (y + 1) * scl, z2);
      }
      p.endShape();
    }

    p.pop();

    // Draw horizon glow
    p.push();
    p.translate(0, p.height * 0.1, -500);
    p.noStroke();
    for (let i = 0; i < 5; i++) {
      const alpha = p.map(i, 0, 5, 30, 0);
      p.fill(280, 50, 80, alpha);
      p.ellipse(0, 0, p.width * 2, 100 + i * 50);
    }
    p.pop();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  p.mousePressed = () => {
    // Reset with new noise seed
    p.noiseSeed(p.random(1000));
    flying = 0;
  };
};

export default wireframeTerrainSketch;
