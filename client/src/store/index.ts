import { configureStore } from "@reduxjs/toolkit";
import authReducer, { AuthState } from "./slices/authSlice";

// Helper functions for state persistence
const sanitizeAuthState = (authState: AuthState): Partial<AuthState> => {
  return {
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
  };
};

// Load persisted state from localStorage
const loadState = (): { auth: AuthState } | undefined => {
  if (typeof window === "undefined") return undefined;

  try {
    const serializedState = localStorage.getItem("reduxState");
    if (!serializedState) return undefined;

    const state = JSON.parse(serializedState);
    if (!state.auth) return undefined;

    // Only rehydrate essential auth state
    return {
      auth: {
        ...state.auth,
        loading: false,
        error: null,
      },
    };
  } catch {
    // Clear corrupted state
    localStorage.removeItem("reduxState");
    return undefined;
  }
};

// Create store with preloaded state
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: loadState(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

// Subscribe to store changes and save to localStorage
// Save state to localStorage when it changes
store.subscribe(() => {
  if (typeof window === "undefined") return;

  const state = store.getState();
  try {
    // Only persist essential auth state
    const persistedState = {
      auth: sanitizeAuthState(state.auth),
    };

    const serializedState = JSON.stringify(persistedState);
    localStorage.setItem("reduxState", serializedState);
  } catch (err) {
    // Handle potential errors like QuotaExceededError
    console.error("Failed to save state to localStorage:", err);

    // Attempt to clear storage if it might be full
    if (err instanceof Error && err.name === "QuotaExceededError") {
      try {
        localStorage.removeItem("reduxState");
      } catch (clearErr) {
        console.error("Failed to clear localStorage:", clearErr);
      }
    }
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
