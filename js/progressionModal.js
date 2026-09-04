/**
 * progressionModal.js - Modal para exibir a progressão de cargas usando Chart.js
 */

export class ProgressionModal {
  constructor() {
    this.modalEl = null;
    this.chartInstance = null;
    this.createModalDOM();
  }

  createModalDOM() {
    this.modalEl = document.createElement('div');
    this.modalEl.className = 'fixed inset-0 z-[200] hidden items-center justify-center p-4 bg-[#0F172A]/80 backdrop-blur-sm transition-opacity duration-300 opacity-0';
    this.modalEl.innerHTML = `
      <div class="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl transform transition-transform duration-300 scale-95 flex flex-col max-h-[90vh]">
        <div class="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900/50 rounded-t-xl">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-lime-500/20 flex items-center justify-center text-lime-500">
              <i data-lucide="trending-up" class="w-5 h-5"></i>
            </div>
            <div>
              <h2 id="progression-exercise-title" class="text-xl font-bold text-white leading-tight">Nome do Exercício</h2>
              <p class="text-sm text-slate-400">Progressão de Carga (Últimas 8 Semanas)</p>
            </div>
          </div>
          <button id="btn-close-progression" class="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto">
          <div class="relative w-full h-[300px]">
            <canvas id="progression-chart-canvas"></canvas>
          </div>
        </div>
        
        <div class="p-4 border-t border-slate-700 bg-slate-900/50 rounded-b-xl flex justify-end">
          <button id="btn-close-progression-bottom" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-semibold transition-colors">
            Fechar
          </button>
        </div>
      </div>
    `;

    document.getElementById('progression-modal-root').appendChild(this.modalEl);

    // Eventos de fechamento
    this.modalEl.querySelector('#btn-close-progression').addEventListener('click', () => this.close());
    this.modalEl.querySelector('#btn-close-progression-bottom').addEventListener('click', () => this.close());
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    if (window.lucide) {
      window.lucide.createIcons({ root: this.modalEl });
    }
  }

  open(exerciseName) {
    this.currentExercise = exerciseName;
    document.getElementById('progression-exercise-title').textContent = exerciseName;
    
    this.modalEl.classList.remove('hidden');
    // Força reflow para animação
    void this.modalEl.offsetWidth;
    this.modalEl.classList.remove('opacity-0');
    this.modalEl.querySelector('.transform').classList.remove('scale-95');
    this.modalEl.querySelector('.transform').classList.add('scale-100');

    this.renderChart(exerciseName);
  }

  close() {
    this.modalEl.classList.add('opacity-0');
    this.modalEl.querySelector('.transform').classList.add('scale-95');
    this.modalEl.querySelector('.transform').classList.remove('scale-100');
    
    setTimeout(() => {
      this.modalEl.classList.add('hidden');
      if (this.chartInstance) {
        this.chartInstance.destroy();
        this.chartInstance = null;
      }
    }, 300);
  }

  renderChart(exerciseName) {
    const ctx = document.getElementById('progression-chart-canvas').getContext('2d');
    
    // Ler dados reais do localStorage para este exercício
    let allRecords = [];
    try {
      allRecords = JSON.parse(localStorage.getItem('treino3d_set_records')) || [];
    } catch { /* empty */ }

    const exRecords = allRecords.filter(r => r.exercise === exerciseName);

    // Agrupar por semana (últimas 8 semanas) pegando o kg máximo
    const now = new Date();
    const labels = [];
    const data = [];

    for (let w = 7; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (w * 7 + now.getDay()));
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekRecords = exRecords.filter(r => {
        const d = new Date(r.date);
        return d >= weekStart && d < weekEnd;
      });

      const maxKg = weekRecords.length > 0
        ? Math.max(...weekRecords.map(r => r.kg || 0))
        : 0;

      labels.push(`Sem ${8 - w}`);
      data.push(maxKg);
    }

    // Criar um gradiente (Verde Limão para Transparente)
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(132, 204, 22, 0.4)');
    gradient.addColorStop(1, 'rgba(132, 204, 22, 0.0)');

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Carga (kg)',
          data: data,
          borderColor: '#84CC16', // Lime 500
          borderWidth: 3,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4, // Suaviza a linha (Curva Bezier)
          pointBackgroundColor: '#1E293B',
          pointBorderColor: '#84CC16',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#84CC16',
            bodyColor: '#F8FAFC',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: (context) => `${context.raw} kg`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              color: '#64748B',
              font: {
                family: "'Inter', sans-serif"
              },
              callback: function(value) {
                return value + ' kg';
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
              drawBorder: false
            }
          },
          x: {
            ticks: {
              color: '#64748B',
              font: {
                family: "'Inter', sans-serif"
              }
            },
            grid: {
              display: false,
              drawBorder: false
            }
          }
        }
      }
    });
  }
}
