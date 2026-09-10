/**
 * ExerciseUI - Renderizador de Exercícios e Navegação Bi-direcional
 */

import { MUSCLE_DATABASE } from './database.js';

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
    this.listContainer.className = "flex flex-col w-full gap-4 pb-20";

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
      card.className = "bg-zinc-900 rounded-2xl border border-white/5 flex flex-col p-4 w-full relative";

      const categoryData = MUSCLE_DATABASE[ex.categoryId];
      const accentColor = categoryData ? categoryData.color : 'var(--primary-cyan)';

      card.innerHTML = `
        <div class="flex flex-col mb-3">
          <div class="flex justify-between items-start gap-2">
            <h3 class="font-bold text-zinc-100 text-lg leading-tight cursor-pointer hover:text-lime-400 transition-colors" title="Ver Histórico de Progressão">${ex.name}</h3>
            <button class="btn-edit-ex flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-sm transition-colors text-zinc-500 hover:text-zinc-200 hover:bg-white/5" title="Editar Exercício">
              <i data-lucide="edit-3" class="w-4 h-4 pointer-events-none"></i>
            </button>
          </div>
          <div class="mt-1">
            <span class="editable-field bg-white/5 text-zinc-300 border border-white/10 text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold" contenteditable="true" data-field="targetHead" spellcheck="false" title="Clique para editar">
              ${ex.targetHead}
            </span>
          </div>
        </div>
        
        <div class="flex flex-wrap gap-2 mb-3">
          <span class="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 transition-colors rounded-xl px-3 py-1.5 text-sm text-zinc-300 border border-zinc-700">
            <i data-lucide="${eqIcon}" class="w-4 h-4 opacity-70 equip-icon pointer-events-none"></i>
            <select class="equip-select bg-transparent outline-none font-semibold text-white cursor-pointer" style="max-width: 140px;">
              <option value="Máquina" class="bg-zinc-800 text-white" ${eqVal === 'Máquina' ? 'selected' : ''}>Máquina</option>
              <option value="Halteres" class="bg-zinc-800 text-white" ${eqVal === 'Halteres' ? 'selected' : ''}>Halteres</option>
              <option value="Barra" class="bg-zinc-800 text-white" ${eqVal === 'Barra' ? 'selected' : ''}>Barra</option>
            </select>
          </span>
          <span class="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 transition-colors rounded-xl px-3 py-1.5 text-sm text-zinc-300 border border-zinc-700">
            <i data-lucide="repeat" class="w-4 h-4 opacity-70 pointer-events-none"></i>
            <div class="flex flex-col items-center justify-center -space-y-0.5">
              <select class="series-select bg-transparent outline-none font-mono font-bold text-white cursor-pointer text-center" style="min-width: 2rem;">
                ${Array.from({length: 10}, (_, i) => `<option value="${i+1}" class="bg-zinc-800 text-white" ${(i+1) === currentSeries ? 'selected' : ''}>${i+1}</option>`).join('')}
              </select>
              <span class="text-[0.65rem] uppercase tracking-wider font-semibold opacity-60">séries</span>
            </div>
            <span class="font-bold opacity-40 text-xs px-1">x</span>
            <div class="flex flex-col items-center justify-center -space-y-0.5">
              <select class="reps-select bg-transparent outline-none font-mono font-bold text-white cursor-pointer text-center" style="min-width: 2rem;">
                ${Array.from({length: 15}, (_, i) => `<option value="${i+1}" class="bg-zinc-800 text-white" ${(i+1) === currentReps ? 'selected' : ''}>${i+1}</option>`).join('')}
              </select>
              <span class="text-[0.65rem] uppercase tracking-wider font-semibold opacity-60">reps</span>
            </div>
          </span>
        </div>
        
        <details class="group mb-4">
          <summary class="cursor-pointer text-xs font-semibold text-zinc-400 hover:text-lime-500 transition-colors flex items-center gap-1 list-none select-none">
            <i data-lucide="info" class="w-3.5 h-3.5"></i> Ver instruções e dicas
          </summary>
          <div class="mt-2 pt-2 border-t border-white/5 space-y-2">
            <p class="editable-field text-sm text-zinc-300 leading-relaxed" contenteditable="true" data-field="instructions" spellcheck="false" title="Clique para editar">${ex.instructions}</p>
            ${ex.biomechanics ? `<div class="text-[0.78rem] text-zinc-500 italic flex gap-1.5 items-start mt-1">
              <span class="mt-0.5">💡</span>
              <span class="editable-field" contenteditable="true" data-field="biomechanics" spellcheck="false" title="Clique para editar">${ex.biomechanics}</span>
            </div>` : ''}
          </div>
        </details>
        
        <div class="flex gap-2 mt-auto pt-2">
          <button class="btn-add-to-routine flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm transition-colors bg-lime-500 text-black font-semibold hover:bg-lime-600 flex-1 shadow-lg shadow-lime-500/20" title="Adicionar ao Treino Atual">
            <i data-lucide="plus" class="w-4 h-4 pointer-events-none"></i> + Treino
          </button>
          <button class="btn-add-workout flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm transition-colors bg-zinc-800 text-zinc-300 font-semibold hover:bg-zinc-700 hover:text-white" title="Histórico de Progresso">
            <i data-lucide="trending-up" class="w-4 h-4 pointer-events-none"></i>
          </button>
        </div>
      `;

      // Inline Editing Logic
      const editableFields = card.querySelectorAll('.editable-field');
      editableFields.forEach(field => {
        // Save value on blur
        field.addEventListener('blur', (e) => {
          const fieldName = e.target.getAttribute('data-field');
          const newValue = e.target.textContent.trim();
          if (newValue) {
            ex[fieldName] = newValue;
          }
        });

        // Prevent newlines in single-line fields
        field.addEventListener('keydown', (e) => {
          const fieldName = e.target.getAttribute('data-field');
          if (e.key === 'Enter' && fieldName !== 'instructions' && fieldName !== 'biomechanics') {
            e.preventDefault();
            e.target.blur();
          }
        });
      });

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

      this.listContainer.appendChild(card);
    });

    if (window.lucide) {
      window.lucide.createIcons({ root: this.listContainer });
    }
  }
}
