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
        <div class="banner-head">
          <h2 style="color: ${data.color}">
            <span class="muscle-dot" style="background: ${data.color}; width: 14px; height: 14px;"></span>
            ${data.name}
          </h2>
          <span class="target-head-badge" style="background: ${data.color}22; color: ${data.color}">
            Vista: ${data.view === 'front' ? 'Frontal' : 'Posterior'}
          </span>
        </div>
        <p class="banner-desc"><strong>Anatomia:</strong> ${data.anatomicalNames.join(" • ")}</p>
        <p class="banner-desc">${data.description}</p>
        <div class="biomechanics-box" style="border-left-color: ${data.color}">
          <i data-lucide="zap" style="color: ${data.color}; min-width: 18px;"></i>
          <div>
            <strong>Dica Biomecânica do Especialista:</strong> ${data.bioMechanicsTips}
          </div>
        </div>
      `;
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  renderExerciseList() {
    if (!this.listContainer) return;
    this.listContainer.innerHTML = "";

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
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    exercisesToDisplay.forEach(ex => {
      const card = document.createElement('div');
      card.className = "exercise-card";

      const categoryData = MUSCLE_DATABASE[ex.categoryId];
      const accentColor = categoryData ? categoryData.color : 'var(--primary-cyan)';

      card.innerHTML = `
        <div class="card-top">
          <h3 class="card-title cursor-pointer hover:text-lime-400 transition-colors" title="Ver Histórico de Progressão">${ex.name}</h3>
          <span class="target-head-badge editable-field bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider" contenteditable="true" data-field="targetHead" spellcheck="false" title="Clique para editar">
            ${ex.targetHead}
          </span>
        </div>
        <div class="flex gap-2 mt-2 mb-3">
          <span class="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-800 rounded-md px-2.5 py-1 text-sm text-slate-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700">
            <i data-lucide="wrench" class="w-3.5 h-3.5"></i>
            <span class="editable-field inline-edit outline-none" contenteditable="true" data-field="equipment" spellcheck="false" title="Clique para editar">${ex.equipment}</span>
          </span>
          <span class="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-800 rounded-md px-2.5 py-1 text-sm text-slate-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700">
            <i data-lucide="repeat" class="w-3.5 h-3.5"></i>
            <span class="editable-field inline-edit outline-none" contenteditable="true" data-field="setsReps" spellcheck="false" title="Clique para editar">${ex.setsReps.replace(/(\d+(?:-\d+)?)/g, '<span class="font-mono font-bold text-slate-800 dark:text-white tabular-nums">$1</span>')}</span>
          </span>
        </div>
        <p class="card-instructions editable-field" contenteditable="true" data-field="instructions" spellcheck="false" title="Clique para editar">${ex.instructions}</p>
        ${ex.biomechanics ? `<div style="font-size: 0.78rem; color: var(--text-dim); font-style: italic;">💡 <span class="editable-field" contenteditable="true" data-field="biomechanics" spellcheck="false" title="Clique para editar">${ex.biomechanics}</span></div>` : ''}
        
        <div class="card-actions flex gap-2">
          <button class="btn-add-workout flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors bg-lime-500 text-black font-semibold hover:bg-lime-600">
            <i data-lucide="trending-up" class="w-3.5 h-3.5"></i> Progresso
          </button>
          <button class="btn-edit-ex flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors text-gray-400 hover:text-gray-800 hover:bg-gray-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Editar
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
      window.lucide.createIcons();
    }
  }
}
