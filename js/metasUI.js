/**
 * metasUI.js - Painel de Metas do Usuário
 * Exibe dados do perfil e um velocímetro de progresso, com edição inline.
 */

export class MetasUI {
  constructor() {
    this.container = document.getElementById('metas-panel-content');
    this.chartInstance = null;
    this.session = null;
  }

  async render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="flex items-center justify-center h-full w-full">
        <i data-lucide="loader-2" class="w-8 h-8 text-[#84CC16] animate-spin"></i>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons({ root: this.container });

    let profileData = { nickname: '', bio: '', startWeight: '', weight: '', targetWeight: '', height: '', goal: 'Manutencao' };

    try {
      if (window.supabase) {
        const { data: { session } } = await window.supabase.auth.getSession();
        this.session = session;
        if (session) {
          profileData.nickname = window.currentNickname || session.user.user_metadata?.nickname || 'Atleta';
          
          const { data: profile } = await window.supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            if (profile.weight) profileData.weight = profile.weight;
            if (profile.height) profileData.height = profile.height;
            if (profile.goal) profileData.goal = profile.goal;
          }

          // Usar a meta atual ou Manutencao
          let activeGoal = profileData.goal;

          // Pegar startWeight, currentWeight e targetWeight do localStorage baseados na meta atual
          const savedStartWeight = localStorage.getItem(`metas_sw_${session.user.id}_${activeGoal}`);
          const savedTargetWeight = localStorage.getItem(`metas_tw_${session.user.id}_${activeGoal}`);
          const savedCurrentWeight = localStorage.getItem(`metas_cw_${session.user.id}_${activeGoal}`);
          const savedBio = localStorage.getItem(`metas_bio_${session.user.id}`);
          
          if (savedStartWeight !== null) profileData.startWeight = savedStartWeight;
          if (savedTargetWeight !== null) profileData.targetWeight = savedTargetWeight;
          if (savedCurrentWeight !== null) profileData.weight = savedCurrentWeight;
          if (savedBio) profileData.bio = savedBio;

        } else {
           profileData.nickname = "Visitante";
        }
      }
    } catch (e) {
      console.error("Erro ao carregar dados para o painel de Metas:", e);
    }

    this.profileData = profileData;

    this.renderUI();
  }

  renderUI() {
    const p = this.profileData;
    let progressValue = this.calculateProgress();

    this.container.innerHTML = `
      <div class="bg-zinc-950 min-h-full p-5 lg:p-8 flex flex-col items-center">
        
        <!-- Header do Painel -->
        <div class="w-full max-w-4xl mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 class="font-display text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
              <i data-lucide="target" class="text-[#84CC16] w-8 h-8"></i>
              Painel de Metas
            </h2>
            <p class="text-slate-400 mt-2 text-sm md:text-base">Clique sobre os valores para editar e acompanhar seu progresso automaticamente.</p>
          </div>
        </div>

        <!-- Cartões Superiores (Perfil Editável Inline) -->
        <div class="w-full max-w-4xl grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          
          <div class="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-lg hover:border-[#84CC16] hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(132,204,22,0.3)] transition-all duration-300 group cursor-text" onclick="document.getElementById('inline-nickname').focus()">
            <i data-lucide="user" class="text-slate-300 group-hover:text-[#84CC16] w-6 h-6 mb-2 transition-colors"></i>
            <div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Atleta</div>
            <div class="flex items-center w-full mt-1">
              <input type="text" id="inline-nickname" class="bg-transparent text-center text-white font-bold text-lg w-full outline-none focus:ring-1 focus:ring-[#84CC16] rounded transition-all placeholder:text-slate-600" placeholder="Seu nome" value="${p.nickname}">
            </div>
          </div>
          
          <div class="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-lg hover:border-[#84CC16] hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(132,204,22,0.3)] transition-all duration-300 group cursor-text" onclick="document.getElementById('inline-start-weight').focus()">
            <i data-lucide="flag" class="text-slate-300 group-hover:text-[#84CC16] w-6 h-6 mb-2 transition-colors"></i>
            <div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Peso Inicial</div>
            <div class="flex items-center text-white font-bold text-xl mt-1">
              <input type="number" step="0.1" id="inline-start-weight" class="bg-transparent text-center font-mono w-16 outline-none focus:ring-1 focus:ring-[#84CC16] rounded transition-all placeholder:text-slate-600" placeholder="0.0" value="${p.startWeight}">
              <span class="text-sm font-normal text-slate-400">kg</span>
            </div>
          </div>

          <div class="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-lg hover:border-[#84CC16] hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(132,204,22,0.3)] transition-all duration-300 group cursor-text" onclick="document.getElementById('inline-weight').focus()">
            <i data-lucide="scale" class="text-slate-300 group-hover:text-[#84CC16] w-6 h-6 mb-2 transition-colors"></i>
            <div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Peso Atual</div>
            <div class="flex items-center text-white font-bold text-xl mt-1">
              <input type="number" step="0.1" id="inline-weight" class="bg-transparent text-center font-mono w-16 outline-none focus:ring-1 focus:ring-[#84CC16] rounded transition-all placeholder:text-slate-600" placeholder="0.0" value="${p.weight}">
              <span class="text-sm font-normal text-slate-400">kg</span>
            </div>
          </div>

          <div class="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-lg hover:border-[#84CC16] hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(132,204,22,0.3)] transition-all duration-300 group cursor-text" onclick="document.getElementById('inline-target-weight').focus()">
            <i data-lucide="target" class="text-slate-300 group-hover:text-[#84CC16] w-6 h-6 mb-2 transition-colors"></i>
            <div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Peso Alvo</div>
            <div class="flex items-center text-white font-bold text-xl mt-1">
              <input type="number" step="0.1" id="inline-target-weight" class="bg-transparent text-center font-mono w-16 outline-none focus:ring-1 focus:ring-[#84CC16] rounded transition-all placeholder:text-slate-600" placeholder="0.0" value="${p.targetWeight}">
              <span class="text-sm font-normal text-slate-400">kg</span>
            </div>
          </div>

          <div class="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-lg hover:border-[#84CC16] hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(132,204,22,0.3)] transition-all duration-300 group cursor-text" onclick="document.getElementById('inline-height').focus()">
            <i data-lucide="ruler" class="text-slate-300 group-hover:text-[#84CC16] w-6 h-6 mb-2 transition-colors"></i>
            <div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Altura</div>
            <div class="flex items-center text-white font-bold text-xl mt-1">
              <input type="number" id="inline-height" class="bg-transparent text-center font-mono w-16 outline-none focus:ring-1 focus:ring-[#84CC16] rounded transition-all placeholder:text-slate-600" placeholder="0" value="${p.height}">
              <span class="text-sm font-normal text-slate-400">cm</span>
            </div>
          </div>

          <div class="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-lg hover:border-[#84CC16] hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(132,204,22,0.3)] transition-all duration-300 group">
            <i data-lucide="crosshair" class="text-[#84CC16] w-6 h-6 mb-2"></i>
            <div class="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Objetivo</div>
            <select id="inline-goal" class="w-full bg-transparent text-white font-bold text-sm text-center outline-none focus:ring-1 focus:ring-[#84CC16] rounded transition-all appearance-none cursor-pointer">
              <option value="Hipertrofia" ${p.goal === 'Hipertrofia' ? 'selected' : ''} class="bg-slate-900 text-sm">Hipertrofia</option>
              <option value="Emagrecimento" ${p.goal === 'Emagrecimento' ? 'selected' : ''} class="bg-slate-900 text-sm">Emagrecimento</option>
              <option value="Resistencia" ${p.goal === 'Resistencia' ? 'selected' : ''} class="bg-slate-900 text-sm">Resistência</option>
              <option value="Manutencao" ${p.goal === 'Manutencao' ? 'selected' : ''} class="bg-slate-900 text-sm">Manutenção</option>
            </select>
          </div>
        </div>

        <!-- Bio Card (Frase de Identificação) -->
        <div class="w-full max-w-4xl bg-slate-900/50 border border-slate-800 rounded-xl p-5 shadow-lg mb-8 hover:border-[#84CC16] hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(132,204,22,0.3)] transition-all duration-300 group cursor-text" onclick="document.getElementById('inline-bio').focus()">
          <div class="flex items-center gap-2 mb-2">
            <i data-lucide="quote" class="text-slate-300 group-hover:text-[#84CC16] w-5 h-5 transition-colors"></i>
            <div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Sua Frase de Identificação</div>
          </div>
          <input type="text" id="inline-bio" class="bg-transparent text-white text-lg w-full outline-none focus:ring-1 focus:ring-[#84CC16] rounded transition-all placeholder:text-slate-600 italic" placeholder="Ex: Gosto de treinar todos os dias pela manhã..." value="${p.bio}">
        </div>

        <!-- Área Central: Velocímetro -->
        <div class="w-full max-w-4xl bg-slate-900/30 border border-slate-800/50 rounded-2xl p-6 md:p-10 flex flex-col items-center relative shadow-2xl">
           <div class="w-full text-center mb-6">
              <h3 class="text-xl font-bold text-white font-display tracking-wide uppercase">Progresso da Meta</h3>
              <p class="text-slate-400 text-sm mt-1">Sua evolução em relação ao seu objetivo principal</p>
           </div>
           
           <div class="relative w-full max-w-[400px] aspect-[2/1] flex items-end justify-center mb-4">
              <canvas id="metas-speedometer-chart"></canvas>
              
              <!-- Texto central do velocímetro -->
              <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[20%] flex flex-col items-center">
                 <div class="text-5xl md:text-6xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" id="progress-text-display">
                   ${progressValue}%
                 </div>
                 <div class="text-[#84CC16] font-semibold text-sm uppercase tracking-widest mt-1 bg-[#84CC16]/10 px-3 py-1 rounded-full border border-[#84CC16]/20 shadow-[0_0_10px_rgba(132,204,22,0.2)]">
                   Concluído
                 </div>
              </div>
           </div>
           
           <div class="w-full max-w-[350px] flex justify-between mt-8 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span class="flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-red-500"></div> Inicial</span>
              <span class="flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-yellow-400"></div> Caminho</span>
              <span class="flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-green-500"></div> Meta</span>
           </div>
        </div>

      </div>
    `;

    if (window.lucide) window.lucide.createIcons({ root: this.container });

    // Renderizar gráfico velocímetro
    const ctx = document.getElementById('metas-speedometer-chart');
    if (ctx && window.Chart) {
      this.renderSpeedometer(ctx, progressValue);
    }

    this.attachEventListeners();
  }

  calculateProgress() {
    let p = this.profileData;
    let progressValue = 0;
    let sw = parseFloat(p.startWeight);
    let cw = parseFloat(p.weight);
    let tw = parseFloat(p.targetWeight);

    if (!isNaN(sw) && !isNaN(cw) && !isNaN(tw) && sw !== tw) {
      if (sw > tw) {
         // Emagrecimento
         progressValue = ((sw - cw) / (sw - tw)) * 100;
      } else {
         // Hipertrofia / Ganho de Massa
         progressValue = ((cw - sw) / (tw - sw)) * 100;
      }
      if (progressValue < 0) progressValue = 0;
      if (progressValue > 100) progressValue = 100;
      progressValue = Math.round(progressValue);
    }
    return progressValue;
  }

  attachEventListeners() {
    const inputs = ['inline-nickname', 'inline-start-weight', 'inline-weight', 'inline-target-weight', 'inline-height', 'inline-bio'];
    
    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', () => this.saveData());
        // Auto-save ao pressionar Enter nos inputs de texto
        if (el.tagName === 'INPUT') {
          el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              el.blur(); // Perder foco trigga o 'change'
            }
          });
        }
      }
    });

    const goalEl = document.getElementById('inline-goal');
    if (goalEl) {
      goalEl.addEventListener('change', (e) => this.switchGoal(e.target.value));
    }
  }

  switchGoal(newGoal) {
    if (!this.session) return;
    const userId = this.session.user.id;
    this.profileData.goal = newGoal;
    
    // Carrega os valores locais para o novo objetivo. Se for a primeira vez (null), deixa vazio/zerado ('')
    const sw = localStorage.getItem(`metas_sw_${userId}_${newGoal}`) || '';
    const tw = localStorage.getItem(`metas_tw_${userId}_${newGoal}`) || '';
    const cw = localStorage.getItem(`metas_cw_${userId}_${newGoal}`) || '';

    this.profileData.startWeight = sw;
    this.profileData.targetWeight = tw;
    this.profileData.weight = cw;
    
    // Atualiza visualmente os inputs
    const elSw = document.getElementById('inline-start-weight');
    const elTw = document.getElementById('inline-target-weight');
    const elCw = document.getElementById('inline-weight');
    
    if (elSw) elSw.value = sw;
    if (elTw) elTw.value = tw;
    if (elCw) elCw.value = cw;

    // Salva a mudança de objetivo e recalcula o gráfico
    this.saveData();
  }

  async saveData() {
    if (!this.session) return;

    this.profileData.nickname = document.getElementById('inline-nickname').value;
    this.profileData.startWeight = document.getElementById('inline-start-weight').value;
    this.profileData.weight = document.getElementById('inline-weight').value;
    this.profileData.targetWeight = document.getElementById('inline-target-weight').value;
    this.profileData.height = document.getElementById('inline-height').value;
    this.profileData.goal = document.getElementById('inline-goal').value;
    this.profileData.bio = document.getElementById('inline-bio').value;

    const p = this.profileData;

    // 1. Salva valores locais no LocalStorage (Peso Inicial, Peso Alvo, Peso Atual, Bio)
    // Agora salvamos associado ao objetivo ativo para ter perfis independentes
    const activeGoal = p.goal;
    localStorage.setItem(`metas_sw_${this.session.user.id}_${activeGoal}`, p.startWeight);
    localStorage.setItem(`metas_tw_${this.session.user.id}_${activeGoal}`, p.targetWeight);
    localStorage.setItem(`metas_cw_${this.session.user.id}_${activeGoal}`, p.weight);
    localStorage.setItem(`metas_bio_${this.session.user.id}`, p.bio);

    // Update nickname in auth se alterou
    if (p.nickname && p.nickname !== (this.session.user.user_metadata?.nickname)) {
       try {
         const { error } = await window.supabase.auth.updateUser({
           data: { nickname: p.nickname }
         });
         if (!error) {
           window.currentNickname = p.nickname;
           this.session.user.user_metadata = this.session.user.user_metadata || {};
           this.session.user.user_metadata.nickname = p.nickname;
           if (window.authUI) window.authUI.checkSession(); // Update header
         }
       } catch(e) { console.error("Error updating nickname", e); }
    }

    // 2. Salva valores da nuvem no Supabase (Peso Atual, Altura, Objetivo)
    try {
      const supabaseData = {
        id: this.session.user.id,
        weight: p.weight ? parseFloat(p.weight) : null,
        height: p.height ? parseFloat(p.height) : null,
        goal: p.goal
      };

      const { error } = await window.supabase.from('profiles').upsert(supabaseData);
      if (error) throw error;
      
      // Update global dashboard se necessário
      if (window.dashboardUI) window.dashboardUI.renderProgressChart();

    } catch (e) {
      console.error("Erro ao salvar perfil no Supabase:", e);
    }

    // 3. Atualiza o Gráfico dinamicamente
    const newProgress = this.calculateProgress();
    const textDisplay = document.getElementById('progress-text-display');
    if (textDisplay) textDisplay.textContent = newProgress + '%';

    if (this.chartInstance && this.chartInstance.data.datasets.length > 0) {
      // Animar para o novo valor
      this.chartInstance.data.datasets[0].needleValue = newProgress;
      this.chartInstance.update();
    }
  }

  renderSpeedometer(ctx, value) {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    // Criando o array de cores e dados para um degradê customizado
    const sliceData = [];
    const sliceColors = [];
    
    // Serão 100 fatias, de 1 em 1
    for (let i = 0; i < 100; i++) {
      sliceData.push(1);
      
      if (i < 33) {
        // Vermelho forte para vermelho fraco
        // Opacidade de 1.0 caindo até 0.2
        let opacity = 1 - (i / 33) * 0.8;
        sliceColors.push(`rgba(239, 68, 68, ${opacity})`);
      } else if (i < 66) {
        // Amarelo forte para amarelo fraco
        // Opacidade de 1.0 caindo até 0.2
        let opacity = 1 - ((i - 33) / 33) * 0.8;
        sliceColors.push(`rgba(250, 204, 21, ${opacity})`);
      } else {
        // Verde fraco para verde forte
        // Opacidade subindo de 0.2 até 1.0
        let opacity = 0.2 + ((i - 66) / 34) * 0.8;
        sliceColors.push(`rgba(34, 197, 94, ${opacity})`);
      }
    }

    const data = {
      datasets: [{
        data: sliceData,
        backgroundColor: sliceColors,
        borderWidth: 0,
        cutout: '75%', // Grossura do anel
        circumference: 180, // Meio círculo
        rotation: 270, // Começar do lado esquerdo
        needleValue: value // Custom param
      }]
    };

    // Plugin customizado para desenhar a agulha/ponteiro
    const needlePlugin = {
      id: 'needlePlugin',
      afterDraw: (chart) => {
        const { ctx, config, chartArea: { top, bottom, left, right, width, height } } = chart;
        const dataSet = config.data.datasets[0];
        const val = dataSet.needleValue;
        
        // Posição central (fundo do arco)
        const cx = left + width / 2;
        const cy = bottom;
        
        // Calcular o ângulo (0 a 100 mapeado para 180 graus, da esquerda para a direita)
        const angle = Math.PI + (val / 100) * Math.PI;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        // Desenhar a agulha apontando para o arco
        const radius = chart.getDatasetMeta(0).data[0].outerRadius - 10;
        
        ctx.beginPath();
        // A agulha será um triângulo longo
        ctx.moveTo(0, -5); // base top
        ctx.lineTo(radius, 0); // ponta
        ctx.lineTo(0, 5); // base bottom
        ctx.fillStyle = '#ffffff'; // Cor da agulha
        ctx.fill();
        
        // Bolinha no centro
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, 2 * Math.PI);
        ctx.fillStyle = '#0F172A';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        ctx.restore();
      }
    };

    this.chartInstance = new window.Chart(ctx, {
      type: 'doughnut',
      data: data,
      plugins: [needlePlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { bottom: 20 }
        },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        },
        animation: {
          duration: 1500,
          easing: 'easeOutQuart'
        }
      }
    });
  }
}
