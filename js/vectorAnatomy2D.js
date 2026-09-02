/**
 * VectorAnatomy2D - Ilustração Anatômica Humana Proporcional & Harmônica
 * Desenho de alta definição em proporção áurea com grupos musculares perfeitamente encaixados.
 */

import { MUSCLE_DATABASE } from './database.js';

export class VectorAnatomy2D {
  constructor(containerId, onSelectCallback) {
    this.container = document.getElementById(containerId);
    this.onSelectCallback = onSelectCallback;
    
    this.selectedMuscleId = null;
    this.hoveredMuscleId = null;
    
    this.init();
  }

  init() {
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="vector-anatomy-wrapper" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; padding: 12px; overflow-y: auto;">
        
        <!-- Palco das Vistas Frontal e Posterior Harmônicas -->
        <div class="anatomy-figures-stage" style="width: 100%; max-width: 520px; display: flex; items-center; justify-content: space-around; gap: 16px;">
          
          <!-- VISTA FRONTAL -->
          <div class="figure-box" style="flex: 1; display: flex; flex-direction: column; align-items: center;">
            <div style="font-family: var(--font-display); font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; letter-spacing: 1.5px; display: flex; align-items: center; gap: 6px;">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--primary-red);"></span> Vista Frontal
            </div>
            <div id="svg-front-container" style="width: 100%; max-width: 230px; height: 460px;">
              ${this.getHarmoniousFrontSVG()}
            </div>
          </div>

