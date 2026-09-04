/**
 * DashboardUI — Premium "Bento Box" Dashboard
 * Lê dados REAIS do localStorage (persistidos pelo store.js).
 * Quando não há dados, exibe estado vazio elegante.
 */

import { loadWorkoutHistory } from './store.js';

const SET_RECORDS_KEY = 'treino3d_set_records';

function loadSetRecords() {
  try {
    return JSON.parse(localStorage.getItem(SET_RECORDS_KEY)) || [];
  } catch {
    return [];
  }
}

export class DashboardUI {
  constructor() {
    this.charts = {};
  }

  /* ─── Data Layer (lê do localStorage) ────────────────── */

  _getData() {
    const history = loadWorkoutHistory(); // Array de { name, date, durationSeconds, durationLabel }
    const now = new Date();

    // ── Treinos no Mês ──
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const monthWorkouts = history.filter(w => {
      const d = new Date(w.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    const treinosNoMes = monthWorkouts.length;

    // ── Volume estimado dos registros de séries reais ──
    const setRecords = loadSetRecords();
    const monthSets = setRecords.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    const volumeTotal = monthSets.reduce((sum, r) => sum + (r.kg || 0), 0);

    // ── Streak (dias consecutivos treinados, contando para trás) ──
    const streak = this._calcStreak(history);

    // ── Frequência últimos 7 dias ──
    const frequency = this._calcFrequency(history);

    // ── Volume por semana (últimas 4 semanas) ──
    const volumeWeekly = this._calcWeeklyVolume(history);

    // ── Últimos 3 treinos ──
    const recent = history
      .slice(-3)
      .reverse()
      .map(w => {
        const d = new Date(w.date);
        const dayString = d.toISOString().slice(0, 10);
        const daySets = setRecords.filter(r => r.date.startsWith(dayString));
        const totalKg = daySets.reduce((sum, r) => sum + (r.kg || 0), 0);
        return {
          original: w, // para acesso completo aos dados
          name: w.name,
          durationSeconds: w.durationSeconds,
          duration: w.durationLabel || `${Math.round(w.durationSeconds / 60)} min`,
          dateStr: w.date, // raw data for filtering
          date: this._relativeDate(d),
          volume: totalKg,
          sets: daySets // pass sets to the modal
        };
      });

    return {
      user: { name: 'Atleta', streak, split: treinosNoMes > 0 ? this._guessSplit(history) : '—' },
      metrics: [
        {
          label: 'Treinos no Mês', value: treinosNoMes, icon: 'dumbbell',
          delta: treinosNoMes > 0 ? `${treinosNoMes} sessões registradas` : 'Nenhum treino ainda',
          deltaUp: treinosNoMes > 0
        },
        {
          label: 'Volume Total', value: volumeTotal > 0 ? volumeTotal.toLocaleString('pt-BR') : '0', unit: 'kg', icon: 'trending-up',
          delta: volumeTotal > 0 ? 'Estimativa baseada nos treinos' : 'Sem dados',
          deltaUp: volumeTotal > 0
        },
        {
          label: 'PRs Quebrados', value: 0, icon: 'trophy',
          delta: 'Sem recordes',
          deltaUp: false
        }
      ],
      frequency,
      volumeWeekly,
      recentWorkouts: recent
    };
  }

  _calcStreak(history) {
    if (history.length === 0) return 0;

    // Coleta os dias únicos treinados (formato YYYY-MM-DD)
    const trainedDays = new Set(history.map(w => new Date(w.date).toISOString().slice(0, 10)));
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const key = checkDate.toISOString().slice(0, 10);
      if (trainedDays.has(key)) {
        streak++;
      } else if (i > 0) {
        break; // Quebrou a sequência
      }
      // Se hoje ainda não treinou (i === 0), continua verificando ontem
    }

    return streak;
  }

  _calcFrequency(history) {
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const result = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const trained = history.some(w => new Date(w.date).toISOString().slice(0, 10) === dateKey);
      result.push({ day: dayNames[d.getDay()], treinos: trained ? 1 : 0 });
    }

    return result;
  }

  _calcWeeklyVolume(history) {
    const setRecords = loadSetRecords();
    if (setRecords.length === 0) {
      return [
        { week: 'Sem 1', kg: 0 },
        { week: 'Sem 2', kg: 0 },
        { week: 'Sem 3', kg: 0 },
        { week: 'Sem 4', kg: 0 }
      ];
    }

    // Find the first workout date
    const firstDate = new Date(Math.min(...setRecords.map(r => new Date(r.date))));
    // Get start of that week (Sunday)
    firstDate.setDate(firstDate.getDate() - firstDate.getDay());
    firstDate.setHours(0, 0, 0, 0);

    const now = new Date();
    const weeks = [];
    let currentWeekStart = new Date(firstDate);
    let weekNum = 1;

    while (currentWeekStart <= now) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekKg = setRecords
        .filter(r => {
          const d = new Date(r.date);
          return d >= currentWeekStart && d < weekEnd;
        })
        .reduce((sum, r) => sum + (r.kg || 0), 0);

      weeks.push({
        week: `Sem ${weekNum}`,
        kg: weekKg
      });

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      weekNum++;
    }

    // Ensure at least 4 weeks are shown for a good chart layout
    while (weeks.length < 4) {
      weeks.push({
        week: `Sem ${weekNum}`,
        kg: 0
      });
      weekNum++;
    }

    // Limit to the last 12 weeks to prevent chart crowding
    return weeks.slice(-12);
  }

