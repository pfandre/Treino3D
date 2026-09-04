/**
 * WorkoutPlanner - Criador Avançado de Rotinas de Treino & Métricas Atléticas
 */
import { MUSCLE_DATABASE } from './database.js';
import { useWorkoutStore } from './store.js';

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
      background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px);
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
      <div style="background: rgba(30, 41, 59, 0.95); backdrop-filter: blur(12px); width: 100%; max-width: 500px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05); overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; flex-direction: column; transition: all 0.3s ease;">
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
          <button id="btn-delete-routine" class="btn-secondary" style="font-size: 0.82rem; padding: 8px 12px; display: flex; align-items: center; gap: 6px; color: #ef4444;">
            <i data-lucide="trash-2" style="width: 14px;"></i> Apagar Atual
          </button>
          <button id="btn-export-workout" class="btn-primary" style="font-size: 0.82rem; padding: 8px 16px; display: flex; align-items: center; gap: 6px;">
            <i data-lucide="printer" style="width: 14px;"></i> Imprimir / Exportar
          </button>
          <button id="btn-start-planner-workout" class="flex items-center gap-2 bg-lime-500 hover:bg-lime-600 text-black px-4 py-2 rounded-md font-semibold transition-colors shadow-lg shadow-lime-500/20" style="font-size: 0.82rem;">
            <i data-lucide="play" style="width: 14px;"></i> Iniciar Treino
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
          <div class="font-mono tabular-nums text-3xl font-bold" style="color: var(--text-main);">${totalExercises}</div>
        </div>
        <div class="metric-card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); padding: 12px; border-radius: 10px; text-align: center;">
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Séries Totais</div>
          <div class="font-mono tabular-nums text-3xl font-bold" style="color: var(--primary-red);">${estimatedSets}</div>
        </div>
        <div class="metric-card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); padding: 12px; border-radius: 10px; text-align: center;">
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Tempo Estimado</div>
          <div class="font-mono tabular-nums text-3xl font-bold" style="color: var(--text-main);">${totalExercises * 12}<span style="font-size: 1rem; font-weight: normal; font-family: var(--font-sans); margin-left: 4px;">min</span></div>
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
            ${activeRoutine.exercises.map((ex, idx) => {
              const numSetsMatch = ex.customSets ? ex.customSets.match(/(\d+)\s*séries/i) : null;
              const numSets = numSetsMatch ? parseInt(numSetsMatch[1]) : 4;
              const repsMatch = ex.customSets ? ex.customSets.match(/x\s*(.+)/i) : null;
              const repsText = repsMatch ? repsMatch[1] : '10-12 reps';
              
              let setsHtml = '';
              for (let i = 1; i <= numSets; i++) {
                setsHtml += `
                  <div class="set-row flex items-center justify-between bg-white/5 rounded-xl p-4 transition-all duration-300" data-ex-name="${ex.name}">
                    <div class="flex items-center gap-4">
                      <span class="font-mono text-slate-400 font-bold w-6">${i}</span>
                      <div class="font-mono text-lg font-bold text-white tabular-nums">${repsText}</div>
                    </div>
                    <div class="flex items-center gap-3">
                      <div class="flex items-center gap-1">
                        <input type="number" class="input-kg w-16 bg-transparent border border-white/10 rounded-lg px-2 py-1 text-right font-mono text-lg font-bold text-[#84CC16] tabular-nums outline-none focus:border-[#84CC16]/50 focus:ring-1 focus:ring-[#84CC16]/30 transition-all placeholder:text-slate-500" placeholder="--" min="0" max="999" step="0.5" data-ex-name="${ex.name}" data-set-num="${i}">
                        <span class="text-[#84CC16] font-mono text-sm font-bold">kg</span>
                      </div>
                      <button class="btn-check-set h-12 w-12 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center text-slate-400 transition-all duration-300 active:scale-90 hover:border-white/20" data-ex-idx="${idx}" data-set-idx="${i}" data-ex-name="${ex.name}">
                        <i data-lucide="check" class="w-6 h-6 transition-all duration-300"></i>
                      </button>
                    </div>
                  </div>
                `;
              }

              return `
              <div class="exercise-card" style="padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                  <div>
                    <h4 style="font-size: 1.1rem; color: var(--text-main); font-weight: 700;">${idx + 1}. ${ex.name}</h4>
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">${ex.equipment}</div>
                  </div>
                  <button class="btn-close btn-remove-ex" data-index="${idx}" title="Remover do treino">
                    <i data-lucide="trash-2" style="width: 20px; color: var(--primary-red);"></i>
                  </button>
                </div>
                <div class="sets-container flex flex-col gap-2">
                  ${setsHtml}
                </div>
              </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;

    const btnStart = this.containerEl.querySelector('#btn-start-planner-workout');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        const currentRoutineName = this.routines[this.activeRoutineKey]?.name || 'Treino Livre';
        useWorkoutStore.getState().startWorkout(currentRoutineName);
        if (this.soundEffects) this.soundEffects.playAdd();
      });
    }

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

    this.containerEl.querySelectorAll('.btn-check-set').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const button = e.currentTarget;
        const row = button.closest('.set-row');
        const exName = button.dataset.exName;
        const setNum = button.dataset.setIdx;
        const kgInput = row.querySelector('.input-kg');
        const kgValue = parseFloat(kgInput?.value) || 0;
        
        const isChecking = !button.classList.contains('checked');
        button.classList.toggle('checked');

        if (isChecking) {
          // ── Visual: botão fica verde vibrante ──
          button.style.background = '#84CC16';
          button.style.borderColor = '#84CC16';
          button.style.color = '#000';
          button.style.boxShadow = '0 0 20px rgba(132, 204, 22, 0.6)';
          button.querySelector('i')?.setAttribute('style', 'color: #000; transform: scale(1.3);');
          
          // ── Flash animation no botão ──
          button.animate([
            { transform: 'scale(1)', boxShadow: '0 0 0px rgba(132, 204, 22, 0)' },
            { transform: 'scale(1.3)', boxShadow: '0 0 30px rgba(132, 204, 22, 0.8)' },
            { transform: 'scale(1)', boxShadow: '0 0 20px rgba(132, 204, 22, 0.6)' }
          ], { duration: 400, easing: 'ease-out' });

          // ── Flash na row inteira ──
          row.style.background = 'rgba(132, 204, 22, 0.15)';
          row.style.borderLeft = '3px solid #84CC16';
          
          // ── Desabilitar input ──
          if (kgInput) {
            kgInput.disabled = true;
            kgInput.style.opacity = '0.6';
          }

          // ── Persistir os kg no localStorage ──
          if (kgValue > 0) {
            this._saveSetRecord(exName, setNum, kgValue);
          }
          
          if (this.soundEffects) this.soundEffects.playClick();
        } else {
          // ── Desfazer ──
          button.style.background = 'rgba(255,255,255,0.05)';
          button.style.borderColor = 'rgba(255,255,255,0.1)';
          button.style.color = '#94A3B8';
          button.style.boxShadow = 'none';
          button.querySelector('i')?.setAttribute('style', '');
          row.style.background = 'rgba(255,255,255,0.05)';
          row.style.borderLeft = 'none';
          if (kgInput) {
            kgInput.disabled = false;
            kgInput.style.opacity = '1';
          }
        }
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
  /**
   * Persiste o registro de uma série concluída (exercício + kg) no localStorage.
   * Formato: { exercise, kg, set, date }
   * Chave: 'treino3d_set_records'
   */
  _saveSetRecord(exerciseName, setNum, kg) {
    const STORAGE_KEY = 'treino3d_set_records';
    let records = [];
    try {
      records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch { /* empty */ }

    records.push({
      exercise: exerciseName,
      kg: kg,
      set: setNum,
      date: new Date().toISOString()
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  showNotification(msg, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: ${type === 'success' ? 'linear-gradient(135deg, var(--primary-red), #65a30d)' : '#ef4444'};
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
