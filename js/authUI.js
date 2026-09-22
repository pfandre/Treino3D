import { supabase } from './supabaseClient.js?v=2';
import { syncWorkoutHistory } from './store.js?v=3';

export class AuthUI {
  constructor() {
    this.lampOn = true;
    this.createAuthModal();
    this.setupEventListeners();
    this.checkSession();
    
    // Auto-logout por inatividade (30 minutos = 1.800.000 ms)
    this.inactivityTimeout = null;
    this.inactivityTimeLimit = 30 * 60 * 1000;
    this.setupInactivityListener();

    // Rate Limiter para o formulário (máx 5 tentativas a cada 5 minutos)
    this.requestTimestamps = [];
    this.maxRequests = 5;
    this.timeWindowMs = 5 * 60 * 1000;
    this.rateLimitInterval = null;
    this.checkRateLimitStatus();
  }

  createAuthModal() {
    const modalHTML = `
      <style>
        .firefly {
          position: absolute;
          background: #84CC16;
          border-radius: 50%;
          filter: drop-shadow(0 0 4px #84CC16);
          animation: float var(--duration) ease-in-out infinite, pulse var(--pulse-duration) ease-in-out infinite alternate;
          animation-delay: var(--delay);
          opacity: 0;
        }
        @keyframes float {
          0% { transform: translate(0, 0); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translate(var(--x-end), var(--y-end)); opacity: 0; }
        }
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 2px #84CC16; }
          100% { transform: scale(1.5); box-shadow: 0 0 8px #84CC16; }
        }
        @keyframes pulse-text {
          0% { opacity: 0.5; transform: scale(0.98); }
          100% { opacity: 1; transform: scale(1.02); }
        }
        .pulse-text-anim {
          animation: pulse-text 2s ease-in-out infinite alternate;
        }
      </style>

      <div id="auth-modal" class="hidden fixed inset-0 z-[200] opacity-0 pointer-events-none transition-opacity duration-500 overflow-hidden font-sans cursor-pointer" style="background-image: url('assets/gym_bg.png'); background-size: cover; background-position: center;">
        
        <!-- Fundo Escurecido (Fica levemente transparente ao acender) -->
        <div id="auth-bg-overlay" class="absolute inset-0 bg-slate-950/40 transition-colors duration-1000 z-0 pointer-events-none"></div>

        <!-- Fireflies background -->
        <div id="fireflies-container" class="absolute inset-0 pointer-events-none z-10"></div>

        <!-- Wrapper do Formulário (Centralizado ou na Direita) -->
        <div class="absolute inset-0 flex flex-col items-center justify-center z-40 px-6 sm:px-8 pointer-events-none">
        
        <!-- Formulário de Login -->
        <div id="login-form-container" class="w-full max-w-sm p-8 rounded-3xl backdrop-blur-lg bg-slate-800/80 border border-[#84CC16]/50 shadow-[0_0_30px_rgba(132,204,22,0.3)] hover:border-[#84CC16] hover:shadow-[0_0_60px_rgba(132,204,22,0.6)] hover:-translate-y-3 hover:scale-[1.03] transition-all duration-500 opacity-100 pointer-events-auto relative">
          
          <!-- Brilho no topo do card -->
          <div class="absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-[#84CC16]/50 to-transparent"></div>

          <div class="text-center mb-6">
            <h2 id="auth-title" class="text-3xl font-bold text-[#84CC16] mb-2 font-display">Bem-vindo Atleta</h2>
            <p id="auth-subtitle" class="text-sm text-slate-400">Informe seus dados para acessar o treino</p>
          </div>

          <form id="auth-form" class="space-y-4">
            <div id="nickname-field-container" class="hidden">
              <label class="block text-sm font-medium text-slate-300 mb-1">Nickname (Apelido)</label>
              <input type="text" id="auth-nickname" class="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16] transition-all" placeholder="Seu apelido ninja">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">E-mail</label>
              <input type="email" id="auth-email" required class="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16] transition-all" placeholder="atleta@apptreino.com">
            </div>
            <div id="password-field-container">
              <label class="block text-sm font-medium text-slate-300 mb-1">Senha</label>
              <div class="relative">
                <input type="password" id="auth-password" required class="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16] transition-all" placeholder="••••••••">
                <button type="button" id="toggle-password-btn" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1" title="Mostrar/Ocultar Senha">
                  <i data-lucide="eye" id="eye-icon" class="w-5 h-5"></i>
                </button>
              </div>
              <div class="flex justify-end mt-1">
                <button type="button" id="btn-forgot-password" class="text-xs text-[#84CC16] hover:underline">Esqueci minha senha?</button>
              </div>
            </div>

            <div id="auth-error" class="text-red-400 text-sm hidden bg-red-950/50 p-3 rounded-lg border border-red-500/30"></div>
            <div id="auth-success" class="text-[#84CC16] text-sm hidden bg-[#84CC16]/10 p-3 rounded-lg border border-[#84CC16]/30"></div>

            <button type="submit" id="btn-auth-submit" class="w-full bg-[#84CC16] hover:bg-[#65a30d] text-slate-900 font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2 mt-6 shadow-[0_0_15px_rgba(132,204,22,0.3)] hover:shadow-[0_0_25px_rgba(132,204,22,0.5)]">
              <span>Vamos Treinar</span>
            </button>
          </form>

          <div id="auth-footer" class="mt-8 text-center text-sm text-slate-400 relative z-40">
            <span id="auth-switch-text">Não tem uma conta?</span>
            <button type="button" id="btn-switch-auth" class="text-[#84CC16] hover:underline font-medium ml-1 cursor-pointer relative z-50">Cadastre-se</button>
            <br><button type="button" id="btn-back-to-login" class="text-[#84CC16] hover:underline font-medium mt-2 hidden cursor-pointer relative z-50">Voltar para o Login</button>
          </div>
        </div>
        
        </div> <!-- Fim Wrapper -->
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
    
    this.bgOverlay = document.getElementById('auth-bg-overlay');
    this.loginFormContainer = document.getElementById('login-form-container');
    this.firefliesContainer = document.getElementById('fireflies-container');

    this.createFireflies();

    // Clique em qualquer lugar do Modal para "Acender"
    this.modal.addEventListener('click', (e) => {
      // Se clicar dentro do formulário, não faz nada
      if (e.target.closest('#login-form-container')) return;
      
      this.turnOnLamp();
    });
    
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
      if (window.adminUI) window.adminUI.checkAdminPrivileges(session);
      
      if (event === 'SIGNED_IN') {
        if (this.mode !== 'update_password') {
          const isModalOpen = !this.modal.classList.contains('opacity-0');
          const transitionScreen = document.getElementById('transition-screen');
          const transitionVideo = document.getElementById('transition-video');

          if (isModalOpen && transitionScreen && transitionVideo) {
            this.hideMessages();
            transitionScreen.classList.remove('opacity-0', 'pointer-events-none');
            transitionScreen.classList.add('opacity-100');
            
            syncWorkoutHistory().then(() => {
              if (window.dashboardUI) window.dashboardUI.renderProgressChart();
            });

            // Toca o vídeo do começo
            transitionVideo.currentTime = 0;
            transitionVideo.play();
            
            // Quando o vídeo terminar (4 segundos)
            transitionVideo.onended = () => {
              transitionScreen.classList.remove('opacity-100');
              transitionScreen.classList.add('opacity-0', 'pointer-events-none');
              this.hideModal();
            };

            // Fallback de segurança de 10 segundos (caso o vídeo trave ou seja maior)
            setTimeout(() => {
               if (!transitionScreen.classList.contains('opacity-0')) {
                   transitionScreen.classList.remove('opacity-100');
                   transitionScreen.classList.add('opacity-0', 'pointer-events-none');
                   this.hideModal();
               }
            }, 10000);

          } else {
            this.hideModal();
            await syncWorkoutHistory();
            if (window.dashboardUI) {
              window.dashboardUI.renderProgressChart();
            }
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

    // Toggle Password Visibility
    const togglePasswordBtn = document.getElementById('toggle-password-btn');
    const eyeIcon = document.getElementById('eye-icon');
    if (togglePasswordBtn) {
      togglePasswordBtn.addEventListener('click', () => {
        if (this.passwordInput.type === 'password') {
          this.passwordInput.type = 'text';
          eyeIcon.setAttribute('data-lucide', 'eye-off');
        } else {
          this.passwordInput.type = 'password';
          eyeIcon.setAttribute('data-lucide', 'eye');
        }
        if (window.lucide) window.lucide.createIcons();
      });
    }

    this.setupAvatarUpload();
  }

  setupAvatarUpload() {
    const avatarInput = document.getElementById('avatar-upload-input');
    const brandIcon = document.getElementById('main-brand-icon');

    if (!avatarInput || !brandIcon) return;

    // Quando clicar na área do avatar, abre o seletor de arquivos (se logado)
    brandIcon.addEventListener('click', async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return; // Só permite se estiver logado
      avatarInput.click();
    });

    avatarInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const userId = session.user.id;
      // Usando o mesmo nome sempre para economizar espaço no Supabase (overwrite)
      const fileName = `${userId}_avatar.webp`;
      const filePath = `${fileName}`;

      // Show uploading feedback
      const brandAvatarImg = document.getElementById('brand-avatar-img');
      const originalSrc = brandAvatarImg.src;
      if(brandAvatarImg) brandAvatarImg.classList.add('opacity-50');

      try {
        // Comprimir a imagem (máx 400x400px, 80% de qualidade WebP)
        let compressedBlob = file;
        if (file.type.startsWith('image/')) {
          compressedBlob = await this.compressImage(file, 400, 400, 0.8);
        }

        // Upload para o Supabase com upsert = true para sobrescrever
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, compressedBlob, { 
            upsert: true,
            contentType: 'image/webp'
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        // Forçar quebra de cache do navegador adicionando timestamp no final da URL apenas para exibição
        const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`;

        // Update user metadata com a URL limpa (sem cache buster para salvar no BD de forma consistente)
        const { error: updateError } = await supabase.auth.updateUser({
          data: { avatar_url: publicUrl }
        });

        if (updateError) throw updateError;

        // Atualizar também na tabela profiles para o Painel Admin conseguir listar
        await supabase.from('profiles').upsert({ id: userId, avatar_url: publicUrl });

        // Force UI update manually with the cache busted URL so the new image shows instantly
        if (brandAvatarImg) {
          const brandIconActivity = document.getElementById('brand-activity-icon');
          if (brandIconActivity) brandIconActivity.classList.add('hidden');
          brandAvatarImg.src = cacheBustedUrl;
          brandAvatarImg.classList.remove('hidden', 'opacity-50');
        }
        
      } catch (error) {
        console.error('Error uploading avatar:', error);
        alert('Erro ao fazer upload da foto. Tente novamente.');
        if(brandAvatarImg) {
          brandAvatarImg.src = originalSrc;
          brandAvatarImg.classList.remove('opacity-50');
        }
      }
    });
  }

  compressImage(file, maxWidth, maxHeight, quality) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height *= maxWidth / width));
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width *= maxHeight / height));
              height = maxHeight;
            }
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/webp', quality);
        };
      };
    });
  }

  setupInactivityListener() {
    const resetTimer = () => {
      if (this.inactivityTimeout) {
        clearTimeout(this.inactivityTimeout);
      }
      this.inactivityTimeout = setTimeout(() => this.logoutDueToInactivity(), this.inactivityTimeLimit);
    };

    // Monitora atividades do usuário
    ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'].forEach(event => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    resetTimer();
  }

  async logoutDueToInactivity() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log('Inatividade detectada (30 min). Fazendo logout automático...');
      await supabase.auth.signOut();
      this.checkSession(); // Atualiza a UI e mostra o modal
      
      // Dá tempo do modal renderizar e exibe a mensagem de erro/aviso
      setTimeout(() => {
        this.showError('Sua sessão foi encerrada por 30 minutos de inatividade.');
      }, 500);
    }
  }

  createFireflies() {
    this.firefliesContainer.innerHTML = '';
    const numFireflies = 25;
    for (let i = 0; i < numFireflies; i++) {
      const dot = document.createElement('span');
      dot.className = 'firefly';
      const size = Math.random() * 3 + 1;
      dot.style.width = size + 'px';
      dot.style.height = size + 'px';
      
      // Start position (mostly around the center/bottom)
      dot.style.left = Math.random() * 100 + 'vw';
      dot.style.top = Math.random() * 100 + 'vh';
      
      // End movement variables for the animation
      dot.style.setProperty('--x-end', (Math.random() * 200 - 100) + 'px');
      dot.style.setProperty('--y-end', (Math.random() * -200 - 50) + 'px');
      
      // Animation timings
      dot.style.setProperty('--duration', (Math.random() * 5 + 5) + 's');
      dot.style.setProperty('--pulse-duration', (Math.random() * 1 + 0.5) + 's');
      dot.style.setProperty('--delay', (Math.random() * 3) + 's');
      
      this.firefliesContainer.appendChild(dot);
    }
  }

  turnOnLamp() {
    if (this.lampOn) return;
    this.lampOn = true;

    // Fundo escuro fica mais translúcido para revelar a academia
    this.bgOverlay.classList.replace('bg-slate-950/95', 'bg-slate-950/40');

    // Esconde o texto "Toque para Treinar"
    const tapText = document.getElementById('tap-to-start-container');
    if (tapText) tapText.classList.add('opacity-0');

    // Mostra o formulário de login (fundo mais claro no container)
    this.loginFormContainer.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
    this.loginFormContainer.classList.add('opacity-100', 'translate-y-0');
    
    // Deixa o local do login mais claro e visível
    this.loginFormContainer.classList.replace('bg-slate-900/40', 'bg-slate-800/80');

    // Gera as fireflies
    this.createFireflies();
  }

  turnOffLamp() {
    this.lampOn = false;
    
    // Escurece o fundo novamente
    this.bgOverlay.classList.replace('bg-slate-950/40', 'bg-slate-950/95');

    // Mostra o texto "Toque para Treinar"
    const tapText = document.getElementById('tap-to-start-container');
    if (tapText) tapText.classList.remove('opacity-0');

    // Esconde o formulário
    this.loginFormContainer.classList.remove('opacity-100', 'translate-y-0');
    this.loginFormContainer.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
    // Remove a classe mais clara e volta a mais escura no form
    this.loginFormContainer.classList.replace('bg-slate-800/80', 'bg-slate-900/40');
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
      title.textContent = 'Bem-vindo Atleta';
      subtitle.textContent = 'Informe seus dados para acessar o treino';
      submitBtn.textContent = 'Ligar o Treino';
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
      title.textContent = 'Nova Senha';
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
    // === Frontend Rate Limiter (Persistente) ===
    const agora = Date.now();
    const storedTimestamps = localStorage.getItem('authRateLimit');
    this.requestTimestamps = storedTimestamps ? JSON.parse(storedTimestamps) : [];
    
    // Limpa timestamps antigos (mais velhos que a janela de tempo)
    this.requestTimestamps = this.requestTimestamps.filter(t => agora - t < this.timeWindowMs);
    
    if (this.requestTimestamps.length >= this.maxRequests) {
      // Salva de volta (caso tenha limpado timestamps velhos)
      localStorage.setItem('authRateLimit', JSON.stringify(this.requestTimestamps));
      this.checkRateLimitStatus();
      return;
    }
    // ===========================================

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
        this.showSuccess('Acesso garantido! Carregando...');
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
          this.setMode('login'); // Restaura o estado normal
        }, 2000);
      }
      
      // Se chegou até aqui sem erros, limpa o histórico de falhas (strikes)
      this.requestTimestamps = [];
      localStorage.removeItem('authRateLimit');

    } catch (error) {
      // Registra a falha no Rate Limiter
      this.requestTimestamps.push(Date.now());
      localStorage.setItem('authRateLimit', JSON.stringify(this.requestTimestamps));

      let msg = error.message;
      
      // Tratamento de Rate Limit do lado do Servidor (Supabase)
      if (error.status === 429 || msg.includes('rate limit') || msg.toLowerCase().includes('too many requests')) {
        msg = 'O servidor detectou muitas tentativas. Por favor, aguarde alguns instantes.';
      } else {
        if (msg.includes('Invalid login credentials')) msg = 'E-mail ou senha incorretos.';
        if (msg.includes('Password should be at least')) msg = 'A senha deve ter pelo menos 6 caracteres.';
        if (msg.includes('User not found')) msg = 'Usuário não encontrado.';
      }
      
      this.showError(msg);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>${originalText}</span>`;
    }
  }

  checkRateLimitStatus() {
    if (this.rateLimitInterval) {
      clearInterval(this.rateLimitInterval);
    }

    const storedTimestamps = localStorage.getItem('authRateLimit');
    this.requestTimestamps = storedTimestamps ? JSON.parse(storedTimestamps) : [];
    const agora = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter(t => agora - t < this.timeWindowMs);
    
    if (this.requestTimestamps.length >= this.maxRequests) {
      const submitBtn = document.getElementById('btn-auth-submit');
      if (submitBtn) submitBtn.disabled = true;
      
      const updateCountdown = () => {
        const now = Date.now();
        const maisAntigo = this.requestTimestamps[0];
        const tempoRestante = Math.ceil((this.timeWindowMs - (now - maisAntigo)) / 1000);
        
        if (tempoRestante <= 0) {
          clearInterval(this.rateLimitInterval);
          this.requestTimestamps.shift(); // Remove o mais antigo que expirou
          localStorage.setItem('authRateLimit', JSON.stringify(this.requestTimestamps));
          if (submitBtn) submitBtn.disabled = false;
          // Apenas limpa a mensagem se ela for do rate limit
          if (this.errorBox && this.errorBox.textContent.includes('Muitas tentativas')) {
            this.hideMessages();
          }
        } else {
          const m = Math.floor(tempoRestante / 60);
          const s = (tempoRestante % 60).toString().padStart(2, '0');
          this.showError(`Muitas tentativas. Aguarde ${m}:${s} para tentar novamente.`);
        }
      };

      updateCountdown(); // Atualiza na hora
      this.rateLimitInterval = setInterval(updateCountdown, 1000);
    }
  }

  showModal() {
    this.modal.classList.remove('hidden');
    void this.modal.offsetWidth; // Force DOM reflow
    this.modal.classList.remove('opacity-0', 'pointer-events-none');
    this.hideMessages();
    this.emailInput.value = '';
    this.passwordInput.value = '';
  }

  hideModal() {
    this.modal.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => {
      if (this.modal.classList.contains('opacity-0')) {
        this.modal.classList.add('hidden');
      }
    }, 500);
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
      this.showModal();
    }
    
    // Revelar o aplicativo de forma suave após a checagem (evita piscar a tela)
    const mainBody = document.getElementById('main-body');
    if (mainBody) mainBody.classList.remove('opacity-0');
  }

  updateHeaderUI(session) {
    const headerBtn = document.getElementById('btn-header-auth');
    const headerActions = document.getElementById('header-user-actions');
    const brandTitle = document.getElementById('main-brand-title');
    const brandSubtitle = document.getElementById('main-brand-subtitle');
    const brandIconActivity = document.getElementById('brand-activity-icon');
    const brandAvatarImg = document.getElementById('brand-avatar-img');
    const avatarHoverOverlay = document.getElementById('avatar-hover-overlay');

    if (!headerBtn) return;

    if (session) {
      const displayName = session.user.user_metadata?.nickname || session.user.email.split('@')[0];
      const avatarUrl = session.user.user_metadata?.avatar_url;
      window.currentNickname = displayName;
      
      // Update brand area
      if (brandTitle) brandTitle.textContent = displayName;
      if (brandSubtitle) brandSubtitle.textContent = 'Atleta Ativo';
      
      if (brandIconActivity && brandAvatarImg && avatarHoverOverlay) {
        if (avatarUrl) {
          brandIconActivity.classList.add('hidden');
          brandAvatarImg.src = avatarUrl;
          brandAvatarImg.classList.remove('hidden');
        } else {
          brandIconActivity.classList.remove('hidden');
          brandAvatarImg.classList.add('hidden');
        }
        // Ativar hover overlay e classes de click visual apenas quando logado
        avatarHoverOverlay.classList.remove('hidden'); 
      }
      
      headerBtn.innerHTML = `<i data-lucide="log-out"></i> Sair (${displayName})`;
      headerBtn.title = `Logado como: ${session.user.email}`;
      headerBtn.classList.remove('btn-primary');
      headerBtn.classList.add('btn-secondary'); 

      if (headerActions) {
        headerActions.classList.remove('hidden');
        headerActions.classList.add('flex');
      }

      const overlay = document.getElementById('model-nickname-overlay');
      if (overlay) {
        overlay.innerHTML = `<i data-lucide="user" class="w-3 h-3 inline-block mr-1"></i> ${displayName}`;
        overlay.style.opacity = '1';
      }
    } else {
      window.currentNickname = 'Atleta';
      
      // Reset brand area
      if (brandTitle) brandTitle.textContent = 'Anatomia & Musculação';
      if (brandSubtitle) brandSubtitle.textContent = 'Desenho Anatômico Profissional & Guia de Exercícios de Atletas';
      
      if (brandIconActivity && brandAvatarImg && avatarHoverOverlay) {
        brandIconActivity.classList.remove('hidden');
        brandAvatarImg.classList.add('hidden');
        brandAvatarImg.src = '';
        avatarHoverOverlay.classList.add('hidden'); 
      }

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
    
    if (window.dashboardUI) {
      window.dashboardUI.renderProgressChart();
    }
    
    if (window.lucide) window.lucide.createIcons();
  }
}