  _relativeDate(d) {
    const now = new Date();
    const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Ontem';
    return `${diff} dias atrás`;
  }

  _guessSplit(history) {
    const count = history.length;
    if (count >= 5) return 'PPLUL';
    if (count >= 3) return 'PPL';
    if (count >= 2) return 'AB';
    return 'Full';
  }

  /* ─── Render Entry Point ─────────────────────────────── */

  renderProgressChart() {
    const container = document.getElementById('dashboard-panel-content');
    if (!container) return;

    // Destroy existing chart instances
    Object.values(this.charts).forEach(c => c?.destroy?.());
    this.charts = {};

    // Build full DOM with REAL data
    container.innerHTML = this._buildHTML();

    // Hydrate icons
    if (window.lucide) window.lucide.createIcons({ root: container });

    // Render charts after DOM is painted
    requestAnimationFrame(() => {
      this._renderFrequencyChart();
      this._renderVolumeChart();

      // Bind eventos dos botões de detalhes
      container.querySelectorAll('.btn-ver-detalhes').forEach(btn => {
        btn.addEventListener('click', (e) => {
          try {
            const wData = JSON.parse(e.currentTarget.dataset.workout);
            const event = new CustomEvent('open-workout-details', { detail: wData });
            document.dispatchEvent(event);
          } catch (err) {
            console.error("Erro ao parsear dados do treino:", err);
          }
        });
      });
    });
  }

  /* ─── HTML Template ──────────────────────────────────── */

