import { supabase } from './supabaseClient.js?v=2';

export class AuthUI {
  constructor() {
    this.createAuthModal();
    this.setupEventListeners();
    this.checkSession();
  }

  createAuthModal() {
    const modalHTML = `
      <div id="auth-modal" class="fixed inset-0 z-[200] flex items-center justify-center bg-[#0F172A]/90 backdrop-blur-md opacity-0 pointer-events-none transition-opacity duration-300">
        <div class="bg-[#1E293B] border border-slate-700 p-8 rounded-2xl shadow-2xl w-full max-w-md relative transform scale-95 transition-transform duration-300">


          <div class="text-center mb-6">
            <h2 id="auth-title" class="text-2xl font-bold text-white mb-2">Entrar</h2>
            <p id="auth-subtitle" class="text-sm text-slate-400">Faça login para salvar seus treinos</p>
          </div>

          <form id="auth-form" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">E-mail</label>
              <input type="email" id="auth-email" required class="w-full bg-[#0F172A] border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16] transition-all" placeholder="seu@email.com">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">Senha</label>
              <input type="password" id="auth-password" required class="w-full bg-[#0F172A] border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16] transition-all" placeholder="••••••••">
            </div>

            <div id="auth-error" class="text-red-400 text-sm hidden bg-red-400/10 p-3 rounded-lg border border-red-400/20"></div>
            <div id="auth-success" class="text-green-400 text-sm hidden bg-green-400/10 p-3 rounded-lg border border-green-400/20"></div>

            <button type="submit" id="btn-auth-submit" class="w-full bg-[#84CC16] hover:bg-[#65a30d] text-slate-900 font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2">
              <span>Entrar</span>
            </button>
          </form>

          <div class="mt-6 text-center text-sm text-slate-400">
            <span id="auth-switch-text">Não tem uma conta?</span>
            <button id="btn-switch-auth" class="text-[#84CC16] hover:underline font-medium ml-1">Cadastre-se</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modal = document.getElementById('auth-modal');
    this.form = document.getElementById('auth-form');
    this.emailInput = document.getElementById('auth-email');
    this.passwordInput = document.getElementById('auth-password');
    this.errorBox = document.getElementById('auth-error');
    this.successBox = document.getElementById('auth-success');
    this.isLoginMode = true;

    // Refresh icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  setupEventListeners() {
    // Alternar entre Login e Cadastro
    document.getElementById('btn-switch-auth').addEventListener('click', () => this.toggleMode());

    // Submissão do Formulário
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit();
    });

    // Escutar mudanças de estado do Supabase (Login/Logout detectados de fora)
    supabase.auth.onAuthStateChange((event, session) => {
      this.updateHeaderUI(session);
      if (event === 'SIGNED_IN') {
        this.hideModal();
      }
    });

    // Botão do Header (que criaremos no index.html)
    const headerBtn = document.getElementById('btn-header-auth');
    if (headerBtn) {
      headerBtn.addEventListener('click', async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Logged in -> Do Logout
          await supabase.auth.signOut();
        } else {
          // Not logged in -> Show Modal
          this.showModal();
        }
      });
    }
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const submitBtn = document.querySelector('#btn-auth-submit span');
    const switchText = document.getElementById('auth-switch-text');
    const switchBtn = document.getElementById('btn-switch-auth');

    this.hideMessages();

    if (this.isLoginMode) {
      title.textContent = 'Entrar';
      subtitle.textContent = 'Faça login para salvar seus treinos';
      submitBtn.textContent = 'Entrar';
      switchText.textContent = 'Não tem uma conta?';
      switchBtn.textContent = 'Cadastre-se';
    } else {
      title.textContent = 'Criar Conta';
      subtitle.textContent = 'Cadastre-se gratuitamente';
      submitBtn.textContent = 'Cadastrar';
      switchText.textContent = 'Já tem uma conta?';
      switchBtn.textContent = 'Entrar';
    }
  }

  async handleSubmit() {
    const email = this.emailInput.value;
    const password = this.passwordInput.value;
    const submitBtn = document.getElementById('btn-auth-submit');
    
    this.hideMessages();
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-lucide="loader-2" class="animate-spin"></i> Processando...';
    if (window.lucide) window.lucide.createIcons();

    try {
      if (this.isLoginMode) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        this.showSuccess('Login realizado com sucesso!');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        this.showSuccess('Conta criada! Verifique seu e-mail (se necessário) ou faça login.');
        setTimeout(() => this.toggleMode(), 2000);
      }
    } catch (error) {
      let msg = error.message;
      if (msg.includes('Invalid login credentials')) msg = 'E-mail ou senha incorretos.';
      if (msg.includes('Password should be at least')) msg = 'A senha deve ter pelo menos 6 caracteres.';
      this.showError(msg);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>${this.isLoginMode ? 'Entrar' : 'Cadastrar'}</span>`;
    }
  }

  showModal() {
    this.modal.classList.remove('opacity-0', 'pointer-events-none');
    this.modal.firstElementChild.classList.remove('scale-95');
    this.hideMessages();
    this.emailInput.value = '';
    this.passwordInput.value = '';
  }

  hideModal() {
    this.modal.classList.add('opacity-0', 'pointer-events-none');
    this.modal.firstElementChild.classList.add('scale-95');
  }

  showError(msg) {
    this.errorBox.textContent = msg;
    this.errorBox.classList.remove('hidden');
    this.successBox.classList.add('hidden');
  }

  showSuccess(msg) {
    this.successBox.textContent = msg;
    this.successBox.classList.remove('hidden');
    this.errorBox.classList.add('hidden');
  }

  hideMessages() {
    this.errorBox.classList.add('hidden');
    this.successBox.classList.add('hidden');
  }

  async checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    this.updateHeaderUI(session);
    if (!session) {
      this.showModal(); // Força a exibição se não estiver logado (Opção B)
    }
  }

  updateHeaderUI(session) {
    const headerBtn = document.getElementById('btn-header-auth');
    if (!headerBtn) return;

    if (session) {
      // User is logged in
      headerBtn.innerHTML = '<i data-lucide="log-out"></i> Sair';
      headerBtn.title = `Logado como: ${session.user.email}`;
      headerBtn.classList.remove('btn-primary');
      headerBtn.classList.add('btn-secondary'); // Estilo alternativo se existir
    } else {
      // User is logged out
      headerBtn.innerHTML = '<i data-lucide="user"></i> Entrar';
      headerBtn.title = 'Fazer Login';
      headerBtn.classList.add('btn-primary');
      headerBtn.classList.remove('btn-secondary');
    }
    
    if (window.lucide) window.lucide.createIcons();
  }
}
