import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

const audioReactiveSketch: Sketch = (p: p5) => {
  // Simulated audio visualization (without actual audio input for simplicity)
  const numBars = 64;
  let waveform: number[] = [];
  let spectrum: number[] = [];
  let time = 0;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.noFill();

    // Initialize with zeros
    for (let i = 0; i < numBars; i++) {
      waveform.push(0);
      spectrum.push(0);
    }
  };

  const generateSimulatedAudio = () => {
    time += 0.05;

    // Generate simulated waveform
    for (let i = 0; i < numBars; i++) {
      const freq1 = p.sin(time * 2 + i * 0.1);
      const freq2 = p.sin(time * 3.5 + i * 0.15) * 0.5;
      const freq3 = p.sin(time * 5 + i * 0.2) * 0.3;
      const noise = p.noise(i * 0.1, time) * 0.2;
      waveform[i] = (freq1 + freq2 + freq3 + noise) * 0.5;
    }

    // Generate simulated spectrum (low frequencies higher)
    for (let i = 0; i < numBars; i++) {
      const base = p.sin(time * 2 + i * 0.05);
      const falloff = 1 - (i / numBars) * 0.7;
      const noise = p.noise(i * 0.2, time * 2);
      spectrum[i] = p.abs(base * falloff * noise);
    }
  };

  p.draw = () => {
    p.background(20);
    generateSimulatedAudio();

    p.translate(p.width / 2, p.height / 2);

    // Draw circular spectrum
    for (let i = 0; i < numBars; i++) {
      const angle = p.map(i, 0, numBars, 0, p.TWO_PI);
      const r = 100 + spectrum[i] * 200;
      const x1 = p.cos(angle) * 100;
      const y1 = p.sin(angle) * 100;
      const x2 = p.cos(angle) * r;
      const y2 = p.sin(angle) * r;

      const hue = p.map(i, 0, numBars, 180, 360);
      p.stroke(hue, 80, 90, 80);
      p.strokeWeight(3);
      p.line(x1, y1, x2, y2);

      // Mirror
      p.line(-x1, -y1, -x2, -y2);
    }

    // Draw waveform ring
    p.strokeWeight(2);
    p.beginShape();
    for (let i = 0; i < numBars; i++) {
      const angle = p.map(i, 0, numBars, 0, p.TWO_PI);
      const r = 80 + waveform[i] * 50;
      const x = p.cos(angle) * r;
      const y = p.sin(angle) * r;

      const hue = (p.frameCount + i * 5) % 360;
      p.stroke(hue, 70, 100, 60);
      p.vertex(x, y);
    }
    p.endShape(p.CLOSE);

    // Draw center circle
    const avgSpectrum = spectrum.reduce((a, b) => a + b, 0) / numBars;
    const pulseSize = 50 + avgSpectrum * 100;

    p.noStroke();
    p.fill(280, 70, 90, 30);
    p.ellipse(0, 0, pulseSize * 1.5);
    p.fill(200, 70, 100, 50);
    p.ellipse(0, 0, pulseSize);

    // Reset translation for text
    p.resetMatrix();

    // Draw instruction
    p.fill(255, 50);
    p.textSize(14);
    p.textAlign(p.CENTER);
    p.text('Simulated audio visualization - Click to change pattern', p.width / 2, p.height - 30);
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  p.mousePressed = () => {
    // Add some randomness to the pattern
    time += p.random(p.PI);
  };
};

export default audioReactiveSketch;
