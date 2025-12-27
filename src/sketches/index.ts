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
};

export function getSketch(id: string): Sketch | undefined {
  return sketches[id];
}
