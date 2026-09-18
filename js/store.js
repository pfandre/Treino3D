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
export async function saveWorkoutRecord(record) {
  const history = loadWorkoutHistory();
  history.push(record);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

  // Tenta salvar no Supabase se estiver logado
  if (window.supabase) {
    const { data: { session } } = await window.supabase.auth.getSession();
    if (session) {
      try {
        await window.supabase.from('workouts').insert([{
          user_id: session.user.id,
          name: record.name,
          date: record.date,
          start_time: record.startTime,
          duration_seconds: record.durationSeconds,
          duration_label: record.durationLabel
        }]);
      } catch (err) {
        console.error("Erro ao salvar no Supabase:", err);
      }
    }
  }
}

/** Exclui um treino do histórico local e da nuvem (via data) */
export async function deleteWorkoutRecord(date) {
  // 1. Remove do localStorage
  const history = loadWorkoutHistory();
  const realIndex = history.findIndex(h => h.date === date);
  if (realIndex > -1) {
    history.splice(realIndex, 1);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  // 2. Tenta remover do Supabase se estiver logado
  if (window.supabase) {
    const { data: { session } } = await window.supabase.auth.getSession();
    if (session) {
      try {
        await window.supabase
          .from('workouts')
          .delete()
          .eq('date', date)
          .eq('user_id', session.user.id);
      } catch (err) {
        console.error("Erro ao deletar no Supabase:", err);
      }
    }
  }
}

/** Sincroniza os treinos da nuvem com o localStorage ao fazer login */
export async function syncWorkoutHistory() {
  if (!window.supabase) return;
  const { data: { session } } = await window.supabase.auth.getSession();
  if (!session) return;

  try {
    const { data: cloudWorkouts, error } = await window.supabase
      .from('workouts')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    if (cloudWorkouts && cloudWorkouts.length > 0) {
      // Converte do formato do banco para o formato do app
      const formattedHistory = cloudWorkouts.map(cw => ({
        name: cw.name,
        date: cw.date,
        startTime: cw.start_time,
        durationSeconds: cw.duration_seconds,
        durationLabel: cw.duration_label
      }));
      
      // Substitui o histórico local pelo da nuvem (fonte da verdade)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(formattedHistory));
    }
  } catch (err) {
    console.error("Erro ao sincronizar treinos:", err);
  }
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

const ACTIVE_WORKOUT_KEY = 'treino3d_active_workout_state';

// Recuperar estado ativo salvo
function getSavedActiveWorkout() {
  try {
    const saved = localStorage.getItem(ACTIVE_WORKOUT_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.isWorkoutActive && data.startTime) {
        const elapsed = Math.floor((Date.now() - data.startTime) / 1000);
        return {
          isWorkoutActive: true,
          workoutName: data.workoutName,
          elapsedSeconds: elapsed > 0 ? elapsed : 0,
          startTime: data.startTime
        };
      }
    }
  } catch (e) {}
  return null;
}

const savedWorkout = getSavedActiveWorkout();

export const useWorkoutStore = createStore((set, get) => {
  // Inicialização (pode iniciar rodando se houver salvo)
  const initialState = {
    isWorkoutActive: savedWorkout ? savedWorkout.isWorkoutActive : false,
    workoutName: savedWorkout ? savedWorkout.workoutName : '',
    elapsedSeconds: savedWorkout ? savedWorkout.elapsedSeconds : 0,
    intervalId: null,
    startTime: savedWorkout ? savedWorkout.startTime : null
  };

  if (initialState.isWorkoutActive) {
    initialState.intervalId = setInterval(() => {
      set((state) => {
        const newElapsed = Math.floor((Date.now() - state.startTime) / 1000);
        return { elapsedSeconds: newElapsed };
      });
    }, 1000);
  }

  return {
    ...initialState,

  startWorkout: (name) => {
    const currentState = get();
    if (currentState.isWorkoutActive) return; // Já está rodando

    const startTime = Date.now();
    localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify({
      isWorkoutActive: true,
      workoutName: name || 'Treino Livre',
      startTime: startTime
    }));

    const intervalId = setInterval(() => {
      set((state) => {
        const newElapsed = Math.floor((Date.now() - state.startTime) / 1000);
        return { elapsedSeconds: newElapsed };
      });
    }, 1000);

    set({
      isWorkoutActive: true,
      workoutName: name || 'Treino Livre',
      elapsedSeconds: 0,
      intervalId: intervalId,
      startTime: startTime
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
        startTime: new Date(currentState.startTime).toISOString(),
        durationSeconds: currentState.elapsedSeconds,
        durationLabel: minutes > 0 ? `${minutes} min` : `${currentState.elapsedSeconds}s`
      });
    }

    localStorage.removeItem(ACTIVE_WORKOUT_KEY);
    // Remove o progresso do planner também
    localStorage.removeItem('treino3d_workout_progress');

    set({
      isWorkoutActive: false,
      workoutName: '',
      elapsedSeconds: 0,
      intervalId: null,
      startTime: null
    });
  }
};
});
