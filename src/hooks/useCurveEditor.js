import { useState, useCallback, useRef } from 'react';

/**
 * Hook for canvas cubic Bézier curve editor interaction.
 * Manages dragging of control points on a canvas.
 *
 * @param {[number,number][]} points - Current control points [[x1,y1],[x2,y2]]
 * @param {function} onPointsChange - Callback when points are updated
 * @param {{ width: number, height: number }} dimensions - Canvas dimensions
 * @returns {object} Event handlers and state for the curve editor
 */
export function useCurveEditor(points, onPointsChange, dimensions = { width: 220, height: 130 }) {
  const [draggingIndex, setDraggingIndex] = useState(null);
  const canvasRef = useRef(null);

  const { width, height } = dimensions;

  /** Convert canvas pixel coords to normalized 0–1 coords. */
  const pixelToNorm = useCallback(
    (px, py) => {
      const padding = 10;
      const plotW = width - padding * 2;
      const plotH = height - padding * 2;
      return [
        Math.max(0, Math.min(1, (px - padding) / plotW)),
        Math.max(0, Math.min(1, 1 - (py - padding) / plotH)),
      ];
    },
    [width, height]
  );

  /** Convert normalized coords to canvas pixels. */
  const normToPixel = useCallback(
    (nx, ny) => {
      const padding = 10;
      const plotW = width - padding * 2;
      const plotH = height - padding * 2;
      return [padding + nx * plotW, padding + (1 - ny) * plotH];
    },
    [width, height]
  );

  /** Get mouse position relative to canvas. */
  const getCanvasPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return [0, 0];
    const rect = canvas.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  }, []);

  /** Find nearest control point within grab radius. */
  const findNearest = useCallback(
    (px, py) => {
      const GRAB_RADIUS = 12;
      let bestIdx = null;
      let bestDist = Infinity;

      points.forEach((pt, i) => {
        const [cx, cy] = normToPixel(pt[0], pt[1]);
        const dist = Math.hypot(px - cx, py - cy);
        if (dist < GRAB_RADIUS && dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      });

      return bestIdx;
    },
    [points, normToPixel]
  );

  const handleMouseDown = useCallback(
    (e) => {
      const [px, py] = getCanvasPos(e);
      const idx = findNearest(px, py);
      if (idx !== null) {
        setDraggingIndex(idx);
        e.preventDefault();
      }
    },
    [getCanvasPos, findNearest]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (draggingIndex === null) return;
      const [px, py] = getCanvasPos(e);
      const [nx, ny] = pixelToNorm(px, py);
      const newPoints = points.map((p, i) => (i === draggingIndex ? [nx, ny] : p));
      onPointsChange(newPoints);
    },
    [draggingIndex, getCanvasPos, pixelToNorm, points, onPointsChange]
  );

  const handleMouseUp = useCallback(() => {
    setDraggingIndex(null);
  }, []);

  return {
    canvasRef,
    draggingIndex,
    normToPixel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
