/**
 * WorkoutPlanner - Criador Avançado de Rotinas de Treino & Métricas Atléticas
 */
import { MUSCLE_DATABASE } from './database.js';

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

  openRoutineModal() {
    const modal = document.createElement('div');
    modal.className = 'routine-modal-overlay';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.8); backdrop-filter: blur(5px);
      display: flex; justify-content: center; align-items: center;
      z-index: 3000; padding: 20px; transition: opacity 0.3s ease;
    `;

    let checkboxesHtml = '';
    Object.keys(MUSCLE_DATABASE).forEach(key => {
      const muscle = MUSCLE_DATABASE[key];
      checkboxesHtml += `
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color);">
          <input type="checkbox" value="${key}" class="muscle-checkbox" style="width: 16px; height: 16px; accent-color: var(--primary-red);">
          <span style="font-size: 0.9rem; color: var(--text-main);">${muscle.name.split(' (')[0]}</span>
        </label>
      `;
    });

    modal.innerHTML = `
      <div style="background: var(--bg-card); width: 100%; max-width: 500px; border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.5); display: flex; flex-direction: column;">
        <div style="padding: 20px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-family: var(--font-display); font-size: 1.3rem; color: var(--text-main); margin: 0;">Novo Treino</h3>
          <button id="btn-close-modal" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer;"><i data-lucide="x"></i></button>
        </div>
        
        <div style="padding: 20px; overflow-y: auto; max-height: 60vh;">
          <div style="margin-bottom: 20px;">
            <label style="display: block; font-size: 0.85rem; color: var(--text-dim); margin-bottom: 8px; text-transform: uppercase;">Nome do Treino</label>
            <input type="text" id="routine-name-input" placeholder="Ex: Treino Upper, Push, Sabadão..." style="width: 100%; padding: 12px; background: rgba(0,0,0,0.2); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-main); font-size: 1rem; outline: none;">
          </div>
          
          <div>
            <label style="display: block; font-size: 0.85rem; color: var(--text-dim); margin-bottom: 12px; text-transform: uppercase;">Adicionar Exercícios dos Músculos:</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              ${checkboxesHtml}
            </div>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 12px;">
              * Todos os exercícios dos músculos marcados serão adicionados ao treino automaticamente.
            </p>
          </div>
        </div>
        
        <div style="padding: 20px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 12px; background: rgba(0,0,0,0.2);">
          <button id="btn-cancel-modal" class="btn-secondary" style="padding: 10px 20px;">Cancelar</button>
          <button id="btn-save-modal" class="btn-primary" style="padding: 10px 24px;">Salvar Treino</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    if (window.lucide) window.lucide.createIcons({ root: modal });

    const inputEl = modal.querySelector('#routine-name-input');
    setTimeout(() => inputEl.focus(), 100);

    const closeModal = () => {
      modal.style.opacity = '0';
      setTimeout(() => modal.remove(), 300);
    };

    modal.querySelector('#btn-close-modal').addEventListener('click', closeModal);
    modal.querySelector('#btn-cancel-modal').addEventListener('click', closeModal);
    
    modal.querySelector('#btn-save-modal').addEventListener('click', () => {
      const name = inputEl.value.trim();
      if (!name) {
        alert("Por favor, digite um nome para o treino.");
        return;
      }

      const selectedMuscles = Array.from(modal.querySelectorAll('.muscle-checkbox:checked')).map(cb => cb.value);
      let newExercises = [];

      selectedMuscles.forEach(muscleKey => {
        const cat = MUSCLE_DATABASE[muscleKey];
        if (cat && cat.exercises) {
          cat.exercises.forEach(ex => {
            newExercises.push({ ...ex, customSets: '4 séries x 10-12 reps' });
          });
        }
      });

      const key = 'routine_' + Date.now();
      this.routines[key] = { name: name, exercises: newExercises };
      this.activeRoutineKey = key;
      this.saveRoutinesToStorage();
      this.render();
      if (this.soundEffects) this.soundEffects.playAdd();
      this.showNotification(`Treino "${name}" criado com ${newExercises.length} exercícios!`);
      
      closeModal();
    });
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
          <h3 style="font-family: var(--font-display); font-size: 1.4rem; color: var(--text-main);">
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
          <div style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: var(--text-main);">${totalExercises}</div>
        </div>
        <div class="metric-card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); padding: 12px; border-radius: 10px; text-align: center;">
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Séries Totais</div>
          <div style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: var(--primary-red);">${estimatedSets}</div>
        </div>
        <div class="metric-card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); padding: 12px; border-radius: 10px; text-align: center;">
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Tempo Estimado</div>
          <div style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: var(--text-main);">${totalExercises * 12} min</div>
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
                  <h4 style="font-size: 1rem; color: var(--text-main);">${idx + 1}. ${ex.name}</h4>
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
    if (btnAddRoutine) btnAddRoutine.addEventListener('click', () => this.openRoutineModal());

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
