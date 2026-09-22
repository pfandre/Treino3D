/**
 * App.js - Orquestrador Principal do Aplicativo Anatômico Profissional Mestre
 */

import { MUSCLE_DATABASE } from './database.js?v=28';
import { ImageAnatomyInteractive } from './imageAnatomyInteractive.js?v=32';

import { ExerciseUI } from './exerciseUI.js?v=39';
import { EditorModal } from './editorModal.js?v=27';
import { WorkoutPlanner } from './workoutPlanner.js?v=43';
import { SoundEffects } from './soundEffects.js?v=27';
import { useWorkoutStore, syncWorkoutHistory, syncCustomExercises, syncRoutines } from './store.js?v=6';
import { ActiveWorkoutUI } from './activeWorkoutUI.js?v=1';
import { DashboardUI } from './dashboardUI.js?v=12';
import { MetasUI } from './metasUI.js?v=1';
import { ProgressionModal } from './progressionModal.js?v=2';
import { WorkoutDetailsModal } from './workoutDetailsModal.js?v=2';
import { AuthUI } from './authUI.js?v=6';
import { ProfileModal } from './profileModal.js?v=1';
import { AdminUI } from './adminUI.js?v=1';

document.addEventListener('DOMContentLoaded', () => {
  EditorModal.loadPersistedData();

  // Forçar padrão 3x10 para todos os exercícios nativos
  Object.values(MUSCLE_DATABASE).forEach(cat => {
    if (cat.exercises) {
      cat.exercises.forEach(ex => {
        ex.setsReps = "3 séries x 10 reps";
      });
    }
  });

  let masterAnatomyEngine = null;
  let activeEngineType = '3d'; // '3d' | 'organic'
  let exerciseUI = null;
  let editorModal = null;
  let workoutPlanner = null;
  let soundEffects = null;
  let dashboardUI = null;
  let metasUI = null;
  let progressionModal = null;
  let workoutDetailsModal = null;
  let profileModal = null;

  // 1. Inicializar Sintetizador de Efeitos Sonoros
  soundEffects = new SoundEffects();

  // Inicializar UIs de Gráficos
  dashboardUI = new DashboardUI();
  metasUI = new MetasUI();
  window.progressionModal = new ProgressionModal();
  window.workoutDetailsModal = new WorkoutDetailsModal();
  window.profileModal = new ProfileModal();
  profileModal = window.profileModal;

  // 1.5 Inicializar UI do Treino Ativo (observador global)
  new ActiveWorkoutUI(soundEffects);

  // Inicializar Autenticação
  window.authUI = new AuthUI();

  // Inicializar Painel Administrativo
  window.adminUI = new AdminUI();

  // Exportar Dashboard para acesso global rápido (ex: ao editar nickname)
  window.dashboardUI = dashboardUI;

  // 2. Inicializar Montador de Treino
  workoutPlanner = new WorkoutPlanner({
    containerId: 'planner-container',
    soundEffects: soundEffects
  });
  window.workoutPlanner = workoutPlanner;

  // 3. Inicializar Modal de Edição
  editorModal = new EditorModal(() => {
    if (exerciseUI) exerciseUI.renderExerciseList();
  });

  // 4. Função para inicializar o motor anatômico 360°
  function initAnatomyEngine() {
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

    const currentSelectedMuscle = exerciseUI ? exerciseUI.activeCategory : 'pecho';

    masterAnatomyEngine = new ImageAnatomyInteractive('threejs-canvas-container', (selectedMuscleId) => {
      if (exerciseUI) {
        exerciseUI.selectCategory(selectedMuscleId, false);
      }
    }, soundEffects);

    // Sincronizar o músculo atualmente selecionado no novo motor
    if (currentSelectedMuscle && currentSelectedMuscle !== 'all') {
      masterAnatomyEngine.selectMuscle(currentSelectedMuscle, false);
    }
  }

  // Inicializar motor padrão (360° / ImageAnatomyInteractive)
  initAnatomyEngine();

  // 5. Inicializar UI de Exercícios e bi-direcionalidade
  exerciseUI = new ExerciseUI({
    filterContainerId: 'category-filter-bar',
    bannerContainerId: 'muscle-banner-container',
    listContainerId: 'exercise-list-container',
    searchInputId: 'exercise-search-input',

    onSelectMuscleCallback: (muscleId) => {
      if (masterAnatomyEngine && muscleId !== 'all') {
        masterAnatomyEngine.selectMuscle(muscleId, false);
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

  // 6. Configurar Botão 360° (Agora é o único modo)
  const btnView3d = document.getElementById('btn-view-3d');
  if (btnView3d) {
    btnView3d.classList.add('active');
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

  document.addEventListener('workout-started', () => {
    // Esconder o botão flutuante quando o treino iniciar
    btnStartWorkout.classList.add('hidden');
  });

  document.addEventListener('workout-finished', () => {
    // Mostrar o botão flutuante quando o treino finalizar
    btnStartWorkout.classList.remove('hidden');
    // Atualizar o histórico
    if (dashboardUI) dashboardUI.renderProgressChart();
  });

  if (btnNewEx) {
    btnNewEx.addEventListener('click', () => {
      editorModal.openForNew(exerciseUI.activeCategory);
    });
  }

  // Sincronizar Histórico e Exercícios com a nuvem quando logar
  if (window.supabase) {
    window.supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await syncWorkoutHistory();
        await syncCustomExercises();
        await syncRoutines();
        if (dashboardUI) dashboardUI.renderProgressChart();
      }
      
      if (event === 'SIGNED_OUT') {
        window.location.reload();
      }
    });
  }

  const btnProfileHeader = document.getElementById('btn-header-edit-profile');
  if (btnProfileHeader) {
    btnProfileHeader.addEventListener('click', () => {
      if (profileModal) profileModal.open();
    });
  }

  const btnChangePwdHeader = document.getElementById('btn-header-change-password');
  if (btnChangePwdHeader) {
    btnChangePwdHeader.addEventListener('click', async () => {
      const newPassword = prompt("Digite a sua nova senha (mínimo 6 caracteres):");
      if (newPassword && newPassword.trim().length >= 6) {
        try {
          if (!window.supabase) throw new Error("Conexão não inicializada.");
          
          const btnIcon = btnChangePwdHeader.querySelector('i');
          if(btnIcon) btnIcon.setAttribute('data-lucide', 'loader-2');
          if(btnIcon) btnIcon.classList.add('animate-spin');
          if(window.lucide) window.lucide.createIcons({ root: btnChangePwdHeader });

          const { error } = await window.supabase.auth.updateUser({
            password: newPassword.trim()
          });
          if (error) throw error;
          
          alert("Senha alterada com sucesso!");
        } catch (err) {
          alert("Erro ao atualizar senha: " + err.message);
        } finally {
          const btnIcon = btnChangePwdHeader.querySelector('i');
          if(btnIcon) btnIcon.setAttribute('data-lucide', 'key');
          if(btnIcon) btnIcon.classList.remove('animate-spin');
          if(window.lucide) window.lucide.createIcons({ root: btnChangePwdHeader });
        }
      } else if (newPassword) {
        alert("A senha deve ter pelo menos 6 caracteres.");
      }
    });
  }

  // 9. Troca de Abas Principais (Explorador vs Montador de Treino)
  const tabBtnExplorer = document.getElementById('tab-btn-explorer');
  const mobBtnExplorer = document.getElementById('mobile-tab-btn-explorer');
  const tabBtnPlanner = document.getElementById('tab-btn-planner');
  const mobBtnPlanner = document.getElementById('mobile-tab-btn-planner');
  const tabBtnDashboard = document.getElementById('tab-btn-dashboard');
  const mobBtnDashboard = document.getElementById('mobile-tab-btn-dashboard');
  const tabBtnMetas = document.getElementById('tab-btn-metas');
  const mobBtnMetas = document.getElementById('mobile-tab-btn-metas');

  const explorerPanel = document.getElementById('explorer-panel-content');
  const plannerPanel = document.getElementById('planner-panel-content');
  const dashboardPanel = document.getElementById('dashboard-panel-content');
  const metasPanel = document.getElementById('metas-panel-content');

  function switchTab(tabId) {
    // Esconde todos
    if (explorerPanel) explorerPanel.style.display = 'none';
    if (plannerPanel) plannerPanel.style.display = 'none';
    if (dashboardPanel) dashboardPanel.style.display = 'none';
    if (metasPanel) metasPanel.style.display = 'none';

    // Desativa tabs desktop
    if (tabBtnExplorer) tabBtnExplorer.classList.remove('active');
    if (tabBtnPlanner) tabBtnPlanner.classList.remove('active');
    if (tabBtnDashboard) tabBtnDashboard.classList.remove('active');
    if (tabBtnMetas) tabBtnMetas.classList.remove('active');

    // Desativa tabs mobile (regular items)
    const mobileItems = [mobBtnDashboard, mobBtnMetas, mobBtnPlanner];
    mobileItems.forEach(btn => {
      if (btn) {
        btn.classList.remove('active');
        btn.classList.add('text-slate-500');
        btn.classList.remove('text-[#84CC16]');
      }
    });
    // Desativa center button
    if (mobBtnExplorer) mobBtnExplorer.classList.remove('active');

    if (tabId === 'explorer') {
      if (explorerPanel) explorerPanel.style.display = 'flex';
      if (tabBtnExplorer) tabBtnExplorer.classList.add('active');
      if (mobBtnExplorer) mobBtnExplorer.classList.add('active');
    } else if (tabId === 'planner') {
      if (plannerPanel) plannerPanel.style.display = 'flex';
      if (tabBtnPlanner) tabBtnPlanner.classList.add('active');
      if (mobBtnPlanner) { mobBtnPlanner.classList.add('active'); mobBtnPlanner.classList.remove('text-slate-500'); }
    } else if (tabId === 'dashboard') {
      if (dashboardPanel) dashboardPanel.style.display = 'block';
      if (tabBtnDashboard) tabBtnDashboard.classList.add('active');
      if (mobBtnDashboard) { mobBtnDashboard.classList.add('active'); mobBtnDashboard.classList.remove('text-slate-500'); }
      if (dashboardUI) dashboardUI.renderProgressChart();
    } else if (tabId === 'metas') {
      if (metasPanel) metasPanel.style.display = 'flex';
      if (tabBtnMetas) tabBtnMetas.classList.add('active');
      if (mobBtnMetas) { mobBtnMetas.classList.add('active'); mobBtnMetas.classList.remove('text-slate-500'); }
      if (metasUI) metasUI.render();
    }
    
    if (soundEffects) soundEffects.playSelect();
  }

  if (tabBtnExplorer) tabBtnExplorer.addEventListener('click', () => switchTab('explorer'));
  if (tabBtnPlanner) tabBtnPlanner.addEventListener('click', () => switchTab('planner'));
  if (tabBtnDashboard) tabBtnDashboard.addEventListener('click', () => switchTab('dashboard'));
  if (tabBtnMetas) tabBtnMetas.addEventListener('click', () => switchTab('metas'));

  if (mobBtnExplorer) mobBtnExplorer.addEventListener('click', () => switchTab('explorer'));
  if (mobBtnPlanner) mobBtnPlanner.addEventListener('click', () => switchTab('planner'));
  if (mobBtnDashboard) mobBtnDashboard.addEventListener('click', () => switchTab('dashboard'));
  if (mobBtnMetas) mobBtnMetas.addEventListener('click', () => switchTab('metas'));

  if (window.lucide) {
    window.lucide.createIcons();
  }
});
