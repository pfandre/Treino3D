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
      'Treino_Livre': { name: 'Treino Livre', exercises: [] }
    };
    
    // Fallback if local storage returns empty object or valid key missing
    if (Object.keys(this.routines).length === 0) {
      this.routines = {
        'Treino_Livre': { name: 'Treino Livre', exercises: [] }
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
          <input type="checkbox" value="${key}" class="muscle-checkbox" style="width: 16px; height: 16px; accent-color: var(--primary-lime);">
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
            <label style="display: block; font-size: 0.85rem; color: var(--text-dim); margin-bottom: 8px; text-transform: uppercase;">Músculos do Treino</label>
            <input type="text" id="routine-muscles-input" readonly placeholder="Selecione os músculos abaixo..." style="width: 100%; padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-muted); font-size: 1rem; outline: none; cursor: not-allowed;">
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; font-size: 0.85rem; color: var(--text-dim); margin-bottom: 8px; text-transform: uppercase;">Identificador (Ex: Treino 1, Segunda...)</label>
            <input type="text" id="routine-id-input" placeholder="Ex: Treino 1, Segunda..." style="width: 100%; padding: 12px; background: rgba(0,0,0,0.2); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-main); font-size: 1rem; outline: none;">
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

    const idInputEl = modal.querySelector('#routine-id-input');
    setTimeout(() => idInputEl.focus(), 100);

    const updateMusclesInput = () => {
      const selectedMuscles = Array.from(modal.querySelectorAll('.muscle-checkbox:checked')).map(cb => {
        return MUSCLE_DATABASE[cb.value].name.split(' (')[0];
      });
      const musclesInput = modal.querySelector('#routine-muscles-input');
      if (selectedMuscles.length > 0) {
        musclesInput.value = selectedMuscles.join(' & ');
      } else {
        musclesInput.value = '';
      }
    };

    modal.querySelectorAll('.muscle-checkbox').forEach(cb => {
      cb.addEventListener('change', updateMusclesInput);
    });

    const closeModal = () => {
      modal.style.opacity = '0';
      setTimeout(() => modal.remove(), 300);
    };

    modal.querySelector('#btn-close-modal').addEventListener('click', closeModal);
    modal.querySelector('#btn-cancel-modal').addEventListener('click', closeModal);
    
    modal.querySelector('#btn-save-modal').addEventListener('click', () => {
      const idInput = modal.querySelector('#routine-id-input').value.trim();
      const musclesInput = modal.querySelector('#routine-muscles-input').value.trim();
      
      let name = 'Novo Treino';
      if (idInput && musclesInput) {
        name = `${idInput} (${musclesInput})`;
      } else if (idInput) {
        name = idInput;
      } else if (musclesInput) {
        name = musclesInput;
      } else {
        alert("Por favor, selecione os músculos ou digite um identificador.");
        return;
      }

      const selectedMuscles = Array.from(modal.querySelectorAll('.muscle-checkbox:checked')).map(cb => cb.value);
      let newExercises = [];

      selectedMuscles.forEach(muscleKey => {
        const cat = MUSCLE_DATABASE[muscleKey];
        if (cat && cat.exercises) {
          cat.exercises.forEach(ex => {
            const savedSetsReps = localStorage.getItem('gym_muscle_ex_sets_' + ex.id);
            newExercises.push({ ...ex, customSets: savedSetsReps || '3 séries x 10 reps' });
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
        const savedSetsReps = localStorage.getItem('gym_muscle_ex_sets_' + exercise.id);
        routine.exercises.push({ ...exercise, customSets: savedSetsReps || '3 séries x 10 reps' });
        this._syncRoutineNameWithExercises(routine);
        this.saveRoutinesToStorage();
        this.render();
        if (this.soundEffects) this.soundEffects.playAdd();
        this.showNotification(`"${exercise.name}" adicionado ao treino!`);
      } else {
        this.showNotification(`"${exercise.name}" já está no treino.`, 'warning');
      }
    }
  }

  removeExercise(index) {
    const routine = this.routines[this.activeRoutineKey];
    if (routine) {
      routine.exercises.splice(index, 1);
      this._syncRoutineNameWithExercises(routine);
      this.saveRoutinesToStorage();
      this.render();
    }
  }

  updateExerciseSets(exerciseId, newSetsReps) {
    let updated = false;
    Object.values(this.routines).forEach(routine => {
       routine.exercises.forEach(ex => {
          if (ex.id === exerciseId) {
             ex.customSets = newSetsReps;
             updated = true;
          }
       });
    });
    if (updated) {
       this.saveRoutinesToStorage();
       this.render();
    }
  }

  _syncRoutineNameWithExercises(routine) {
    const muscleIds = [...new Set(routine.exercises.map(ex => ex.categoryId))];
    const muscleNames = muscleIds.map(id => MUSCLE_DATABASE[id] ? MUSCLE_DATABASE[id].name.split(' (')[0] : '').filter(Boolean);
    const musclesString = muscleNames.join(' & ');
    
    const match = routine.name.match(/^(.*?)\s*\((.*?)\)$/);
    let identifier = routine.name;
    if (match) {
      identifier = match[1];
    } else if (routine.name.trim() === 'Treino Livre') {
      identifier = 'Treino Livre';
    }

    if (musclesString) {
      routine.name = `${identifier} (${musclesString})`;
    } else {
      routine.name = identifier;
    }
  }

  render() {
    if (!this.containerEl) return;

    const keys = Object.keys(this.routines);
    const activeRoutine = this.routines[this.activeRoutineKey];
    const totalExercises = activeRoutine.exercises.length;
    const estimatedSets = totalExercises * 4;

    this.containerEl.innerHTML = `
      <div class="bg-zinc-950 min-h-screen -mx-5 -mt-5 p-5 pb-24">
        <div class="planner-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <div>
          <h3 style="font-family: var(--font-display); font-size: 1.4rem; color: var(--text-main);">
            <i data-lucide="calendar" style="color: var(--primary-lime)"></i> Montador de Rotinas de Treino
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
      <div class="planner-tabs" style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px;">
        ${keys.map(k => {
          const nameFull = this.routines[k].name;
          let identifier = nameFull;
          let muscles = '';
          const match = nameFull.match(/^(.*?)\s*\((.*?)\)$/);
          if (match) {
            identifier = match[1];
            muscles = match[2];
          }
          
          let topText = muscles || identifier;
          let bottomText = muscles ? identifier : '';

          return `
          <button class="planner-tab-btn ${k === this.activeRoutineKey ? 'active' : ''}" data-key="${k}" style="min-width: 140px;">
            <span style="font-family: var(--font-display); font-size: 1.1rem; color: ${k === this.activeRoutineKey ? '#fff' : 'var(--text-main)'}; letter-spacing: 0.5px;">${topText}</span>
            ${bottomText ? `<span style="font-size: 0.75rem; font-weight: 500; opacity: 0.8; max-width: 240px; white-space: normal; text-align: left; line-height: 1.4; margin-top: 2px;">${bottomText}</span>` : ''}
          </button>
          `;
        }).join('')}
        <button class="planner-tab-btn" id="btn-add-routine" style="background: rgba(255,255,255,0.03); border: 1px dashed var(--border-color); opacity: 0.7; flex-direction: row; align-items: center; justify-content: center;">
           <i data-lucide="plus" style="width: 16px; margin-right: 6px;"></i> Novo Treino
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
          <div class="font-mono tabular-nums text-3xl font-bold" style="color: var(--primary-lime);">${estimatedSets}</div>
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
                  <div class="flex items-center justify-between px-1 set-row group w-full mb-2" data-ex-name="${ex.name}">
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 flex items-center justify-center bg-zinc-950 border border-zinc-800 rounded text-zinc-400 font-mono text-xs">
                        ${i}
                      </div>
                      <div class="text-zinc-500 text-xs font-mono truncate max-w-[60px]">
                        -
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <input type="text" inputmode="decimal" pattern="[0-9]*" class="input-kg bg-zinc-950 rounded-md text-center font-mono text-white text-lg w-14 h-11 border border-zinc-800 focus:border-lime-500 outline-none transition-colors" placeholder="--" data-ex-name="${ex.name}" data-set-num="${i}">
                      <input type="text" inputmode="decimal" pattern="[0-9]*" class="input-reps bg-zinc-950 rounded-md text-center font-mono text-white text-lg w-14 h-11 border border-zinc-800 focus:border-lime-500 outline-none transition-colors" value="${repsText.replace(/\\D/g, '')}" data-ex-name="${ex.name}" data-set-num="${i}">
                      <button class="btn-check-set h-11 w-11 rounded-md bg-zinc-800 text-zinc-400 flex items-center justify-center transition-colors duration-200 active:scale-95" data-ex-idx="${idx}" data-set-idx="${i}" data-ex-name="${ex.name}">
                        <i data-lucide="check" class="w-5 h-5 pointer-events-none"></i>
                      </button>
                    </div>
                  </div>
                `;
              }

              return `
              return `
              <div class="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden mb-4 shadow-lg flex flex-col">
                <div class="p-4 flex justify-between items-start border-b border-zinc-800">
                  <div class="flex flex-col">
                    <h3 class="text-lg font-bold text-zinc-100 leading-tight">${idx + 1}. ${ex.name}</h3>
                    <div class="text-xs text-zinc-400 mt-1">${ex.equipment}</div>
                  </div>
                  <div class="relative flex-shrink-0 ml-2">
                    <button class="text-zinc-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/5 btn-ex-options" data-index="${idx}" title="Opções">
                      <i data-lucide="more-horizontal" class="w-6 h-6 pointer-events-none"></i>
                    </button>
                    <div class="absolute right-0 mt-1 w-48 bg-zinc-800 rounded-md shadow-2xl border border-zinc-700 z-50 hidden dropdown-ex-options" id="dropdown-ex-${idx}">
                      <div class="py-1 flex flex-col">
                        <button class="btn-replace flex items-center gap-2 px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white w-full text-left transition-colors" data-ex-idx="${idx}">
                          <i data-lucide="refresh-cw" class="w-4 h-4"></i> Substituir
                        </button>
                        <button class="btn-history flex items-center gap-2 px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white w-full text-left transition-colors" data-ex-idx="${idx}">
                          <i data-lucide="history" class="w-4 h-4"></i> Histórico
                        </button>
                        <div class="border-t border-zinc-700 my-1"></div>
                        <button class="btn-add-set flex items-center gap-2 px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white w-full text-left transition-colors" data-ex-idx="${idx}">
                          <i data-lucide="plus" class="w-4 h-4"></i> Adicionar Série
                        </button>
                        <button class="btn-remove-set flex items-center gap-2 px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white w-full text-left transition-colors" data-ex-idx="${idx}">
                          <i data-lucide="minus" class="w-4 h-4"></i> Remover Série
                        </button>
                        <div class="border-t border-zinc-700 my-1"></div>
                        <button class="btn-remove-ex flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full text-left transition-colors" data-index="${idx}">
                          <i data-lucide="trash-2" class="w-4 h-4"></i> Remover
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="p-4 w-full">
                  <div class="flex items-center justify-between mb-3 px-1">
                    <div class="flex items-center gap-2">
                      <div class="text-[10px] uppercase text-zinc-400 tracking-wider font-semibold w-7 text-center">Série</div>
                      <div class="text-[10px] uppercase text-zinc-400 tracking-wider font-semibold">Anterior</div>
                    </div>
                    <div class="flex items-center gap-2 text-[10px] uppercase text-zinc-400 tracking-wider font-semibold text-center">
                      <div class="w-14">kg</div>
                      <div class="w-14">Reps</div>
                      <div class="w-11"><i data-lucide="check" class="w-4 h-4 mx-auto opacity-70"></i></div>
                    </div>
                  </div>
                  
                  <div class="space-y-1 w-full pb-2">
                    ${setsHtml}
                  </div>
                </div>
              </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
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
        
        const isChecking = !button.classList.contains('bg-lime-500');

        if (isChecking) {
          // ── Visual: botão fica verde vibrante ──
          button.classList.remove('bg-zinc-800');
          button.classList.add('bg-lime-500');
          
          const icon = button.querySelector('i');
          if (icon) {
             icon.classList.remove('text-zinc-400');
             icon.classList.add('text-zinc-900');
             icon.style.transform = 'scale(1.2)';
          }
          
          // ── Desabilitar inputs ──
          const repsInput = row.querySelector('.input-reps');
          if (kgInput) {
            kgInput.disabled = true;
            kgInput.classList.add('opacity-50');
          }
          if (repsInput) {
            repsInput.disabled = true;
            repsInput.classList.add('opacity-50');
          }

          // ── Persistir os kg no localStorage ──
          if (kgValue > 0) {
            this._saveSetRecord(exName, setNum, kgValue);
          }
          
          if (this.soundEffects) this.soundEffects.playClick();
        } else {
          // ── Desfazer ──
          button.classList.add('bg-zinc-800');
          button.classList.remove('bg-lime-500');
          
          const icon = button.querySelector('i');
          if (icon) {
             icon.classList.add('text-zinc-400');
             icon.classList.remove('text-zinc-900');
             icon.style.transform = '';
          }
          
          const repsInput = row.querySelector('.input-reps');
          if (kgInput) {
            kgInput.disabled = false;
            kgInput.classList.remove('opacity-50');
          }
          if (repsInput) {
            repsInput.disabled = false;
            repsInput.classList.remove('opacity-50');
          }
        }
      });
    });

    this.containerEl.querySelectorAll('.btn-ex-options').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.currentTarget.dataset.index;
        const dropdown = document.getElementById(`dropdown-ex-${idx}`);
        
        // Esconde todos os outros dropdowns
        document.querySelectorAll('.dropdown-ex-options').forEach(el => {
           if (el.id !== `dropdown-ex-${idx}`) el.classList.add('hidden');
        });

        if (dropdown) {
          dropdown.classList.toggle('hidden');
        }
      });
    });

    this.containerEl.querySelectorAll('.btn-replace').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.currentTarget.dataset.exIdx;
        const dropdown = document.getElementById(`dropdown-ex-${idx}`);
        if (dropdown) dropdown.classList.add('hidden');
        this.openReplaceModal(idx);
      });
    });

    this.containerEl.querySelectorAll('.btn-history').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.currentTarget.dataset.exIdx;
        const dropdown = document.getElementById(`dropdown-ex-${idx}`);
        if (dropdown) dropdown.classList.add('hidden');
        this.openHistoryModal(idx);
      });
    });

    this.containerEl.querySelectorAll('.btn-remove-set').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.exIdx);
        const dropdown = document.getElementById(`dropdown-ex-${idx}`);
        if (dropdown) dropdown.classList.add('hidden');
        
        const routine = this.routines[this.activeRoutineKey];
        if (routine && routine.exercises[idx]) {
          const ex = routine.exercises[idx];
          
          let numSets = 4;
          let repsText = "10 reps";
          
          if (ex.customSets) {
            const numSetsMatch = ex.customSets.match(/(\d+)\s*série/i) || ex.customSets.match(/^(\d+)x/i);
            numSets = numSetsMatch ? parseInt(numSetsMatch[1]) : 4;
            const repsMatch = ex.customSets.match(/x\s*(.+)/i);
            repsText = repsMatch ? repsMatch[1] : '10 reps';
          }
          
          if (numSets > 1) {
            numSets -= 1;
            ex.customSets = `${numSets} séries x ${repsText}`;
            
            localStorage.setItem('gym_muscle_ex_sets_' + ex.id, ex.customSets);
            this.saveRoutinesToStorage();
            this.render();
            
            if (this.soundEffects) this.soundEffects.playSelect();
          }
        }
      });
    });



    this.containerEl.querySelectorAll('.btn-add-set').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.exIdx);
        const dropdown = document.getElementById(`dropdown-ex-${idx}`);
        if (dropdown) dropdown.classList.add('hidden');
        
        const routine = this.routines[this.activeRoutineKey];
        if (routine && routine.exercises[idx]) {
          const ex = routine.exercises[idx];
          
          let numSets = 4;
          let repsText = "10 reps";
          
          if (ex.customSets) {
            const numSetsMatch = ex.customSets.match(/(\d+)\s*série/i) || ex.customSets.match(/^(\d+)x/i);
            numSets = numSetsMatch ? parseInt(numSetsMatch[1]) : 4;
            const repsMatch = ex.customSets.match(/x\s*(.+)/i);
            repsText = repsMatch ? repsMatch[1] : '10 reps';
          }
          
          numSets += 1; // Adiciona +1 série
          ex.customSets = `${numSets} séries x ${repsText}`;
          
          // Salva no localStorage global para o Explorer e para a Rotina
          localStorage.setItem('gym_muscle_ex_sets_' + ex.id, ex.customSets);
          this.saveRoutinesToStorage();
          this.render();
          
          if (this.soundEffects) this.soundEffects.playAdd();
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

    if (window.lucide) window.lucide.createIcons({ root: this.containerEl });
  }
  openReplaceModal(exIdx) {
    const routine = this.routines[this.activeRoutineKey];
    if (!routine || !routine.exercises[exIdx]) return;
    
    const currentEx = routine.exercises[exIdx];
    
    let categoryId = currentEx.categoryId;
    if (!categoryId) {
      for (const [key, catData] of Object.entries(window.MUSCLE_DATABASE || MUSCLE_DATABASE)) {
        if (catData.exercises && catData.exercises.find(e => e.id === currentEx.id)) {
          categoryId = key;
          break;
        }
      }
    }
    
    const category = (window.MUSCLE_DATABASE || MUSCLE_DATABASE)[categoryId];
    
    if (!category || !category.exercises) {
      this.showNotification("Não foi possível encontrar alternativas para este exercício.", "error");
      return;
    }
    
    const alternatives = category.exercises.filter(e => e.id !== currentEx.id);
    
    const modal = document.createElement('div');
    modal.className = 'routine-modal-overlay';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px);
      display: flex; justify-content: center; align-items: center;
      z-index: 3000; padding: 20px; transition: opacity 0.3s ease;
    `;
    
    let listHtml = '';
    if (alternatives.length === 0) {
      listHtml = `<div class="text-slate-400 text-center py-4">Nenhuma alternativa encontrada.</div>`;
    } else {
      listHtml = alternatives.map(alt => `
        <button class="btn-select-replacement flex items-center justify-between w-full p-4 hover:bg-slate-800 border-b border-white/5 transition-colors text-left" data-alt-id="${alt.id}">
          <div>
            <div class="text-white font-semibold">${alt.name}</div>
            <div class="text-xs text-slate-400">${alt.equipment}</div>
          </div>
          <i data-lucide="arrow-right-circle" class="w-5 h-5 text-lime-500"></i>
        </button>
      `).join('');
    }
    
    modal.innerHTML = `
      <div style="background: rgba(30, 41, 59, 0.95); backdrop-filter: blur(12px); width: 100%; max-width: 500px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05); overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; flex-direction: column; transition: all 0.3s ease;">
        <div style="padding: 20px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-family: var(--font-display); font-size: 1.3rem; color: var(--text-main); margin: 0;">Substituir Exercício</h3>
          <button id="btn-close-replace" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer;"><i data-lucide="x"></i></button>
        </div>
        <div style="padding: 10px; overflow-y: auto; max-height: 60vh;">
          <div class="text-sm text-slate-400 px-3 py-2">Substituindo: <span class="text-white font-semibold">${currentEx.name}</span></div>
          <div class="flex flex-col mt-2 rounded-xl border border-white/5 overflow-hidden">
            ${listHtml}
          </div>
        </div>
        <div style="padding: 20px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 12px; background: rgba(0,0,0,0.2);">
          <button id="btn-cancel-replace" class="btn-secondary" style="padding: 10px 20px;">Cancelar</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    if (window.lucide) window.lucide.createIcons({ root: modal });
    
    const closeModal = () => {
      modal.style.opacity = '0';
      setTimeout(() => modal.remove(), 300);
    };
    
    modal.querySelector('#btn-close-replace').addEventListener('click', closeModal);
    modal.querySelector('#btn-cancel-replace').addEventListener('click', closeModal);
    
    modal.querySelectorAll('.btn-select-replacement').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const altId = e.currentTarget.dataset.altId;
        const newEx = alternatives.find(a => a.id === altId);
        if (newEx) {
          const savedSetsReps = localStorage.getItem('gym_muscle_ex_sets_' + newEx.id);
          routine.exercises[exIdx] = { ...newEx, customSets: savedSetsReps || '3 séries x 10 reps' };
          
          this._syncRoutineNameWithExercises(routine);
          this.saveRoutinesToStorage();
          this.render();
          if (this.soundEffects) this.soundEffects.playAdd();
          this.showNotification(`Exercício substituído por ${newEx.name}!`);
          closeModal();
        }
      });
    });
  }

  openHistoryModal(exIdx) {
    const routine = this.routines[this.activeRoutineKey];
    if (!routine || !routine.exercises[exIdx]) return;
    
    const exName = routine.exercises[exIdx].name;
    let records = [];
    try {
      records = JSON.parse(localStorage.getItem('treino3d_set_records')) || [];
    } catch { /* empty */ }
    
    const exRecords = records.filter(r => r.exercise === exName);
    
    const historyMap = {};
    exRecords.forEach(r => {
      const dateKey = new Date(r.date).toLocaleDateString();
      if (!historyMap[dateKey] || r.kg > historyMap[dateKey]) {
        historyMap[dateKey] = r.kg;
      }
    });
    
    const labels = Object.keys(historyMap);
    const dataPoints = Object.values(historyMap);
    
    const modal = document.createElement('div');
    modal.className = 'routine-modal-overlay';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px);
      display: flex; justify-content: center; align-items: center;
      z-index: 3000; padding: 20px; transition: opacity 0.3s ease;
    `;
    
    let contentHtml = '';
    if (labels.length === 0) {
      contentHtml = `
        <div class="text-center py-10 text-slate-400">
          <i data-lucide="line-chart" class="w-12 h-12 mx-auto mb-4 opacity-50"></i>
          Nenhum histórico encontrado para <br><b class="text-white">${exName}</b>.<br><br>
          <span class="text-xs opacity-70">Complete algumas séries (marcando o check verde) com carga para ver o gráfico de progressão!</span>
        </div>
      `;
    } else {
      contentHtml = `
        <div class="w-full bg-slate-800 rounded-lg p-3 border border-white/5 relative" style="height: 300px;">
           <canvas id="history-chart-canvas"></canvas>
        </div>
      `;
    }
    
    modal.innerHTML = `
      <div style="background: rgba(30, 41, 59, 0.95); backdrop-filter: blur(12px); width: 100%; max-width: 500px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05); overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; flex-direction: column; transition: all 0.3s ease;">
        <div style="padding: 20px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-family: var(--font-display); font-size: 1.3rem; color: var(--text-main); margin: 0;">Histórico de Cargas</h3>
          <button id="btn-close-history" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer;"><i data-lucide="x"></i></button>
        </div>
        
        <div style="padding: 20px; overflow-y: auto; max-height: 60vh;">
          ${contentHtml}
        </div>
        
        <div style="padding: 20px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 12px; background: rgba(0,0,0,0.2);">
          <button id="btn-cancel-history" class="btn-primary" style="padding: 10px 20px;">Fechar</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    if (window.lucide) window.lucide.createIcons({ root: modal });
    
    const closeModal = () => {
      modal.style.opacity = '0';
      setTimeout(() => modal.remove(), 300);
    };
    
    modal.querySelector('#btn-close-history').addEventListener('click', closeModal);
    modal.querySelector('#btn-cancel-history').addEventListener('click', closeModal);
    
    if (labels.length > 0 && window.Chart) {
      setTimeout(() => {
        const ctx = document.getElementById('history-chart-canvas').getContext('2d');
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: 'Carga Máxima (kg)',
              data: dataPoints,
              borderColor: '#84CC16',
              backgroundColor: 'rgba(132, 204, 22, 0.1)',
              borderWidth: 3,
              tension: 0.3,
              fill: true,
              pointBackgroundColor: '#84CC16',
              pointRadius: 4,
              pointHoverRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#94a3b8',
                bodyColor: '#fff',
                padding: 10,
                displayColors: false,
                callbacks: {
                  label: function(context) { return context.parsed.y + ' kg'; }
                }
              }
            },
            scales: {
              x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
              y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } }
            }
          }
        });
      }, 100);
    }
  }

  /**
   * Persiste o registro de uma série concluída (exercício + kg) no localStorage.
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
      background: ${type === 'success' ? 'linear-gradient(135deg, var(--primary-lime), #65a30d)' : '#ef4444'};
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
      if (saved) {
         const parsed = JSON.parse(saved);
         Object.values(parsed).forEach(routine => {
            if (routine.exercises) {
               routine.exercises.forEach(ex => {
                  const savedSetsReps = localStorage.getItem('gym_muscle_ex_sets_' + ex.id);
                  ex.customSets = savedSetsReps || '3 séries x 10 reps';
               });
            }
         });
         return parsed;
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
