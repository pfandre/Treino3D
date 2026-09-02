/**
 * App.js - Orquestrador Principal do Aplicativo Anatômico Profissional Mestre
 */

import { MUSCLE_DATABASE } from './database.js?v=20';
import { ImageAnatomyInteractive } from './imageAnatomyInteractive.js?v=20';
import { OrganicAnatomySVG } from './organicAnatomySVG.js?v=20';
import { ExerciseUI } from './exerciseUI.js?v=20';
import { EditorModal } from './editorModal.js?v=20';
import { WorkoutPlanner } from './workoutPlanner.js?v=20';
import { SoundEffects } from './soundEffects.js?v=20';

document.addEventListener('DOMContentLoaded', () => {
  EditorModal.loadPersistedData();

  let masterAnatomyEngine = null;
  let activeEngineType = '3d'; // '3d' | 'organic'
  let exerciseUI = null;
  let editorModal = null;
  let workoutPlanner = null;
  let soundEffects = null;

  // 1. Inicializar Sintetizador de Efeitos Sonoros
  soundEffects = new SoundEffects();

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

  // 7. Botão de Alternar Efeitos Sonoros na Header
  const soundToggleBtn = document.getElementById('btn-toggle-sound');
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      const isEnabled = soundEffects.toggleSound();
      soundToggleBtn.classList.toggle('active', isEnabled);
      soundToggleBtn.innerHTML = isEnabled ? `<i data-lucide="volume-2"></i> Som On` : `<i data-lucide="volume-x"></i> Som Off`;
      if (window.lucide) window.lucide.createIcons();
    });
  }

  // Botão de Alternar Tema (Claro vs Escuro)
  const themeToggleBtn = document.getElementById('btn-toggle-theme');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light-theme');
      console.log("Theme toggled. isLight:", isLight);
      
      themeToggleBtn.innerHTML = isLight 
        ? `<i data-lucide="moon" style="width: 14px;"></i> Tema Escuro` 
        : `<i data-lucide="sun" style="width: 14px;"></i> Tema Claro`;
      
      const baseImg = document.getElementById('anatomical-base-img');
      if (baseImg) {
        console.log("Updating base image source. isLight:", isLight);
        // Só atualiza a imagem estática se não estivermos usando os frames de rotação
        if (!baseImg.src.includes('assets/frames/')) {
          baseImg.src = isLight 
            ? 'assets/master_anatomy_illustration_light.png?v=14' 
            : 'assets/master_anatomy_illustration.png?v=14';
        }
      }
      
      if (window.lucide) window.lucide.createIcons();
      if (soundEffects) soundEffects.playSelect();
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

  if (btnNewEx) {
    btnNewEx.addEventListener('click', () => {
      editorModal.openForNew(exerciseUI.activeCategory);
    });
  }

  // 9. Troca de Abas Principais (Explorador vs Montador de Treino)
  const tabExplorer = document.getElementById('tab-btn-explorer');
  const tabPlanner = document.getElementById('tab-btn-planner');
  const explorerPanel = document.getElementById('explorer-panel-content');
  const plannerPanel = document.getElementById('planner-panel-content');

  if (tabExplorer && tabPlanner) {
    tabExplorer.addEventListener('click', () => {
      tabExplorer.classList.add('active');
      tabPlanner.classList.remove('active');
      explorerPanel.style.display = 'flex';
      plannerPanel.classList.remove('active');
    });

    tabPlanner.addEventListener('click', () => {
      tabPlanner.classList.add('active');
      tabExplorer.classList.remove('active');
      explorerPanel.style.display = 'none';
      plannerPanel.classList.add('active');
    });
  }

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
