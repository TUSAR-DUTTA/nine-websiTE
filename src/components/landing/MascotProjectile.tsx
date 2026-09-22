import React, { useEffect, useState, useRef, useCallback } from 'react';
import { soundFx } from '@/utils/audio';

interface ProjectileState {
  id: number;
  startX: number;
  startY: number;
  peakY: number;
  endX: number;
  endY: number;
  duration: number;
  rotation: number;
  image: string;
  label: string;
}

const PROJECTILE_OPTIONS = [
  { image: '/assets/mascot_main.webp', label: 'STILL ALIVE! 🚀' },
  { image: '/assets/mascot_head_favicon.webp', label: 'NO DIE TODAY 😼' },
  { image: '/assets/mascot_moonwatcher.webp', label: 'LOOKING AT MOON 🌕' },
  { image: '/assets/meme_wallstreet_suit.webp', label: 'NOT THE SAME 👔' },
  { image: '/assets/meme_gatsby_toast.webp', label: 'TOAST TO SHORTS! 🥂' },
  { image: '/assets/meme_strawberry_zen.webp', label: 'NOM NOM BERRY 🍓' },
  { image: '/assets/meme_baby_hi.webp', label: 'HI! 👋' },
];

export const MascotProjectile: React.FC = () => {
  const [projectile, setProjectile] = useState<ProjectileState | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const elementRef = useRef<HTMLDivElement | null>(null);

  const launchCat = useCallback(() => {
    // Check prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const fromLeft = Math.random() > 0.5;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    const startX = fromLeft ? -100 : screenW + 100;
    const endX = fromLeft ? screenW + 150 : -150;
    const startY = screenH * (0.6 + Math.random() * 0.3);
    const endY = screenH * (0.4 + Math.random() * 0.4);
    const peakY = screenH * (0.1 + Math.random() * 0.2); // Parabolic peak

    const selected = PROJECTILE_OPTIONS[Math.floor(Math.random() * PROJECTILE_OPTIONS.length)];

    const newProj: ProjectileState = {
      id: Date.now(),
      startX,
      startY,
      peakY,
      endX,
      endY,
      duration: 2200 + Math.random() * 600, // 2.2 - 2.8 seconds
      rotation: fromLeft ? 720 : -720,
      image: selected.image,
      label: selected.label,
    };

    setProjectile(newProj);
    startTimeRef.current = performance.now();
    soundFx.playBoing();
    soundFx.playMeow();
  }, []);

  // Periodic automatic launches (every 18-26 seconds)
  useEffect(() => {
    const scheduleNext = () => {
      const delay = 18000 + Math.random() * 8000;
      return setTimeout(() => {
        launchCat();
        timer = scheduleNext();
      }, delay);
    };

    let timer = scheduleNext();

    // Listen for custom trigger event
    const handleTrigger = () => launchCat();
    window.addEventListener('nine:launch-cat', handleTrigger);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('nine:launch-cat', handleTrigger);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [launchCat]);

  // Parabolic Physics Render Loop
  useEffect(() => {
    if (!projectile) return;

    const updateFrame = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / projectile.duration, 1);

      if (elementRef.current) {
        // Linear X interpolation
        const currentX = projectile.startX + (projectile.endX - projectile.startX) * progress;

        // Quadratic Bezier curve for Y: (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
        const t = progress;
        const currentY =
          Math.pow(1 - t, 2) * projectile.startY +
          2 * (1 - t) * t * projectile.peakY +
          Math.pow(t, 2) * projectile.endY;

        // Squash & stretch physics based on arc vertical velocity
        const rot = projectile.rotation * t;
        const squashY = 1 + Math.sin(t * Math.PI) * 0.15;
        const squashX = 1 - Math.sin(t * Math.PI) * 0.1;

        elementRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) rotate(${rot}deg) scale(${squashX}, ${squashY})`;
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(updateFrame);
      } else {
        setProjectile(null);
      }
    };

    animFrameRef.current = requestAnimationFrame(updateFrame);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [projectile]);

  if (!projectile) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      <div
        ref={elementRef}
        className="absolute top-0 left-0 will-change-transform filter drop-shadow-[0_8px_16px_rgba(255,107,157,0.5)]"
        style={{ width: '80px', height: '80px' }}
      >
        <img
          src={projectile.image}
          alt="Flying NINE Mascot"
          className="w-full h-full object-contain"
          loading="eager"
        />
        {/* Playful mini speech bubble or comet tail */}
        <div className="absolute -bottom-2 -left-6 bg-[#00e676] text-black font-['Titan_One'] text-[10px] px-2 py-0.5 rounded-full border border-black shadow-[2px_2px_0px_#000] rotate-[-12deg] whitespace-nowrap">
          {projectile.label}
        </div>
      </div>
    </div>
  );
};
