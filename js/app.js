/**
 * App.js - Orquestrador Principal do Aplicativo Anatômico Profissional Mestre
 */

import { MUSCLE_DATABASE } from './database.js?v=28';
import { ImageAnatomyInteractive } from './imageAnatomyInteractive.js?v=32';
import { OrganicAnatomySVG } from './organicAnatomySVG.js?v=28';
import { ExerciseUI } from './exerciseUI.js?v=31';
import { EditorModal } from './editorModal.js?v=27';
import { WorkoutPlanner } from './workoutPlanner.js?v=32';
import { SoundEffects } from './soundEffects.js?v=27';
import { useWorkoutStore } from './store.js?v=2';
import { ActiveWorkoutUI } from './activeWorkoutUI.js?v=1';
import { DashboardUI } from './dashboardUI.js?v=8';
import { ProgressionModal } from './progressionModal.js?v=2';
import { WorkoutDetailsModal } from './workoutDetailsModal.js?v=2';

document.addEventListener('DOMContentLoaded', () => {
  EditorModal.loadPersistedData();

  let masterAnatomyEngine = null;
  let activeEngineType = '3d'; // '3d' | 'organic'
  let exerciseUI = null;
  let editorModal = null;
  let workoutPlanner = null;
  let soundEffects = null;
  let dashboardUI = null;
  let progressionModal = null;
  let workoutDetailsModal = null;

  // 1. Inicializar Sintetizador de Efeitos Sonoros
  soundEffects = new SoundEffects();

  // Inicializar UIs de Gráficos
  dashboardUI = new DashboardUI();
  progressionModal = new ProgressionModal();
  workoutDetailsModal = new WorkoutDetailsModal();

  // 1.5 Inicializar UI do Treino Ativo (observador global)
  new ActiveWorkoutUI(soundEffects);



  // 2. Inicializar Montador de Treino
  workoutPlanner = new WorkoutPlanner({
    containerId: 'planner-container',
    soundEffects: soundEffects
  });

  // 3. Inicializar Modal de Edição
  editorModal = new EditorModal(() => {
    if (exerciseUI) exerciseUI.renderExerciseList();
  });

  // 4. Função para inicializar/trocar o motor anatômico
  function initAnatomyEngine(type) {
    if (masterAnatomyEngine) {
      if (masterAnatomyEngine.stopAutoSpin) {
        masterAnatomyEngine.stopAutoSpin();
      }
      if (masterAnatomyEngine.spinInterval) {
        clearInterval(masterAnatomyEngine.spinInterval);
      }
      const container = document.getElementById('threejs-canvas-container');
      if (container) container.innerHTML = '';
    }

    activeEngineType = type;
    const currentSelectedMuscle = exerciseUI ? exerciseUI.activeCategory : 'pecho';

    if (type === '3d') {
      masterAnatomyEngine = new ImageAnatomyInteractive('threejs-canvas-container', (selectedMuscleId) => {
        if (exerciseUI) {
          exerciseUI.selectCategory(selectedMuscleId, false);
          updateMuscleBadgeOverlay(selectedMuscleId);
        }
      }, soundEffects);
    } else {
      masterAnatomyEngine = new OrganicAnatomySVG('threejs-canvas-container', (selectedMuscleId) => {
        if (exerciseUI) {
          exerciseUI.selectCategory(selectedMuscleId, false);
          updateMuscleBadgeOverlay(selectedMuscleId);
        }
      });
    }

    // Sincronizar o músculo atualmente selecionado no novo motor
    if (currentSelectedMuscle && currentSelectedMuscle !== 'all') {
      masterAnatomyEngine.selectMuscle(currentSelectedMuscle, false);
      updateMuscleBadgeOverlay(currentSelectedMuscle);
    }
  }

  // Inicializar motor padrão (360° / ImageAnatomyInteractive)
  initAnatomyEngine('3d');

  // 5. Inicializar UI de Exercícios e bi-direcionalidade
  exerciseUI = new ExerciseUI({
    filterContainerId: 'category-filter-bar',
    bannerContainerId: 'muscle-banner-container',
    listContainerId: 'exercise-list-container',
    searchInputId: 'exercise-search-input',

    onSelectMuscleCallback: (muscleId) => {
      if (masterAnatomyEngine && muscleId !== 'all') {
        masterAnatomyEngine.selectMuscle(muscleId, false);
        updateMuscleBadgeOverlay(muscleId);
      }
    },

    onEditExerciseCallback: (exercise) => {
      editorModal.openForEdit(exercise);
    },

    onAddToWorkoutCallback: (exercise) => {
      workoutPlanner.addExerciseToActiveRoutine(exercise);
    },

    onOpenProgressionCallback: (exercise) => {
      progressionModal.open(exercise.name);
    }
  });

  // 6. Configurar Toggles de Visualização (360° vs Vetor SVG)
  const btnView3d = document.getElementById('btn-view-3d');
  const btnViewOrganic = document.getElementById('btn-view-organic');

  if (btnView3d && btnViewOrganic) {
    btnView3d.addEventListener('click', () => {
      if (activeEngineType !== '3d') {
        btnView3d.classList.add('active');
        btnViewOrganic.classList.remove('active');
        initAnatomyEngine('3d');
        if (soundEffects) soundEffects.playSelect();
      }
    });

    btnViewOrganic.addEventListener('click', () => {
      if (activeEngineType !== 'organic') {
        btnViewOrganic.classList.add('active');
        btnView3d.classList.remove('active');
        initAnatomyEngine('organic');
        if (soundEffects) soundEffects.playSelect();
      }
    });
  }



  console.log("Treino 2026 App Loaded - v3");

  // 8. Botões de Controle de Vista (Foco Frente / Foco Costas / Giro Automático)
  const btnFront = document.getElementById('btn-view-front');
  const btnBack = document.getElementById('btn-view-back');
  const btnAutoSpin = document.getElementById('btn-auto-spin');
  const btnNewEx = document.getElementById('btn-add-new-ex');

  if (btnFront) {
    btnFront.addEventListener('click', () => {
      if (masterAnatomyEngine) masterAnatomyEngine.rotateToFront();
    });
  }

  if (btnBack) {
    btnBack.addEventListener('click', () => {
      if (masterAnatomyEngine) masterAnatomyEngine.rotateToBack();
    });
  }

  if (btnAutoSpin) {
    btnAutoSpin.addEventListener('click', () => {
      if (masterAnatomyEngine && masterAnatomyEngine.toggleAutoSpin) {
        const isSpinning = masterAnatomyEngine.toggleAutoSpin();
        btnAutoSpin.classList.toggle('active', isSpinning);
      }
    });
  }

  // Listen to custom events
  document.addEventListener('open-progression', (e) => {
    progressionModal.open(e.detail.exerciseName);
  });

  document.addEventListener('open-workout-details', (e) => {
    workoutDetailsModal.open(e.detail);
  });

  if (btnNewEx) {
    btnNewEx.addEventListener('click', () => {
      editorModal.openForNew(exerciseUI.activeCategory);
    });
  }

  // 9. Troca de Abas Principais (Explorador vs Montador de Treino)
  const tabBtnExplorer = document.getElementById('tab-btn-explorer');
  const mobBtnExplorer = document.getElementById('mobile-tab-btn-explorer');
  const tabBtnPlanner = document.getElementById('tab-btn-planner');
  const mobBtnPlanner = document.getElementById('mobile-tab-btn-planner');
  const tabBtnDashboard = document.getElementById('tab-btn-dashboard');
  const mobBtnDashboard = document.getElementById('mobile-tab-btn-dashboard');

  const explorerPanel = document.getElementById('explorer-panel-content');
  const plannerPanel = document.getElementById('planner-panel-content');
  const dashboardPanel = document.getElementById('dashboard-panel-content');

  function switchTab(tabId) {
    if (tabId === 'explorer') {
      explorerPanel.style.display = 'flex';
      plannerPanel.style.display = 'none';
      dashboardPanel.style.display = 'none';
      
      tabBtnExplorer.classList.add('active');
      tabBtnPlanner.classList.remove('active');
      if (tabBtnDashboard) tabBtnDashboard.classList.remove('active');

      mobBtnExplorer.classList.add('text-[#84CC16]');
      mobBtnExplorer.classList.remove('text-slate-400');
      mobBtnPlanner.classList.add('text-slate-400');
      mobBtnPlanner.classList.remove('text-[#84CC16]');
      if (mobBtnDashboard) {
        mobBtnDashboard.classList.add('text-slate-400');
        mobBtnDashboard.classList.remove('text-[#84CC16]');
      }
    } else if (tabId === 'planner') {
      explorerPanel.style.display = 'none';
      plannerPanel.style.display = 'flex';
      dashboardPanel.style.display = 'none';

      tabBtnPlanner.classList.add('active');
      tabBtnExplorer.classList.remove('active');
      if (tabBtnDashboard) tabBtnDashboard.classList.remove('active');

      mobBtnPlanner.classList.add('text-[#84CC16]');
      mobBtnPlanner.classList.remove('text-slate-400');
      mobBtnExplorer.classList.add('text-slate-400');
      mobBtnExplorer.classList.remove('text-[#84CC16]');
      if (mobBtnDashboard) {
        mobBtnDashboard.classList.add('text-slate-400');
        mobBtnDashboard.classList.remove('text-[#84CC16]');
      }
    } else if (tabId === 'dashboard') {
      explorerPanel.style.display = 'none';
      plannerPanel.style.display = 'none';
      dashboardPanel.style.display = 'block';

      if (tabBtnDashboard) tabBtnDashboard.classList.add('active');
      tabBtnExplorer.classList.remove('active');
      tabBtnPlanner.classList.remove('active');

      if (mobBtnDashboard) {
        mobBtnDashboard.classList.add('text-[#84CC16]');
        mobBtnDashboard.classList.remove('text-slate-400');
      }
      mobBtnExplorer.classList.add('text-slate-400');
      mobBtnExplorer.classList.remove('text-[#84CC16]');
      mobBtnPlanner.classList.add('text-slate-400');
      mobBtnPlanner.classList.remove('text-[#84CC16]');

      dashboardUI.renderProgressChart();
    }
    
    if (soundEffects) soundEffects.playSelect();
  }

  if (tabBtnExplorer) tabBtnExplorer.addEventListener('click', () => switchTab('explorer'));
  if (tabBtnPlanner) tabBtnPlanner.addEventListener('click', () => switchTab('planner'));
  if (tabBtnDashboard) tabBtnDashboard.addEventListener('click', () => switchTab('dashboard'));

  if (mobBtnExplorer) mobBtnExplorer.addEventListener('click', () => switchTab('explorer'));
  if (mobBtnPlanner) mobBtnPlanner.addEventListener('click', () => switchTab('planner'));
  if (mobBtnDashboard) mobBtnDashboard.addEventListener('click', () => switchTab('dashboard'));

  function updateMuscleBadgeOverlay(muscleId) {
    const overlay = document.getElementById('muscle-overlay-badge');
    if (!overlay) return;

    const data = MUSCLE_DATABASE[muscleId];
    if (data) {
      overlay.querySelector('.badge-name').innerText = data.name;
      overlay.style.opacity = '1';
    }
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
});
