import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

/**
 * Maze Generation
 *
 * Visualizes the process of generating perfect mazes using various
 * algorithms. Watch walls being carved out in real-time.
 *
 * Controls:
 * - Click: Regenerate maze
 * - 1-3: Change algorithm (DFS, Prim's, Kruskal's)
 * - +/-: Adjust cell size
 * - Space: Toggle animation speed
 */
const mazeGeneration: Sketch = (p: p5) => {
  const CELL_SIZE = 20;
  let cols: number;
  let rows: number;
  let grid: Cell[][];
  let stack: Cell[] = [];
  let current: Cell | null = null;
  let algorithm = 0;
  let isGenerating = false;
  let fastMode = false;

  // For Prim's algorithm
  let frontier: Cell[] = [];

  // For Kruskal's algorithm
  let walls: { cell1: Cell; cell2: Cell }[] = [];
  let sets: Map<Cell, number> = new Map();

  interface Cell {
    x: number;
    y: number;
    visited: boolean;
    walls: [boolean, boolean, boolean, boolean]; // top, right, bottom, left
    set?: number;
  }

  const algorithms = ['Depth-First Search', "Prim's", "Kruskal's"];

  const initGrid = () => {
    cols = Math.floor(p.width / CELL_SIZE);
    rows = Math.floor(p.height / CELL_SIZE);
    grid = [];
    stack = [];
    frontier = [];
    walls = [];
    sets = new Map();

    for (let i = 0; i < cols; i++) {
      grid[i] = [];
      for (let j = 0; j < rows; j++) {
        grid[i][j] = {
          x: i,
          y: j,
          visited: false,
          walls: [true, true, true, true],
        };
      }
    }

    // Initialize based on algorithm
    if (algorithm === 0) {
      // DFS: Start from top-left
      current = grid[0][0];
      current.visited = true;
    } else if (algorithm === 1) {
      // Prim's: Start from random cell
      const startX = Math.floor(p.random(cols));
      const startY = Math.floor(p.random(rows));
      current = grid[startX][startY];
      current.visited = true;
      addToFrontier(current);
    } else if (algorithm === 2) {
      // Kruskal's: Initialize all walls
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const cell = grid[i][j];
          sets.set(cell, i * rows + j); // Each cell in its own set

          // Add walls to neighbors
          if (i < cols - 1) {
            walls.push({ cell1: cell, cell2: grid[i + 1][j] });
          }
          if (j < rows - 1) {
            walls.push({ cell1: cell, cell2: grid[i][j + 1] });
          }
        }
      }
      // Shuffle walls
      for (let i = walls.length - 1; i > 0; i--) {
        const j = Math.floor(p.random(i + 1));
        [walls[i], walls[j]] = [walls[j], walls[i]];
      }
    }

    isGenerating = true;
  };

  const getNeighbors = (cell: Cell): Cell[] => {
    const neighbors: Cell[] = [];
    const { x, y } = cell;

    if (y > 0) neighbors.push(grid[x][y - 1]); // top
    if (x < cols - 1) neighbors.push(grid[x + 1][y]); // right
    if (y < rows - 1) neighbors.push(grid[x][y + 1]); // bottom
    if (x > 0) neighbors.push(grid[x - 1][y]); // left

    return neighbors;
  };

  const getUnvisitedNeighbors = (cell: Cell): Cell[] => {
    return getNeighbors(cell).filter(n => !n.visited);
  };

  const removeWall = (a: Cell, b: Cell) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;

    if (dx === 1) {
      a.walls[3] = false;
      b.walls[1] = false;
    } else if (dx === -1) {
      a.walls[1] = false;
      b.walls[3] = false;
    } else if (dy === 1) {
      a.walls[0] = false;
      b.walls[2] = false;
    } else if (dy === -1) {
      a.walls[2] = false;
      b.walls[0] = false;
    }
  };

  const addToFrontier = (cell: Cell) => {
    const neighbors = getUnvisitedNeighbors(cell);
    for (const neighbor of neighbors) {
      if (!frontier.includes(neighbor)) {
        frontier.push(neighbor);
      }
    }
  };

  const findSet = (cell: Cell): number => {
    let id = sets.get(cell)!;
    // Path compression
    const visited: Cell[] = [cell];
    let current = cell;

    while (true) {
      let found = false;
      for (const [c, cid] of sets.entries()) {
        if (cid === id && c !== current) {
          visited.push(c);
          current = c;
          id = sets.get(c)!;
          found = true;
          break;
        }
      }
      if (!found) break;
    }

    return sets.get(cell)!;
  };

  const unionSets = (cell1: Cell, cell2: Cell) => {
    const set1 = findSet(cell1);
    const set2 = findSet(cell2);

    if (set1 !== set2) {
      // Merge set2 into set1
      for (const [cell, setId] of sets.entries()) {
        if (setId === set2) {
          sets.set(cell, set1);
        }
      }
    }
  };

  const stepDFS = () => {
    if (current) {
      const neighbors = getUnvisitedNeighbors(current);

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(p.random(neighbors.length))];
        stack.push(current);
        removeWall(current, next);
        current = next;
        current.visited = true;
      } else if (stack.length > 0) {
        current = stack.pop()!;
      } else {
        isGenerating = false;
      }
    }
  };

  const stepPrims = () => {
    if (frontier.length > 0) {
      const randomIndex = Math.floor(p.random(frontier.length));
      const cell = frontier[randomIndex];
      frontier.splice(randomIndex, 1);

      if (!cell.visited) {
        cell.visited = true;

        // Connect to a visited neighbor
        const visitedNeighbors = getNeighbors(cell).filter(n => n.visited);
        if (visitedNeighbors.length > 0) {
          const neighbor = visitedNeighbors[Math.floor(p.random(visitedNeighbors.length))];
          removeWall(cell, neighbor);
        }

        addToFrontier(cell);
        current = cell;
      }
    } else {
      isGenerating = false;
    }
  };

  const stepKruskals = () => {
    while (walls.length > 0) {
      const wall = walls.pop()!;
      const set1 = findSet(wall.cell1);
      const set2 = findSet(wall.cell2);

      if (set1 !== set2) {
        removeWall(wall.cell1, wall.cell2);
        unionSets(wall.cell1, wall.cell2);
        wall.cell1.visited = true;
        wall.cell2.visited = true;
        current = wall.cell2;
        return;
      }
    }
    isGenerating = false;
  };

  const step = () => {
    if (!isGenerating) return;

    switch (algorithm) {
      case 0:
        stepDFS();
        break;
      case 1:
        stepPrims();
        break;
      case 2:
        stepKruskals();
        break;
    }
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    initGrid();
  };

  p.draw = () => {
    p.background(20, 25, 35);

    // Draw cells
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const cell = grid[i][j];
        const x = i * CELL_SIZE;
        const y = j * CELL_SIZE;

        // Fill visited cells
        if (cell.visited) {
          const hue = ((i + j) * 5) % 360;
          p.colorMode(p.HSB, 360, 100, 100);
          p.fill(hue, 40, 30);
          p.noStroke();
          p.rect(x, y, CELL_SIZE, CELL_SIZE);
        }

        // Draw walls
        p.stroke(100, 200, 255);
        p.strokeWeight(2);

        if (cell.walls[0]) p.line(x, y, x + CELL_SIZE, y); // top
        if (cell.walls[1]) p.line(x + CELL_SIZE, y, x + CELL_SIZE, y + CELL_SIZE); // right
        if (cell.walls[2]) p.line(x + CELL_SIZE, y + CELL_SIZE, x, y + CELL_SIZE); // bottom
        if (cell.walls[3]) p.line(x, y + CELL_SIZE, x, y); // left
      }
    }

    // Highlight current cell
    if (current) {
      p.fill(255, 100, 100);
      p.noStroke();
      p.rect(current.x * CELL_SIZE, current.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }

    // Run algorithm
    if (isGenerating) {
      const iterations = fastMode ? 10 : 1;
      for (let i = 0; i < iterations; i++) {
        step();
        if (!isGenerating) break;
      }
    }

    // Instructions
    p.colorMode(p.RGB, 255);
    p.fill(255);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.LEFT, p.BOTTOM);
    const status = isGenerating ? 'Generating...' : 'Complete';
    const speedMode = fastMode ? 'Fast' : 'Normal';
    p.text(
      `Algorithm: ${algorithms[algorithm]} | ${status} | Speed: ${speedMode} | Click: restart | 1-3: algorithm | Space: speed`,
      20,
      p.height - 20
    );
  };

  p.mousePressed = () => {
    initGrid();
  };

  p.keyPressed = () => {
    if (p.key === '1') {
      algorithm = 0;
      initGrid();
    } else if (p.key === '2') {
      algorithm = 1;
      initGrid();
    } else if (p.key === '3') {
      algorithm = 2;
      initGrid();
    } else if (p.key === ' ') {
      fastMode = !fastMode;
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    initGrid();
  };
};

export default mazeGeneration;
