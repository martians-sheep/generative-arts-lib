export interface Artwork {
  id: string;
  title: string;
  titleJa: string;
  description: string;
  descriptionJa: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export const artworks: Artwork[] = [
  {
    id: 'flow-fields',
    title: 'Flow Fields',
    titleJa: 'フローフィールド',
    description: 'Thousands of particles flow through an invisible vector field, creating organic, painterly trails reminiscent of Van Gogh\'s brushwork.',
    descriptionJa: '画面全体に目に見えない「風の流れ」のようなベクトル場を作り、その上を数千個の粒子が移動して軌跡を描くアートです。',
    difficulty: 'easy',
    tags: ['Perlin Noise', 'Particles', 'Organic'],
  },
  {
    id: 'physarum',
    title: 'Physarum Simulation',
    titleJa: 'フィザラム・シミュレーション（粘菌）',
    description: 'Simulating the behavior of slime mold (Physarum polycephalum) as it creates efficient networks, resembling blood vessels or city roads.',
    descriptionJa: '単細胞生物である「粘菌」が餌を求めてネットワークを作る様子を模倣したアルゴリズムです。',
    difficulty: 'hard',
    tags: ['Agent-based', 'Pixel Manipulation', 'Biology'],
  },
  {
    id: 'reaction-diffusion',
    title: 'Reaction-Diffusion',
    titleJa: '反応拡散系',
    description: 'Simulating two chemicals reacting and diffusing (Gray-Scott model), creating patterns seen in zebra stripes, coral, and fingerprints.',
    descriptionJa: '2つの化学物質が反応し合いながら拡散していく様子をシミュレーションします（グレイ・スコット・モデル）。',
    difficulty: 'hard',
    tags: ['Cellular Automata', 'Convolution', 'Mathematics'],
  },
  {
    id: 'strange-attractors',
    title: 'Strange Attractors',
    titleJa: 'ストレンジ・アトラクタ',
    description: 'Visualizing chaotic systems through mathematical equations, revealing butterfly-like structures in 3D space (Lorenz Attractor).',
    descriptionJa: 'カオス理論に基づいた数式を用いて、3次元空間に点を打ち続けることで現れる奇妙な軌道を描画します。',
    difficulty: 'medium',
    tags: ['WEBGL', 'Differential Equations', '3D'],
  },
  {
    id: 'recursive-subdivision',
    title: 'Recursive Subdivision',
    titleJa: '再帰的な分割',
    description: 'Randomly dividing the canvas recursively, creating geometric patterns similar to Mondrian paintings or aerial city views.',
    descriptionJa: '画面をランダムに分割し、分割されたエリアをさらに分割…と繰り返す手法です。',
    difficulty: 'easy',
    tags: ['Recursion', 'Geometry', 'Mondrian'],
  },
  {
    id: 'circle-packing',
    title: 'Circle Packing',
    titleJa: 'サークル・パッキング',
    description: 'Filling space with non-overlapping circles that grow until they touch, creating organic cell-like or bubble patterns.',
    descriptionJa: '円同士が重ならないように、空間が埋まるまで新しい円を配置・成長させ続ける手法です。',
    difficulty: 'medium',
    tags: ['Collision Detection', 'Optimization', 'Organic'],
  },
  {
    id: 'kinetic-typography',
    title: 'Kinetic Typography',
    titleJa: 'キネティック・タイポグラフィ',
    description: 'Interactive text where letter particles react to mouse movement, scattering and reforming dynamically.',
    descriptionJa: '文字を構成する点をパーティクルとして扱い、マウスの動きに反応して弾け飛んだり、元に戻ったりするインタラクティブな文字表現です。',
    difficulty: 'medium',
    tags: ['Typography', 'Physics', 'Interactive'],
  },
  {
    id: 'audio-reactive',
    title: 'Audio Reactive',
    titleJa: 'オーディオ・リアクティブ',
    description: 'Visualizing microphone input or music through pulsating shapes and waveforms that respond to sound frequencies.',
    descriptionJa: 'マイク入力や音楽ファイルの波形・周波数を解析し、ビジュアルに変換します。',
    difficulty: 'medium',
    tags: ['FFT', 'Audio', 'Polar Coordinates'],
  },
  {
    id: 'shader-art',
    title: 'Shader Art',
    titleJa: 'シェーダーアート',
    description: 'Using GLSL shaders for GPU-accelerated effects, enabling fluid simulations and raymarching at high performance.',
    descriptionJa: 'p5.js上でGLSL（シェーダー言語）を動かします。',
    difficulty: 'hard',
    tags: ['GLSL', 'GPU', 'Fragment Shader'],
  },
  {
    id: 'vector-morphing',
    title: 'Vector Morphing',
    titleJa: 'ベクトル・モーフィング',
    description: 'Smoothly transitioning between different shapes by interpolating vertex positions, creating mesmerizing transformations.',
    descriptionJa: 'ある図形から別の図形へ、頂点の座標をスムーズに移動させて変形させます。',
    difficulty: 'easy',
    tags: ['Lerp', 'Animation', 'Shapes'],
  },
];

export function getArtwork(id: string): Artwork | undefined {
  return artworks.find(art => art.id === id);
}
