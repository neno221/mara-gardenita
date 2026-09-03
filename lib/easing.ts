/**
 * Cubic-bezier timing functions, solved with Newton-Raphson and a bisection
 * fallback so they can be handed straight to GSAP as `ease` callbacks.
 */
function bezierComponent(t: number, a1: number, a2: number) {
  const c = 3 * a1;
  const b = 3 * (a2 - a1) - c;
  const a = 1 - c - b;
  return ((a * t + b) * t + c) * t;
}

function bezierSlope(t: number, a1: number, a2: number) {
  const c = 3 * a1;
  const b = 3 * (a2 - a1) - c;
  const a = 1 - c - b;
  return (3 * a * t + 2 * b) * t + c;
}

function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;

    let t = x;
    for (let i = 0; i < 8; i++) {
      const slope = bezierSlope(t, x1, x2);
      if (slope === 0) break;
      const error = bezierComponent(t, x1, x2) - x;
      if (Math.abs(error) < 1e-6) return bezierComponent(t, y1, y2);
      t -= error / slope;
    }

    let low = 0;
    let high = 1;
    t = x;
    while (high - low > 1e-6) {
      if (bezierComponent(t, x1, x2) < x) low = t;
      else high = t;
      t = (low + high) / 2;
    }
    return bezierComponent(t, y1, y2);
  };
}

/** Matches the transition curve used throughout the stylesheet. */
export const outQuad = cubicBezier(0.25, 0.46, 0.45, 0.94);
export const easeInOut = cubicBezier(0.42, 0, 0.58, 1);

export const lerp = (from: number, to: number, t: number) => from + (to - from) * t;
