import { artworks } from '@/lib/artworks';
import ArtCard from '@/components/ArtCard';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="relative overflow-hidden border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950">
        <div className="absolute inset-0 opacity-30">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(120, 0, 255, 0.3) 0%, transparent 50%),
                               radial-gradient(circle at 80% 50%, rgba(0, 200, 255, 0.3) 0%, transparent 50%)`,
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <h1 className="text-center text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Generative Art
            </span>
            <br />
            <span className="text-white">Gallery</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-zinc-400">
            p5.jsを使用したインタラクティブなジェネラティブアート作品集。
            <br className="hidden sm:inline" />
            クリックやマウスの動きでアートが変化します。
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-zinc-800/50 px-4 py-2 text-sm text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Easy
            </div>
            <div className="flex items-center gap-2 rounded-full bg-zinc-800/50 px-4 py-2 text-sm text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-yellow-500" />
              Medium
            </div>
            <div className="flex items-center gap-2 rounded-full bg-zinc-800/50 px-4 py-2 text-sm text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Hard
            </div>
          </div>
        </div>
      </header>

      {/* Gallery Grid */}
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {artworks.map((artwork, index) => (
            <ArtCard key={artwork.id} artwork={artwork} index={index} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-900/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-zinc-500">
            Built with Next.js, p5.js, and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}
