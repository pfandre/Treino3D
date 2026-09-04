import { useWorkoutStore } from './store.js';

export class ActiveWorkoutUI {
  constructor() {
    this.barElement = null;
    this.timeElement = null;
    this.nameElement = null;
    
    // Inscreve a UI para ouvir as mudanças de estado
    useWorkoutStore.subscribe(this.handleStateChange.bind(this));
  }

  handleStateChange(state, prevState) {
    // Se o treino iniciou e a barra não existe, criar
    if (state.isWorkoutActive && !this.barElement) {
      this.renderBar();
    }
    
    // Se o treino terminou e a barra existe, remover
    if (!state.isWorkoutActive && this.barElement) {
      this.removeBar();
    }

    // Se o treino está ativo, atualizar o tempo e o nome
    if (state.isWorkoutActive && this.barElement) {
      this.updateTime(state.elapsedSeconds);
      if (state.workoutName !== prevState.workoutName) {
        this.nameElement.textContent = state.workoutName;
      }
    }
  }

  formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  updateTime(seconds) {
    if (this.timeElement) {
      this.timeElement.textContent = this.formatTime(seconds);
    }
  }

  renderBar() {
    this.barElement = document.createElement('div');
    this.barElement.className = "fixed bottom-0 left-0 w-full z-50 bg-slate-900/90 backdrop-blur-md border-t border-white/10 text-white flex items-center justify-between px-6 py-4 shadow-2xl transition-transform duration-300 transform translate-y-0";
    
    this.barElement.innerHTML = `
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center bg-lime-500/20 text-lime-500 rounded-full w-10 h-10 animate-pulse">
          <i data-lucide="activity"></i>
        </div>
        <div>
          <div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Treino Ativo</div>
          <div class="text-sm font-bold text-slate-100" id="active-workout-name">Carregando...</div>
        </div>
      </div>
      
      <div class="flex items-center gap-6">
        <div class="font-mono text-2xl font-bold tracking-widest text-lime-400 drop-shadow-md" id="active-workout-time">
          00:00
        </div>
        <button id="btn-end-workout" class="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-semibold transition-colors shadow-lg shadow-red-500/20">
          <i data-lucide="square" class="w-4 h-4 fill-current"></i> Encerrar
        </button>
      </div>
    `;

    document.body.appendChild(this.barElement);
    
    // Atualiza referências
    this.timeElement = this.barElement.querySelector('#active-workout-time');
    this.nameElement = this.barElement.querySelector('#active-workout-name');
    
    // Ativa ícones
    if (window.lucide) {
      window.lucide.createIcons({ root: this.barElement });
    }

    // Evento de encerrar
    const endBtn = this.barElement.querySelector('#btn-end-workout');
    endBtn.addEventListener('click', () => {
      useWorkoutStore.getState().endWorkout();
    });
  }

  removeBar() {
    if (this.barElement) {
      this.barElement.classList.add('translate-y-full'); // Animação de saída
      setTimeout(() => {
        if (this.barElement && this.barElement.parentNode) {
          this.barElement.parentNode.removeChild(this.barElement);
        }
        this.barElement = null;
        this.timeElement = null;
        this.nameElement = null;
      }, 300);
    }
  }
}