  _buildHTML() {
    const data = this._getData();
    const { user, metrics, recentWorkouts } = data;

    return `
      <div class="p-5 md:p-8 space-y-6">

        <!-- ══════ HEADER ══════ -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Olá, ${user.name} 👋
            </h1>
            <p class="text-slate-400 text-sm mt-1">
              Seu resumo de desempenho e evolução
            </p>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 ${user.streak > 0 ? 'bg-orange-500/10 border-orange-500/20' : 'bg-slate-700/50 border-slate-600/30'} border px-4 py-2 rounded-full">
              <span class="text-lg">🔥</span>
              <span class="${user.streak > 0 ? 'text-orange-400' : 'text-slate-400'} font-bold text-sm font-mono tabular-nums">${user.streak > 0 ? user.streak + ' dias' : 'Sem ofensiva'}</span>
            </div>
            <div class="flex items-center gap-2 ${user.split !== '—' ? 'bg-lime-500/10 border-lime-500/20' : 'bg-slate-700/50 border-slate-600/30'} border px-4 py-2 rounded-full">
              <i data-lucide="layers" class="w-4 h-4 ${user.split !== '—' ? 'text-lime-400' : 'text-slate-400'}"></i>
              <span class="${user.split !== '—' ? 'text-lime-400' : 'text-slate-400'} font-bold text-sm tracking-wider">${user.split}</span>
            </div>
          </div>
        </div>

        <!-- ══════ TOP METRICS ══════ -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          ${metrics.map(m => this._metricCard(m)).join('')}
        </div>

        <!-- ══════ CHARTS BENTO GRID ══════ -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

          <!-- Frequência (BarChart) -->
          <div class="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5 md:p-6">
            <div class="flex items-center justify-between mb-5">
              <div>
                <h3 class="text-white font-semibold text-base">Frequência de Treino</h3>
                <p class="text-slate-500 text-xs mt-0.5">Últimos 7 dias</p>
              </div>
              <div class="w-9 h-9 rounded-xl bg-lime-500/10 flex items-center justify-center">
                <i data-lucide="calendar-check" class="w-4 h-4 text-lime-400"></i>
              </div>
            </div>
            <div style="position: relative; height: 220px; width: 100%;">
              <canvas id="dash-frequency-chart"></canvas>
            </div>
          </div>

          <!-- Evolução de Volume (AreaChart) -->
          <div class="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5 md:p-6">
            <div class="flex items-center justify-between mb-5">
              <div>
                <h3 class="text-white font-semibold text-base">Evolução de Volume</h3>
                <p class="text-slate-500 text-xs mt-0.5">Carga total por semana (kg)</p>
              </div>
              <div class="w-9 h-9 rounded-xl bg-lime-500/10 flex items-center justify-center">
                <i data-lucide="trending-up" class="w-4 h-4 text-lime-400"></i>
              </div>
            </div>
            <div style="position: relative; height: 220px; width: 100%;">
              <canvas id="dash-volume-chart"></canvas>
            </div>
          </div>

        </div>

        <!-- ══════ RECENT ACTIVITY FEED ══════ -->
        <div class="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5 md:p-6">
          <div class="flex items-center justify-between mb-5">
            <div>
              <h3 class="text-white font-semibold text-base">Atividade Recente</h3>
              <p class="text-slate-500 text-xs mt-0.5">Seus últimos treinos registrados</p>
            </div>
            <div class="w-9 h-9 rounded-xl bg-lime-500/10 flex items-center justify-center">
              <i data-lucide="clock" class="w-4 h-4 text-lime-400"></i>
            </div>
          </div>
          <div class="space-y-3">
            ${recentWorkouts.length > 0 
              ? recentWorkouts.map((w, i) => this._activityRow(w, i === recentWorkouts.length - 1)).join('')
              : `<div class="flex flex-col items-center justify-center py-10 text-center">
                   <div class="w-14 h-14 rounded-2xl bg-slate-700/50 flex items-center justify-center mb-4">
                     <i data-lucide="inbox" class="w-6 h-6 text-slate-500"></i>
                   </div>
                   <p class="text-slate-400 text-sm font-medium">Nenhum treino registrado ainda</p>
                   <p class="text-slate-500 text-xs mt-1">Inicie seu primeiro treino para ver o histórico aqui</p>
                 </div>`
            }
          </div>
        </div>

      </div>
    `;
  }

  /* ─── Sub-Templates ──────────────────────────────────── */

  _metricCard(m) {
    return `
      <div class="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5 flex items-start gap-4 group hover:border-lime-500/20 transition-all duration-300">
        <div class="w-11 h-11 rounded-xl bg-lime-500/10 flex items-center justify-center shrink-0 group-hover:bg-lime-500/20 transition-colors">
          <i data-lucide="${m.icon}" class="w-5 h-5 text-lime-400"></i>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-slate-400 text-xs uppercase tracking-wider font-medium">${m.label}</p>
          <div class="flex items-baseline gap-1.5 mt-1">
            <span class="text-white text-2xl font-bold font-mono tabular-nums leading-none">${m.value}</span>
            ${m.unit ? `<span class="text-slate-500 text-sm font-medium">${m.unit}</span>` : ''}
          </div>
          <div class="flex items-center gap-1 mt-2">
            ${m.deltaUp 
              ? `<i data-lucide="arrow-up-right" class="w-3 h-3 text-emerald-400"></i>
                 <span class="text-xs text-emerald-400 font-medium">${m.delta}</span>`
              : `<span class="text-xs text-slate-500 font-medium">${m.delta}</span>`
            }
          </div>
        </div>
      </div>
    `;
  }

