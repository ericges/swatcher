/**
 * Lightness and saturation curve profile functions.
 * Each takes t ∈ [0,1] (normalized step position, 0 = darkest) and returns a value ∈ [0,1].
 */

/**
 * Linear: direct mapping.
 * @param {number} t
 * @returns {number}
 */
export function linear(t) {
  return t;
}

/**
 * Cubic ease-in: slow start, fast end.
 * @param {number} t
 * @returns {number}
 */
export function easeIn(t) {
  return t * t * t;
}

/**
 * Cubic ease-out: fast start, slow end.
 * @param {number} t
 * @returns {number}
 */
export function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * S-curve: smooth cubic sigmoid shape.
 * @param {number} t
 * @returns {number}
 */
export function sCurve(t) {
  if (t < 0.5) {
    return 4 * t * t * t;
  }
  return 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Perceptual: gamma 2.2 approximation.
 * @param {number} t
 * @returns {number}
 */
export function perceptual(t) {
  return Math.pow(t, 1 / 2.2);
}

/**
 * Evaluate a cubic Bézier curve defined by control points at a given t.
 * Uses De Casteljau's algorithm with 4 points: (0,0), p1, p2, (1,1).
 * @param {[number,number][]} points - Two control points [[x1,y1],[x2,y2]]
 * @param {number} t - Parameter 0–1
 * @returns {number} Y value at t
 */
export function customBezier(points, t) {
  if (!points || points.length < 2) return t;

  const p0 = [0, 0];
  const p1 = points[0];
  const p2 = points[1];
  const p3 = [1, 1];

  // Find the t parameter that produces the desired x value
  // using Newton's method
  const bezierX = (tt) => {
    const u = 1 - tt;
    return 3 * u * u * tt * p1[0] + 3 * u * tt * tt * p2[0] + tt * tt * tt;
  };

  const bezierY = (tt) => {
    const u = 1 - tt;
    return 3 * u * u * tt * p1[1] + 3 * u * tt * tt * p2[1] + tt * tt * tt;
  };

  // Newton-Raphson to solve for the bezier t that gives us x = t
  let guess = t;
  for (let i = 0; i < 8; i++) {
    const x = bezierX(guess) - t;
    if (Math.abs(x) < 0.0001) break;
    const dx = 3 * (1 - guess) * (1 - guess) * p1[0] +
               6 * (1 - guess) * guess * (p2[0] - p1[0]) +
               3 * guess * guess * (1 - p2[0]);
    if (Math.abs(dx) < 0.0001) break;
    guess -= x / dx;
  }

  return bezierY(guess);
}

// --- Saturation curve profiles ---

/**
 * Flat saturation: full saturation at all steps.
 * @param {number} t
 * @returns {number}
 */
export function satFlat(t) {
  return 1;
}

/**
 * Bell saturation: peak in midtones, fades toward black and white.
 * @param {number} t
 * @returns {number}
 */
export function satBell(t) {
  // Gaussian-like bell centered at 0.5
  return Math.exp(-Math.pow((t - 0.5) * 3, 2));
}

/**
 * Dark-fade saturation: full in lights, fades to 0 at black end.
 * @param {number} t
 * @returns {number}
 */
export function satDarkFade(t) {
  return Math.min(1, t * 2);
}

/** Map of profile type IDs to lightness curve functions */
export const lightnessCurves = {
  linear,
  'ease-in': easeIn,
  'ease-out': easeOut,
  's-curve': sCurve,
  perceptual,
};

/** Map of saturation profile type IDs to saturation curve functions */
export const saturationCurves = {
  flat: satFlat,
  bell: satBell,
  'dark-fade': satDarkFade,
};

/**
 * Get the lightness value for a given step position using a profile config.
 * @param {import('../state/initialState.js').ProfileConfig} profile
 * @param {number} t - Normalized position 0–1
 * @returns {number} Lightness 0–1
 */
export function evaluateLightnessProfile(profile, t) {
  if (profile.type === 'custom') {
    return customBezier(profile.customPoints, t);
  }
  if (profile.type === 'apca-adaptive') {
    // Handled externally by adaptiveCurve.js — fallback to linear
    return t;
  }
  const fn = lightnessCurves[profile.type];
  return fn ? fn(t) : t;
}

/**
 * Get the saturation modifier for a given step position using a profile config.
 * @param {import('../state/initialState.js').ProfileConfig} profile
 * @param {number} t - Normalized position 0–1
 * @returns {number} Saturation modifier 0–1
 */
export function evaluateSaturationProfile(profile, t) {
  if (profile.type === 'custom') {
    return customBezier(profile.customPoints, t);
  }
  const fn = saturationCurves[profile.type];
  return fn ? fn(t) : 1;
}
