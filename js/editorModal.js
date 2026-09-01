/**
 * EditorModal - Modal de Edição de Exercícios e Cadastro Customizado
 */

import { MUSCLE_DATABASE } from './database.js';

export class EditorModal {
  constructor(onSaveSuccessCallback) {
    this.onSaveSuccessCallback = onSaveSuccessCallback;
    this.currentEditingExercise = null;
    this.modalEl = null;
    
    this.createModalDOM();
  }

  createModalDOM() {
    const modalHTML = `
      <div id="exercise-editor-modal" class="modal-backdrop">
        <div class="modal-box">
          <div class="modal-header">
            <h3 id="modal-title"><i data-lucide="edit-3"></i> Editar Exercício</h3>
            <button class="btn-close" id="btn-close-modal"><i data-lucide="x"></i></button>
          </div>
          
          <form id="exercise-form" class="modal-body">
            <input type="hidden" id="form-ex-id" />
            
            <div class="form-group">
              <label for="form-ex-name">Nome do Exercício *</label>
              <input type="text" id="form-ex-name" class="form-control" required placeholder="Ex: Supino Inclinado com Halteres" />
            </div>

            <div class="form-group">
              <label for="form-ex-category">Grupo Muscular Principal *</label>
              <select id="form-ex-category" class="form-control" required>
                ${Object.keys(MUSCLE_DATABASE).map(key => `
                  <option value="${key}">${MUSCLE_DATABASE[key].name}</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label for="form-ex-target">Região / Cabeça Alvo *</label>
              <input type="text" id="form-ex-target" class="form-control" required placeholder="Ex: Peitoral Superior (Clavicular)" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label for="form-ex-equipment">Equipamento</label>
                <input type="text" id="form-ex-equipment" class="form-control" placeholder="Ex: Halteres + Banco 30°" />
              </div>
              <div class="form-group">
                <label for="form-ex-setsreps">Séries & Repetições</label>
                <input type="text" id="form-ex-setsreps" class="form-control" placeholder="Ex: 4 séries x 8-12 reps" />
              </div>
            </div>

            <div class="form-group">
              <label for="form-ex-instructions">Instruções de Execução *</label>
              <textarea id="form-ex-instructions" class="form-control" required placeholder="Descreva os passos para a execução perfeita..."></textarea>
            </div>

            <div class="form-group">
              <label for="form-ex-biomechanics">Dica Biomecânica de Especialista</label>
              <input type="text" id="form-ex-biomechanics" class="form-control" placeholder="Ex: Manter cotovelos a 45° para proteger a articulação do ombro." />
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary" id="btn-cancel-modal">Cancelar</button>
              <button type="submit" class="btn-primary">Salvar Alterações</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modalEl = document.getElementById('exercise-editor-modal');

    document.getElementById('btn-close-modal').addEventListener('click', () => this.close());
    document.getElementById('btn-cancel-modal').addEventListener('click', () => this.close());

    document.getElementById('exercise-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveForm();
    });
  }

  openForNew(defaultCategory = 'pecho') {
    this.currentEditingExercise = null;
    document.getElementById('modal-title').innerHTML = `<i data-lucide="plus-circle"></i> Adicionar Novo Exercício`;
    document.getElementById('form-ex-id').value = "";
    document.getElementById('form-ex-name').value = "";
    document.getElementById('form-ex-category').value = defaultCategory;
    document.getElementById('form-ex-target').value = "";
    document.getElementById('form-ex-equipment').value = "";
    document.getElementById('form-ex-setsreps').value = "4 séries x 10-12 reps";
    document.getElementById('form-ex-instructions').value = "";
    document.getElementById('form-ex-biomechanics').value = "";

    this.modalEl.classList.add('open');
    if (window.lucide) window.lucide.createIcons();
  }

  openForEdit(exercise) {
    this.currentEditingExercise = exercise;
    document.getElementById('modal-title').innerHTML = `<i data-lucide="edit-3"></i> Editar: ${exercise.name}`;
    document.getElementById('form-ex-id').value = exercise.id;
    document.getElementById('form-ex-name').value = exercise.name;
    document.getElementById('form-ex-category').value = exercise.categoryId || 'pecho';
    document.getElementById('form-ex-target').value = exercise.targetHead || '';
    document.getElementById('form-ex-equipment').value = exercise.equipment || '';
    document.getElementById('form-ex-setsreps').value = exercise.setsReps || '';
    document.getElementById('form-ex-instructions').value = exercise.instructions || '';
    document.getElementById('form-ex-biomechanics').value = exercise.biomechanics || '';

    this.modalEl.classList.add('open');
    if (window.lucide) window.lucide.createIcons();
  }

  close() {
    this.modalEl.classList.remove('open');
  }

  saveForm() {
    const id = document.getElementById('form-ex-id').value || `custom_${Date.now()}`;
    const categoryId = document.getElementById('form-ex-category').value;
    
    const exerciseData = {
      id: id,
      name: document.getElementById('form-ex-name').value.trim(),
      targetHead: document.getElementById('form-ex-target').value.trim(),
      equipment: document.getElementById('form-ex-equipment').value.trim() || 'Livre / Aparelho',
      setsReps: document.getElementById('form-ex-setsreps').value.trim() || '4 séries x 10-12 reps',
      instructions: document.getElementById('form-ex-instructions').value.trim(),
      biomechanics: document.getElementById('form-ex-biomechanics').value.trim(),
      categoryId: categoryId
    };

    const targetCategory = MUSCLE_DATABASE[categoryId];
    if (targetCategory) {
      const existingIndex = targetCategory.exercises.findIndex(e => e.id === id);
      if (existingIndex >= 0) {
        targetCategory.exercises[existingIndex] = exerciseData;
      } else {
        targetCategory.exercises.push(exerciseData);
      }

      // Persistir edições no localStorage
      this.persistToLocalStorage();
    }

    this.close();

    if (this.onSaveSuccessCallback) {
      this.onSaveSuccessCallback(categoryId);
    }
  }

  persistToLocalStorage() {
    try {
      const customData = {};
      Object.keys(MUSCLE_DATABASE).forEach(cat => {
        customData[cat] = MUSCLE_DATABASE[cat].exercises;
      });
      localStorage.setItem('gym_muscle_app_custom_exercises', JSON.stringify(customData));
    } catch (e) {
      console.warn("Não foi possível salvar no localStorage:", e);
    }
  }

  static loadPersistedData() {
    try {
      const saved = localStorage.getItem('gym_muscle_app_custom_exercises');
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.keys(parsed).forEach(cat => {
          if (MUSCLE_DATABASE[cat]) {
            MUSCLE_DATABASE[cat].exercises = parsed[cat];
          }
        });
      }
    } catch (e) {
      console.warn("Erro ao carregar dados do localStorage:", e);
    }
  }
}
