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
    
    // Fallback if local storage returns empty object or valid key missing
    if (Object.keys(this.routines).length === 0) {
      this.routines = {
        'Treino A': { name: 'Treino A (Peitoral & Tríceps)', exercises: [] }
      };
    }
    
    const storedActiveKey = localStorage.getItem('gym_muscle_app_active_routine');
    if (storedActiveKey && this.routines[storedActiveKey]) {
      this.activeRoutineKey = storedActiveKey;
    } else {
      this.activeRoutineKey = Object.keys(this.routines)[0];
    }
    
    this.init();
  }

  init() {
    this.render();
  }

  addNewRoutine() {
    const name = prompt("Digite o nome do novo treino (ex: Treino D - Full Body):");
    if (name && name.trim()) {
      const key = 'routine_' + Date.now();
      this.routines[key] = { name: name.trim(), exercises: [] };
      this.activeRoutineKey = key;
      this.saveRoutinesToStorage();
      this.render();
      if (this.soundEffects) this.soundEffects.playAdd();
      this.showNotification(`Treino "${name}" criado com sucesso!`);
    }
  }

  renameRoutine() {
    if (!this.activeRoutineKey) return;
    const currentName = this.routines[this.activeRoutineKey].name;
    const newName = prompt("Digite o novo nome para este treino:", currentName);
    if (newName && newName.trim() && newName.trim() !== currentName) {
      this.routines[this.activeRoutineKey].name = newName.trim();
      this.saveRoutinesToStorage();
      this.render();
      this.showNotification("Nome atualizado com sucesso!");
    }
  }

  deleteRoutine() {
    if (!this.activeRoutineKey) return;
    const keys = Object.keys(this.routines);
    if (keys.length <= 1) {
      alert("Você precisa ter pelo menos um treino configurado.");
      return;
    }
    const currentName = this.routines[this.activeRoutineKey].name;
    if (confirm(`Tem certeza que deseja apagar o "${currentName}" permanentemente?`)) {
      delete this.routines[this.activeRoutineKey];
      const remainingKeys = Object.keys(this.routines);
      this.activeRoutineKey = remainingKeys[0];
      this.saveRoutinesToStorage();
      this.render();
      this.showNotification("Treino removido.");
    }
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
        
        <div style="display: flex; gap: 8px;">
          <button id="btn-rename-routine" class="btn-secondary" style="font-size: 0.82rem; padding: 8px 12px; display: flex; align-items: center; gap: 6px;">
            <i data-lucide="edit-2" style="width: 14px;"></i> Renomear Atual
          </button>
          <button id="btn-delete-routine" class="btn-secondary" style="font-size: 0.82rem; padding: 8px 12px; display: flex; align-items: center; gap: 6px; color: #ff4d4d;">
            <i data-lucide="trash-2" style="width: 14px;"></i> Apagar Atual
          </button>
          <button id="btn-export-workout" class="btn-primary" style="font-size: 0.82rem; padding: 8px 16px; display: flex; align-items: center; gap: 6px;">
            <i data-lucide="printer" style="width: 14px;"></i> Imprimir / Exportar
          </button>
        </div>
      </div>

      <!-- Abas dos Treinos -->
      <div class="planner-tabs" style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
        ${keys.map(k => `
          <button class="planner-tab-btn ${k === this.activeRoutineKey ? 'active' : ''}" data-key="${k}">
            ${this.routines[k].name}
          </button>
        `).join('')}
        <button class="planner-tab-btn" id="btn-add-routine" style="background: rgba(255,255,255,0.05); border: 1px dashed var(--border-color); opacity: 0.8; padding: 10px 16px;">
           <i data-lucide="plus" style="width: 14px; margin-right: 4px;"></i> Novo Treino
        </button>
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

    this.containerEl.querySelectorAll('.planner-tab-btn[data-key]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.activeRoutineKey = e.currentTarget.dataset.key;
        localStorage.setItem('gym_muscle_app_active_routine', this.activeRoutineKey);
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

    const btnAddRoutine = document.getElementById('btn-add-routine');
    if (btnAddRoutine) btnAddRoutine.addEventListener('click', () => this.addNewRoutine());

    const btnRenameRoutine = document.getElementById('btn-rename-routine');
    if (btnRenameRoutine) btnRenameRoutine.addEventListener('click', () => this.renameRoutine());

    const btnDeleteRoutine = document.getElementById('btn-delete-routine');
    if (btnDeleteRoutine) btnDeleteRoutine.addEventListener('click', () => this.deleteRoutine());

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
