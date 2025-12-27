'use client';

import { useRef, useEffect } from 'react';
import type p5 from 'p5';

export type Sketch = (p: p5) => void;

interface P5WrapperProps {
  sketch: Sketch;
  className?: string;
}

export default function P5Wrapper({ sketch, className = '' }: P5WrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  useEffect(() => {
    let p5Constructor: typeof p5;

    const initP5 = async () => {
      const p5Module = await import('p5');
      p5Constructor = p5Module.default;

      if (containerRef.current && !p5InstanceRef.current) {
        p5InstanceRef.current = new p5Constructor(sketch, containerRef.current);
      }
    };

    initP5();

    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [sketch]);

  return <div ref={containerRef} className={className} />;
}
