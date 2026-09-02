/**
 * OrganicAnatomySVG - Renderizador Anatômico Humano Orgânico e Realista em SVG
 * Substitui formas robóticas por ilustrações anatômicas com curvas humanas suaves.
 */

import { MUSCLE_DATABASE } from './database.js';

export class OrganicAnatomySVG {
  constructor(containerId, onSelectCallback) {
    this.container = document.getElementById(containerId);
    this.onSelectCallback = onSelectCallback;
    
    this.currentView = 'front'; // 'front' | 'back'
    this.selectedMuscleId = null;
    this.hoveredMuscleId = null;
    
    this.isAutoSpinning = false;
    this.spinInterval = null;
    
    this.init();
  }

  init() {
    this.renderContainerStructure();
    this.renderSVGView(this.currentView);
  }

  renderContainerStructure() {
    this.container.innerHTML = `
      <div class="organic-anatomy-wrapper" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; padding: 20px;">
        <div id="svg-body-canvas" style="width: 100%; height: 100%; max-height: 540px; display: flex; align-items: center; justify-content: center;">
          <!-- SVG da anatomia humana renderizado dinamicamente -->
        </div>
      </div>
    `;

    this.svgContainer = document.getElementById('svg-body-canvas');
  }

  renderSVGView(view = 'front') {
    this.currentView = view;
    this.svgContainer.innerHTML = view === 'front' ? this.getFrontBodySVG() : this.getBackBodySVG();
    
    this.attachSVGListeners();
    this.updateHighlighting();
  }

  getFrontBodySVG() {
    return `
      <svg viewBox="0 0 400 700" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-height: 520px; filter: drop-shadow(0 10px 25px rgba(0,0,0,0.5));">
        <defs>
          <linearGradient id="bodySkin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#3b4758" />
            <stop offset="100%" stop-color="#212a37" />
          </linearGradient>
          <linearGradient id="highlightRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ff2a4b" />
            <stop offset="100%" stop-color="#e11d48" />
          </linearGradient>
          <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- Silhueta Contorno Anatômico Humano Neutro -->
        <g id="body-outline" fill="url(#bodySkin)" stroke="#1e293b" stroke-width="1.5">
          <!-- Cabeça & Pescoço -->
          <path d="M 180 50 C 180 30, 220 30, 220 50 C 220 70, 215 90, 210 100 C 205 105, 195 105, 190 100 C 185 90, 180 70, 180 50 Z" />
          <!-- Tronco e Pélvis -->
          <path d="M 160 115 L 240 115 C 265 130, 275 160, 260 270 C 250 340, 240 370, 230 400 L 170 400 C 160 370, 150 340, 140 270 C 125 160, 135 130, 160 115 Z" />
          <!-- Perda esquerda/direita -->
          <path d="M 170 400 L 195 400 L 190 650 L 160 650 Z" />
          <path d="M 205 400 L 230 400 L 240 650 L 210 650 Z" />
        </g>

        <!-- MÚSCULOS ANATÔMICOS INTERATIVOS (CURVAS ORGÂNICAS REAIS) -->
        <g id="muscle-groups">
          <!-- PESCOÇO / TRAPÉZIO (TRAPEZIO) -->
          <path data-muscle="trapezio" class="muscle-path" d="M 186 102 C 188 115, 190 120, 193 125 L 180 128 C 175 120, 178 110, 186 102 Z" />
          <path data-muscle="trapezio" class="muscle-path" d="M 214 102 C 212 115, 210 120, 207 125 L 220 128 C 225 120, 222 110, 214 102 Z" />

          <!-- PEITORAL MAIOR (PECHO) -->
          <path data-muscle="pecho" class="muscle-path" d="M 162 128 C 180 125, 196 128, 197 132 C 197 165, 188 185, 158 180 C 150 170, 150 145, 162 128 Z" />
          <path data-muscle="pecho" class="muscle-path" d="M 238 128 C 220 125, 204 128, 203 132 C 203 165, 212 185, 242 180 C 250 170, 250 145, 238 128 Z" />

          <!-- OMBROS (DELTOIDES ANTERIOR E LATERAL) -->
          <path data-muscle="hombros" class="muscle-path" d="M 160 126 C 145 130, 130 145, 132 175 C 142 178, 152 165, 158 145 Z" />
          <path data-muscle="hombros" class="muscle-path" d="M 240 126 C 255 130, 270 145, 268 175 C 258 178, 248 165, 242 145 Z" />

          <!-- BÍCEPS BRAQUIAL -->
          <path data-muscle="biceps" class="muscle-path" d="M 132 178 C 126 195, 130 225, 142 232 C 148 220, 152 195, 146 178 Z" />
          <path data-muscle="biceps" class="muscle-path" d="M 268 178 C 274 195, 270 225, 258 232 C 252 220, 248 195, 254 178 Z" />

          <!-- ANTEBRAÇOS (BRAQUIORRADIAL E FLEXORES) -->
          <path data-muscle="antebrazos" class="muscle-path" d="M 138 235 C 125 255, 120 285, 126 305 C 134 300, 142 270, 144 240 Z" />
          <path data-muscle="antebrazos" class="muscle-path" d="M 262 235 C 275 255, 280 285, 274 305 C 266 300, 258 270, 256 240 Z" />

          <!-- ABDOMINAIS & CORE (6-PACK MATRIX + OBLÍQUOS) -->
          <path data-muscle="abdominales" class="muscle-path" d="M 182 190 Q 200 188 218 190 Q 216 210 184 210 Z" />
          <path data-muscle="abdominales" class="muscle-path" d="M 182 215 Q 200 213 218 215 Q 216 235 184 235 Z" />
          <path data-muscle="abdominales" class="muscle-path" d="M 184 240 Q 200 238 216 240 Q 214 265 186 265 Z" />

          <!-- OBLÍQUOS EXTERNOS E SERRATO -->
          <path data-muscle="abdominales" class="muscle-path" d="M 160 190 C 172 195, 176 235, 168 270 C 158 250, 152 220, 160 190 Z" />
          <path data-muscle="abdominales" class="muscle-path" d="M 240 190 C 228 195, 224 235, 232 270 C 242 250, 248 220, 240 190 Z" />

          <!-- QUADRÍCEPS (VASTO LATERAL, RECTO FEMORAL E VASTO MEDIAL) -->
          <path data-muscle="quadriceps" class="muscle-path" d="M 165 310 C 150 350, 152 440, 172 470 C 185 450, 188 370, 182 310 Z" />
          <path data-muscle="quadriceps" class="muscle-path" d="M 235 310 C 250 350, 248 440, 228 470 C 215 450, 212 370, 218 310 Z" />

          <!-- PANTURRILHAS (CANELA / TIBIAL ANTERIOR) -->
          <path data-muscle="pantorrillas" class="muscle-path" d="M 162 500 C 152 530, 155 580, 170 610 C 178 590, 176 540, 172 500 Z" />
          <path data-muscle="pantorrillas" class="muscle-path" d="M 238 500 C 248 530, 245 580, 230 610 C 222 590, 224 540, 228 500 Z" />
        </g>
      </svg>
    `;
  }

