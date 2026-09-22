/**
 * adminUI.js - Painel de Administrador
 * Lista os alunos cadastrados e estatísticas de uso.
 */

export class AdminUI {
  constructor() {
    this.modalEl = null;
    this.adminEmail = "aaddreee@gmail.com";
    this.createModalDOM();
    this.setupEventListeners();
  }

  createModalDOM() {
    this.modalEl = document.createElement('div');
    this.modalEl.className = 'fixed inset-0 z-[250] hidden flex flex-col bg-[#0F172A]/90 backdrop-blur-md transition-opacity duration-300 opacity-0';
    this.modalEl.innerHTML = `
      <div class="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 flex flex-col transform transition-transform duration-300 translate-y-4">
        
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#84CC16] to-[#65a30d] flex items-center justify-center text-slate-900 shadow-[0_0_20px_rgba(132,204,22,0.4)]">
              <i data-lucide="shield-check" class="w-6 h-6"></i>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-white tracking-tight">Painel Administrativo</h2>
              <p class="text-sm text-slate-400">Visão Geral dos Alunos</p>
            </div>
          </div>
          <button id="btn-close-admin" class="text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 p-2 rounded-lg transition-colors border border-slate-700">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- Estatísticas -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div class="bg-slate-800/80 border border-slate-700 rounded-xl p-5 flex items-center gap-4">
            <div class="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
              <i data-lucide="users" class="w-6 h-6"></i>
            </div>
            <div>
              <p class="text-sm font-medium text-slate-400">Total de Alunos</p>
              <h3 class="text-2xl font-bold text-white" id="admin-total-users">-</h3>
            </div>
          </div>
          
          <div class="bg-slate-800/80 border border-slate-700 rounded-xl p-5 flex items-center gap-4">
            <div class="p-3 bg-[#84CC16]/10 text-[#84CC16] rounded-lg">
              <i data-lucide="image" class="w-6 h-6"></i>
            </div>
            <div>
              <p class="text-sm font-medium text-slate-400">Alunos com Foto de Perfil</p>
              <h3 class="text-2xl font-bold text-white" id="admin-users-with-avatar">-</h3>
            </div>
          </div>
        </div>

        <!-- Lista de Usuários -->
        <div class="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden flex flex-col">
          <div class="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
            <h3 class="font-semibold text-white">Lista de Alunos</h3>
            <button id="btn-refresh-admin" class="text-slate-400 hover:text-[#84CC16] transition-colors flex items-center gap-2 text-sm font-medium">
              <i data-lucide="refresh-cw" class="w-4 h-4"></i> Atualizar
            </button>
          </div>
          
          <div class="flex-1 overflow-y-auto p-4">
            <div id="admin-users-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="text-slate-500 col-span-full text-center py-8">
                <i data-lucide="loader-2" class="w-8 h-8 animate-spin mx-auto mb-3"></i>
                <p>Carregando alunos...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('admin-modal-root').appendChild(this.modalEl);

    if (window.lucide) {
      window.lucide.createIcons({ root: this.modalEl });
    }
  }

  setupEventListeners() {
    this.modalEl.querySelector('#btn-close-admin').addEventListener('click', () => this.close());
    this.modalEl.querySelector('#btn-refresh-admin').addEventListener('click', () => this.loadData());
    
    const adminBtn = document.getElementById('btn-admin-dashboard');
    if (adminBtn) {
      adminBtn.addEventListener('click', () => this.open());
    }
  }

  checkAdminPrivileges(session) {
    const adminBtn = document.getElementById('btn-admin-dashboard');
    if (!adminBtn) return;

    if (session && session.user && session.user.email === this.adminEmail) {
      adminBtn.classList.remove('hidden');
    } else {
      adminBtn.classList.add('hidden');
    }
  }

  setAdminEmail(email) {
    this.adminEmail = email;
    // Check session again to show/hide button
    supabase.auth.getSession().then(({ data: { session } }) => {
      this.checkAdminPrivileges(session);
    });
  }

  open() {
    this.modalEl.classList.remove('hidden');
    void this.modalEl.offsetWidth; // Force reflow
    this.modalEl.classList.remove('opacity-0');
    this.modalEl.querySelector('.transform').classList.remove('translate-y-4');
    this.modalEl.querySelector('.transform').classList.add('translate-y-0');

    this.loadData();
  }

  close() {
    this.modalEl.classList.add('opacity-0');
    this.modalEl.querySelector('.transform').classList.remove('translate-y-0');
    this.modalEl.querySelector('.transform').classList.add('translate-y-4');
    
    setTimeout(() => {
      this.modalEl.classList.add('hidden');
    }, 300);
  }

  async loadData() {
    const listContainer = this.modalEl.querySelector('#admin-users-list');
    const totalEl = this.modalEl.querySelector('#admin-total-users');
    const withAvatarEl = this.modalEl.querySelector('#admin-users-with-avatar');
    
    listContainer.innerHTML = `
      <div class="text-slate-500 col-span-full text-center py-8">
        <i data-lucide="loader-2" class="w-8 h-8 animate-spin mx-auto mb-3"></i>
        <p>Carregando dados...</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons({ root: listContainer });

    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        throw error;
      }

      const total = profiles.length;
      const withAvatar = profiles.filter(p => p.avatar_url).length;

      totalEl.textContent = total;
      withAvatarEl.textContent = withAvatar;

      if (total === 0) {
        listContainer.innerHTML = `
          <div class="text-slate-500 col-span-full text-center py-8">
            <p>Nenhum aluno encontrado na base de dados.</p>
          </div>
        `;
        return;
      }

      listContainer.innerHTML = profiles.map(profile => {
        const avatarHtml = profile.avatar_url 
          ? `<img src="${profile.avatar_url}" class="w-12 h-12 rounded-full object-cover border-2 border-slate-700" alt="Avatar">`
          : `<div class="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-600"><i data-lucide="user" class="w-6 h-6 text-slate-400"></i></div>`;
        
        const nickname = profile.nickname || 'Aluno Sem Nome';
        const goal = profile.goal || 'Sem objetivo';
        
        return `
          <div class="bg-slate-900 border border-slate-700 rounded-xl p-4 flex items-center gap-4 hover:border-[#84CC16]/50 transition-colors">
            ${avatarHtml}
            <div class="flex-1 min-w-0">
              <h4 class="text-white font-semibold truncate">${nickname}</h4>
              <p class="text-xs text-slate-400 truncate mt-0.5"><span class="px-2 py-0.5 bg-slate-800 rounded-md">${goal}</span></p>
            </div>
            <div class="text-xs text-slate-500 flex flex-col items-end">
              <span>Peso: ${profile.weight || '-'}kg</span>
              <span>Alt: ${profile.height || '-'}cm</span>
            </div>
          </div>
        `;
      }).join('');

      if (window.lucide) window.lucide.createIcons({ root: listContainer });

    } catch (err) {
      console.error(err);
      listContainer.innerHTML = `
        <div class="text-red-400 col-span-full text-center py-8 bg-red-900/10 rounded-xl border border-red-900/30">
          <i data-lucide="alert-circle" class="w-8 h-8 mx-auto mb-3"></i>
          <p>Erro ao carregar dados. Verifique a política do Supabase (RLS).</p>
          <p class="text-xs mt-2 opacity-70">${err.message}</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons({ root: listContainer });
    }
  }
}
