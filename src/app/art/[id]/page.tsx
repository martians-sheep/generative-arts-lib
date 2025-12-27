'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getArtwork, artworks } from '@/lib/artworks';
import { getSketch } from '@/sketches';

const P5Wrapper = dynamic(() => import('@/components/P5Wrapper'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mx-auto" />
        <p className="text-zinc-400">Loading artwork...</p>
      </div>
    </div>
  ),
});

const difficultyColors = {
  easy: 'bg-green-500',
  medium: 'bg-yellow-500',
  hard: 'bg-red-500',
};

const difficultyLabels = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export default function ArtPage() {
  const params = useParams();
  const id = params.id as string;
  const artwork = getArtwork(id);
  const sketch = getSketch(id);

  if (!artwork || !sketch) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">Artwork Not Found</h1>
          <p className="mt-4 text-zinc-400">The requested artwork does not exist.</p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-full bg-purple-600 px-6 py-3 text-white hover:bg-purple-700 transition-colors"
          >
            Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = artworks.findIndex((a) => a.id === id);
  const prevArt = currentIndex > 0 ? artworks[currentIndex - 1] : null;
  const nextArt = currentIndex < artworks.length - 1 ? artworks[currentIndex + 1] : null;

  return (
    <div className="relative min-h-screen bg-zinc-950">
      {/* Canvas Container */}
      <div className="fixed inset-0">
        <P5Wrapper sketch={sketch} className="h-full w-full" />
      </div>

      {/* Overlay UI */}
      <div className="pointer-events-none fixed inset-0 z-10">
        {/* Top Bar */}
        <div className="pointer-events-auto absolute left-0 right-0 top-0 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="hidden sm:inline">Gallery</span>
            </Link>

            <div className="text-center">
              <h1 className="text-lg font-semibold text-white sm:text-xl">
                {artwork.title}
              </h1>
              <p className="text-sm text-zinc-400">{artwork.titleJa}</p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-sm font-medium text-white ${
                difficultyColors[artwork.difficulty]
              }`}
            >
              {difficultyLabels[artwork.difficulty]}
            </span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pointer-events-auto absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="mx-auto max-w-7xl">
            {/* Description */}
            <div className="mb-4 rounded-xl bg-black/30 p-4 backdrop-blur-sm">
              <p className="text-sm text-zinc-300">{artwork.descriptionJa}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {artwork.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-zinc-800/80 px-3 py-1 text-xs text-zinc-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              {prevArt ? (
                <Link
                  href={`/art/${prevArt.id}`}
                  className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span className="hidden sm:inline">{prevArt.title}</span>
                </Link>
              ) : (
                <div />
              )}

              <p className="text-center text-xs text-zinc-500">
                Click or move mouse to interact
              </p>

              {nextArt ? (
                <Link
                  href={`/art/${nextArt.id}`}
                  className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <span className="hidden sm:inline">{nextArt.title}</span>
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
