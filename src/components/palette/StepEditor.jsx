import { useState } from 'react';
import { useAppState } from '../../hooks/useAppState.js';
import { UPDATE_PALETTE } from '../../state/actions.js';
import { IconButton } from '../common/IconButton.jsx';

/**
 * Editable step list for a palette — add/remove steps.
 */
export function StepEditor({ palette }) {
  const { dispatch } = useAppState();
  const [newStep, setNewStep] = useState('');

  const sortedSteps = [...palette.steps].sort((a, b) => b - a);

  const addStep = () => {
    const val = parseInt(newStep, 10);
    if (isNaN(val) || val < 1 || val > 99) return;
    if (palette.steps.includes(val)) return;
    dispatch({
      type: UPDATE_PALETTE,
      payload: {
        id: palette.id,
        changes: { steps: [...palette.steps, val].sort((a, b) => b - a) },
      },
    });
    setNewStep('');
  };

  const removeStep = (step) => {
    if (step === 100 || step === 0) return; // Fixed steps
    dispatch({
      type: UPDATE_PALETTE,
      payload: {
        id: palette.id,
        changes: { steps: palette.steps.filter((s) => s !== step) },
      },
    });
  };

  return (
    <div>
      <span className="text-base uppercase tracking-wider text-text-tertiary mb-2 block">
        Steps
      </span>
      <div className="flex flex-wrap gap-1 items-center">
        {sortedSteps.map((step) => {
          const isFixed = step === 100 || step === 0;
          return (
            <span
              key={step}
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-base font-mono border ${
                isFixed
                  ? 'border-border text-text-tertiary'
                  : 'border-border text-text-secondary group hover:border-danger/50 cursor-default'
              }`}
            >
              {step}
              {!isFixed && (
                <button
                  onClick={() => removeStep(step)}
                  className="text-text-tertiary hover:text-danger ml-0.5 transition-colors"
                >
                  &times;
                </button>
              )}
            </span>
          );
        })}

        {/* Add step */}
        <div className="flex items-center gap-0.5">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={newStep}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '' || /^\d{1,2}$/.test(v)) setNewStep(v);
            }}
            onKeyDown={(e) => e.key === 'Enter' && addStep()}
            placeholder="+"
            className="w-12 h-8 bg-surface-2 border border-border rounded text-base font-mono text-center text-text-secondary focus:border-accent focus:outline-none"
          />
          {newStep && (
            <IconButton onClick={addStep} size="sm" title="Add step">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="5" y1="1" x2="5" y2="9" />
                <line x1="1" y1="5" x2="9" y2="5" />
              </svg>
            </IconButton>
          )}
        </div>
      </div>
    </div>
  );
}
