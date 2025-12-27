import type { Sketch } from '@/components/P5Wrapper';

import flowFieldsSketch from './flowFields';
import physarumSketch from './physarum';
import reactionDiffusionSketch from './reactionDiffusion';
import strangeAttractorsSketch from './strangeAttractors';
import recursiveSubdivisionSketch from './recursiveSubdivision';
import circlePackingSketch from './circlePacking';
import kineticTypographySketch from './kineticTypography';
import audioReactiveSketch from './audioReactive';
import shaderArtSketch from './shaderArt';
import vectorMorphingSketch from './vectorMorphing';
import constellationSketch from './constellation';
import voronoiSketch from './voronoi';
import wireframeTerrainSketch from './wireframeTerrain';
import magneticGridSketch from './magneticGrid';
import liquidBlobsSketch from './liquidBlobs';
import asciiRainSketch from './asciiRain';
import cursorTrailSketch from './cursorTrail';
import parallaxParticlesSketch from './parallaxParticles';
import geometricWaveSketch from './geometricWave';
import glitchEffectSketch from './glitchEffect';

export const sketches: Record<string, Sketch> = {
  'flow-fields': flowFieldsSketch,
  'physarum': physarumSketch,
  'reaction-diffusion': reactionDiffusionSketch,
  'strange-attractors': strangeAttractorsSketch,
  'recursive-subdivision': recursiveSubdivisionSketch,
  'circle-packing': circlePackingSketch,
  'kinetic-typography': kineticTypographySketch,
  'audio-reactive': audioReactiveSketch,
  'shader-art': shaderArtSketch,
  'vector-morphing': vectorMorphingSketch,
  'constellation': constellationSketch,
  'voronoi': voronoiSketch,
  'wireframe-terrain': wireframeTerrainSketch,
  'magnetic-grid': magneticGridSketch,
  'liquid-blobs': liquidBlobsSketch,
  'ascii-rain': asciiRainSketch,
  'cursor-trail': cursorTrailSketch,
  'parallax-particles': parallaxParticlesSketch,
  'geometric-wave': geometricWaveSketch,
  'glitch-effect': glitchEffectSketch,
};

export function getSketch(id: string): Sketch | undefined {
  return sketches[id];
}
