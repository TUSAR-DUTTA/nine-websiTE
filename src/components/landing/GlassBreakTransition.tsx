import React, { useEffect, useCallback, useRef } from 'react';
import { soundFx } from '@/utils/audio';

interface GlassBreakTransitionProps {
  onComplete?: () => void;
}

export const GlassBreakTransition: React.FC<GlassBreakTransitionProps> = ({ onComplete }) => {
  const firedRef = useRef(false);

  const triggerBreak = useCallback(
    (clickX: number, clickY: number) => {
      if (firedRef.current) return;
      firedRef.current = true;

      // ── 0. Lock scrolling & overflow ──
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';

      // ── 1. Dark void backdrop (sits behind page content) ──
      const backdrop = document.createElement('div');
      Object.assign(backdrop.style, {
        position: 'fixed',
        inset: '0',
        zIndex: '9990',
        background: '#050507',
        pointerEvents: 'none',
      });
      document.body.appendChild(backdrop);

      // ── 2. Crack lines SVG overlay ──
      const crackEl = buildCrackOverlay(clickX, clickY);
      document.body.appendChild(crackEl);

      // ── 3. Short screen shake ──
      document.body.style.animation = 'glass-shake 0.22s ease both';
      setTimeout(() => {
        document.body.style.animation = '';
      }, 250);

      // ── 4. Play crisp glass crack sound ──
      soundFx.playGlassShatter();

      // ── 5. Animate real page sections as shards ──
      requestAnimationFrame(() => {
        const appWrapper =
          document.getElementById('landing-layer-root') ||
          document.getElementById('root')?.firstElementChild ||
          document.body;

        if (!appWrapper || !(appWrapper instanceof HTMLElement)) return;

        // Lift app above backdrop
        appWrapper.style.position = 'relative';
        appWrapper.style.zIndex = '9995';

        // Collect every major visible section
        const sections: HTMLElement[] = [];
        const header = appWrapper.querySelector('header');
        const main = appWrapper.querySelector('main');
        const footer = appWrapper.querySelector('footer');

        if (header) sections.push(header as HTMLElement);
        if (main) {
          // Each child of <main> becomes its own shard
          Array.from(main.children).forEach((child) => {
            if (child instanceof HTMLElement) sections.push(child);
          });
        }
        if (footer) sections.push(footer as HTMLElement);

        // Fallback: if no semantic elements found, take direct children
        if (sections.length === 0) {
          Array.from(appWrapper.children).forEach((child) => {
            if (child instanceof HTMLElement && child.tagName !== 'CANVAS') {
              sections.push(child);
            }
          });
        }

        // ── Apply shard physics to each section ──
        sections.forEach((section) => {
          const rect = section.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;

          // Direction away from impact
          const dx = cx - clickX;
          const dy = cy - clickY;
          const dist = Math.hypot(dx, dy) || 1;

          // Closer = stronger blast
          const force = Math.max(60, 200 - dist * 0.12);
          const tx = (dx / dist) * force + (Math.random() - 0.5) * 40;
          const ty = (dy / dist) * force + 30 + Math.random() * 50; // gravity bias
          const rot = (Math.random() - 0.5) * 18;

          // Stagger by distance from impact (closer pieces fly first)
          const delay = Math.min(dist * 0.25, 120);

          section.style.willChange = 'transform, opacity';
          section.style.transition = [
            `transform 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
            `opacity 0.45s ease-out ${delay + 80}ms`,
          ].join(', ');
          section.style.transformOrigin = 'center center';

          // Trigger on next frame so the transition actually fires
          requestAnimationFrame(() => {
            section.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(0.96)`;
            section.style.opacity = '0';
          });
        });
      });

      // ── 6. Fade crack overlay ──
      setTimeout(() => {
        crackEl.style.opacity = '0';
      }, 350);

      // ── 7. Transition to Community Terminal ──
      setTimeout(() => {
        try {
          backdrop.remove();
          crackEl.remove();
        } catch {}
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';

        if (onComplete) {
          onComplete();
        } else {
          // Fallback if no callback
          window.location.hash = '#terminal';
        }
      }, 850);
    },
    [onComplete],
  );

  // ── Listen for the global break-glass event ──
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ clientX?: number; clientY?: number }>).detail || {};
      triggerBreak(
        detail.clientX ?? (typeof window !== 'undefined' ? window.innerWidth / 2 : 500),
        detail.clientY ?? (typeof window !== 'undefined' ? window.innerHeight / 2 : 400),
      );
    };
    window.addEventListener('nine:break-glass', handler);
    return () => window.removeEventListener('nine:break-glass', handler);
  }, [triggerBreak]);

  return null;
};

