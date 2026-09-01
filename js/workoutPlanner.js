/**
 * WorkoutPlanner - Criador Avançado de Rotinas de Treino & Métricas Atléticas
 */

export class WorkoutPlanner {
  constructor(options) {
    this.containerEl = document.getElementById(options.containerId);
    this.soundEffects = options.soundEffects;
    
    this.routines = this.loadRoutinesFromStorage() || {
      'Treino A': { name: 'Treino A (Peitoral & Tríceps)', exercises: [] },
      'Treino B': { name: 'Treino B (Costas & Bíceps)', exercises: [] },
      'Treino C': { name: 'Treino C (Pernas & Ombros)', exercises: [] }
    };
    
    this.activeRoutineKey = 'Treino A';
    this.init();
  }

  init() {
    this.render();
  }

  addExerciseToActiveRoutine(exercise) {
    const routine = this.routines[this.activeRoutineKey];
    if (routine) {
      if (!routine.exercises.some(e => e.id === exercise.id)) {
        routine.exercises.push({ ...exercise, customSets: '4 séries x 10-12 reps' });
        this.saveRoutinesToStorage();
        this.render();
        if (this.soundEffects) this.soundEffects.playAdd();
        this.showNotification(`"${exercise.name}" adicionado ao ${routine.name}!`);
      } else {
        this.showNotification(`"${exercise.name}" já está no ${routine.name}.`, 'warning');
      }
    }
  }

  removeExercise(index) {
    const routine = this.routines[this.activeRoutineKey];
    if (routine) {
      routine.exercises.splice(index, 1);
      this.saveRoutinesToStorage();
      this.render();
    }
  }

  render() {
    if (!this.containerEl) return;

    const keys = Object.keys(this.routines);
    const activeRoutine = this.routines[this.activeRoutineKey];
    const totalExercises = activeRoutine.exercises.length;
    const estimatedSets = totalExercises * 4;

    this.containerEl.innerHTML = `
      <div class="planner-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <div>
          <h3 style="font-family: var(--font-display); font-size: 1.4rem; color: #fff;">
            <i data-lucide="calendar" style="color: var(--primary-red)"></i> Montador de Rotinas de Treino
          </h3>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
            Atletas de Alto Rendimento • Carga & Métricas
          </div>
        </div>
        
        <button id="btn-export-workout" class="btn-primary" style="font-size: 0.82rem; padding: 8px 16px; display: flex; align-items: center; gap: 6px;">
          <i data-lucide="printer" style="width: 14px;"></i> Imprimir / Exportar
        </button>
      </div>

      <!-- Abas dos Treinos -->
      <div class="planner-tabs">
        ${keys.map(k => `
          <button class="planner-tab-btn ${k === this.activeRoutineKey ? 'active' : ''}" data-key="${k}">
            ${this.routines[k].name}
          </button>
        `).join('')}
      </div>

      <!-- Métricas Rápidas do Treino -->
      <div class="metrics-row" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0;">
        <div class="metric-card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); padding: 12px; border-radius: 10px; text-align: center;">
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Exercícios</div>
          <div style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: #fff;">${totalExercises}</div>
        </div>
        <div class="metric-card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); padding: 12px; border-radius: 10px; text-align: center;">
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Séries Totais</div>
          <div style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: var(--primary-red);">${estimatedSets}</div>
        </div>
        <div class="metric-card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); padding: 12px; border-radius: 10px; text-align: center;">
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Tempo Estimado</div>
          <div style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: #fff;">${totalExercises * 12} min</div>
        </div>
      </div>

      <div class="planner-content">
        ${activeRoutine.exercises.length === 0 ? `
          <div style="text-align: center; padding: 40px; border: 2px dashed var(--border-color); border-radius: var(--radius-md); color: var(--text-muted);">
            <i data-lucide="clipboard-list" style="width: 42px; height: 42px; opacity: 0.4; margin-bottom: 10px;"></i>
            <p>Nenhum exercício adicionado a este treino ainda.</p>
            <span style="font-size: 0.8rem; color: var(--text-dim);">Navegue pelo Catálogo ou Músculos Anatômicos e clique em "<b>+ Treino</b>" nos cards.</span>
          </div>
        ` : `
          <div class="routine-exercise-list" style="display: flex; flex-direction: column; gap: 10px;">
            ${activeRoutine.exercises.map((ex, idx) => `
              <div class="exercise-card" style="flex-direction: row; align-items: center; justify-content: space-between;">
                <div>
                  <h4 style="font-size: 1rem; color: #fff;">${idx + 1}. ${ex.name}</h4>
                  <span class="target-head-badge">${ex.targetHead}</span>
                  <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">${ex.equipment} | ${ex.customSets}</div>
                </div>
                <button class="btn-close btn-remove-ex" data-index="${idx}" title="Remover do treino">
                  <i data-lucide="trash-2" style="width: 16px; color: var(--primary-red);"></i>
                </button>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;

    this.containerEl.querySelectorAll('.planner-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.activeRoutineKey = e.currentTarget.dataset.key;
        this.render();
      });
    });

    this.containerEl.querySelectorAll('.btn-remove-ex').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index);
        this.removeExercise(idx);
      });
    });

    const exportBtn = document.getElementById('btn-export-workout');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        window.print();
      });
    }

    if (window.lucide) window.lucide.createIcons();
  }

  showNotification(msg, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: ${type === 'success' ? 'linear-gradient(135deg, var(--primary-red), #e11d48)' : '#ff4d4d'};
      color: #fff;
      padding: 12px 20px;
      border-radius: 30px;
      font-weight: 700;
      font-size: 0.88rem;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      z-index: 2000;
      transition: all 0.3s ease;
    `;
    toast.innerText = msg;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  saveRoutinesToStorage() {
    try {
      localStorage.setItem('gym_muscle_app_routines', JSON.stringify(this.routines));
    } catch (e) {
      console.warn("Erro ao salvar rotinas:", e);
    }
  }

  loadRoutinesFromStorage() {
    try {
      const saved = localStorage.getItem('gym_muscle_app_routines');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }
}
