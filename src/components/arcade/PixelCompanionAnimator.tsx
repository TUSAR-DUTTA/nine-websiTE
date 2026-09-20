'use client';

import React, { useState, useEffect } from 'react';
import { soundManager } from '@/lib/sound';

export type CompanionType = 'cat' | 'monster' | 'fairy';

export interface PixelCompanionProps {
  type?: CompanionType;
  catId?: number; // 1 to 6
  monsterId?: string; // 'doux' | 'mort' | 'tard' | 'vita' | 'loki' | 'kira' | 'nico' | 'olaf'
  fairyId?: number; // 1 to 3
  action?: string;
  size?: number; // width/height in px (e.g. 110 or 160)
  className?: string;
  interactive?: boolean;
  showControls?: boolean;
  onActionComplete?: () => void;
  soundMood?: 'meow' | 'chirp' | 'purr' | 'warcry';
}

interface FrameConfig {
  src: string;
  frameWidth: number;
  frameHeight: number;
  totalFrames: number;
  frameDelayMs: number;
  loop: boolean;
}

export function PixelCompanionAnimator({
  type = 'cat',
  catId = 1,
  monsterId = 'doux',
  fairyId = 1,
  action = 'idle',
  size = 110,
  className = '',
  interactive = true,
  showControls = false,
  onActionComplete,
  soundMood = 'meow',
}: PixelCompanionProps) {
  const [currentAction, setCurrentAction] = useState<string>(action);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [vfxFrame, setVfxFrame] = useState<number>(0);
  const [isMeowActive, setIsMeowActive] = useState<boolean>(false);

  // Sync external action prop
  useEffect(() => {
    setCurrentAction(action);
    setCurrentFrame(0);
  }, [action]);

  // Compute sprite configuration based on companion type and action
  const getSpriteConfig = (): FrameConfig => {
    if (type === 'cat') {
      const validCatId = Math.min(6, Math.max(1, Math.round(catId) || 1));
      const baseDir = `/assets/animations/pet-cats/Cat-${validCatId}`;

      switch (currentAction) {
        case 'meow':
          return {
            src: `${baseDir}/Cat-${validCatId}-Meow.png`,
            frameWidth: 50,
            frameHeight: 50,
            totalFrames: 4,
            frameDelayMs: 140,
            loop: false,
          };
        case 'walk':
          return {
            src: `${baseDir}/Cat-${validCatId}-Walk.png`,
            frameWidth: 50,
            frameHeight: 50,
            totalFrames: 8,
            frameDelayMs: 100,
            loop: true,
          };
        case 'run':
          return {
            src: `${baseDir}/Cat-${validCatId}-Run.png`,
            frameWidth: 50,
            frameHeight: 50,
            totalFrames: 8,
            frameDelayMs: 75,
            loop: true,
          };
        case 'stretch':
          return {
            src: `${baseDir}/Cat-${validCatId}-Stretching.png`,
            frameWidth: 50,
            frameHeight: 50,
            totalFrames: 13,
            frameDelayMs: 110,
            loop: false,
          };
        case 'laying':
          return {
            src: `${baseDir}/Cat-${validCatId}-Laying.png`,
            frameWidth: 50,
            frameHeight: 50,
            totalFrames: 8,
            frameDelayMs: 150,
            loop: true,
          };
        case 'sitting':
          return {
            src: `${baseDir}/Cat-${validCatId}-Sitting.png`,
            frameWidth: 50,
            frameHeight: 50,
            totalFrames: 1,
            frameDelayMs: 500,
            loop: true,
          };
        case 'idle':
        default:
          return {
            src: `${baseDir}/Cat-${validCatId}-Idle.png`,
            frameWidth: 50,
            frameHeight: 50,
            totalFrames: 10,
            frameDelayMs: 110,
            loop: true,
          };
      }
    }

    if (type === 'monster') {
      const validMonster = monsterId || 'doux';
      const baseDir = `/assets/animations/monsters/${validMonster}`;

      switch (currentAction) {
        case 'move':
        case 'walk':
        case 'run':
          return {
            src: `${baseDir}/move.png`,
            frameWidth: 24,
            frameHeight: 24,
            totalFrames: 6,
            frameDelayMs: 100,
            loop: true,
          };
        case 'kick':
          return {
            src: `${baseDir}/kick.png`,
            frameWidth: 24,
            frameHeight: 24,
            totalFrames: 3,
            frameDelayMs: 130,
            loop: false,
          };
        case 'bite':
          return {
            src: `${baseDir}/bite.png`,
            frameWidth: 24,
            frameHeight: 24,
            totalFrames: 3,
            frameDelayMs: 130,
            loop: false,
          };
        case 'jump':
          return {
            src: `${baseDir}/jump.png`,
            frameWidth: 24,
            frameHeight: 24,
            totalFrames: 4,
            frameDelayMs: 110,
            loop: false,
          };
        case 'dash':
          return {
            src: `${baseDir}/dash.png`,
            frameWidth: 24,
            frameHeight: 24,
            totalFrames: 6,
            frameDelayMs: 80,
            loop: true,
          };
        case 'idle':
        default:
          return {
            src: `${baseDir}/idle.png`,
            frameWidth: 24,
            frameHeight: 24,
            totalFrames: 3,
            frameDelayMs: 160,
            loop: true,
          };
      }
    }

    // Fairy
    const fId = Math.min(3, Math.max(1, fairyId || 1));
    return {
      src: `/assets/animations/fairy/Fairy ${fId}.png`,
      frameWidth: 32,
      frameHeight: 32,
      totalFrames: 8,
      frameDelayMs: 100,
      loop: true,
    };
  };

  const config = getSpriteConfig();

  // Frame Stepper
  useEffect(() => {
    if (config.totalFrames <= 1) {
      setCurrentFrame(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        const next = prev + 1;
        if (next >= config.totalFrames) {
          if (!config.loop) {
            if (onActionComplete) onActionComplete();
            // Return to idle after temporary action
            setTimeout(() => {
              setCurrentAction('idle');
              setIsMeowActive(false);
            }, 60);
            return config.totalFrames - 1;
          }
          return 0;
        }
        return next;
      });
    }, config.frameDelayMs);

    return () => clearInterval(interval);
  }, [config.src, config.totalFrames, config.frameDelayMs, config.loop]);

  // Meow VFX Stepper for Cats
  useEffect(() => {
    if (type !== 'cat' || currentAction !== 'meow') {
      setVfxFrame(0);
      return;
    }

    const vfxInterval = setInterval(() => {
      setVfxFrame((prev) => (prev + 1) % 3);
    }, 120);

    return () => clearInterval(vfxInterval);
  }, [type, currentAction]);

  // Click Handler: Triggers subtle electronic click + action animation (no annoying meows)
  const handleClick = (e: React.MouseEvent) => {
    if (!interactive) return;
    e.stopPropagation();

    if (type === 'cat') {
      soundManager.playClick();
      setCurrentAction(currentAction === 'stretch' ? 'walk' : 'stretch');
      setCurrentFrame(0);
    } else if (type === 'monster') {
      soundManager.playClick();
      setCurrentAction(currentAction === 'kick' ? 'bite' : 'kick');
      setCurrentFrame(0);
    } else if (type === 'fairy') {
      soundManager.playClick();
    }
  };

  const handleActionSelect = (newAct: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playClick();
    setCurrentAction(newAct);
    setCurrentFrame(0);
  };

  const availableActions =
    type === 'cat'
      ? ['idle', 'walk', 'run', 'stretch', 'laying']
      : type === 'monster'
      ? ['idle', 'move', 'kick', 'bite', 'jump']
      : ['idle'];

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      {/* Sliced Frame Container */}
      <div
        onClick={handleClick}
        title={interactive ? 'Click to interact!' : undefined}
        className={`relative flex items-center justify-center ${
          interactive ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : ''
        }`}
        style={{
          width: size,
          height: size,
        }}
      >
        {/* Animated Meow VFX Bubble for Cats (3 frames of 16x16) */}
        {type === 'cat' && (currentAction === 'meow' || isMeowActive) && (
          <div
            className="absolute -top-3 right-0 z-20 pointer-events-none filter drop-shadow-[0_0_8px_rgba(0,255,102,0.9)] animate-bounce"
            style={{
              width: Math.round(size * 0.3),
              height: Math.round(size * 0.3),
              overflow: 'hidden',
              imageRendering: 'pixelated',
            }}
          >
            <img
              src="/assets/animations/pet-cats/Meow-VFX/Meow-VFX.png"
              alt="Meow Note"
              style={{
                position: 'absolute',
                top: 0,
                left: `-${vfxFrame * Math.round(size * 0.3)}px`,
                width: `${3 * Math.round(size * 0.3)}px`,
                height: `${Math.round(size * 0.3)}px`,
                maxWidth: 'none',
                maxHeight: 'none',
                imageRendering: 'pixelated',
                pointerEvents: 'none',
              }}
            />
          </div>
        )}

        {/* Pixel Pedestal / Shadow Base */}
        <div
          className="absolute bottom-1 w-3/4 h-2 rounded-full bg-black/40 blur-[2px] pointer-events-none"
        />

        {/* The Frame-Sliced Sprite Viewport */}
        <div
          style={{
            width: size,
            height: size,
            overflow: 'hidden',
            position: 'relative',
            imageRendering: 'pixelated',
          }}
        >
          <img
            src={config.src}
            alt="Companion Sprite"
            style={{
              position: 'absolute',
              top: 0,
              left: `-${currentFrame * size}px`,
              width: `${config.totalFrames * size}px`,
              height: `${size}px`,
              maxWidth: 'none',
              maxHeight: 'none',
              imageRendering: 'pixelated',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          />
        </div>
      </div>

      {/* Action Switcher Bar */}
      {showControls && availableActions.length > 1 && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1 font-mono text-[10px]">
          {availableActions.map((act) => {
            const isActive = currentAction === act;
            return (
              <button
                key={act}
                onClick={(e) => handleActionSelect(act, e)}
                className={`px-2 py-0.5 rounded uppercase font-bold transition-all ${
                  isActive
                    ? 'bg-nine-green text-black shadow-[0_0_10px_rgba(0,255,102,0.4)]'
                    : 'bg-zinc-850 text-zinc-400 hover:text-white hover:bg-zinc-750 border border-zinc-750'
                }`}
              >
                {act}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
