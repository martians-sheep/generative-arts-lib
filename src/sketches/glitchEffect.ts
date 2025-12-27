import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

interface GlitchBlock {
  x: number;
  y: number;
  w: number;
  h: number;
  offsetX: number;
  offsetY: number;
  channel: number; // 0=R, 1=G, 2=B
  life: number;
}

const glitchEffectSketch: Sketch = (p: p5) => {
  let baseGraphics: p5.Graphics;
  const glitchBlocks: GlitchBlock[] = [];
  let glitchIntensity = 0;
  let targetIntensity = 0;
  let lastGlitchTime = 0;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.pixelDensity(1);

    baseGraphics = p.createGraphics(p.width, p.height);
    baseGraphics.colorMode(baseGraphics.HSB, 360, 100, 100, 100);
    drawBasePattern();
  };

  const drawBasePattern = () => {
    baseGraphics.background(0, 0, 10);

    // Draw geometric pattern as base
    const gridSize = 60;
    baseGraphics.noFill();

    for (let x = 0; x < p.width; x += gridSize) {
      for (let y = 0; y < p.height; y += gridSize) {
        const hue = ((x + y) * 0.5) % 360;
        baseGraphics.stroke(hue, 60, 80, 60);
        baseGraphics.strokeWeight(1);

        // Alternating shapes
        if ((x / gridSize + y / gridSize) % 2 === 0) {
          baseGraphics.rect(x + 10, y + 10, gridSize - 20, gridSize - 20);
        } else {
          baseGraphics.ellipse(x + gridSize / 2, y + gridSize / 2, gridSize - 20);
        }

        // Cross pattern
        baseGraphics.stroke(hue, 40, 60, 30);
        baseGraphics.line(x, y + gridSize / 2, x + gridSize, y + gridSize / 2);
        baseGraphics.line(x + gridSize / 2, y, x + gridSize / 2, y + gridSize);
      }
    }

    // Add some text elements
    baseGraphics.fill(0, 0, 80, 40);
    baseGraphics.noStroke();
    baseGraphics.textSize(100);
    baseGraphics.textAlign(baseGraphics.CENTER, baseGraphics.CENTER);
    baseGraphics.text('GLITCH', p.width / 2, p.height / 2);
  };

  p.draw = () => {
    const time = p.millis();

    // Random glitch triggers
    if (time - lastGlitchTime > p.random(500, 2000)) {
      targetIntensity = p.random() < 0.3 ? p.random(0.5, 1) : 0;
      lastGlitchTime = time;
    }

    // Mouse proximity increases glitch intensity
    const centerDist = p.dist(p.mouseX, p.mouseY, p.width / 2, p.height / 2);
    const mouseIntensity = p.map(centerDist, 0, p.width / 2, 0.8, 0);
    targetIntensity = p.max(targetIntensity, mouseIntensity);

    // Smooth intensity transition
    glitchIntensity = p.lerp(glitchIntensity, targetIntensity, 0.1);
    targetIntensity *= 0.95;

    // Draw base image
    p.image(baseGraphics, 0, 0);

    // Apply glitch effects based on intensity
    if (glitchIntensity > 0.1) {
      applyGlitchEffects();
    }

    // Update and draw glitch blocks
    updateGlitchBlocks();

    // Add scanlines
    drawScanlines();

    // Add chromatic aberration on edges
    if (glitchIntensity > 0.3) {
      drawChromaticAberration();
    }
  };

  const applyGlitchEffects = () => {
    // Add new glitch blocks
    if (p.random() < glitchIntensity * 0.5) {
      const numBlocks = Math.floor(p.random(1, 5) * glitchIntensity);
      for (let i = 0; i < numBlocks; i++) {
        glitchBlocks.push({
          x: p.random(p.width),
          y: p.random(p.height),
          w: p.random(50, 200),
          h: p.random(5, 30),
          offsetX: p.random(-50, 50) * glitchIntensity,
          offsetY: p.random(-10, 10) * glitchIntensity,
          channel: Math.floor(p.random(3)),
          life: p.random(5, 15),
        });
      }
    }

    // Horizontal shift lines
    if (p.random() < glitchIntensity * 0.3) {
      const y = p.random(p.height);
      const h = p.random(2, 10);
      const shift = p.random(-30, 30) * glitchIntensity;

      const slice = p.get(0, y, p.width, h);
      p.image(slice, shift, y);
    }
  };

  const updateGlitchBlocks = () => {
    for (let i = glitchBlocks.length - 1; i >= 0; i--) {
      const block = glitchBlocks[i];

      // Draw the glitch block with color channel separation
      const slice = baseGraphics.get(
        Math.floor(block.x),
        Math.floor(block.y),
        Math.floor(block.w),
        Math.floor(block.h)
      );

      // Apply color tint based on channel
      p.push();
      p.tint(
        block.channel === 0 ? 255 : 0,
        block.channel === 1 ? 255 : 0,
        block.channel === 2 ? 255 : 0,
        150
      );
      p.blendMode(p.ADD);
      p.image(slice, block.x + block.offsetX, block.y + block.offsetY);
      p.pop();

      block.life--;
      if (block.life <= 0) {
        glitchBlocks.splice(i, 1);
      }
    }
  };

  const drawScanlines = () => {
    p.stroke(0, 0, 0, 15);
    p.strokeWeight(1);
    for (let y = 0; y < p.height; y += 3) {
      p.line(0, y, p.width, y);
    }
  };

  const drawChromaticAberration = () => {
    const offset = glitchIntensity * 5;

    // Red channel shift
    p.blendMode(p.ADD);
    p.tint(255, 0, 0, 30 * glitchIntensity);
    p.image(baseGraphics, -offset, 0);

    // Blue channel shift
    p.tint(0, 0, 255, 30 * glitchIntensity);
    p.image(baseGraphics, offset, 0);

    p.blendMode(p.BLEND);
    p.noTint();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    baseGraphics.resizeCanvas(p.width, p.height);
    drawBasePattern();
  };

  p.mousePressed = () => {
    // Trigger intense glitch
    glitchIntensity = 1;
    targetIntensity = 1;

    // Add burst of glitch blocks
    for (let i = 0; i < 20; i++) {
      glitchBlocks.push({
        x: p.random(p.width),
        y: p.random(p.height),
        w: p.random(30, 150),
        h: p.random(5, 40),
        offsetX: p.random(-100, 100),
        offsetY: p.random(-20, 20),
        channel: Math.floor(p.random(3)),
        life: p.random(10, 30),
      });
    }

    // Redraw base with slight variation
    drawBasePattern();
  };
};

export default glitchEffectSketch;
