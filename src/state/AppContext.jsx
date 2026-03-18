import { createContext, useReducer, useEffect } from 'react';
import { reducer } from './reducer.js';
import { buildInitialState } from './initialState.js';

const STORAGE_KEY = 'colorSystemApp_v1';

export const AppContext = createContext(null);

/**
 * Load persisted state from localStorage, or return default.
 * @returns {object}
 */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Basic validation: ensure systems array exists
      if (parsed && Array.isArray(parsed.systems) && parsed.systems.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore parse errors
  }
  return buildInitialState();
}

/**
 * App-level context provider. Wraps children with state + dispatch.
 */
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);

  // Persist to localStorage on every state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage errors (quota, etc.)
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
