/**
 * profileModal.js - Modal para editar perfil do usuário
 * Permite alteração de Nickname, Peso, Altura e Metas.
 */

export class ProfileModal {
  constructor() {
    this.modalEl = null;
    this.createModalDOM();
  }

  createModalDOM() {
    this.modalEl = document.createElement('div');
    this.modalEl.className = 'fixed inset-0 z-[200] hidden items-center justify-center p-4 bg-[#0F172A]/80 backdrop-blur-sm transition-opacity duration-300 opacity-0';
    this.modalEl.innerHTML = `
      <div class="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md transform transition-transform duration-300 scale-95 flex flex-col">
        <div class="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900/50 rounded-t-xl">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-[#84CC16]/20 flex items-center justify-center text-[#84CC16]">
              <i data-lucide="user" class="w-5 h-5"></i>
            </div>
            <div>
              <h2 class="text-xl font-bold text-white leading-tight">Meu Perfil</h2>
              <p class="text-sm text-slate-400">Configure suas informações</p>
            </div>
          </div>
          <button id="btn-close-profile" class="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto space-y-4">
          <!-- Nickname -->
          <div>
            <label class="block text-sm font-medium text-slate-400 mb-1">Apelido (Nickname)</label>
            <input type="text" id="profile-nickname" class="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 outline-none focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16] transition-all" placeholder="Como quer ser chamado?">
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <!-- Peso -->
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1">Peso Atual (kg)</label>
              <input type="number" step="0.1" id="profile-weight" class="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 outline-none focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16] transition-all" placeholder="Ex: 80.5">
            </div>
            
            <!-- Altura -->
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1">Altura (cm)</label>
              <input type="number" id="profile-height" class="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 outline-none focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16] transition-all" placeholder="Ex: 180">
            </div>
          </div>

          <!-- Objetivo -->
          <div>
            <label class="block text-sm font-medium text-slate-400 mb-1">Objetivo Principal</label>
            <select id="profile-goal" class="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 outline-none focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16] transition-all appearance-none cursor-pointer">
              <option value="Hipertrofia">Hipertrofia (Ganho de Massa)</option>
              <option value="Emagrecimento">Emagrecimento (Perda de Gordura)</option>
              <option value="Resistencia">Resistência / Condicionamento</option>
              <option value="Manutencao">Manutenção</option>
            </select>
          </div>
        </div>
        
        <div class="p-4 border-t border-slate-700 bg-slate-900/50 rounded-b-xl flex justify-end gap-3">
          <button id="btn-cancel-profile" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors">
            Cancelar
          </button>
          <button id="btn-save-profile" class="px-5 py-2 bg-[#84CC16] hover:bg-[#65A30D] text-slate-900 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(132,204,22,0.3)] flex items-center gap-2">
            <span>Salvar</span>
            <i data-lucide="check" class="w-4 h-4 hidden" id="profile-save-icon-check"></i>
            <i data-lucide="loader-2" class="w-4 h-4 animate-spin hidden" id="profile-save-icon-load"></i>
          </button>
        </div>
      </div>
    `;

    document.getElementById('profile-modal-root').appendChild(this.modalEl);

    // Fechamento
    this.modalEl.querySelector('#btn-close-profile').addEventListener('click', () => this.close());
    this.modalEl.querySelector('#btn-cancel-profile').addEventListener('click', () => this.close());
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    // Salvar
    this.modalEl.querySelector('#btn-save-profile').addEventListener('click', () => this.save());

    if (window.lucide) {
      window.lucide.createIcons({ root: this.modalEl });
    }
  }

  async open() {
    this.modalEl.classList.remove('hidden');
    void this.modalEl.offsetWidth; // Force reflow
    this.modalEl.classList.remove('opacity-0');
    this.modalEl.querySelector('.transform').classList.remove('scale-95');
    this.modalEl.querySelector('.transform').classList.add('scale-100');

    await this.loadData();
  }

  close() {
    this.modalEl.classList.add('opacity-0');
    this.modalEl.querySelector('.transform').classList.add('scale-95');
    this.modalEl.querySelector('.transform').classList.remove('scale-100');
    
    setTimeout(() => {
      this.modalEl.classList.add('hidden');
    }, 300);
  }

  async loadData() {
    const inputNick = this.modalEl.querySelector('#profile-nickname');
    const inputWeight = this.modalEl.querySelector('#profile-weight');
    const inputHeight = this.modalEl.querySelector('#profile-height');
    const inputGoal = this.modalEl.querySelector('#profile-goal');

    // Estado de carregamento
    inputWeight.disabled = true;
    inputHeight.disabled = true;
    inputGoal.disabled = true;

    try {
      if (!window.supabase) throw new Error("Supabase não carregado");
      
      const { data: { session } } = await window.supabase.auth.getSession();
      if (!session) {
        alert("Você precisa estar logado para editar o perfil.");
        this.close();
        return;
      }

      // Preencher apelido (que já fica no window ou na sessão auth)
      inputNick.value = window.currentNickname || session.user.user_metadata?.nickname || '';

      // Buscar perfil na tabela `profiles`
      const { data: profile, error } = await window.supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        // PGRST116 significa que a linha não existe, o que é esperado na primeira vez
        console.error("Erro ao carregar perfil:", error);
      }

      if (profile) {
        inputWeight.value = profile.weight || '';
        inputHeight.value = profile.height || '';
        if (profile.goal) {
          inputGoal.value = profile.goal;
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      inputWeight.disabled = false;
      inputHeight.disabled = false;
      inputGoal.disabled = false;
    }
  }

  async save() {
    const btn = this.modalEl.querySelector('#btn-save-profile');
    const iconCheck = this.modalEl.querySelector('#profile-save-icon-check');
    const iconLoad = this.modalEl.querySelector('#profile-save-icon-load');
    
    const nickname = this.modalEl.querySelector('#profile-nickname').value.trim();
    const weight = this.modalEl.querySelector('#profile-weight').value;
    const height = this.modalEl.querySelector('#profile-height').value;
    const goal = this.modalEl.querySelector('#profile-goal').value;

    if (!nickname) {
      alert("O apelido não pode ficar vazio!");
      return;
    }

    // Loader on
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Salvando...';
    iconCheck.classList.add('hidden');
    iconLoad.classList.remove('hidden');

    try {
      const { data: { session } } = await window.supabase.auth.getSession();
      if (!session) throw new Error("Usuário não está logado.");

      // 1. Atualizar Apelido (Auth Metadata)
      if (nickname !== (session.user.user_metadata?.nickname)) {
        const { error: authError } = await window.supabase.auth.updateUser({
          data: { nickname }
        });
        if (authError) throw authError;
        window.currentNickname = nickname;
        
        // Atualizar headers na UI imediatamente
        if (window.authUI) window.authUI.checkSession();
        if (window.dashboardUI) window.dashboardUI.renderProgressChart();
      }

      // 2. Atualizar Tabela de Perfis
      const profileData = {
        id: session.user.id,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        goal: goal,
        nickname: nickname
      };

      const { error: profileError } = await window.supabase
        .from('profiles')
        .upsert(profileData);
      
      if (profileError) throw profileError;

      // Sucesso
      this.close();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar perfil: " + err.message);
    } finally {
      // Loader off
      btn.disabled = false;
      btn.querySelector('span').textContent = 'Salvar';
      iconLoad.classList.add('hidden');
      iconCheck.classList.remove('hidden');
      setTimeout(() => iconCheck.classList.add('hidden'), 2000);
    }
  }
}
