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
// Mathematical generative art
import superformulaSketch from './superformula';
import fourierSeriesSketch from './fourierSeries';
import phyllotaxisSketch from './phyllotaxis';
import deJongAttractorSketch from './deJongAttractor';
import maurerRoseSketch from './maurerRose';
import voronoiDelaunaySketch from './voronoiDelaunay';
import complexDomainColoringSketch from './complexDomainColoring';
import chladniPatternsSketch from './chladniPatterns';
import apollonianGasketSketch from './apollonianGasket';
import marchingSquaresSketch from './marchingSquares';
// Nature of Code inspired generative art
import levyFlightSketch from './levyFlight';
import gravitationalAttractorSketch from './gravitationalAttractor';
import doublePendulumSketch from './doublePendulum';
import particlePaintingSketch from './particlePainting';
import autonomousAgentsSketch from './autonomousAgents';
import flockingSketch from './flocking';
import cellularAutomataSketch from './cellularAutomata';
import fractalTreeSketch from './fractalTree';
import geneticAlgorithmSketch from './geneticAlgorithm';
import neuralCreaturesSketch from './neuralCreatures';

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
  // Mathematical generative art
  'superformula': superformulaSketch,
  'fourier-series': fourierSeriesSketch,
  'phyllotaxis': phyllotaxisSketch,
  'de-jong-attractor': deJongAttractorSketch,
  'maurer-rose': maurerRoseSketch,
  'voronoi-delaunay': voronoiDelaunaySketch,
  'complex-domain-coloring': complexDomainColoringSketch,
  'chladni-patterns': chladniPatternsSketch,
  'apollonian-gasket': apollonianGasketSketch,
  'marching-squares': marchingSquaresSketch,
  // Nature of Code inspired generative art
  'levy-flight': levyFlightSketch,
  'gravitational-attractor': gravitationalAttractorSketch,
  'double-pendulum': doublePendulumSketch,
  'particle-painting': particlePaintingSketch,
  'autonomous-agents': autonomousAgentsSketch,
  'flocking': flockingSketch,
  'cellular-automata': cellularAutomataSketch,
  'fractal-tree': fractalTreeSketch,
  'genetic-algorithm': geneticAlgorithmSketch,
  'neural-creatures': neuralCreaturesSketch,
};

export function getSketch(id: string): Sketch | undefined {
  return sketches[id];
}
