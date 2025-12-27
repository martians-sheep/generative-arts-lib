'use client';

import Link from 'next/link';
import type { Artwork } from '@/lib/artworks';

interface ArtCardProps {
  artwork: Artwork;
  index: number;
}

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

export default function ArtCard({ artwork, index }: ArtCardProps) {
  return (
    <Link
      href={`/art/${artwork.id}`}
      className="group relative block overflow-hidden rounded-xl bg-zinc-900 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20"
    >
      {/* Gradient Background */}
      <div
        className="aspect-video w-full"
        style={{
          background: `linear-gradient(${135 + index * 36}deg,
            hsl(${(index * 36) % 360}, 70%, 30%),
            hsl(${(index * 36 + 60) % 360}, 70%, 20%))`,
        }}
      >
        {/* Animated Pattern Overlay */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `radial-gradient(circle at ${30 + index * 10}% ${40 + index * 5}%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
            }}
          />
        </div>

        {/* Preview Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-white/10 p-6 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
            <svg
              className="h-12 w-12 text-white/80"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
            {artwork.title}
          </h3>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${difficultyColors[artwork.difficulty]}`}
          >
            {difficultyLabels[artwork.difficulty]}
          </span>
        </div>

        <p className="mb-3 text-sm text-zinc-400 line-clamp-2">
          {artwork.titleJa}
        </p>

        <div className="flex flex-wrap gap-1">
          {artwork.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 rounded-xl border border-transparent transition-colors duration-300 group-hover:border-purple-500/50" />
    </Link>
  );
}
