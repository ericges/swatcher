import { useEffect, useCallback, memo } from 'react';
import { useCurveEditor } from '../../hooks/useCurveEditor.js';
import { evaluateLightnessProfile, evaluateSaturationProfile } from '../../color/curveProfiles.js';

const WIDTH = 220;
const HEIGHT = 130;
const PADDING = 10;

/**
 * Canvas-based cubic Bézier curve editor.
 * Background shows the palette's color ramp as a horizontal gradient.
 * Draggable control points for custom curves.
 */
export const CurveCanvas = memo(function CurveCanvas({ profile, onProfileChange, palette, type }) {
  const {
    canvasRef,
    normToPixel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useCurveEditor(
    profile.customPoints || [[0.25, 0.25], [0.75, 0.75]],
    (newPoints) => {
      onProfileChange({ ...profile, customPoints: newPoints });
    },
    { width: WIDTH, height: HEIGHT }
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Background gradient (palette ramp preview)
    const gradient = ctx.createLinearGradient(PADDING, 0, WIDTH - PADDING, 0);
    gradient.addColorStop(0, `hsl(${palette.hue}, ${palette.saturation}%, 5%)`);
    gradient.addColorStop(0.5, `hsl(${palette.hue}, ${palette.saturation}%, 50%)`);
    gradient.addColorStop(1, `hsl(${palette.hue}, ${palette.saturation}%, 95%)`);
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.15;
    ctx.fillRect(PADDING, PADDING, WIDTH - PADDING * 2, HEIGHT - PADDING * 2);
    ctx.globalAlpha = 1;

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0.25; i < 1; i += 0.25) {
      const [x] = normToPixel(i, 0);
      const [, y] = normToPixel(0, i);
      ctx.beginPath();
      ctx.moveTo(x, PADDING);
      ctx.lineTo(x, HEIGHT - PADDING);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(PADDING, y);
      ctx.lineTo(WIDTH - PADDING, y);
      ctx.stroke();
    }

    // Evaluate curve and draw it
    const evaluator = type === 'lightness' ? evaluateLightnessProfile : evaluateSaturationProfile;
    ctx.beginPath();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const v = evaluator(profile, t);
      const [px, py] = normToPixel(t, v);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Draw control points for custom type
    if (profile.type === 'custom') {
      const pts = profile.customPoints || [[0.25, 0.25], [0.75, 0.75]];

      // Draw lines from endpoints to control points
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
      ctx.lineWidth = 1;
      const [sx, sy] = normToPixel(0, 0);
      const [p1x, p1y] = normToPixel(pts[0][0], pts[0][1]);
      const [p2x, p2y] = normToPixel(pts[1][0], pts[1][1]);
      const [ex, ey] = normToPixel(1, 1);

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(p1x, p1y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(p2x, p2y);
      ctx.stroke();

      // Draw control point circles
      for (const pt of pts) {
        const [cx, cy] = normToPixel(pt[0], pt[1]);
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#6366f1';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
  }, [canvasRef, normToPixel, profile, palette.hue, palette.saturation, type]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      className="rounded border border-border cursor-crosshair"
      style={{ width: WIDTH, height: HEIGHT }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
});
