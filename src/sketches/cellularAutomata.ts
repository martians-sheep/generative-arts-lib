import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

const cellularAutomataSketch: Sketch = (p: p5) => {
  let cells: number[] = [];
  let cellSize = 4;
  let numCells = 0;
  let currentRow = 0;
  let rule = 30;
  let ruleSet: number[] = [];
  let colorMode: 'classic' | 'gradient' | 'hue' = 'gradient';
  let baseHue = 200;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    initializeCA();
  };

  const initializeCA = () => {
    p.background(0, 0, 8);
    numCells = Math.ceil(p.width / cellSize);
    cells = new Array(numCells).fill(0);

    // Start with single cell in middle (or random)
    if (p.random() < 0.7) {
      cells[Math.floor(numCells / 2)] = 1;
    } else {
      // Random initial state
      for (let i = 0; i < numCells; i++) {
        cells[i] = p.random() < 0.5 ? 1 : 0;
      }
    }

    currentRow = 0;
    generateRuleSet(rule);
    baseHue = p.random(360);
  };

  const generateRuleSet = (ruleNumber: number) => {
    ruleSet = [];
    for (let i = 0; i < 8; i++) {
      ruleSet[i] = (ruleNumber >> i) & 1;
    }
  };

  const calculateNextGeneration = () => {
    const nextCells = new Array(numCells).fill(0);

    for (let i = 0; i < numCells; i++) {
      const left = cells[(i - 1 + numCells) % numCells];
      const center = cells[i];
      const right = cells[(i + 1) % numCells];

      const index = left * 4 + center * 2 + right;
      nextCells[i] = ruleSet[index];
    }

    cells = nextCells;
  };

  const drawCurrentGeneration = () => {
    const y = currentRow * cellSize;

    for (let i = 0; i < numCells; i++) {
      if (cells[i] === 1) {
        const x = i * cellSize;

        switch (colorMode) {
          case 'classic':
            p.fill(0, 0, 100);
            break;
          case 'gradient':
            const progress = currentRow / (p.height / cellSize);
            const hue = (baseHue + progress * 120) % 360;
            p.fill(hue, 70, 90);
            break;
          case 'hue':
            const neighborSum = getNeighborSum(i);
            const h = (baseHue + neighborSum * 30 + currentRow * 0.5) % 360;
            p.fill(h, 80, 85);
            break;
        }

        p.noStroke();
        p.rect(x, y, cellSize, cellSize);
      }
    }
  };

  const getNeighborSum = (i: number): number => {
    let sum = 0;
    for (let j = -2; j <= 2; j++) {
      const idx = (i + j + numCells) % numCells;
      sum += cells[idx];
    }
    return sum;
  };

  p.draw = () => {
    // Draw multiple rows per frame for faster visualization
    const rowsPerFrame = 3;

    for (let r = 0; r < rowsPerFrame; r++) {
      if (currentRow * cellSize < p.height) {
        drawCurrentGeneration();
        calculateNextGeneration();
        currentRow++;
      } else {
        // Reset with new rule or same rule
        setTimeout(() => {
          rule = Math.floor(p.random(256));
          initializeCA();
        }, 2000);
        p.noLoop();
        break;
      }
    }

    // Draw UI
    p.push();
    p.fill(0, 0, 8, 80);
    p.noStroke();
    p.rect(10, 10, 280, 50, 5);

    p.fill(0, 0, 90);
    p.textSize(14);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`Rule ${rule} | Row: ${currentRow}`, 20, 18);
    p.textSize(11);
    p.text('Click: New rule | 1-3: Color mode | R: Restart', 20, 38);
    p.pop();
  };

  p.mousePressed = () => {
    // Generate new random rule
    rule = Math.floor(p.random(256));
    initializeCA();
    p.loop();
  };

  p.keyPressed = () => {
    if (p.key === 'r' || p.key === 'R') {
      initializeCA();
      p.loop();
    }
    if (p.key === '1') {
      colorMode = 'classic';
    }
    if (p.key === '2') {
      colorMode = 'gradient';
    }
    if (p.key === '3') {
      colorMode = 'hue';
    }
    // Famous rules
    if (p.key === 'a' || p.key === 'A') {
      rule = 30; // Rule 30 - chaotic
      initializeCA();
      p.loop();
    }
    if (p.key === 'b' || p.key === 'B') {
      rule = 90; // Rule 90 - Sierpinski triangle
      initializeCA();
      p.loop();
    }
    if (p.key === 'c' || p.key === 'C') {
      rule = 110; // Rule 110 - Turing complete
      initializeCA();
      p.loop();
    }
    if (p.key === 'd' || p.key === 'D') {
      rule = 184; // Rule 184 - traffic flow
      initializeCA();
      p.loop();
    }
    // Adjust cell size
    if (p.key === '+' || p.key === '=') {
      cellSize = Math.min(cellSize + 1, 10);
      initializeCA();
      p.loop();
    }
    if (p.key === '-' || p.key === '_') {
      cellSize = Math.max(cellSize - 1, 2);
      initializeCA();
      p.loop();
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    initializeCA();
    p.loop();
  };
};

export default cellularAutomataSketch;