  _activityRow(w, isLast) {
    return `
      <div class="flex items-center gap-4 py-3 ${isLast ? '' : 'border-b border-white/5'}">
        <div class="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center shrink-0">
          <i data-lucide="zap" class="w-4 h-4 text-lime-400"></i>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-white text-sm font-medium truncate">${w.name}</p>
          <p class="text-slate-500 text-xs mt-0.5">${w.duration}</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-xs text-lime-400 bg-lime-500/10 px-2 py-1 rounded font-mono font-bold">
            ${w.volume} kg
          </div>
          <button class="btn-ver-detalhes text-xs text-slate-400 hover:text-white transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10" 
            data-workout='${JSON.stringify({ 
              name: w.name, 
              date: w.dateStr, 
              durationLabel: w.duration, 
              durationSeconds: w.durationSeconds,
              volume: w.volume,
              sets: w.sets
            }).replace(/'/g, "&#39;")}'>
            Ver Detalhes
          </button>
        </div>
      </div>
    `;
  }

  /* ─── Chart Renderers ────────────────────────────────── */

  _renderFrequencyChart() {
    const canvas = document.getElementById('dash-frequency-chart');
    if (!canvas) return;

    const data = this._getData();
    const { frequency } = data;

    this.charts.frequency = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: frequency.map(d => d.day),
        datasets: [{
          data: frequency.map(d => d.treinos),
          backgroundColor: frequency.map(d => d.treinos > 0 ? '#84CC16' : 'rgba(100, 116, 139, 0.15)'),
          borderRadius: { topLeft: 4, topRight: 4 },
          barThickness: 28,
          maxBarThickness: 36
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            titleColor: '#94A3B8',
            bodyColor: '#F8FAFC',
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
            titleFont: { family: "'Inter', sans-serif", size: 11 },
            bodyFont: { family: "'Inter', sans-serif", size: 13, weight: 'bold' },
            callbacks: {
              title: (items) => items[0].label,
              label: (ctx) => ctx.raw > 0 ? '✅ Treinou' : '🛌 Descanso'
            }
          }
        },
        scales: {
          y: { display: false },
          x: {
            border: { display: false },
            ticks: {
              color: '#64748B',
              font: { family: "'Inter', sans-serif", size: 11, weight: '500' }
            },
            grid: { display: false }
          }
        }
      }
    });
  }

  _renderVolumeChart() {
    const canvas = document.getElementById('dash-volume-chart');
    if (!canvas) return;

    const data = this._getData();
    const { volumeWeekly } = data;
    const ctx = canvas.getContext('2d');

    // Build gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 220);
    gradient.addColorStop(0, 'rgba(132, 204, 22, 0.35)');
    gradient.addColorStop(0.7, 'rgba(132, 204, 22, 0.05)');
    gradient.addColorStop(1, 'rgba(132, 204, 22, 0.0)');

    this.charts.volume = new Chart(canvas, {
      type: 'line',
      data: {
        labels: volumeWeekly.map(d => d.week),
        datasets: [{
          data: volumeWeekly.map(d => d.kg),
          borderColor: '#84CC16',
          borderWidth: 2.5,
          backgroundColor: gradient,
          fill: true,
          tension: 0.45,
          pointBackgroundColor: '#0F172A',
          pointBorderColor: '#84CC16',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: '#84CC16',
          pointHoverBorderColor: '#0F172A',
          pointHoverBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            titleColor: '#94A3B8',
            bodyColor: '#F8FAFC',
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
            titleFont: { family: "'Inter', sans-serif", size: 11 },
            bodyFont: { family: "'Inter', sans-serif", size: 13, weight: 'bold' },
            callbacks: {
              label: (ctx) => `${ctx.raw.toLocaleString('pt-BR')} kg`
            }
          }
        },
        scales: {
          y: {
            border: { display: false },
            ticks: {
              color: '#64748B',
              font: { family: "'Inter', sans-serif", size: 11 },
              padding: 8,
              callback: (v) => v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v + ''
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.04)',
              drawBorder: false
            }
          },
          x: {
            border: { display: false },
            ticks: {
              color: '#64748B',
              font: { family: "'Inter', sans-serif", size: 11, weight: '500' }
            },
            grid: { display: false }
          }
        }
      }
    });
  }
}
