/**
 * workoutDetailsModal.js - Modal flutuante para exibir os detalhes completos de um treino
 */

export class WorkoutDetailsModal {
  constructor() {
    this.modalEl = null;
    this.createModalDOM();
  }

  createModalDOM() {
    this.modalEl = document.createElement('div');
    this.modalEl.className = 'fixed inset-0 z-[300] hidden items-center justify-center p-4 bg-[#0F172A]/80 backdrop-blur-sm transition-opacity duration-300 opacity-0';
    this.modalEl.innerHTML = `
      <div class="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md transform transition-transform duration-300 scale-95 flex flex-col max-h-[85vh]">
        
        <!-- Header -->
        <div class="p-5 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/40 rounded-t-2xl">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-lime-500/10 flex items-center justify-center border border-lime-500/20">
              <i data-lucide="zap" class="w-5 h-5 text-lime-400"></i>
            </div>
            <div>
              <h2 id="wd-title" class="text-lg font-bold text-white leading-tight">Nome do Treino</h2>
              <p id="wd-datetime" class="text-xs text-slate-400 mt-0.5">Data e Hora</p>
            </div>
          </div>
          <button id="btn-close-wd" class="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
        
        <!-- Body (Scrollable) -->
        <div class="p-5 overflow-y-auto flex-1 space-y-6">
          
          <!-- Summary Metrics -->
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-slate-900/50 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <i data-lucide="clock" class="w-4 h-4 text-slate-400 mb-1"></i>
              <span class="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Duração</span>
              <span id="wd-duration" class="text-lg font-bold text-white mt-0.5">--</span>
            </div>
            <div class="bg-slate-900/50 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <i data-lucide="dumbbell" class="w-4 h-4 text-slate-400 mb-1"></i>
              <span class="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Volume Total</span>
              <span id="wd-volume" class="text-lg font-bold text-lime-400 mt-0.5">-- kg</span>
            </div>
          </div>

          <!-- Exercises List -->
          <div>
            <h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <i data-lucide="list-checks" class="w-4 h-4 text-slate-400"></i> Exercícios Realizados
            </h3>
            <div id="wd-exercises-list" class="space-y-2">
              <!-- Renderizado dinamicamente -->
            </div>
          </div>

        </div>
        
        <!-- Footer -->
        <div class="p-4 border-t border-slate-700/50 bg-slate-900/40 rounded-b-2xl flex justify-end">
          <button id="btn-close-wd-bottom" class="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-semibold transition-colors">
            Fechar Detalhes
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modalEl);

    // Eventos
    this.modalEl.querySelector('#btn-close-wd').addEventListener('click', () => this.close());
    this.modalEl.querySelector('#btn-close-wd-bottom').addEventListener('click', () => this.close());
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    if (window.lucide) {
      window.lucide.createIcons({ root: this.modalEl });
    }
  }

  open(workoutData) {
    // workoutData = { name, date, durationSeconds, durationLabel, volume, sets }
    
    // Header
    document.getElementById('wd-title').textContent = workoutData.name || 'Treino Concluído';
    
    const d = new Date(workoutData.date);
    const dateStr = d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
    const timeStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('wd-datetime').textContent = `${dateStr.charAt(0).toUpperCase() + dateStr.slice(1)} • ${timeStr}`;

    // Metrics
    document.getElementById('wd-duration').textContent = workoutData.durationLabel;
    document.getElementById('wd-volume').textContent = `${workoutData.volume} kg`;

    // Render Exercises List
    const listEl = document.getElementById('wd-exercises-list');
    listEl.innerHTML = '';

    if (workoutData.sets && workoutData.sets.length > 0) {
      // Agrupar sets por exercício
      const grouped = {};
      workoutData.sets.forEach(set => {
        if (!grouped[set.exercise]) grouped[set.exercise] = [];
        grouped[set.exercise].push(set);
      });

      Object.keys(grouped).forEach(exName => {
        const sets = grouped[exName];
        // Ordernar por número da série
        sets.sort((a, b) => parseInt(a.set) - parseInt(b.set));
        
        const totalKgEx = sets.reduce((sum, s) => sum + (s.kg || 0), 0);
        
        const item = document.createElement('div');
        item.className = 'bg-white/5 border border-white/5 rounded-xl p-3';
        
        let setsHtml = sets.map(s => `
          <div class="flex items-center justify-between text-xs mt-1.5 px-1 py-1 rounded bg-black/20">
            <span class="text-slate-400">Série ${s.set}</span>
            <span class="text-white font-mono font-bold">${s.kg} <span class="text-lime-400 font-normal">kg</span></span>
          </div>
        `).join('');

        item.innerHTML = `
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-sm font-semibold text-white leading-tight">${exName}</h4>
            <span class="text-xs font-semibold text-lime-400 bg-lime-500/10 px-2 py-0.5 rounded">${totalKgEx} kg total</span>
          </div>
          <div class="flex flex-col gap-0.5">
            ${setsHtml}
          </div>
        `;
        listEl.appendChild(item);
      });
    } else {
      listEl.innerHTML = `
        <div class="text-center py-6 text-slate-500 flex flex-col items-center">
          <i data-lucide="ghost" class="w-8 h-8 opacity-20 mb-2"></i>
          <p class="text-sm">Nenhuma série registrada neste treino.</p>
        </div>
      `;
    }

    if (window.lucide) window.lucide.createIcons({ root: listEl });

    // Animação de entrada
    this.modalEl.classList.remove('hidden');
    void this.modalEl.offsetWidth;
    this.modalEl.classList.remove('opacity-0');
    this.modalEl.querySelector('.transform').classList.remove('scale-95');
    this.modalEl.querySelector('.transform').classList.add('scale-100');
  }

  close() {
    this.modalEl.classList.add('opacity-0');
    this.modalEl.querySelector('.transform').classList.add('scale-95');
    this.modalEl.querySelector('.transform').classList.remove('scale-100');
    
    setTimeout(() => {
      this.modalEl.classList.add('hidden');
    }, 300);
  }
}
