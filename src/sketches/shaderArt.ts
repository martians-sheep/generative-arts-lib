import type p5 from 'p5';
import type { Sketch } from '@/components/P5Wrapper';

const shaderArtSketch: Sketch = (p: p5) => {
  let theShader: p5.Shader | null = null;
  let shaderReady = false;

  const vertexShader = `
    attribute vec3 aPosition;
    attribute vec2 aTexCoord;
    varying vec2 vTexCoord;

    void main() {
      vTexCoord = aTexCoord;
      vec4 positionVec4 = vec4(aPosition, 1.0);
      positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
      gl_Position = positionVec4;
    }
  `;

  const fragmentShader = `
    precision mediump float;

    varying vec2 vTexCoord;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_mouse;

    vec3 palette(float t) {
      vec3 a = vec3(0.5, 0.5, 0.5);
      vec3 b = vec3(0.5, 0.5, 0.5);
      vec3 c = vec3(1.0, 1.0, 1.0);
      vec3 d = vec3(0.263, 0.416, 0.557);
      return a + b * cos(6.28318 * (c * t + d));
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
      vec2 uv0 = uv;
      vec3 finalColor = vec3(0.0);

      for (float i = 0.0; i < 4.0; i++) {
        uv = fract(uv * 1.5) - 0.5;

        float d = length(uv) * exp(-length(uv0));

        vec3 col = palette(length(uv0) + i * 0.4 + u_time * 0.4);

        d = sin(d * 8.0 + u_time) / 8.0;
        d = abs(d);

        d = pow(0.01 / d, 1.2);

        finalColor += col * d;
      }

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
    p.noStroke();

    try {
      theShader = p.createShader(vertexShader, fragmentShader);
      shaderReady = true;
    } catch (e) {
      console.error('Shader compilation failed:', e);
      shaderReady = false;
    }
  };

  p.draw = () => {
    if (shaderReady && theShader) {
      p.shader(theShader);
      theShader.setUniform('u_resolution', [p.width, p.height]);
      theShader.setUniform('u_time', p.millis() / 1000.0);
      theShader.setUniform('u_mouse', [p.mouseX / p.width, 1.0 - p.mouseY / p.height]);
      p.rect(0, 0, p.width, p.height);
    } else {
      // Fallback if shader fails
      p.background(20);
      p.fill(255);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(20);
      p.text('Shader visualization', 0, 0);

      // Draw a simple pattern as fallback
      const time = p.millis() / 1000;
      for (let i = 0; i < 50; i++) {
        const angle = (i / 50) * p.TWO_PI + time;
        const r = 100 + p.sin(time * 2 + i * 0.2) * 50;
        const x = p.cos(angle) * r;
        const y = p.sin(angle) * r;
        const hue = (i * 7 + p.frameCount) % 360;
        p.fill(p.color(`hsl(${hue}, 70%, 50%)`));
        p.noStroke();
        p.ellipse(x, y, 20 + p.sin(time * 3 + i) * 10);
      }
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};

export default shaderArtSketch;