  getBackBodySVG() {
    return `
      <svg viewBox="0 0 400 700" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-height: 520px; filter: drop-shadow(0 10px 25px rgba(0,0,0,0.5));">
        <defs>
          <linearGradient id="bodySkinBack" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#3b4758" />
            <stop offset="100%" stop-color="#212a37" />
          </linearGradient>
        </defs>

        <!-- Silhueta Contorno Posterior -->
        <g id="body-outline-back" fill="url(#bodySkinBack)" stroke="#1e293b" stroke-width="1.5">
          <path d="M 180 50 C 180 30, 220 30, 220 50 C 220 75, 210 95, 200 100 C 190 95, 180 75, 180 50 Z" />
          <path d="M 160 115 L 240 115 C 268 135, 275 160, 260 270 C 250 340, 245 370, 235 400 L 165 400 C 155 370, 150 340, 140 270 C 125 160, 132 135, 160 115 Z" />
          <path d="M 165 400 L 195 400 L 190 650 L 160 650 Z" />
          <path d="M 205 400 L 235 400 L 240 650 L 210 650 Z" />
        </g>

        <!-- MÚSCULOS POSTERIORES (CURVAS ANATÔMICAS ORGÂNICAS) -->
        <g id="muscle-groups-back">
          <!-- TRAPÉZIO & COSTAS SUPERIOR (ESPALDA) -->
          <path data-muscle="espalda" class="muscle-path" d="M 200 110 L 170 135 C 185 145, 215 145, 230 135 Z" />
          <path data-muscle="espalda" class="muscle-path" d="M 165 140 C 180 150, 200 170, 200 210 C 175 190, 160 170, 165 140 Z" />
          <path data-muscle="espalda" class="muscle-path" d="M 235 140 C 220 150, 200 170, 200 210 C 225 190, 240 170, 235 140 Z" />

          <!-- LATÍSSIMO DO DORSO ("ASAS" V-TAPER) -->
          <path data-muscle="espalda" class="muscle-path" d="M 152 170 C 170 185, 188 230, 182 270 C 168 250, 150 210, 152 170 Z" />
          <path data-muscle="espalda" class="muscle-path" d="M 248 170 C 230 185, 212 230, 218 270 C 232 250, 250 210, 248 170 Z" />

          <!-- ERETORES DA ESPINHA (LOMBAR) -->
          <path data-muscle="espalda" class="muscle-path" d="M 184 270 C 192 270, 208 270, 216 270 C 214 300, 186 300, 184 270 Z" />

          <!-- TRÍCEPS POSTERIOR -->
          <path data-muscle="triceps" class="muscle-path" d="M 132 175 C 124 195, 128 225, 142 232 C 146 220, 148 195, 142 175 Z" />
          <path data-muscle="triceps" class="muscle-path" d="M 268 175 C 276 195, 272 225, 258 232 C 254 220, 252 195, 258 175 Z" />

          <!-- GLÚTEOS (GLÚTEO MÁXIMO & MÉDIO) -->
          <path data-muscle="gluteos" class="muscle-path" d="M 165 310 C 185 305, 198 330, 196 370 C 170 375, 155 350, 165 310 Z" />
          <path data-muscle="gluteos" class="muscle-path" d="M 235 310 C 215 305, 202 330, 204 370 C 230 375, 245 350, 235 310 Z" />

          <!-- ISQUIOTIBIAIS / FEMORAIS (POSTERIOR DE COXA) -->
          <path data-muscle="femorales" class="muscle-path" d="M 168 375 C 182 375, 192 420, 185 470 C 168 460, 158 410, 168 375 Z" />
          <path data-muscle="femorales" class="muscle-path" d="M 232 375 C 218 375, 208 420, 215 470 C 232 460, 242 410, 232 375 Z" />

          <!-- PANTURRILHAS (GASTROCNÊMIO DUPLO & SÓLEO) -->
          <path data-muscle="pantorrillas" class="muscle-path" d="M 162 490 C 150 515, 152 560, 172 580 C 182 560, 178 520, 162 490 Z" />
          <path data-muscle="pantorrillas" class="muscle-path" d="M 238 490 C 250 515, 248 560, 228 580 C 218 560, 222 520, 238 490 Z" />
        </g>
      </svg>
    `;
  }

