/**
 * ExerciseUI - Renderizador de Exercícios e Navegação Bi-direcional
 */

import { MUSCLE_DATABASE } from './database.js';
import { saveCustomExercisesToCloud } from './store.js?v=8';

export class ExerciseUI {
  constructor(options) {
    this.filterContainer = document.getElementById(options.filterContainerId);
    this.bannerContainer = document.getElementById(options.bannerContainerId);
    this.listContainer = document.getElementById(options.listContainerId);
    this.searchInput = document.getElementById(options.searchInputId);

    this.onSelectMuscleCallback = options.onSelectMuscleCallback;
    this.onEditExerciseCallback = options.onEditExerciseCallback || null;
    this.onAddToWorkoutCallback = options.onAddToWorkoutCallback || null;
    this.onOpenProgressionCallback = options.onOpenProgressionCallback || null;

    this.activeCategory = "pecho"; // Padrão inicial
    this.searchQuery = "";

    this.init();
  }

  init() {
    this.renderCategoryChips();
    this.renderMuscleBanner(this.activeCategory);
    this.renderExerciseList();

    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderExerciseList();
      });
    }
  }

  renderCategoryChips() {
    if (!this.filterContainer) return;
    this.filterContainer.innerHTML = "";

    // Botão "Todos"
    const allChip = document.createElement('button');
    allChip.className = `filter-chip ${this.activeCategory === 'all' ? 'active' : ''}`;
    allChip.style.setProperty('--chip-color', 'var(--primary-cyan)');
    allChip.innerHTML = `<span class="muscle-dot"></span> Todos os Músculos`;
    allChip.addEventListener('click', () => this.selectCategory('all'));
    this.filterContainer.appendChild(allChip);

    // Músculos individuais
    Object.keys(MUSCLE_DATABASE).forEach(key => {
      const data = MUSCLE_DATABASE[key];
      const chip = document.createElement('button');
      chip.className = `filter-chip ${this.activeCategory === key ? 'active' : ''}`;
      chip.style.setProperty('--chip-color', data.color);
      chip.innerHTML = `
        <span class="muscle-dot"></span>
        ${data.name}
      `;
      chip.addEventListener('click', () => this.selectCategory(key));
      this.filterContainer.appendChild(chip);
    });
  }

  selectCategory(muscleId, triggerModelSync = true) {
    this.activeCategory = muscleId;
    this.renderCategoryChips();
    this.renderMuscleBanner(muscleId);
    this.renderExerciseList();

    if (triggerModelSync && this.onSelectMuscleCallback && muscleId !== 'all') {
      this.onSelectMuscleCallback(muscleId);
    }
  }

  renderMuscleBanner(muscleId) {
    if (!this.bannerContainer) return;

    if (muscleId === 'all') {
      this.bannerContainer.innerHTML = `
        <div class="banner-head">
          <h2><i data-lucide="dumbbell"></i> Catálogo Geral de Exercícios</h2>
        </div>
        <p class="banner-desc">Exibindo todos os exercícios cadastrados. Selecione um grupo muscular no modelo 3D ou nos filtros acima para ver a anatomia e biomecânica detalhada.</p>
      `;
    } else {
      const data = MUSCLE_DATABASE[muscleId];
      if (!data) return;

      this.bannerContainer.innerHTML = `
        <div class="banner-head" style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <h2 style="color: ${data.color}; margin: 0; display: flex; align-items: center; gap: 8px;">
              <span class="muscle-dot" style="background: ${data.color}; width: 14px; height: 14px;"></span>
              ${data.name}
            </h2>
            <span class="target-head-badge" style="background: ${data.color}22; color: ${data.color}">
              Vista: ${data.view === 'front' ? 'Frontal' : 'Posterior'}
            </span>
          </div>
          <button id="btn-add-group-to-routine" class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors bg-lime-500 text-black font-semibold hover:bg-lime-600">
            <i data-lucide="plus" class="w-4 h-4"></i> Adicionar Grupo ao Treino
          </button>
        </div>
        <p class="banner-desc mt-2"><strong>Anatomia:</strong> ${data.anatomicalNames.join(" • ")}</p>
        <p class="banner-desc">${data.description}</p>
        <div class="biomechanics-box mt-2" style="border-left-color: ${data.color}">
          <i data-lucide="zap" style="color: ${data.color}; min-width: 18px;"></i>
          <div>
            <strong>Dica Biomecânica do Especialista:</strong> ${data.bioMechanicsTips}
          </div>
        </div>
      `;

      const btnAddGroup = this.bannerContainer.querySelector('#btn-add-group-to-routine');
      if (btnAddGroup) {
        btnAddGroup.addEventListener('click', () => {
          if (this.onAddToWorkoutCallback) {
             data.exercises.forEach(ex => {
               this.onAddToWorkoutCallback(ex);
             });
          }
        });
      }
    }

    if (window.lucide) {
      window.lucide.createIcons({ root: this.bannerContainer });
    }
  }

  renderExerciseList() {
    if (!this.listContainer) return;
    this.listContainer.innerHTML = "";
    this.listContainer.className = "flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-20 pt-4 px-4 w-full max-w-7xl mx-auto content-start";

    let exercisesToDisplay = [];

    if (this.activeCategory === 'all') {
      Object.keys(MUSCLE_DATABASE).forEach(cat => {
        exercisesToDisplay.push(...MUSCLE_DATABASE[cat].exercises.map(e => ({ ...e, categoryId: cat })));
      });
    } else {
      const data = MUSCLE_DATABASE[this.activeCategory];
      if (data) {
        exercisesToDisplay = data.exercises.map(e => ({ ...e, categoryId: this.activeCategory }));
      }
    }

    // Filtrar por texto da busca
    if (this.searchQuery) {
      exercisesToDisplay = exercisesToDisplay.filter(ex => 
        ex.name.toLowerCase().includes(this.searchQuery) ||
        ex.targetHead.toLowerCase().includes(this.searchQuery) ||
        ex.equipment.toLowerCase().includes(this.searchQuery) ||
        ex.instructions.toLowerCase().includes(this.searchQuery)
      );
    }

    if (exercisesToDisplay.length === 0) {
      this.listContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          <i data-lucide="search-x" style="width: 48px; height: 48px; opacity: 0.4; margin-bottom: 12px;"></i>
          <p>Nenhum exercício encontrado para "${this.searchQuery}".</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons({ root: this.listContainer });
      return;
    }

    exercisesToDisplay.forEach(ex => {
      let currentSeries = 3;
      let currentReps = 10;
      
      const savedSetsReps = localStorage.getItem('gym_muscle_ex_sets_' + ex.id);
      if (savedSetsReps) {
         ex.setsReps = savedSetsReps;
         const sMatch = savedSetsReps.match(/(\d+)\s*série/i) || savedSetsReps.match(/^(\d+)x/i);
         const rMatch = savedSetsReps.match(/x\s*(\d+)/i) || savedSetsReps.match(/(\d+)(-\d+)?\s*reps/i);
         currentSeries = sMatch ? parseInt(sMatch[1]) : 3;
         currentReps = rMatch ? parseInt(rMatch[1]) : 10;
      } else {
         ex.setsReps = "3 séries x 10 reps";
      }

      let eqVal = "Máquina";
      let eqIcon = "settings";
      const eqLow = (ex.equipment || '').toLowerCase();
      if (eqLow.includes('halter')) {
        eqVal = "Halteres";
        eqIcon = "dumbbell";
      } else if (eqLow.includes('barra')) {
        eqVal = "Barra";
        eqIcon = "minus";
      }

      const card = document.createElement('div');
      card.className = "bg-zinc-900 rounded-2xl border border-white/5 flex flex-col p-4 w-full relative transition-all duration-300 hover:z-20 hover:-translate-y-1 hover:scale-[1.02] hover:border-white/40 hover:shadow-2xl hover:shadow-white/10";

      const categoryData = MUSCLE_DATABASE[ex.categoryId];
      const accentColor = categoryData ? categoryData.color : 'var(--primary-cyan)';

      card.innerHTML = `
        <div class="flex flex-col mb-4">
          <div class="flex justify-between items-start gap-3">
            <h3 class="card-title font-semibold text-zinc-100 text-[1.1rem] leading-snug cursor-pointer hover:text-lime-400 transition-colors" title="Ver Histórico de Progressão">${ex.name}</h3>
          </div>
          <div class="mt-1.5">
            <span class="text-zinc-300 text-[11px] uppercase tracking-[0.1em] font-medium">
              ${ex.targetHead}
            </span>
          </div>
        </div>
        
        <div class="flex gap-2 mb-4 w-full">
          <div class="flex-1 flex items-center justify-center gap-1.5 bg-zinc-950/50 hover:bg-zinc-800 transition-colors rounded-xl py-2 px-1 text-sm text-zinc-300 border border-zinc-800">
            <i data-lucide="${eqIcon}" class="w-[15px] h-[15px] opacity-70 equip-icon pointer-events-none"></i>
            <select class="equip-select bg-transparent outline-none font-medium text-white cursor-pointer appearance-none text-center" style="text-align-last: center;">
              <option value="Máquina" class="bg-zinc-800 text-white" ${eqVal === 'Máquina' ? 'selected' : ''}>Máquina</option>
              <option value="Halteres" class="bg-zinc-800 text-white" ${eqVal === 'Halteres' ? 'selected' : ''}>Halteres</option>
              <option value="Barra" class="bg-zinc-800 text-white" ${eqVal === 'Barra' ? 'selected' : ''}>Barra</option>
            </select>
          </div>
          <div class="flex-1 flex items-center justify-center gap-1 bg-zinc-950/50 hover:bg-zinc-800 transition-colors rounded-xl py-2 px-1 text-sm text-zinc-300 border border-zinc-800">
            <i data-lucide="repeat" class="w-[15px] h-[15px] opacity-70 pointer-events-none mr-1"></i>
            <div class="flex items-baseline gap-1">
              <select class="series-select bg-transparent outline-none font-mono font-medium text-white cursor-pointer appearance-none text-center">
                ${Array.from({length: 10}, (_, i) => `<option value="${i+1}" class="bg-zinc-800 text-white" ${(i+1) === currentSeries ? 'selected' : ''}>${i+1}</option>`).join('')}
              </select>
              <span class="text-zinc-400 text-[10px]">S</span>
            </div>
            <span class="text-zinc-500 text-xs px-0.5">x</span>
            <div class="flex items-baseline gap-1">
              <select class="reps-select bg-transparent outline-none font-mono font-medium text-white cursor-pointer appearance-none text-center">
                ${Array.from({length: 15}, (_, i) => `<option value="${i+1}" class="bg-zinc-800 text-white" ${(i+1) === currentReps ? 'selected' : ''}>${i+1}</option>`).join('')}
              </select>
              <span class="text-zinc-400 text-[10px]">R</span>
            </div>
          </div>
        </div>
        
        <div class="mb-5 flex-1">
          <p class="text-[13px] text-zinc-300 leading-relaxed font-light line-clamp-3 mb-2">${ex.instructions}</p>
          ${ex.biomechanics ? `<div class="text-[12px] text-zinc-400 italic flex gap-1.5 items-start">
            <i data-lucide="zap" class="w-3 h-3 mt-0.5 opacity-70"></i>
            <span class="leading-snug line-clamp-2">${ex.biomechanics}</span>
          </div>` : ''}
        </div>
        
        <div class="flex mt-auto justify-end">
          <div class="flex items-center gap-1 bg-lime-500/15 p-1 rounded-full border border-lime-500/10 shadow-sm">
            <button class="btn-edit-ex flex items-center justify-center w-9 h-9 rounded-full transition-all text-lime-400 hover:bg-lime-500/20 hover:text-lime-300 hover:scale-105" title="Editar Exercício">
              <i data-lucide="edit-3" class="w-[18px] h-[18px] pointer-events-none"></i>
            </button>
            <button class="btn-add-workout flex items-center justify-center w-9 h-9 rounded-full transition-all text-lime-400 hover:bg-lime-500/20 hover:text-lime-300 hover:scale-105" title="Histórico de Progresso">
              <i data-lucide="trending-up" class="w-[18px] h-[18px] pointer-events-none"></i>
            </button>
            <button class="btn-add-to-routine flex items-center justify-center w-9 h-9 rounded-full transition-all text-lime-400 hover:bg-lime-500/20 hover:text-lime-300 hover:scale-105" title="Adicionar ao Treino Atual">
              <i data-lucide="plus" class="w-[20px] h-[20px] pointer-events-none"></i>
            </button>
            <button class="btn-delete-ex flex items-center justify-center w-9 h-9 rounded-full transition-all text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:scale-105" title="Excluir Exercício">
              <i data-lucide="trash-2" class="w-[18px] h-[18px] pointer-events-none"></i>
            </button>
          </div>
        </div>
      `;

      // Inline Editing Logic Removida a pedido (agora apenas pelo lápis)

      const seriesSelect = card.querySelector('.series-select');
      const repsSelect = card.querySelector('.reps-select');
      if (seriesSelect && repsSelect) {
        const updateSetsReps = () => {
          ex.setsReps = `${seriesSelect.value} séries x ${repsSelect.value} reps`;
          localStorage.setItem('gym_muscle_ex_sets_' + ex.id, ex.setsReps);
          if (window.workoutPlanner) {
             window.workoutPlanner.updateExerciseSets(ex.id, ex.setsReps);
          }
        };
        seriesSelect.addEventListener('change', updateSetsReps);
        repsSelect.addEventListener('change', updateSetsReps);
      }

      const equipSelect = card.querySelector('.equip-select');
      const equipIcon = card.querySelector('.equip-icon');
      if (equipSelect) {
        equipSelect.addEventListener('change', () => {
          ex.equipment = equipSelect.value;
          
          let newIcon = "settings";
          if (ex.equipment === "Halteres") newIcon = "dumbbell";
          if (ex.equipment === "Barra") newIcon = "minus";
          
          if (window.lucide) {
            const parent = equipSelect.parentElement;
            const currentIcon = parent.querySelector('.equip-icon');
            if (currentIcon) {
              const newI = document.createElement('i');
              newI.className = "w-3.5 h-3.5 opacity-70 equip-icon";
              newI.setAttribute('data-lucide', newIcon);
              parent.replaceChild(newI, currentIcon);
              window.lucide.createIcons({ root: parent });
            }
          }
        });
      }

      card.querySelector('.btn-add-to-routine').addEventListener('click', () => {
        if (this.onAddToWorkoutCallback) this.onAddToWorkoutCallback(ex);
      });

      card.querySelector('.btn-add-workout').addEventListener('click', () => {
        if (this.onOpenProgressionCallback) this.onOpenProgressionCallback(ex);
      });

      card.querySelector('.card-title').addEventListener('click', () => {
        if (this.onOpenProgressionCallback) this.onOpenProgressionCallback(ex);
      });

      card.querySelector('.btn-edit-ex').addEventListener('click', () => {
        if (this.onEditExerciseCallback) this.onEditExerciseCallback(ex);
      });

      card.querySelector('.btn-delete-ex').addEventListener('click', () => {
        if (confirm(`Tem certeza que deseja excluir o exercício "${ex.name}" permanentemente? Isso removerá o exercício do banco de dados.`)) {
          const category = MUSCLE_DATABASE[ex.categoryId];
          if (category) {
            category.exercises = category.exercises.filter(e => e.id !== ex.id);
            
            const customData = {};
            Object.keys(MUSCLE_DATABASE).forEach(cat => {
              customData[cat] = MUSCLE_DATABASE[cat].exercises;
            });
            const jsonStr = JSON.stringify(customData);
            localStorage.setItem('gym_muscle_app_custom_exercises', jsonStr);
            saveCustomExercisesToCloud(jsonStr);
            
            this.renderExerciseList();
            
            if (window.workoutPlanner) {
               window.workoutPlanner.showNotification(`"${ex.name}" excluído.`);
            }
          }
        }
      });

      this.listContainer.appendChild(card);
    });

    if (window.lucide) {
      window.lucide.createIcons({ root: this.listContainer });
    }
  }
}
