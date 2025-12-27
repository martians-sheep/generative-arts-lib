import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

interface Gene {
  hue: number;
  saturation: number;
  brightness: number;
  size: number;
  x: number;
  y: number;
  rotation: number;
  shape: 'circle' | 'square' | 'triangle' | 'star';
  alpha: number;
}

interface Organism {
  genes: Gene[];
  fitness: number;
  selected: boolean;
}

const geneticAlgorithmSketch: Sketch = (p: p5) => {
  let population: Organism[] = [];
  const populationSize = 12;
  const genesPerOrganism = 8;
  let generation = 0;
  let selectedParents: Organism[] = [];
  const mutationRate = 0.1;
  let organismSize = 0;
  let gridCols = 4;
  let gridRows = 3;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    calculateLayout();
    initializePopulation();
  };

  const calculateLayout = () => {
    // Calculate optimal grid layout
    const aspect = p.width / p.height;
    if (aspect > 1.5) {
      gridCols = 4;
      gridRows = 3;
    } else if (aspect > 1) {
      gridCols = 4;
      gridRows = 3;
    } else {
      gridCols = 3;
      gridRows = 4;
    }
    organismSize = Math.min(
      (p.width - 40) / gridCols - 20,
      (p.height - 120) / gridRows - 20
    );
  };

  const initializePopulation = () => {
    population = [];
    for (let i = 0; i < populationSize; i++) {
      population.push(createRandomOrganism());
    }
    generation = 1;
    selectedParents = [];
  };

  const createRandomOrganism = (): Organism => {
    const genes: Gene[] = [];
    const baseHue = p.random(360);

    for (let i = 0; i < genesPerOrganism; i++) {
      genes.push({
        hue: (baseHue + p.random(-60, 60) + 360) % 360,
        saturation: p.random(40, 100),
        brightness: p.random(50, 100),
        size: p.random(0.1, 0.5),
        x: p.random(-0.4, 0.4),
        y: p.random(-0.4, 0.4),
        rotation: p.random(p.TWO_PI),
        shape: (['circle', 'square', 'triangle', 'star'] as const)[Math.floor(p.random(4))],
        alpha: p.random(40, 90)
      });
    }

    return { genes, fitness: 0, selected: false };
  };

  const crossover = (parent1: Organism, parent2: Organism): Organism => {
    const childGenes: Gene[] = [];
    const crossoverPoint = Math.floor(p.random(genesPerOrganism));

    for (let i = 0; i < genesPerOrganism; i++) {
      const parentGene = i < crossoverPoint ? parent1.genes[i] : parent2.genes[i];

      // Mix some properties from both parents
      const gene: Gene = {
        hue: i < crossoverPoint ? parent1.genes[i].hue : parent2.genes[i].hue,
        saturation: p.lerp(parent1.genes[i].saturation, parent2.genes[i].saturation, p.random()),
        brightness: p.lerp(parent1.genes[i].brightness, parent2.genes[i].brightness, p.random()),
        size: p.lerp(parent1.genes[i].size, parent2.genes[i].size, p.random()),
        x: p.lerp(parent1.genes[i].x, parent2.genes[i].x, p.random()),
        y: p.lerp(parent1.genes[i].y, parent2.genes[i].y, p.random()),
        rotation: parentGene.rotation,
        shape: parentGene.shape,
        alpha: p.lerp(parent1.genes[i].alpha, parent2.genes[i].alpha, p.random())
      };

      childGenes.push(gene);
    }

    return { genes: childGenes, fitness: 0, selected: false };
  };

  const mutate = (organism: Organism): Organism => {
    const mutatedGenes = organism.genes.map(gene => {
      const mutatedGene = { ...gene };

      if (p.random() < mutationRate) {
        mutatedGene.hue = (gene.hue + p.random(-30, 30) + 360) % 360;
      }
      if (p.random() < mutationRate) {
        mutatedGene.saturation = p.constrain(gene.saturation + p.random(-20, 20), 20, 100);
      }
      if (p.random() < mutationRate) {
        mutatedGene.brightness = p.constrain(gene.brightness + p.random(-20, 20), 30, 100);
      }
      if (p.random() < mutationRate) {
        mutatedGene.size = p.constrain(gene.size + p.random(-0.1, 0.1), 0.05, 0.6);
      }
      if (p.random() < mutationRate) {
        mutatedGene.x = p.constrain(gene.x + p.random(-0.1, 0.1), -0.45, 0.45);
      }
      if (p.random() < mutationRate) {
        mutatedGene.y = p.constrain(gene.y + p.random(-0.1, 0.1), -0.45, 0.45);
      }
      if (p.random() < mutationRate * 0.5) {
        mutatedGene.shape = (['circle', 'square', 'triangle', 'star'] as const)[Math.floor(p.random(4))];
      }
      if (p.random() < mutationRate) {
        mutatedGene.rotation = gene.rotation + p.random(-0.5, 0.5);
      }

      return mutatedGene;
    });

    return { genes: mutatedGenes, fitness: 0, selected: false };
  };

  const evolve = () => {
    if (selectedParents.length < 2) return;

    const newPopulation: Organism[] = [];

    // Keep the selected parents (elitism)
    for (const parent of selectedParents) {
      parent.selected = false;
      newPopulation.push(parent);
    }

    // Create offspring
    while (newPopulation.length < populationSize) {
      const parent1 = selectedParents[Math.floor(p.random(selectedParents.length))];
      const parent2 = selectedParents[Math.floor(p.random(selectedParents.length))];

      let child = crossover(parent1, parent2);
      child = mutate(child);
      newPopulation.push(child);
    }

    population = newPopulation;
    selectedParents = [];
    generation++;
  };

  const drawShape = (gene: Gene, centerX: number, centerY: number, scale: number) => {
    const size = gene.size * scale;
    const x = centerX + gene.x * scale;
    const y = centerY + gene.y * scale;

    p.push();
    p.translate(x, y);
    p.rotate(gene.rotation);
    p.fill(gene.hue, gene.saturation, gene.brightness, gene.alpha);
    p.noStroke();

    switch (gene.shape) {
      case 'circle':
        p.ellipse(0, 0, size, size);
        break;
      case 'square':
        p.rectMode(p.CENTER);
        p.rect(0, 0, size, size);
        break;
      case 'triangle':
        p.triangle(
          0, -size / 2,
          -size / 2, size / 2,
          size / 2, size / 2
        );
        break;
      case 'star':
        drawStar(0, 0, size * 0.25, size * 0.5, 5);
        break;
    }

    p.pop();
  };

  const drawStar = (x: number, y: number, radius1: number, radius2: number, npoints: number) => {
    const angle = p.TWO_PI / npoints;
    const halfAngle = angle / 2.0;
    p.beginShape();
    for (let a = -p.HALF_PI; a < p.TWO_PI - p.HALF_PI; a += angle) {
      let sx = x + Math.cos(a) * radius2;
      let sy = y + Math.sin(a) * radius2;
      p.vertex(sx, sy);
      sx = x + Math.cos(a + halfAngle) * radius1;
      sy = y + Math.sin(a + halfAngle) * radius1;
      p.vertex(sx, sy);
    }
    p.endShape(p.CLOSE);
  };

  const drawOrganism = (organism: Organism, x: number, y: number, size: number) => {
    // Background
    p.fill(0, 0, 15);
    p.stroke(organism.selected ? p.color(60, 100, 100) : p.color(0, 0, 30));
    p.strokeWeight(organism.selected ? 3 : 1);
    p.rect(x, y, size, size, 5);

    // Draw genes
    const centerX = x + size / 2;
    const centerY = y + size / 2;

    for (const gene of organism.genes) {
      drawShape(gene, centerX, centerY, size);
    }
  };

  const getOrganismAtPosition = (mx: number, my: number): Organism | null => {
    const startX = (p.width - gridCols * (organismSize + 20)) / 2 + 10;
    const startY = 80;

    for (let i = 0; i < population.length; i++) {
      const col = i % gridCols;
      const row = Math.floor(i / gridCols);
      const x = startX + col * (organismSize + 20);
      const y = startY + row * (organismSize + 20);

      if (mx >= x && mx <= x + organismSize && my >= y && my <= y + organismSize) {
        return population[i];
      }
    }
    return null;
  };

  p.draw = () => {
    p.background(0, 0, 8);

    // Title
    p.fill(0, 0, 90);
    p.textSize(18);
    p.textAlign(p.CENTER, p.TOP);
    p.noStroke();
    p.text(`Generation ${generation} | Selected: ${selectedParents.length}/2+`, p.width / 2, 15);

    p.textSize(12);
    p.fill(0, 0, 70);
    p.text('Click organisms to select parents, then press SPACE to evolve', p.width / 2, 42);

    // Draw population
    const startX = (p.width - gridCols * (organismSize + 20)) / 2 + 10;
    const startY = 80;

    for (let i = 0; i < population.length; i++) {
      const col = i % gridCols;
      const row = Math.floor(i / gridCols);
      const x = startX + col * (organismSize + 20);
      const y = startY + row * (organismSize + 20);

      drawOrganism(population[i], x, y, organismSize);
    }

    // Instructions at bottom
    p.fill(0, 0, 60);
    p.textSize(11);
    p.textAlign(p.CENTER, p.BOTTOM);
    p.text('SPACE: Evolve | R: Reset | M: Mutate selected', p.width / 2, p.height - 10);
  };

  p.mousePressed = () => {
    const organism = getOrganismAtPosition(p.mouseX, p.mouseY);
    if (organism) {
      organism.selected = !organism.selected;

      if (organism.selected) {
        selectedParents.push(organism);
      } else {
        selectedParents = selectedParents.filter(o => o !== organism);
      }
    }
  };

  p.keyPressed = () => {
    if (p.key === ' ') {
      if (selectedParents.length >= 2) {
        evolve();
      }
    }
    if (p.key === 'r' || p.key === 'R') {
      initializePopulation();
    }
    if (p.key === 'm' || p.key === 'M') {
      // Mutate all selected
      for (const org of selectedParents) {
        const idx = population.indexOf(org);
        if (idx !== -1) {
          population[idx] = mutate(org);
          population[idx].selected = true;
        }
      }
    }
    if (p.key === 'a' || p.key === 'A') {
      // Auto-evolve: select random 2-3 and evolve
      selectedParents = [];
      const numSelect = Math.floor(p.random(2, 4));
      const shuffled = [...population].sort(() => p.random() - 0.5);
      for (let i = 0; i < numSelect; i++) {
        shuffled[i].selected = true;
        selectedParents.push(shuffled[i]);
      }
      evolve();
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    calculateLayout();
  };
};

export default geneticAlgorithmSketch;