          <!-- VISTA POSTERIOR -->
          <div class="figure-box" style="flex: 1; display: flex; flex-direction: column; align-items: center;">
            <div style="font-family: var(--font-display); font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; letter-spacing: 1.5px; display: flex; align-items: center; gap: 6px;">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--primary-red);"></span> Vista Posterior
            </div>
            <div id="svg-back-container" style="width: 100%; max-width: 230px; height: 460px;">
              ${this.getHarmoniousBackSVG()}
            </div>
          </div>

        </div>

      </div>
    `;

    this.attachEvents();
  }

  getHarmoniousFrontSVG() {
    return `
      <svg viewBox="0 0 240 520" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 12px 28px rgba(0,0,0,0.6));">
        <defs>
          <filter id="glowFrontH" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- 1. SILHUETA DE PELE BRANCA PROPORCIONAL & HARMONIOSA (FRONTAL) -->
        <g id="skin-base-front" fill="#f8fafc" stroke="#0f172a" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">
          <!-- Cabeça Harmônica (Proporção Áurea) -->
          <path d="M 100 38 C 100 16, 140 16, 140 38 C 140 60, 134 76, 120 80 C 106 76, 100 60, 100 38 Z" />
          <!-- Detalhes do Rosto -->
          <ellipse cx="111" cy="40" rx="2.5" ry="1.5" fill="#0f172a" />
          <ellipse cx="129" cy="40" rx="2.5" ry="1.5" fill="#0f172a" />
          <path d="M 116 56 Q 120 59 124 56" fill="none" stroke="#0f172a" stroke-width="1.5" />

          <!-- Contorno do Pescoço, Ombros & Tronco V-Taper -->
          <path d="M 104 80 L 76 98 L 48 108 L 42 165 L 56 205 L 42 260 L 52 265 L 70 215 L 82 280 L 105 290 L 120 290 L 135 290 L 158 280 L 170 215 L 188 265 L 198 260 L 184 205 L 198 165 L 192 108 L 164 98 L 136 80 Z" />
          
          <!-- Braços e Mãos Brancas Proporcionais -->
          <path d="M 38 260 C 32 275, 36 290, 48 295 L 58 260 Z" />
          <path d="M 202 260 C 208 275, 204 290, 192 295 L 182 260 Z" />

          <!-- Pernas e Pés Brancos Proporcionais -->
          <path d="M 82 290 L 115 290 L 110 480 L 78 480 Z" />
          <path d="M 125 290 L 158 290 L 162 480 L 130 480 Z" />
          <path d="M 78 480 L 68 502 L 105 502 Z" />
          <path d="M 162 480 L 172 502 L 135 502 Z" />
        </g>

        <!-- 2. MÚSCULOS COLORIDOS PERFEITAMENTE ENCAIXADOS (VISTA FRONTAL) -->
        <g id="muscles-front">
          <!-- PESCOÇO / TRAPÉZIO (VERMELHO - TRAPEZIO) -->
          <path data-muscle="trapezio" class="h-muscle" fill="#cc0000" stroke="#0f172a" stroke-width="1.3" d="M 106 80 L 120 98 L 134 80 C 142 92, 138 104, 120 106 C 102 104, 98 92, 106 80 Z" />

          <!-- PEITORAL MAIOR (VERMELHO-LARANJA - PECHO) -->
          <path data-muscle="pecho" class="h-muscle" fill="#ff4500" stroke="#0f172a" stroke-width="1.3" d="M 78 106 C 98 102, 118 106, 118 108 C 118 148, 106 156, 76 150 C 70 140, 70 118, 78 106 Z" />
          <path data-muscle="pecho" class="h-muscle" fill="#ff4500" stroke="#0f172a" stroke-width="1.3" d="M 162 106 C 142 102, 122 106, 122 108 C 122 148, 134 156, 164 150 C 170 140, 170 118, 162 106 Z" />

          <!-- OMBROS (VERMELHO - HOMBROS) -->
          <path data-muscle="hombros" class="h-muscle" fill="#e52b2b" stroke="#0f172a" stroke-width="1.3" d="M 76 104 C 58 110, 44 122, 46 148 C 58 152, 68 140, 74 120 Z" />
          <path data-muscle="hombros" class="h-muscle" fill="#e52b2b" stroke="#0f172a" stroke-width="1.3" d="M 164 104 C 182 110, 196 122, 194 148 C 182 152, 172 140, 166 120 Z" />

          <!-- BÍCEPS (AMARELO - BICEPS) -->
          <path data-muscle="biceps" class="h-muscle" fill="#ffcc00" stroke="#0f172a" stroke-width="1.3" d="M 46 152 C 38 165, 40 198, 52 204 C 60 192, 64 165, 58 152 Z" />
          <path data-muscle="biceps" class="h-muscle" fill="#ffcc00" stroke="#0f172a" stroke-width="1.3" d="M 194 152 C 202 165, 200 198, 188 204 C 180 192, 176 165, 182 152 Z" />

          <!-- ANTEBRAÇOS (VERDE - ANTEBRAZOS) -->
          <path data-muscle="antebrazos" class="h-muscle" fill="#28a745" stroke="#0f172a" stroke-width="1.3" d="M 50 206 C 36 225, 30 252, 36 264 C 44 258, 50 234, 54 208 Z" />
          <path data-muscle="antebrazos" class="h-muscle" fill="#28a745" stroke="#0f172a" stroke-width="1.3" d="M 190 206 C 204 225, 210 252, 204 264 C 196 258, 190 234, 186 208 Z" />

          <!-- ABDOMINAIS 6-PACK (LARANJA VÍVIDO - ABDOMINALES) -->
          <path data-muscle="abdominales" class="h-muscle" fill="#ff7700" stroke="#0f172a" stroke-width="1.3" d="M 102 158 L 138 158 L 136 178 L 104 178 Z" />
          <path data-muscle="abdominales" class="h-muscle" fill="#ff7700" stroke="#0f172a" stroke-width="1.3" d="M 103 182 L 137 182 L 135 202 L 105 202 Z" />
          <path data-muscle="abdominales" class="h-muscle" fill="#ff7700" stroke="#0f172a" stroke-width="1.3" d="M 104 206 L 136 206 L 134 228 L 106 228 Z" />
          <path data-muscle="abdominales" class="h-muscle" fill="#ff7700" stroke="#0f172a" stroke-width="1.3" d="M 105 232 L 135 232 L 133 260 L 107 260 Z" />

          <!-- SERRATO & OBLÍQUOS (VERDE PETRÓLEO/CYAN - ABDOMINALES) -->
          <path data-muscle="abdominales" class="h-muscle" fill="#008080" stroke="#0f172a" stroke-width="1.3" d="M 78 158 C 92 164, 96 208, 88 240 C 78 220, 74 186, 78 158 Z" />
          <path data-muscle="abdominales" class="h-muscle" fill="#008080" stroke="#0f172a" stroke-width="1.3" d="M 162 158 C 148 164, 144 208, 152 240 C 162 220, 166 186, 162 158 Z" />

          <!-- QUADRÍCEPS HARMONIOSOS (ROXO/VIOLETA - QUADRICEPS) -->
          <path data-muscle="quadriceps" class="h-muscle" fill="#6f42c1" stroke="#0f172a" stroke-width="1.3" d="M 84 266 C 70 310, 74 395, 90 422 C 102 405, 105 328, 98 266 Z" />
          <path data-muscle="quadriceps" class="h-muscle" fill="#6f42c1" stroke="#0f172a" stroke-width="1.3" d="M 156 266 C 170 310, 166 395, 150 422 C 138 405, 135 328, 142 266 Z" />

          <!-- PANTURRILHAS HARMONIOSAS (MAGENTA/ROXO - PANTORRILLAS) -->
          <path data-muscle="pantorrillas" class="h-muscle" fill="#8a2be2" stroke="#0f172a" stroke-width="1.3" d="M 80 436 C 68 462, 70 495, 84 512 C 92 495, 90 462, 94 436 Z" />
          <path data-muscle="pantorrillas" class="h-muscle" fill="#8a2be2" stroke="#0f172a" stroke-width="1.3" d="M 160 436 C 172 462, 170 495, 156 512 C 148 495, 150 462, 146 436 Z" />
        </g>
      </svg>
    `;
  }

  getHarmoniousBackSVG() {
    return `
      <svg viewBox="0 0 240 520" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 12px 28px rgba(0,0,0,0.6));">
        <defs>
          <filter id="glowBackH" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- 1. SILHUETA DE PELE BRANCA PROPORCIONAL & HARMONIOSA (POSTERIOR) -->
        <g id="skin-base-back" fill="#f8fafc" stroke="#0f172a" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">
          <!-- Cabeça Posterior -->
          <path d="M 100 38 C 100 16, 140 16, 140 38 C 140 60, 134 76, 120 80 C 106 76, 100 60, 100 38 Z" />

          <!-- Contorno do Pescoço, Ombros & Tronco V-Taper -->
          <path d="M 104 80 L 76 98 L 48 108 L 42 165 L 56 205 L 42 260 L 52 265 L 70 215 L 82 280 L 105 290 L 120 290 L 135 290 L 158 280 L 170 215 L 188 265 L 198 260 L 184 205 L 198 165 L 192 108 L 164 98 L 136 80 Z" />
          
          <!-- Braços e Mãos Brancas -->
          <path d="M 38 260 C 32 275, 36 290, 48 295 L 58 260 Z" />
          <path d="M 202 260 C 208 275, 204 290, 192 295 L 182 260 Z" />

          <!-- Pernas e Pés Brancos -->
          <path d="M 82 290 L 115 290 L 110 480 L 78 480 Z" />
          <path d="M 125 290 L 158 290 L 162 480 L 130 480 Z" />
          <path d="M 78 480 L 68 502 L 105 502 Z" />
          <path d="M 162 480 L 172 502 L 135 502 Z" />
        </g>

        <!-- 2. MÚSCULOS COLORIDOS POSTERIORES HARMONIOSOS -->
        <g id="muscles-back">
          <!-- PESCOÇO / TRAPÉZIO SUPERIOR (VERMELHO - TRAPEZIO) -->
          <path data-muscle="trapezio" class="h-muscle" fill="#cc0000" stroke="#0f172a" stroke-width="1.3" d="M 104 80 L 120 102 L 136 80 C 144 94, 140 106, 120 108 C 100 106, 96 94, 104 80 Z" />

          <!-- COSTAS & TRAPÉZIO/DORSAL (VERMELHO-LARANJA - ESPALDA) -->
          <path data-muscle="espalda" class="h-muscle" fill="#ff4500" stroke="#0f172a" stroke-width="1.3" d="M 78 106 C 98 112, 120 120, 120 175 C 98 164, 78 148, 78 106 Z" />
          <path data-muscle="espalda" class="h-muscle" fill="#ff4500" stroke="#0f172a" stroke-width="1.3" d="M 162 106 C 142 112, 120 120, 120 175 C 142 164, 162 148, 162 106 Z" />

          <!-- LATÍSSIMO DO DORSO (LARANJA - ESPALDA) -->
          <path data-muscle="espalda" class="h-muscle" fill="#ff7700" stroke="#0f172a" stroke-width="1.3" d="M 74 148 C 88 158, 110 196, 106 240 C 90 224, 76 186, 74 148 Z" />
          <path data-muscle="espalda" class="h-muscle" fill="#ff7700" stroke="#0f172a" stroke-width="1.3" d="M 166 148 C 152 158, 130 196, 134 240 C 150 224, 164 186, 166 148 Z" />

          <!-- TRÍCEPS POSTERIOR (AMARELO - TRICEPS) -->
          <path data-muscle="triceps" class="h-muscle" fill="#ffcc00" stroke="#0f172a" stroke-width="1.3" d="M 46 152 C 38 165, 40 198, 52 204 C 60 192, 64 165, 58 152 Z" />
          <path data-muscle="triceps" class="h-muscle" fill="#ffcc00" stroke="#0f172a" stroke-width="1.3" d="M 194 152 C 202 165, 200 198, 188 204 C 180 192, 176 165, 182 152 Z" />

          <!-- ANTEBRAÇOS POSTERIOR (VERDE - ANTEBRAZOS) -->
          <path data-muscle="antebrazos" class="h-muscle" fill="#28a745" stroke="#0f172a" stroke-width="1.3" d="M 50 206 C 36 225, 30 252, 36 264 C 44 258, 50 234, 54 208 Z" />
          <path data-muscle="antebrazos" class="h-muscle" fill="#28a745" stroke="#0f172a" stroke-width="1.3" d="M 190 206 C 204 225, 210 252, 204 264 C 196 258, 190 234, 186 208 Z" />

          <!-- GLÚTEOS (VERDE PETRÓLEO/AZUL ESCURO - GLUTEOS) -->
          <path data-muscle="gluteos" class="h-muscle" fill="#006666" stroke="#0f172a" stroke-width="1.3" d="M 86 266 C 102 260, 115 282, 113 315 C 92 320, 81 298, 86 266 Z" />
          <path data-muscle="gluteos" class="h-muscle" fill="#006666" stroke="#0f172a" stroke-width="1.3" d="M 154 266 C 138 260, 125 282, 127 315 C 148 320, 159 298, 154 266 Z" />

          <!-- ISQUIOTIBIAIS / FEMORAIS (ROXO ESCURO - FEMORALES) -->
          <path data-muscle="femorales" class="h-muscle" fill="#5a2a82" stroke="#0f172a" stroke-width="1.3" d="M 88 320 C 100 320, 106 370, 100 420 C 86 408, 80 360, 88 320 Z" />
          <path data-muscle="femorales" class="h-muscle" fill="#5a2a82" stroke="#0f172a" stroke-width="1.3" d="M 152 320 C 140 320, 134 370, 140 420 C 154 408, 160 360, 152 320 Z" />

          <!-- PANTURRILHAS POSTERIOR (MAGENTA/ROXO - PANTORRILLAS) -->
          <path data-muscle="pantorrillas" class="h-muscle" fill="#8a2be2" stroke="#0f172a" stroke-width="1.3" d="M 80 436 C 68 462, 70 495, 84 512 C 92 495, 90 462, 94 436 Z" />
          <path data-muscle="pantorrillas" class="h-muscle" fill="#8a2be2" stroke="#0f172a" stroke-width="1.3" d="M 160 436 C 172 462, 170 495, 156 512 C 148 495, 150 462, 146 436 Z" />
        </g>
      </svg>
    `;
  }

  attachEvents() {
    const muscles = this.container.querySelectorAll('.h-muscle');
    muscles.forEach(m => {
      m.style.cursor = 'pointer';
      m.style.transition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)';

      m.addEventListener('mouseenter', (e) => {
        const id = e.currentTarget.dataset.muscle;
        this.hoveredMuscleId = id;
        this.updateHighlightState();
      });

      m.addEventListener('mouseleave', () => {
        this.hoveredMuscleId = null;
        this.updateHighlightState();
      });

      m.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.muscle;
        this.selectMuscle(id, true);
      });
    });
  }

  selectMuscle(muscleId, triggerCallback = true) {
    this.selectedMuscleId = muscleId;
    this.updateHighlightState();

    if (triggerCallback && this.onSelectCallback) {
      this.onSelectCallback(muscleId);
    }
  }

  updateHighlightState() {
    const muscles = this.container.querySelectorAll('.h-muscle');
    muscles.forEach(m => {
      const id = m.dataset.muscle;
      const isSelected = id === this.selectedMuscleId;
      const isHovered = id === this.hoveredMuscleId;

      if (isSelected) {
        m.style.filter = 'url(#glowFrontH) drop-shadow(0 0 12px #ffffff)';
        m.style.stroke = '#ffffff';
        m.style.strokeWidth = '2.5px';
        m.style.opacity = '1';
        m.style.transform = 'scale(1.02)';
        m.style.transformOrigin = 'center';
      } else if (isHovered) {
        m.style.filter = 'drop-shadow(0 0 8px rgba(255,255,255,0.85))';
        m.style.stroke = '#ffffff';
        m.style.strokeWidth = '1.8px';
        m.style.opacity = '0.95';
        m.style.transform = 'scale(1.01)';
        m.style.transformOrigin = 'center';
      } else {
        m.style.filter = 'none';
        m.style.stroke = '#0f172a';
        m.style.strokeWidth = '1.3px';
        m.style.opacity = '0.88';
        m.style.transform = 'none';
      }
    });
  }

  rotateToFront() {
    this.selectMuscle('pecho', true);
  }

  rotateToBack() {
    this.selectMuscle('espalda', true);
  }

  toggleAutoSpin() {
    return false;
  }
}
