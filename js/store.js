/**
 * store.js - Sistema de Gerenciamento de Estado Global estilo Zustand
 * Agora com persistência automática do histórico de treinos no localStorage.
 */

const HISTORY_KEY = 'treino3d_workout_history';

/** Carrega o histórico de treinos do localStorage */
export function loadWorkoutHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

/** Salva um registro de treino concluído */
function saveWorkoutRecord(record) {
  const history = loadWorkoutHistory();
  history.push(record);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function createStore(createState) {
  let state;
  const listeners = new Set();

  const setState = (partial, replace) => {
    const nextState = typeof partial === 'function' ? partial(state) : partial;
    if (nextState !== state) {
      const previousState = state;
      state = replace ? nextState : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, previousState));
    }
  };

  const getState = () => state;

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener); // Unsubscribe function
  };

  const api = { setState, getState, subscribe };
  state = createState(setState, getState, api);
  return api;
}

export const useWorkoutStore = createStore((set, get) => ({
  isWorkoutActive: false,
  workoutName: '',
  elapsedSeconds: 0,
  intervalId: null,

  startWorkout: (name) => {
    const currentState = get();
    if (currentState.isWorkoutActive) return; // Já está rodando

    const intervalId = setInterval(() => {
      set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 }));
    }, 1000);

    set({
      isWorkoutActive: true,
      workoutName: name || 'Treino Livre',
      elapsedSeconds: 0,
      intervalId: intervalId
    });
  },

  endWorkout: () => {
    const currentState = get();
    if (currentState.intervalId) {
      clearInterval(currentState.intervalId);
    }

    // Persistir o treino concluído no histórico (se durou mais de 10s)
    if (currentState.elapsedSeconds > 10) {
      const minutes = Math.round(currentState.elapsedSeconds / 60);
      saveWorkoutRecord({
        name: currentState.workoutName,
        date: new Date().toISOString(),
        durationSeconds: currentState.elapsedSeconds,
        durationLabel: minutes > 0 ? `${minutes} min` : `${currentState.elapsedSeconds}s`
      });
    }

    set({
      isWorkoutActive: false,
      workoutName: '',
      elapsedSeconds: 0,
      intervalId: null
    });
  }
}));
