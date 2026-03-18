import { Slider } from '../common/Slider.jsx';
import { useAppState } from '../../hooks/useAppState.js';
import { UPDATE_PALETTE } from '../../state/actions.js';

/**
 * Hue + saturation/chroma sliders for a palette.
 */
export function ColorSliders({ palette }) {
  const { dispatch } = useAppState();
  const colorMode = palette.colorMode ?? 'OKLCH';

  const updatePalette = (changes) => {
    dispatch({ type: UPDATE_PALETTE, payload: { id: palette.id, changes } });
  };

  // Build hue gradient
  const hueStops = [];
  for (let h = 0; h <= 360; h += 30) {
    hueStops.push(`hsl(${h}, 80%, 50%)`);
  }
  const hueGradient = `linear-gradient(to right, ${hueStops.join(', ')})`;

  // Build saturation gradient
  const satGradient =
    colorMode === 'OKLCH'
      ? `linear-gradient(to right, oklch(0.6 0 ${palette.hue}), oklch(0.6 0.2 ${palette.hue}), oklch(0.6 0.4 ${palette.hue}))`
      : `linear-gradient(to right, hsl(${palette.hue}, 0%, 50%), hsl(${palette.hue}, 100%, 50%))`;

  return (
    <div className="flex flex-col gap-3">
      <Slider
        label="Hue"
        value={palette.hue}
        min={0}
        max={360}
        onChange={(v) => updatePalette({ hue: v })}
        gradient={hueGradient}
      />
      <Slider
        label={colorMode === 'OKLCH' ? 'Chroma' : 'Saturation'}
        value={palette.saturation}
        min={0}
        max={100}
        onChange={(v) => updatePalette({ saturation: v })}
        gradient={satGradient}
      />
    </div>
  );
}
