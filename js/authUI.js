import { supabase } from './supabaseClient.js?v=2';
import { syncWorkoutHistory } from './store.js?v=3';

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
            <div id="nickname-field-container" class="hidden">
              <label class="block text-sm font-medium text-slate-300 mb-1">Nickname (Apelido)</label>
              <input type="text" id="auth-nickname" class="w-full bg-[#0F172A] border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16] transition-all" placeholder="Seu apelido ninja">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">E-mail</label>
              <input type="email" id="auth-email" required class="w-full bg-[#0F172A] border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16] transition-all" placeholder="seu@email.com">
            </div>
            <div id="password-field-container">
              <label class="block text-sm font-medium text-slate-300 mb-1">Senha</label>
              <input type="password" id="auth-password" required class="w-full bg-[#0F172A] border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16] transition-all" placeholder="••••••••">
              <div class="flex justify-end mt-1">
                <button type="button" id="btn-forgot-password" class="text-xs text-[#84CC16] hover:underline">Esqueci minha senha?</button>
              </div>
            </div>

            <div id="auth-error" class="text-red-400 text-sm hidden bg-red-400/10 p-3 rounded-lg border border-red-400/20"></div>
            <div id="auth-success" class="text-green-400 text-sm hidden bg-green-400/10 p-3 rounded-lg border border-green-400/20"></div>

            <button type="submit" id="btn-auth-submit" class="w-full bg-[#84CC16] hover:bg-[#65a30d] text-slate-900 font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2">
              <span>Entrar</span>
            </button>
          </form>

          <div id="auth-footer" class="mt-6 text-center text-sm text-slate-400">
            <span id="auth-switch-text">Não tem uma conta?</span>
            <button type="button" id="btn-switch-auth" class="text-[#84CC16] hover:underline font-medium ml-1">Cadastre-se</button>
            <br><button type="button" id="btn-back-to-login" class="text-[#84CC16] hover:underline font-medium mt-2 hidden">Voltar para o Login</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modal = document.getElementById('auth-modal');
    this.form = document.getElementById('auth-form');
    this.nicknameContainer = document.getElementById('nickname-field-container');
    this.passwordContainer = document.getElementById('password-field-container');
    this.nicknameInput = document.getElementById('auth-nickname');
    this.emailInput = document.getElementById('auth-email');
    this.passwordInput = document.getElementById('auth-password');
    this.errorBox = document.getElementById('auth-error');
    this.successBox = document.getElementById('auth-success');
    this.btnForgotPassword = document.getElementById('btn-forgot-password');
    this.btnBackToLogin = document.getElementById('btn-back-to-login');
    this.authFooter = document.getElementById('auth-footer');
    this.switchBtn = document.getElementById('btn-switch-auth');
    this.switchText = document.getElementById('auth-switch-text');
    
    this.mode = 'login'; // login | register | recovery | update_password

    // Refresh icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  setupEventListeners() {
    // Alternar modos
    this.switchBtn.addEventListener('click', () => this.setMode(this.mode === 'login' ? 'register' : 'login'));
    this.btnForgotPassword.addEventListener('click', () => this.setMode('recovery'));
    this.btnBackToLogin.addEventListener('click', () => this.setMode('login'));

    // Submissão do Formulário
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit();
    });

    // Escutar mudanças de estado do Supabase
    supabase.auth.onAuthStateChange(async (event, session) => {
      this.updateHeaderUI(session);
      if (event === 'SIGNED_IN') {
        if (this.mode !== 'update_password') {
          this.hideModal();
          await syncWorkoutHistory();
          if (window.dashboardUI) {
            window.dashboardUI.renderProgressChart();
          }
        }
      } else if (event === 'PASSWORD_RECOVERY') {
        this.setMode('update_password');
        this.showModal();
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

  setMode(newMode) {
    this.mode = newMode;
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const submitBtn = document.querySelector('#btn-auth-submit span');

    this.hideMessages();

    // Reseta visibilidade
    this.nicknameContainer.classList.add('hidden');
    this.nicknameInput.removeAttribute('required');
    this.passwordContainer.classList.remove('hidden');
    this.passwordInput.setAttribute('required', 'true');
    this.btnForgotPassword.classList.add('hidden');
    this.btnBackToLogin.classList.add('hidden');
    this.switchText.style.display = 'inline';
    this.switchBtn.style.display = 'inline';

    if (this.mode === 'login') {
      title.textContent = 'Entrar';
      subtitle.textContent = 'Faça login para salvar seus treinos';
      submitBtn.textContent = 'Entrar';
      this.switchText.textContent = 'Não tem uma conta?';
      this.switchBtn.textContent = 'Cadastre-se';
      this.btnForgotPassword.classList.remove('hidden');
    } else if (this.mode === 'register') {
      title.textContent = 'Criar Conta';
      subtitle.textContent = 'Cadastre-se gratuitamente';
      submitBtn.textContent = 'Cadastrar';
      this.switchText.textContent = 'Já tem uma conta?';
      this.switchBtn.textContent = 'Entrar';
      this.nicknameContainer.classList.remove('hidden');
      this.nicknameInput.setAttribute('required', 'true');
    } else if (this.mode === 'recovery') {
      title.textContent = 'Recuperar Senha';
      subtitle.textContent = 'Digite seu e-mail para receber o link';
      submitBtn.textContent = 'Enviar Link';
      this.passwordContainer.classList.add('hidden');
      this.passwordInput.removeAttribute('required');
      this.switchText.style.display = 'none';
      this.switchBtn.style.display = 'none';
      this.btnBackToLogin.classList.remove('hidden');
    } else if (this.mode === 'update_password') {
      title.textContent = 'Criar Nova Senha';
      subtitle.textContent = 'Digite sua nova senha abaixo';
      submitBtn.textContent = 'Atualizar Senha';
      this.emailInput.parentElement.classList.add('hidden');
      this.emailInput.removeAttribute('required');
      this.switchText.style.display = 'none';
      this.switchBtn.style.display = 'none';
      this.btnBackToLogin.classList.remove('hidden');
    }
  }

  async handleSubmit() {
    const email = this.emailInput.value;
    const password = this.passwordInput.value;
    const nickname = this.nicknameInput.value;
    const submitBtn = document.getElementById('btn-auth-submit');
    
    this.hideMessages();
    submitBtn.disabled = true;
    const originalText = submitBtn.querySelector('span').textContent;
    submitBtn.innerHTML = '<i data-lucide="loader-2" class="animate-spin"></i> Processando...';
    if (window.lucide) window.lucide.createIcons();

    try {
      if (this.mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        this.showSuccess('Login realizado com sucesso!');
      } else if (this.mode === 'register') {
        const { error } = await supabase.auth.signUp({ 
          email, password, options: { data: { nickname: nickname } }
        });
        if (error) throw error;
        this.showSuccess('Conta criada com sucesso! Você já pode fazer login.');
        setTimeout(() => {
          this.setMode('login');
          this.emailInput.value = email;
        }, 2000);
      } else if (this.mode === 'recovery') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + window.location.pathname
        });
        if (error) throw error;
        this.showSuccess('Link de recuperação enviado para o seu e-mail!');
      } else if (this.mode === 'update_password') {
        const { error } = await supabase.auth.updateUser({ password: password });
        if (error) throw error;
        this.showSuccess('Senha atualizada com sucesso!');
        setTimeout(() => {
          this.hideModal();
          this.emailInput.parentElement.classList.remove('hidden');
          this.setMode('login'); // Restaura o estado normal para a próxima vez
        }, 2000);
      }
    } catch (error) {
      let msg = error.message;
      if (msg.includes('Invalid login credentials')) msg = 'E-mail ou senha incorretos.';
      if (msg.includes('Password should be at least')) msg = 'A senha deve ter pelo menos 6 caracteres.';
      if (msg.includes('User not found')) msg = 'Usuário não encontrado.';
      this.showError(msg);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>${originalText}</span>`;
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
    const headerActions = document.getElementById('header-user-actions');
    if (!headerBtn) return;

    if (session) {
      // User is logged in
      const displayName = session.user.user_metadata?.nickname || session.user.email.split('@')[0];
      window.currentNickname = displayName;
      
      headerBtn.innerHTML = `<i data-lucide="log-out"></i> Sair (${displayName})`;
      headerBtn.title = `Logado como: ${session.user.email}`;
      headerBtn.classList.remove('btn-primary');
      headerBtn.classList.add('btn-secondary'); // Estilo alternativo se existir

      if (headerActions) {
        headerActions.classList.remove('hidden');
        headerActions.classList.add('flex');
      }

      // Atualiza o overlay do modelo 3D
      const overlay = document.getElementById('model-nickname-overlay');
      if (overlay) {
        overlay.innerHTML = `<i data-lucide="user" class="w-3 h-3 inline-block mr-1"></i> ${displayName}`;
        overlay.style.opacity = '1';
      }
    } else {
      // User is logged out
      window.currentNickname = 'Atleta';

      headerBtn.innerHTML = `<i data-lucide="user"></i> Entrar`;
      headerBtn.title = `Fazer Login`;
      headerBtn.classList.add('btn-primary');
      headerBtn.classList.remove('btn-secondary');

      if (headerActions) {
        headerActions.classList.add('hidden');
        headerActions.classList.remove('flex');
      }

      const overlay = document.getElementById('model-nickname-overlay');
      if (overlay) {
        overlay.style.opacity = '0';
      }
    }
    
    // Força atualização do Dashboard se ele já estiver carregado
    if (window.dashboardUI) {
      window.dashboardUI.renderProgressChart();
    }
    
    if (window.lucide) window.lucide.createIcons();
  }
}
