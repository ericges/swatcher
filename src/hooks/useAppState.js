import { useContext } from 'react';
import { AppContext } from '../state/AppContext.jsx';

/**
 * Convenience hook to access app state and dispatch.
 * @returns {{ state: object, dispatch: function }}
 */
export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}