  attachSVGListeners() {
    const musclePaths = this.container.querySelectorAll('.muscle-path');
    musclePaths.forEach(path => {
      path.style.cursor = 'pointer';
      path.style.transition = 'all 0.25s ease';
      path.style.fill = '#475569';
      path.style.opacity = '0.75';

      path.addEventListener('mouseenter', (e) => {
        const muscleId = e.currentTarget.dataset.muscle;
        this.hoveredMuscleId = muscleId;
        this.updateHighlighting();
      });

      path.addEventListener('mouseleave', () => {
        this.hoveredMuscleId = null;
        this.updateHighlighting();
      });

      path.addEventListener('click', (e) => {
        const muscleId = e.currentTarget.dataset.muscle;
        this.selectMuscle(muscleId, true);
      });
    });
  }

  selectMuscle(muscleId, triggerCallback = true) {
    this.selectedMuscleId = muscleId;
    this.updateHighlighting();

    if (triggerCallback && this.onSelectCallback) {
      this.onSelectCallback(muscleId);
    }
  }

  updateHighlighting() {
    const musclePaths = this.container.querySelectorAll('.muscle-path');
    musclePaths.forEach(path => {
      const id = path.dataset.muscle;
      const isSelected = id === this.selectedMuscleId;
      const isHovered = id === this.hoveredMuscleId;

      if (isSelected) {
        path.style.fill = '#ff1a40'; // Vermelho vívido da referência
        path.style.opacity = '1';
        path.style.filter = 'url(#glowEffect)';
        path.style.stroke = '#ffffff';
        path.style.strokeWidth = '1.5px';
      } else if (isHovered) {
        path.style.fill = '#ff1a40';
        path.style.opacity = '0.85';
        path.style.stroke = '#ff1a40';
        path.style.strokeWidth = '1px';
      } else {
        path.style.fill = '#475569';
        path.style.opacity = '0.7';
        path.style.filter = 'none';
        path.style.stroke = 'none';
      }
    });
  }

  rotateToFront() {
    this.renderSVGView('front');
  }

  rotateToBack() {
    this.renderSVGView('back');
  }

  toggleAutoSpin() {
    this.isAutoSpinning = !this.isAutoSpinning;
    if (this.isAutoSpinning) {
      this.spinInterval = setInterval(() => {
        this.renderSVGView(this.currentView === 'front' ? 'back' : 'front');
      }, 3000);
    } else {
      if (this.spinInterval) clearInterval(this.spinInterval);
    }
    return this.isAutoSpinning;
  }
}
