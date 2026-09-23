'use client';

import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from '@/lib/sound';

export type CatActionType =
  | 'idle'
  | 'meow'
  | 'walk'
  | 'run'
  | 'stretch'
  | 'sitting'
  | 'laying';

interface ActionConfig {
  fileSuffix: string;
  frames: number;
  frameDelayMs: number;
  loop: boolean;
}

const ACTION_CONFIGS: Record<CatActionType, ActionConfig> = {
  idle: { fileSuffix: 'Idle.png', frames: 10, frameDelayMs: 110, loop: true },
  meow: { fileSuffix: 'Meow.png', frames: 4, frameDelayMs: 140, loop: false },
  walk: { fileSuffix: 'Walk.png', frames: 8, frameDelayMs: 100, loop: true },
  run: { fileSuffix: 'Run.png', frames: 8, frameDelayMs: 75, loop: true },
  stretch: { fileSuffix: 'Stretching.png', frames: 13, frameDelayMs: 110, loop: false },
  sitting: { fileSuffix: 'Sitting.png', frames: 1, frameDelayMs: 500, loop: true },
  laying: { fileSuffix: 'Laying.png', frames: 8, frameDelayMs: 150, loop: true },
};

interface PixelCatAnimatorProps {
  catId: number; // 1 to 6
  action?: CatActionType;
  size?: number; // pixel width/height (default: 80)
  className?: string;
  showControls?: boolean;
  interactiveMeowOnClick?: boolean;
  onActionComplete?: () => void;
  speedMultiplier?: number;
}

export function PixelCatAnimator({
  catId = 1,
  action = 'idle',
  size = 80,
  className = '',
  showControls = false,
  interactiveMeowOnClick = true,
  onActionComplete,
  speedMultiplier = 1,
}: PixelCatAnimatorProps) {
  // Normalize catId between 1 and 6
  const validCatId = Math.min(6, Math.max(1, Math.round(catId) || 1));

  const [currentAction, setCurrentAction] = useState<CatActionType>(action);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [vfxFrame, setVfxFrame] = useState<number>(0);
  const [isMeowBursting, setIsMeowBursting] = useState<boolean>(false);

  // Sync external action prop if changed
  useEffect(() => {
    setCurrentAction(action);
    setCurrentFrame(0);
  }, [action]);

  const config = ACTION_CONFIGS[currentAction] || ACTION_CONFIGS.idle;
  const spriteSrc = `/assets/animations/pet-cats/Cat-${validCatId}/Cat-${validCatId}-${config.fileSuffix}`;

  // Main sprite frame stepper
  useEffect(() => {
    if (config.frames <= 1) {
      setCurrentFrame(0);
      return;
    }

    const intervalTime = Math.max(40, config.frameDelayMs / speedMultiplier);
    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        const next = prev + 1;
        if (next >= config.frames) {
          if (!config.loop) {
            // Action finished
            if (onActionComplete) {
              onActionComplete();
            }
            // If it was a temporary meow or stretch, return to idle
            if (currentAction === 'meow' || currentAction === 'stretch') {
              setTimeout(() => {
                setCurrentAction('idle');
                setIsMeowBursting(false);
              }, 50);
            }
            return config.frames - 1;
          }
          return 0;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [currentAction, config, speedMultiplier, onActionComplete]);

  // Meow VFX frame stepper (3 frames: 0, 1, 2)
  useEffect(() => {
    if (currentAction !== 'meow') {
      setVfxFrame(0);
      return;
    }

    const vfxInterval = setInterval(() => {
      setVfxFrame((prev) => (prev + 1) % 3);
    }, 120);

    return () => clearInterval(vfxInterval);
  }, [currentAction]);

  // Interactive Click Animation
  const handleCatClick = (e: React.MouseEvent) => {
    if (!interactiveMeowOnClick) return;
    e.stopPropagation();

    // Subtle electronic click sound
    soundManager.playClick();

    // Trigger action animation
    setCurrentAction('meow');
    setCurrentFrame(0);
    setIsMeowBursting(true);
  };

  const handleActionSelect = (newAction: CatActionType, e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playClick();
    if (newAction === 'meow') {
      setIsMeowBursting(true);
    } else {
      setIsMeowBursting(false);
    }
    setCurrentAction(newAction);
    setCurrentFrame(0);
  };

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      {/* Sprite Viewport container */}
      <div
        onClick={handleCatClick}
        title={interactiveMeowOnClick ? `Click Cat #${validCatId} to animate!` : undefined}
        className={`relative select-none flex items-center justify-center ${
          interactiveMeowOnClick ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : ''
        }`}
        style={{
          width: size,
          height: size,
        }}
      >
        {/* Animated Meow VFX Bubble (cut from Meow-VFX.png: 48x16 -> 3 frames of 16x16) */}
        {(currentAction === 'meow' || isMeowBursting) && (
          <div
            className="absolute -top-3 right-0 z-20 pointer-events-none filter drop-shadow-[0_0_6px_rgba(0,255,102,0.8)] animate-bounce"
            style={{
              width: 24,
              height: 24,
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
                left: `-${vfxFrame * 24}px`,
                width: `${3 * 24}px`,
                height: '24px',
                maxWidth: 'none',
                maxHeight: 'none',
                imageRendering: 'pixelated',
                pointerEvents: 'none',
              }}
            />
          </div>
        )}

        {/* The Frame-Clipped Cat Animation */}
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
            src={spriteSrc}
            alt={`Cat ${validCatId} ${currentAction}`}
            style={{
              position: 'absolute',
              top: 0,
              left: `-${currentFrame * size}px`,
              width: `${config.frames * size}px`,
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

      {/* Optional Interactive Action Pills (e.g. for preview chamber) */}
      {showControls && (
        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1 font-mono text-[10px]">
          {(['idle', 'meow', 'walk', 'run', 'stretch', 'sitting', 'laying'] as CatActionType[]).map((act) => {
            const isActive = currentAction === act;
            return (
              <button
                key={act}
                onClick={(e) => handleActionSelect(act, e)}
                className={`px-2 py-0.5 rounded uppercase font-bold transition-all ${
                  isActive
                    ? 'bg-nine-green text-black shadow-[0_0_10px_rgba(0,255,102,0.3)]'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
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
