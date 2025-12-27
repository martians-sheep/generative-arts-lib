import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

/**
 * Wave Function Collapse
 *
 * A constraint-solving algorithm that fills a grid with tiles
 * based on adjacency rules. Creates maze-like or dungeon patterns.
 *
 * Controls:
 * - Click: Regenerate pattern
 * - 1-3: Change tile set (pipes, circuit, dungeon)
 * - Space: Step through generation
 */
const waveFunctionCollapse: Sketch = (p: p5) => {
  const TILE_SIZE = 20;
  let cols: number;
  let rows: number;
  let grid: Cell[][];
  let tileSetIndex = 0;
  let isGenerating = false;
  let stepMode = false;

  interface TileType {
    name: string;
    draw: (p: p5, x: number, y: number, size: number) => void;
    edges: [string, string, string, string]; // top, right, bottom, left
  }

  interface Cell {
    collapsed: boolean;
    options: number[];
  }

  // Pipe tile set
  const pipeTiles: TileType[] = [
    {
      name: 'empty',
      edges: ['0', '0', '0', '0'],
      draw: (p, x, y, size) => {
        p.fill(30, 40, 50);
        p.noStroke();
        p.rect(x, y, size, size);
      },
    },
    {
      name: 'cross',
      edges: ['1', '1', '1', '1'],
      draw: (p, x, y, size) => {
        p.fill(30, 40, 50);
        p.rect(x, y, size, size);
        p.fill(100, 200, 255);
        p.rect(x + size * 0.35, y, size * 0.3, size);
        p.rect(x, y + size * 0.35, size, size * 0.3);
      },
    },
    {
      name: 'vertical',
      edges: ['1', '0', '1', '0'],
      draw: (p, x, y, size) => {
        p.fill(30, 40, 50);
        p.rect(x, y, size, size);
        p.fill(100, 200, 255);
        p.rect(x + size * 0.35, y, size * 0.3, size);
      },
    },
    {
      name: 'horizontal',
      edges: ['0', '1', '0', '1'],
      draw: (p, x, y, size) => {
        p.fill(30, 40, 50);
        p.rect(x, y, size, size);
        p.fill(100, 200, 255);
        p.rect(x, y + size * 0.35, size, size * 0.3);
      },
    },
    {
      name: 'corner-tr',
      edges: ['1', '1', '0', '0'],
      draw: (p, x, y, size) => {
        p.fill(30, 40, 50);
        p.rect(x, y, size, size);
        p.fill(100, 200, 255);
        p.rect(x + size * 0.35, y, size * 0.3, size * 0.65);
        p.rect(x + size * 0.35, y + size * 0.35, size * 0.65, size * 0.3);
      },
    },
    {
      name: 'corner-br',
      edges: ['0', '1', '1', '0'],
      draw: (p, x, y, size) => {
        p.fill(30, 40, 50);
        p.rect(x, y, size, size);
        p.fill(100, 200, 255);
        p.rect(x + size * 0.35, y + size * 0.35, size * 0.3, size * 0.65);
        p.rect(x + size * 0.35, y + size * 0.35, size * 0.65, size * 0.3);
      },
    },
    {
      name: 'corner-bl',
      edges: ['0', '0', '1', '1'],
      draw: (p, x, y, size) => {
        p.fill(30, 40, 50);
        p.rect(x, y, size, size);
        p.fill(100, 200, 255);
        p.rect(x + size * 0.35, y + size * 0.35, size * 0.3, size * 0.65);
        p.rect(x, y + size * 0.35, size * 0.65, size * 0.3);
      },
    },
    {
      name: 'corner-tl',
      edges: ['1', '0', '0', '1'],
      draw: (p, x, y, size) => {
        p.fill(30, 40, 50);
        p.rect(x, y, size, size);
        p.fill(100, 200, 255);
        p.rect(x + size * 0.35, y, size * 0.3, size * 0.65);
        p.rect(x, y + size * 0.35, size * 0.65, size * 0.3);
      },
    },
    {
      name: 't-top',
      edges: ['1', '1', '0', '1'],
      draw: (p, x, y, size) => {
        p.fill(30, 40, 50);
        p.rect(x, y, size, size);
        p.fill(100, 200, 255);
        p.rect(x + size * 0.35, y, size * 0.3, size * 0.65);
        p.rect(x, y + size * 0.35, size, size * 0.3);
      },
    },
    {
      name: 't-bottom',
      edges: ['0', '1', '1', '1'],
      draw: (p, x, y, size) => {
        p.fill(30, 40, 50);
        p.rect(x, y, size, size);
        p.fill(100, 200, 255);
        p.rect(x + size * 0.35, y + size * 0.35, size * 0.3, size * 0.65);
        p.rect(x, y + size * 0.35, size, size * 0.3);
      },
    },
    {
      name: 't-left',
      edges: ['1', '0', '1', '1'],
      draw: (p, x, y, size) => {
        p.fill(30, 40, 50);
        p.rect(x, y, size, size);
        p.fill(100, 200, 255);
        p.rect(x + size * 0.35, y, size * 0.3, size);
        p.rect(x, y + size * 0.35, size * 0.65, size * 0.3);
      },
    },
    {
      name: 't-right',
      edges: ['1', '1', '1', '0'],
      draw: (p, x, y, size) => {
        p.fill(30, 40, 50);
        p.rect(x, y, size, size);
        p.fill(100, 200, 255);
        p.rect(x + size * 0.35, y, size * 0.3, size);
        p.rect(x + size * 0.35, y + size * 0.35, size * 0.65, size * 0.3);
      },
    },
  ];

  let currentTiles = pipeTiles;

  const initGrid = () => {
    cols = Math.floor(p.width / TILE_SIZE);
    rows = Math.floor(p.height / TILE_SIZE);
    grid = [];

    for (let i = 0; i < cols; i++) {
      grid[i] = [];
      for (let j = 0; j < rows; j++) {
        grid[i][j] = {
          collapsed: false,
          options: currentTiles.map((_, index) => index),
        };
      }
    }

    isGenerating = true;
  };

  const getLowestEntropyCell = (): { x: number; y: number } | null => {
    let minEntropy = Infinity;
    let candidates: { x: number; y: number }[] = [];

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const cell = grid[i][j];
        if (!cell.collapsed && cell.options.length > 0) {
          if (cell.options.length < minEntropy) {
            minEntropy = cell.options.length;
            candidates = [{ x: i, y: j }];
          } else if (cell.options.length === minEntropy) {
            candidates.push({ x: i, y: j });
          }
        }
      }
    }

    if (candidates.length === 0) return null;
    return candidates[Math.floor(p.random(candidates.length))];
  };

  const collapseCell = (x: number, y: number) => {
    const cell = grid[x][y];
    if (cell.options.length === 0) return;

    const choice = cell.options[Math.floor(p.random(cell.options.length))];
    cell.options = [choice];
    cell.collapsed = true;
  };

  const propagate = () => {
    let changed = true;
    while (changed) {
      changed = false;

      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          const cell = grid[x][y];
          if (cell.collapsed) continue;

          const validOptions: number[] = [];

          for (const option of cell.options) {
            const tile = currentTiles[option];
            let valid = true;

            // Check top neighbor
            if (y > 0 && grid[x][y - 1].collapsed) {
              const neighborTile = currentTiles[grid[x][y - 1].options[0]];
              if (tile.edges[0] !== neighborTile.edges[2]) valid = false;
            }

            // Check right neighbor
            if (x < cols - 1 && grid[x + 1][y].collapsed) {
              const neighborTile = currentTiles[grid[x + 1][y].options[0]];
              if (tile.edges[1] !== neighborTile.edges[3]) valid = false;
            }

            // Check bottom neighbor
            if (y < rows - 1 && grid[x][y + 1].collapsed) {
              const neighborTile = currentTiles[grid[x][y + 1].options[0]];
              if (tile.edges[2] !== neighborTile.edges[0]) valid = false;
            }

            // Check left neighbor
            if (x > 0 && grid[x - 1][y].collapsed) {
              const neighborTile = currentTiles[grid[x - 1][y].options[0]];
              if (tile.edges[3] !== neighborTile.edges[1]) valid = false;
            }

            if (valid) validOptions.push(option);
          }

          if (validOptions.length < cell.options.length) {
            cell.options = validOptions;
            changed = true;
          }
        }
      }
    }
  };

  const step = () => {
    const cell = getLowestEntropyCell();
    if (!cell) {
      isGenerating = false;
      return;
    }

    collapseCell(cell.x, cell.y);
    propagate();
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    initGrid();
  };

  p.draw = () => {
    p.background(20, 25, 35);
    p.noStroke();

    // Draw grid
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const cell = grid[x][y];
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        if (cell.collapsed) {
          currentTiles[cell.options[0]].draw(p, px, py, TILE_SIZE);
        } else {
          // Show entropy as brightness
          const entropy = cell.options.length / currentTiles.length;
          p.fill(entropy * 100, entropy * 50, entropy * 80);
          p.rect(px, py, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    // Run WFC algorithm
    if (isGenerating && !stepMode) {
      for (let i = 0; i < 5; i++) {
        step();
        if (!isGenerating) break;
      }
    }

    // Instructions
    p.fill(255);
    p.noStroke();
    p.textSize(14);
    p.textAlign(p.LEFT, p.BOTTOM);
    const status = isGenerating ? 'Generating...' : 'Complete';
    p.text(`WFC: ${status} | Click: restart | Space: step mode | Grid: ${cols}x${rows}`, 20, p.height - 20);
  };

  p.mousePressed = () => {
    stepMode = false;
    initGrid();
  };

  p.keyPressed = () => {
    if (p.key === ' ') {
      stepMode = true;
      if (isGenerating) {
        step();
      } else {
        initGrid();
      }
    } else if (p.key === '1') {
      tileSetIndex = 0;
      currentTiles = pipeTiles;
      initGrid();
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    initGrid();
  };
};

export default waveFunctionCollapse;
