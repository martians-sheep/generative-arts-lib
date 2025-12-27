import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

const fractalTreeSketch: Sketch = (p: p5) => {
  let baseAngle = p.PI / 6;
  let lengthRatio = 0.67;
  let initialLength = 0;
  let windOffset = 0;
  let windStrength = 0;
  let maxDepth = 10;
  let treeStyle: 'natural' | 'symmetric' | 'bonsai' = 'natural';
  let showLeaves = true;
  let colorScheme: 'green' | 'autumn' | 'cherry' = 'green';

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    initialLength = Math.min(p.height * 0.25, 180);
  };

  const getWindAngle = (depth: number, x: number): number => {
    const noiseVal = p.noise(x * 0.005, depth * 0.3, windOffset);
    return p.map(noiseVal, 0, 1, -windStrength, windStrength);
  };

  const drawBranch = (x: number, y: number, len: number, angle: number, depth: number) => {
    if (depth > maxDepth || len < 2) return;

    // Calculate end point
    const endX = x + len * Math.sin(angle);
    const endY = y - len * Math.cos(angle);

    // Branch thickness decreases with depth
    const thickness = p.map(depth, 0, maxDepth, initialLength * 0.08, 1);

    // Branch color
    const depthRatio = depth / maxDepth;
    let branchHue: number;
    let branchSat: number;
    let branchBri: number;

    switch (colorScheme) {
      case 'green':
        branchHue = p.map(depth, 0, maxDepth, 30, 25);
        branchSat = 60;
        branchBri = p.map(depth, 0, maxDepth, 30, 50);
        break;
      case 'autumn':
        branchHue = p.map(depth, 0, maxDepth, 25, 20);
        branchSat = 50;
        branchBri = p.map(depth, 0, maxDepth, 25, 40);
        break;
      case 'cherry':
        branchHue = 340;
        branchSat = 20;
        branchBri = p.map(depth, 0, maxDepth, 25, 45);
        break;
    }

    // Draw branch
    p.stroke(branchHue, branchSat, branchBri);
    p.strokeWeight(thickness);
    p.line(x, y, endX, endY);

    // Calculate next generation parameters
    const wind = getWindAngle(depth, endX);
    const nextLen = len * lengthRatio;

    // Branch variation based on style
    let leftAngle: number;
    let rightAngle: number;
    let variation: number;

    switch (treeStyle) {
      case 'natural':
        variation = p.random(-0.15, 0.15);
        leftAngle = angle - baseAngle + variation + wind;
        rightAngle = angle + baseAngle * p.random(0.8, 1.2) + variation + wind;
        // Sometimes add extra branch
        if (p.random() < 0.2 && depth > 2) {
          drawBranch(endX, endY, nextLen * 0.8, angle + wind, depth + 1);
        }
        break;
      case 'symmetric':
        leftAngle = angle - baseAngle + wind;
        rightAngle = angle + baseAngle + wind;
        break;
      case 'bonsai':
        variation = p.random(-0.3, 0.3);
        leftAngle = angle - baseAngle * 1.2 + variation + wind;
        rightAngle = angle + baseAngle * 0.9 + variation + wind;
        // Bonsai has more horizontal branches
        if (p.random() < 0.15 && depth > 3) {
          const sideAngle = angle + (p.random() < 0.5 ? -1 : 1) * p.HALF_PI * 0.8 + wind;
          drawBranch(endX, endY, nextLen * 0.6, sideAngle, depth + 2);
        }
        break;
    }

    // Draw child branches
    const leftRatio = treeStyle === 'natural' ? p.random(0.9, 1.1) : 1;
    const rightRatio = treeStyle === 'natural' ? p.random(0.9, 1.1) : 1;

    drawBranch(endX, endY, nextLen * leftRatio, leftAngle, depth + 1);
    drawBranch(endX, endY, nextLen * rightRatio, rightAngle, depth + 1);

    // Draw leaves at tips
    if (showLeaves && depth >= maxDepth - 2 && len < 15) {
      drawLeaf(endX, endY, angle);
    }
  };

  const drawLeaf = (x: number, y: number, angle: number) => {
    p.push();
    p.translate(x, y);
    p.rotate(angle);

    let leafHue: number;
    let leafSat: number;
    let leafBri: number;

    switch (colorScheme) {
      case 'green':
        leafHue = p.random(80, 140);
        leafSat = p.random(60, 80);
        leafBri = p.random(50, 80);
        break;
      case 'autumn':
        leafHue = p.random() < 0.5 ? p.random(10, 40) : p.random(40, 60);
        leafSat = p.random(70, 90);
        leafBri = p.random(70, 90);
        break;
      case 'cherry':
        leafHue = p.random(330, 360) % 360;
        leafSat = p.random(60, 90);
        leafBri = p.random(80, 100);
        break;
    }

    p.noStroke();
    p.fill(leafHue, leafSat, leafBri, 70);

    // Draw small ellipse as leaf
    const leafSize = p.random(3, 8);
    p.ellipse(0, -leafSize / 2, leafSize * 0.6, leafSize);

    p.pop();
  };

  p.draw = () => {
    p.background(220, 15, 10);

    // Update wind based on mouse
    const targetWind = p.map(p.mouseX, 0, p.width, -0.3, 0.3);
    windStrength = p.lerp(windStrength, targetWind, 0.05);
    windOffset += 0.01;

    // Draw ground
    p.noStroke();
    p.fill(30, 40, 15);
    p.rect(0, p.height * 0.85, p.width, p.height * 0.15);

    // Draw tree
    const treeX = p.width / 2;
    const treeY = p.height * 0.85;

    // Draw trunk shadow
    p.push();
    p.fill(0, 0, 0, 30);
    p.ellipse(treeX + 20, treeY + 5, initialLength * 0.5, initialLength * 0.1);
    p.pop();

    // Draw the tree
    p.randomSeed(42); // Consistent tree shape
    drawBranch(treeX, treeY, initialLength, 0, 0);

    // UI
    p.push();
    p.fill(0, 0, 90, 70);
    p.textSize(12);
    p.textAlign(p.LEFT, p.TOP);
    p.noStroke();
    p.text(`Style: ${treeStyle} | Color: ${colorScheme} | Move mouse to add wind`, 15, 15);
    p.text('1-3: Style | Q/W/E: Colors | L: Leaves | +/-: Depth', 15, 32);
    p.pop();
  };

  p.keyPressed = () => {
    if (p.key === '1') {
      treeStyle = 'natural';
    }
    if (p.key === '2') {
      treeStyle = 'symmetric';
    }
    if (p.key === '3') {
      treeStyle = 'bonsai';
    }
    if (p.key === 'q' || p.key === 'Q') {
      colorScheme = 'green';
    }
    if (p.key === 'w' || p.key === 'W') {
      colorScheme = 'autumn';
    }
    if (p.key === 'e' || p.key === 'E') {
      colorScheme = 'cherry';
    }
    if (p.key === 'l' || p.key === 'L') {
      showLeaves = !showLeaves;
    }
    if (p.key === '+' || p.key === '=') {
      maxDepth = Math.min(maxDepth + 1, 14);
    }
    if (p.key === '-' || p.key === '_') {
      maxDepth = Math.max(maxDepth - 1, 4);
    }
    if (p.key === 'r' || p.key === 'R') {
      p.randomSeed(Math.floor(p.random(10000)));
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    initialLength = Math.min(p.height * 0.25, 180);
  };
};

export default fractalTreeSketch;
