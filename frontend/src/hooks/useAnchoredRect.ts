import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

export interface AnchoredRect {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
}

const GAP = 4;
const EDGE_PADDING = 8;
const MIN_HEIGHT = 160;

/**
 * Keeps a floating panel (e.g. an autocomplete dropdown rendered via a
 * portal) anchored directly below the reference input - or above it when
 * there isn't enough room below. Tracks `window.visualViewport` in addition
 * to `resize`/`scroll` so the panel stays correctly placed on mobile when
 * the on-screen keyboard opens/closes and shrinks the visible area; without
 * this, a popup positioned only from `getBoundingClientRect` at focus time
 * can end up looking like it floats mid-screen once the keyboard animation
 * settles.
 */
export function useAnchoredRect(inputRef: RefObject<HTMLElement | null>, open: boolean): AnchoredRect | null {
  const [rect, setRect] = useState<AnchoredRect | null>(null);

  useEffect(() => {
    if (!open) {
      setRect(null);
      return;
    }

    function recompute() {
      const input = inputRef.current;
      if (!input) return;
      const r = input.getBoundingClientRect();
      const viewport = window.visualViewport;
      const visibleTop = viewport ? viewport.offsetTop : 0;
      const visibleHeight = viewport ? viewport.height : window.innerHeight;
      const visibleBottom = visibleTop + visibleHeight;

      const spaceBelow = visibleBottom - (r.bottom + GAP) - EDGE_PADDING;
      const spaceAbove = r.top - visibleTop - GAP - EDGE_PADDING;

      if (spaceBelow >= MIN_HEIGHT || spaceBelow >= spaceAbove) {
        setRect({
          top: r.bottom + GAP,
          left: r.left,
          width: r.width,
          maxHeight: Math.max(spaceBelow, MIN_HEIGHT),
        });
      } else {
        const maxHeight = Math.max(spaceAbove, MIN_HEIGHT);
        setRect({
          top: Math.max(r.top - GAP - maxHeight, visibleTop + EDGE_PADDING),
          left: r.left,
          width: r.width,
          maxHeight,
        });
      }
    }

    recompute();
    // The on-screen keyboard animation can finish after focus/scroll events
    // have already fired once, so re-check shortly after opening too.
    const settleTimer = setTimeout(recompute, 350);

    window.addEventListener('resize', recompute);
    window.addEventListener('scroll', recompute, true);
    window.visualViewport?.addEventListener('resize', recompute);
    window.visualViewport?.addEventListener('scroll', recompute);

    return () => {
      clearTimeout(settleTimer);
      window.removeEventListener('resize', recompute);
      window.removeEventListener('scroll', recompute, true);
      window.visualViewport?.removeEventListener('resize', recompute);
      window.visualViewport?.removeEventListener('scroll', recompute);
    };
  }, [open, inputRef]);

  return rect;
}