/* ─────────────────────────────────────────────────────────
   Lightweight SVG crack-line overlay
   ───────────────────────────────────────────────────────── */
function buildCrackOverlay(originX: number, originY: number): HTMLDivElement {
  const wrap = document.createElement('div');
  Object.assign(wrap.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '10001',
    pointerEvents: 'none',
    transition: 'opacity 0.5s ease-out',
  });

  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.cssText = 'position:absolute;inset:0;';

  // Glow filter
  const defs = document.createElementNS(ns, 'defs');
  const filter = document.createElementNS(ns, 'filter');
  filter.setAttribute('id', 'glow');
  const blur = document.createElementNS(ns, 'feGaussianBlur');
  blur.setAttribute('stdDeviation', '1.5');
  blur.setAttribute('result', 'b');
  const merge = document.createElementNS(ns, 'feMerge');
  const mn1 = document.createElementNS(ns, 'feMergeNode');
  mn1.setAttribute('in', 'b');
  const mn2 = document.createElementNS(ns, 'feMergeNode');
  mn2.setAttribute('in', 'SourceGraphic');
  merge.appendChild(mn1);
  merge.appendChild(mn2);
  filter.appendChild(blur);
  filter.appendChild(merge);
  defs.appendChild(filter);
  svg.appendChild(defs);

  const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const height = typeof window !== 'undefined' ? window.innerHeight : 800;
  const maxLen = Math.hypot(width, height);
  const numRays = 12 + Math.floor(Math.random() * 6);

  for (let i = 0; i < numRays; i++) {
    const baseAngle = (i / numRays) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
    const pts: string[] = [`${originX},${originY}`];
    let cx = originX;
    let cy = originY;
    const length = maxLen * (0.25 + Math.random() * 0.75);
    let traveled = 0;

    while (traveled < length) {
      const step = 18 + Math.random() * 30;
      traveled += step;
      cx += Math.cos(baseAngle + (Math.random() - 0.5) * 0.35) * step;
      cy += Math.sin(baseAngle + (Math.random() - 0.5) * 0.35) * step;
      pts.push(`${cx.toFixed(0)},${cy.toFixed(0)}`);
    }

    const line = document.createElementNS(ns, 'polyline');
    line.setAttribute('points', pts.join(' '));
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke', 'rgba(255,255,255,0.55)');
    line.setAttribute('stroke-width', `${0.8 + Math.random() * 1.2}`);
    line.setAttribute('filter', 'url(#glow)');
    svg.appendChild(line);

    // Branch cracks
    if (Math.random() > 0.5 && pts.length > 3) {
      const bi = 2 + Math.floor(Math.random() * (pts.length - 3));
      const [bx, by] = pts[bi].split(',').map(Number);
      const bAngle = baseAngle + (Math.random() - 0.5) * 1.2;
      const bPts = [`${bx},${by}`];
      let bcx = bx, bcy = by, bt = 0;
      const bLen = 20 + Math.random() * 70;
      while (bt < bLen) {
        const s = 8 + Math.random() * 18;
        bt += s;
        bcx += Math.cos(bAngle + (Math.random() - 0.5) * 0.5) * s;
        bcy += Math.sin(bAngle + (Math.random() - 0.5) * 0.5) * s;
        bPts.push(`${bcx.toFixed(0)},${bcy.toFixed(0)}`);
      }
      const branch = document.createElementNS(ns, 'polyline');
      branch.setAttribute('points', bPts.join(' '));
      branch.setAttribute('fill', 'none');
      branch.setAttribute('stroke', 'rgba(255,255,255,0.3)');
      branch.setAttribute('stroke-width', '0.7');
      branch.setAttribute('filter', 'url(#glow)');
      svg.appendChild(branch);
    }
  }

  // Bright impact dot
  const dot = document.createElementNS(ns, 'circle');
  dot.setAttribute('cx', String(originX));
  dot.setAttribute('cy', String(originY));
  dot.setAttribute('r', '4');
  dot.setAttribute('fill', 'rgba(255,255,255,0.85)');
  dot.setAttribute('filter', 'url(#glow)');
  svg.appendChild(dot);

  wrap.appendChild(svg);
  return wrap;
}
