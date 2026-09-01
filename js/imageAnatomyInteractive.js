/**
 * ImageAnatomyInteractive - Motor de Rotação 360° Anatômico Profissional
 * Renderiza um boneco anatômico com rotação de 360° via drag ou auto-spin.
 * Utiliza 8 quadros (5 únicos + 3 espelhados).
 */

import { MUSCLE_DATABASE } from './database.js';

// Definição dos 8 quadros de rotação (0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°)
const ROTATION_FRAMES = [
  { src: 'assets/frames/frame_0.png', mirror: false, label: 'Frente' },         // 0° - Front
  { src: 'assets/frames/frame_1.png', mirror: false, label: 'Frente-Direita' }, // 45° - Front-Right
  { src: 'assets/frames/frame_2.png', mirror: false, label: 'Lateral Direita' },// 90° - Right Side
  { src: 'assets/frames/frame_3.png', mirror: false, label: 'Costas-Direita' }, // 135° - Back-Right
  { src: 'assets/frames/frame_4.png', mirror: false, label: 'Costas' },         // 180° - Back
  { src: 'assets/frames/frame_3.png', mirror: true,  label: 'Costas-Esquerda' },// 225° - Back-Left (mirror of 135°)
  { src: 'assets/frames/frame_2.png', mirror: true,  label: 'Lateral Esquerda'},// 270° - Left Side (mirror of 90°)
  { src: 'assets/frames/frame_1.png', mirror: true,  label: 'Frente-Esquerda' },// 315° - Front-Left (mirror of 45°)
];

// Mapeamento de músculos visíveis por quadro (índice do frame)
const FRAME_MUSCLES = {
  0: ['pecho','cuello','hombros','biceps','antebrazos','abdominales','quadriceps','pantorrillas'],
  1: ['pecho','cuello','hombros','biceps','antebrazos','abdominales','quadriceps','pantorrillas','triceps'],
  2: ['hombros','triceps','antebrazos','abdominales','espalda','gluteos','quadriceps','femorales','pantorrillas','cuello'],
  3: ['espalda','hombros','triceps','antebrazos','gluteos','femorales','pantorrillas','cuello'],
  4: ['espalda','cuello','hombros','triceps','antebrazos','gluteos','femorales','pantorrillas'],
  5: ['espalda','hombros','triceps','antebrazos','gluteos','femorales','pantorrillas','cuello'],
  6: ['hombros','triceps','antebrazos','abdominales','espalda','gluteos','quadriceps','femorales','pantorrillas','cuello'],
  7: ['pecho','cuello','hombros','biceps','antebrazos','abdominales','quadriceps','pantorrillas','triceps'],
};

export class ImageAnatomyInteractive {
  constructor(containerId, onSelectCallback, soundEffects = null) {
    this.container = document.getElementById(containerId);
    this.onSelectCallback = onSelectCallback;
    this.soundEffects = soundEffects;
    
    this.selectedMuscleId = null;
    this.hoveredMuscleId = null;
    this.currentFrame = 0;
    this.totalFrames = ROTATION_FRAMES.length;
    this.isAutoSpinning = false;
    this.autoSpinInterval = null;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragAccumulated = 0;
    this.preloadedImages = [];
    
    this.init();
  }

  init() {
    this.preloadImages();
    this.render();
  }

  preloadImages() {
    ROTATION_FRAMES.forEach((frame, i) => {
      const img = new Image();
      img.src = frame.src + '?v=15';
      this.preloadedImages[i] = img;
    });
  }

  render() {
    const frame = ROTATION_FRAMES[this.currentFrame];
    this.container.innerHTML = `
      <div class="image-anatomy-wrapper" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; padding: 4px; overflow: hidden;">
        
        <!-- Palco de Rotação 360° -->
        <div class="image-stage-exact" style="cursor: grab;">
          
          <!-- Imagem Anatômica Rotativa -->
          <img id="anatomical-base-img" 
               src="${frame.src}?v=15" 
               alt="Anatomia 360°" 
               style="width: 100%; height: 100%; object-fit: contain; border-radius: 12px; pointer-events: none; transition: opacity 0.15s ease; ${frame.mirror ? 'transform: scaleX(-1);' : ''}" />

          <!-- Indicador de Ângulo -->
          <div id="rotation-angle-indicator" style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); background: rgba(10,13,20,0.85); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.15); padding: 4px 14px; border-radius: 20px; font-family: var(--font-display); font-size: 0.75rem; font-weight: 600; color: rgba(255,255,255,0.8); letter-spacing: 0.5px; z-index: 15; pointer-events: none; transition: opacity 0.3s ease; opacity: 0;">
            <span id="rotation-label">${frame.label}</span> · <span id="rotation-degrees">${this.currentFrame * 45}°</span>
          </div>

          <!-- Barra de Progresso Circular -->
          <div id="rotation-progress" style="position: absolute; top: 10px; right: 10px; z-index: 15; pointer-events: none;">
            <svg width="36" height="36" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2.5" />
              <circle id="progress-circle" cx="18" cy="18" r="15" fill="none" stroke="var(--primary-red, #ff1a40)" stroke-width="2.5" stroke-dasharray="94.2" stroke-dashoffset="${94.2 - (this.currentFrame / this.totalFrames) * 94.2}" stroke-linecap="round" transform="rotate(-90 18 18)" style="transition: stroke-dashoffset 0.3s ease;" />
            </svg>
          </div>



          <!-- Overlay SVG para Detecção de Músculos -->
          <svg id="muscle-overlay-svg" viewBox="0 0 1000 1000" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: auto; z-index: 10; ${frame.mirror ? 'transform: scaleX(-1);' : ''}">
            ${this.generateSVGPaths()}
          </svg>
        </div>

        <!-- Legenda Flutuante -->
        <div id="cursor-anatomy-tooltip" class="floating-tooltip" style="position: fixed; display: none; pointer-events: none; z-index: 1000; background: rgba(10, 13, 20, 0.95); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.2); border-left: 4px solid var(--primary-red); padding: 8px 16px; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); transition: opacity 0.15s ease, transform 0.1s ease; opacity: 0; transform: scale(0.95);">
          <div class="tooltip-title" style="font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; color: #fff;"></div>
          <div class="tooltip-sub" style="font-size: 0.75rem; color: var(--primary-red); font-weight: 600; margin-top: 2px;"></div>
        </div>

        <!-- Instrução de Interação -->
        <div id="drag-instruction" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none; z-index: 25; opacity: 0; transition: opacity 0.5s ease;">
          <div style="background: rgba(10,13,20,0.9); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.15); padding: 12px 24px; border-radius: 12px; text-align: center;">
            <div style="font-size: 1.5rem; margin-bottom: 4px;">↔️</div>
            <div style="font-family: var(--font-display); font-size: 0.8rem; color: rgba(255,255,255,0.7);">Arraste para Girar 360°</div>
          </div>
        </div>
      </div>
    `;

    this.tooltipEl = document.getElementById('cursor-anatomy-tooltip');
    this.setupDragRotation();
    this.setupMuscleInteraction();
    this.showDragInstruction();
  }

  generateSVGPaths() {
    const svgAreas = {
      // Frame 0: Front
      0: `
        <path data-muscle="cuello" data-pin-x="50" data-pin-y="14" class="anatomy-trigger-area" d="M 440 100 C 460 95, 540 95, 560 100 L 545 170 L 455 170 Z" />
        <path data-muscle="pecho" data-pin-x="38" data-pin-y="24" class="anatomy-trigger-area" d="M 320 175 C 380 170, 480 175, 480 180 L 480 295 C 400 292, 335 280, 315 240 Z" />
        <path data-muscle="pecho" data-pin-x="62" data-pin-y="24" class="anatomy-trigger-area" d="M 520 180 C 520 175, 620 170, 680 175 L 685 240 C 665 280, 600 292, 520 295 Z" />
        <path data-muscle="hombros" data-pin-x="27" data-pin-y="20" class="anatomy-trigger-area" d="M 230 175 C 270 170, 320 175, 320 180 L 325 250 C 290 265, 245 255, 225 215 Z" />
        <path data-muscle="hombros" data-pin-x="73" data-pin-y="20" class="anatomy-trigger-area" d="M 680 180 C 680 175, 730 170, 770 175 L 775 215 C 755 255, 710 265, 675 250 Z" />
        <path data-muscle="biceps" data-pin-x="22" data-pin-y="33" class="anatomy-trigger-area" d="M 195 260 C 230 258, 265 260, 265 268 L 255 395 C 230 400, 195 392, 185 375 Z" />
        <path data-muscle="biceps" data-pin-x="78" data-pin-y="33" class="anatomy-trigger-area" d="M 735 268 C 735 260, 770 258, 805 260 L 815 375 C 805 392, 770 400, 745 395 Z" />
        <path data-muscle="antebrazos" data-pin-x="35" data-pin-y="42" class="anatomy-trigger-area" d="M 340 360 C 365 358, 380 370, 380 385 L 355 490 C 335 492, 320 480, 320 465 L 340 360 Z" />
        <path data-muscle="antebrazos" data-pin-x="65" data-pin-y="42" class="anatomy-trigger-area" d="M 660 360 C 635 358, 620 370, 620 385 L 645 490 C 665 492, 680 480, 680 465 L 660 360 Z" />
        <path data-muscle="abdominales" data-pin-x="50" data-pin-y="38" class="anatomy-trigger-area" d="M 400 300 L 600 300 L 585 505 L 415 505 Z" />
        <path data-muscle="quadriceps" data-pin-x="38" data-pin-y="60" class="anatomy-trigger-area" d="M 340 510 C 400 505, 485 510, 485 516 L 470 760 C 410 758, 340 735, 340 700 Z" />
        <path data-muscle="quadriceps" data-pin-x="62" data-pin-y="60" class="anatomy-trigger-area" d="M 515 516 C 515 510, 600 505, 660 510 L 660 700 C 660 735, 590 758, 530 760 Z" />
        <path data-muscle="pantorrillas" data-pin-x="38" data-pin-y="80" class="anatomy-trigger-area" d="M 335 765 C 380 762, 430 765, 430 772 L 415 920 C 380 925, 335 910, 335 890 Z" />
        <path data-muscle="pantorrillas" data-pin-x="62" data-pin-y="80" class="anatomy-trigger-area" d="M 570 772 C 570 765, 620 762, 665 765 L 665 890 C 665 910, 620 925, 585 920 Z" />
      `,
      // Frame 1: Front-Right 3/4
      1: `
        <path data-muscle="cuello" data-pin-x="48" data-pin-y="14" class="anatomy-trigger-area" d="M 420 95 C 450 90, 530 90, 555 100 L 540 170 L 430 165 Z" />
        <path data-muscle="pecho" data-pin-x="45" data-pin-y="24" class="anatomy-trigger-area" d="M 330 180 C 380 175, 520 180, 560 185 L 555 290 C 460 288, 345 275, 325 240 Z" />
        <path data-muscle="hombros" data-pin-x="30" data-pin-y="20" class="anatomy-trigger-area" d="M 250 178 C 290 175, 335 178, 335 183 L 340 250 C 305 262, 260 255, 245 218 Z" />
        <path data-muscle="hombros" data-pin-x="68" data-pin-y="20" class="anatomy-trigger-area" d="M 560 185 C 590 180, 640 178, 670 183 L 680 230 C 665 260, 620 268, 575 255 Z" />
        <path data-muscle="biceps" data-pin-x="25" data-pin-y="33" class="anatomy-trigger-area" d="M 210 262 C 245 258, 280 262, 280 268 L 270 395 C 248 400, 215 392, 200 375 Z" />
        <path data-muscle="antebrazos" data-pin-x="37" data-pin-y="42" class="anatomy-trigger-area" d="M 365 355 C 385 355, 397 370, 397 390 L 375 495 C 360 498, 350 485, 350 465 L 365 355 Z" />
        <path data-muscle="antebrazos" data-pin-x="60" data-pin-y="42" class="anatomy-trigger-area" d="M 605 370 C 625 370, 637 385, 635 405 L 610 485 C 595 488, 580 475, 580 455 L 605 370 Z" />
        <path data-muscle="triceps" data-pin-x="72" data-pin-y="31" class="anatomy-trigger-area" d="M 670 265 C 700 260, 730 265, 730 270 L 720 390 C 705 395, 675 388, 665 370 Z" />
        <path data-muscle="abdominales" data-pin-x="48" data-pin-y="38" class="anatomy-trigger-area" d="M 370 295 L 560 295 L 545 500 L 385 500 Z" />
        <path data-muscle="quadriceps" data-pin-x="40" data-pin-y="60" class="anatomy-trigger-area" d="M 320 505 C 400 500, 530 505, 555 510 L 540 755 C 440 752, 320 730, 320 695 Z" />
        <path data-muscle="pantorrillas" data-pin-x="42" data-pin-y="80" class="anatomy-trigger-area" d="M 310 760 C 370 755, 530 760, 545 766 L 530 920 C 440 925, 310 905, 310 885 Z" />
      `,
      // Frame 2: Right Side
      2: `
        <path data-muscle="cuello" data-pin-x="48" data-pin-y="12" class="anatomy-trigger-area" d="M 430 80 C 460 75, 520 80, 540 95 L 530 160 L 440 155 Z" />
        <path data-muscle="hombros" data-pin-x="45" data-pin-y="20" class="anatomy-trigger-area" d="M 370 165 C 420 160, 480 165, 480 172 L 472 245 C 435 258, 380 250, 365 215 Z" />
        <path data-muscle="espalda" data-pin-x="58" data-pin-y="28" class="anatomy-trigger-area" d="M 490 172 C 530 168, 570 172, 570 178 L 565 420 C 535 415, 500 395, 488 355 Z" />
        <path data-muscle="pecho" data-pin-x="40" data-pin-y="24" class="anatomy-trigger-area" d="M 370 178 C 410 175, 480 178, 480 185 L 475 290 C 440 288, 380 278, 368 248 Z" />
        <path data-muscle="triceps" data-pin-x="38" data-pin-y="31" class="anatomy-trigger-area" d="M 330 252 C 365 248, 400 252, 400 258 L 392 385 C 370 390, 335 382, 325 365 Z" />
        <path data-muscle="antebrazos" data-pin-x="50" data-pin-y="42" class="anatomy-trigger-area" d="M 495 350 C 520 350, 532 370, 530 395 L 505 495 C 485 498, 470 480, 470 450 L 495 350 Z" />
        <path data-muscle="abdominales" data-pin-x="46" data-pin-y="38" class="anatomy-trigger-area" d="M 410 295 L 490 295 L 485 460 L 415 460 Z" />
        <path data-muscle="gluteos" data-pin-x="55" data-pin-y="51" class="anatomy-trigger-area" d="M 495 430 C 540 428, 580 435, 580 465 C 575 510, 545 525, 510 518 C 500 498, 493 468, 495 430 Z" />
        <path data-muscle="quadriceps" data-pin-x="43" data-pin-y="60" class="anatomy-trigger-area" d="M 380 475 C 430 470, 495 475, 495 482 L 485 725 C 435 722, 380 705, 380 675 Z" />
        <path data-muscle="femorales" data-pin-x="58" data-pin-y="62" class="anatomy-trigger-area" d="M 500 482 C 545 478, 585 482, 585 488 L 578 725 C 540 722, 500 705, 500 675 Z" />
        <path data-muscle="pantorrillas" data-pin-x="50" data-pin-y="80" class="anatomy-trigger-area" d="M 380 730 C 430 725, 580 730, 580 738 L 565 910 C 490 915, 380 898, 380 878 Z" />
      `,
      // Frame 3: Back-Right 3/4
      3: `
        <path data-muscle="cuello" data-pin-x="48" data-pin-y="12" class="anatomy-trigger-area" d="M 400 80 C 440 75, 530 80, 560 95 L 545 165 L 415 158 Z" />
        <path data-muscle="espalda" data-pin-x="52" data-pin-y="28" class="anatomy-trigger-area" d="M 350 170 L 620 175 C 600 310, 590 395, 575 430 C 540 385, 510 305, 505 225 C 500 305, 470 385, 435 430 C 420 395, 380 310, 350 170 Z" />
        <path data-muscle="hombros" data-pin-x="32" data-pin-y="20" class="anatomy-trigger-area" d="M 265 175 C 305 170, 350 175, 350 180 L 355 248 C 320 260, 278 252, 260 218 Z" />
        <path data-muscle="hombros" data-pin-x="70" data-pin-y="20" class="anatomy-trigger-area" d="M 620 180 C 620 175, 665 170, 705 175 L 710 218 C 692 252, 650 260, 615 248 Z" />
        <path data-muscle="triceps" data-pin-x="28" data-pin-y="31" class="anatomy-trigger-area" d="M 220 255 C 255 250, 290 255, 290 260 L 282 385 C 260 390, 225 382, 215 365 Z" />
        <path data-muscle="triceps" data-pin-x="74" data-pin-y="31" class="anatomy-trigger-area" d="M 680 260 C 680 255, 715 250, 750 255 L 755 365 C 745 382, 710 390, 688 385 Z" />
        <path data-muscle="antebrazos" data-pin-x="37" data-pin-y="43" class="anatomy-trigger-area" d="M 370 380 C 388 380, 392 395, 392 415 L 372 495 C 358 495, 348 480, 348 455 L 370 380 Z" />
        <path data-muscle="antebrazos" data-pin-x="62" data-pin-y="43" class="anatomy-trigger-area" d="M 620 355 C 650 355, 664 375, 662 400 L 630 495 C 610 498, 589 480, 589 450 L 620 355 Z" />
        <path data-muscle="gluteos" data-pin-x="50" data-pin-y="51" class="anatomy-trigger-area" d="M 370 435 C 450 430, 600 435, 620 460 C 615 520, 545 540, 435 535 C 385 520, 368 490, 370 435 Z" />
        <path data-muscle="femorales" data-pin-x="42" data-pin-y="64" class="anatomy-trigger-area" d="M 340 545 C 410 540, 490 545, 490 552 L 478 755 C 420 752, 340 730, 340 695 Z" />
        <path data-muscle="femorales" data-pin-x="60" data-pin-y="64" class="anatomy-trigger-area" d="M 500 552 C 500 545, 580 540, 650 545 L 650 695 C 650 730, 570 752, 512 755 Z" />
        <path data-muscle="pantorrillas" data-pin-x="42" data-pin-y="82" class="anatomy-trigger-area" d="M 330 760 C 390 755, 480 760, 480 768 L 465 920 C 410 925, 330 908, 330 888 Z" />
        <path data-muscle="pantorrillas" data-pin-x="60" data-pin-y="82" class="anatomy-trigger-area" d="M 510 768 C 510 760, 600 755, 660 760 L 660 888 C 660 908, 580 925, 525 920 Z" />
      `,
      // Frame 4: Back
      4: `
        <path data-muscle="cuello" data-pin-x="50" data-pin-y="12" class="anatomy-trigger-area" d="M 430 80 C 460 75, 540 75, 570 80 L 555 155 L 445 155 Z" />
        <path data-muscle="espalda" data-pin-x="50" data-pin-y="28" class="anatomy-trigger-area" d="M 320 160 L 680 160 C 660 300, 650 390, 635 425 C 600 380, 570 295, 565 210 C 555 295, 525 380, 490 425 C 475 390, 440 300, 320 160 Z" />
        <path data-muscle="hombros" data-pin-x="28" data-pin-y="20" class="anatomy-trigger-area" d="M 220 165 C 260 160, 320 165, 320 172 L 328 245 C 295 258, 240 250, 215 215 Z" />
        <path data-muscle="hombros" data-pin-x="72" data-pin-y="20" class="anatomy-trigger-area" d="M 680 172 C 680 165, 740 160, 780 165 L 785 215 C 760 250, 705 258, 672 245 Z" />
        <path data-muscle="triceps" data-pin-x="22" data-pin-y="31" class="anatomy-trigger-area" d="M 175 252 C 215 248, 255 252, 255 258 L 245 385 C 225 390, 185 382, 170 365 Z" />
        <path data-muscle="triceps" data-pin-x="78" data-pin-y="31" class="anatomy-trigger-area" d="M 745 258 C 745 252, 785 248, 825 252 L 830 365 C 815 382, 775 390, 755 385 Z" />
        <path data-muscle="antebrazos" data-pin-x="35" data-pin-y="43" class="anatomy-trigger-area" d="M 345 360 C 365 360, 380 375, 380 395 L 355 495 C 335 495, 312 480, 312 455 L 345 360 Z" />
        <path data-muscle="antebrazos" data-pin-x="65" data-pin-y="43" class="anatomy-trigger-area" d="M 655 360 C 675 360, 686 375, 686 395 L 660 495 C 640 495, 619 480, 619 455 L 655 360 Z" />
        <path data-muscle="gluteos" data-pin-x="40" data-pin-y="51" class="anatomy-trigger-area" d="M 355 430 C 420 425, 498 440, 498 480 C 495 535, 440 548, 415 542 C 390 515, 352 478, 355 430 Z" />
        <path data-muscle="gluteos" data-pin-x="60" data-pin-y="51" class="anatomy-trigger-area" d="M 645 430 C 580 425, 502 440, 502 480 C 505 535, 560 548, 585 542 C 610 515, 648 478, 645 430 Z" />
        <path data-muscle="femorales" data-pin-x="38" data-pin-y="64" class="anatomy-trigger-area" d="M 345 550 C 400 545, 490 550, 490 558 L 478 755 C 420 752, 345 730, 345 695 Z" />
        <path data-muscle="femorales" data-pin-x="62" data-pin-y="64" class="anatomy-trigger-area" d="M 510 558 C 510 550, 600 545, 655 550 L 655 695 C 655 730, 580 752, 522 755 Z" />
        <path data-muscle="pantorrillas" data-pin-x="38" data-pin-y="82" class="anatomy-trigger-area" d="M 335 760 C 385 755, 475 760, 475 768 L 460 920 C 405 925, 335 908, 335 888 Z" />
        <path data-muscle="pantorrillas" data-pin-x="62" data-pin-y="82" class="anatomy-trigger-area" d="M 525 768 C 525 760, 615 755, 665 760 L 665 888 C 665 908, 595 925, 540 920 Z" />
      `,
    };
    svgAreas[5] = svgAreas[3];
    svgAreas[6] = svgAreas[2];
    svgAreas[7] = svgAreas[1];

    let currentPaths = svgAreas[this.currentFrame] || svgAreas[0];
    currentPaths += `
      <g id="muscle-target-pin" style="display: none; pointer-events: none;">
        <circle cx="0" cy="0" r="8" fill="none" stroke="#ffffff" stroke-width="2">
          <animate attributeName="r" values="8;24" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="stroke-width" values="2.5;0.5" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="0" cy="0" r="6" fill="#ffffff" stroke="var(--primary-red)" stroke-width="2.5" />
      </g>
    `;
    return currentPaths;
  }

  setupDragRotation() {
    const stage = this.container.querySelector('.image-stage-exact');
    if (!stage) return;

    const sensitivity = 60; // pixels por frame

    const onDragStart = (e) => {
      this.isDragging = true;
      this.dragStartX = e.clientX || e.touches[0].clientX;
      this.dragAccumulated = 0;
      stage.style.cursor = 'grabbing';
      this.stopAutoSpin();
      this.showAngleIndicator();
    };

    const onDragMove = (e) => {
      if (!this.isDragging) return;
      e.preventDefault();
      const clientX = e.clientX || e.touches[0].clientX;
      const delta = clientX - this.dragStartX;
      this.dragAccumulated = delta;

      const frameShift = Math.round(delta / sensitivity);
      if (frameShift !== 0) {
        const newFrame = ((this.currentFrame + frameShift) % this.totalFrames + this.totalFrames) % this.totalFrames;
        if (newFrame !== this.currentFrame) {
          this.setFrame(newFrame);
          this.dragStartX = clientX;
        }
      }
    };

    const onDragEnd = () => {
      this.isDragging = false;
      stage.style.cursor = 'grab';
      this.hideAngleIndicator();
    };

    // Mouse Events
    stage.addEventListener('mousedown', onDragStart);
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);

    // Touch Events
    stage.addEventListener('touchstart', onDragStart, { passive: false });
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('touchend', onDragEnd);
  }

  setupMuscleInteraction() {
    const areas = this.container.querySelectorAll('.anatomy-trigger-area');
    areas.forEach(area => {
      area.style.fill = 'transparent';
      area.style.cursor = 'pointer';
      area.style.transition = 'fill 0.2s ease';

      area.addEventListener('mouseenter', (e) => {
        const id = e.currentTarget.dataset.muscle;
        this.hoveredMuscleId = id;
        e.currentTarget.style.fill = 'rgba(255, 26, 64, 0.2)';
        this.updateTooltip(e, id);
      });

      area.addEventListener('mousemove', (e) => {
        this.updateTooltip(e, this.hoveredMuscleId);
      });

      area.addEventListener('mouseleave', (e) => {
        this.hoveredMuscleId = null;
        e.currentTarget.style.fill = 'transparent';
        this.updateTooltip(e, null);
      });

      area.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.muscle;
        const pinX = e.currentTarget.dataset.pinX;
        const pinY = e.currentTarget.dataset.pinY;
        
        if (this.soundEffects) this.soundEffects.playSelect();
        this.selectMuscle(id, true, pinX, pinY);
      });
    });
  }

  setFrame(frameIndex) {
    this.currentFrame = frameIndex;
    const frame = ROTATION_FRAMES[frameIndex];
    
    const img = document.getElementById('anatomical-base-img');
    if (img) {
      img.style.opacity = '0.7';
      img.src = frame.src + '?v=15';
      img.style.transform = frame.mirror ? 'scaleX(-1)' : 'none';
      requestAnimationFrame(() => {
        img.style.opacity = '1';
      });
    }

    // Atualizar SVG overlay
    const svg = document.getElementById('muscle-overlay-svg');
    if (svg) {
      svg.innerHTML = this.generateSVGPaths();
      svg.style.transform = frame.mirror ? 'scaleX(-1)' : 'none';
      this.setupMuscleInteraction();
    }

    // Atualizar indicador de ângulo
    const label = document.getElementById('rotation-label');
    const degrees = document.getElementById('rotation-degrees');
    if (label) label.textContent = frame.label;
    if (degrees) degrees.textContent = `${frameIndex * 45}°`;

    // Atualizar barra de progresso circular
    const circle = document.getElementById('progress-circle');
    if (circle) {
      const offset = 94.2 - (frameIndex / this.totalFrames) * 94.2;
      circle.setAttribute('stroke-dashoffset', offset);
    }

    // Esconder pin ao mudar de quadro
    const pin = document.getElementById('muscle-target-pin');
    if (pin) pin.style.display = 'none';
  }

  showAngleIndicator() {
    const indicator = document.getElementById('rotation-angle-indicator');
    if (indicator) indicator.style.opacity = '1';
  }

  hideAngleIndicator() {
    setTimeout(() => {
      const indicator = document.getElementById('rotation-angle-indicator');
      if (indicator && !this.isDragging && !this.isAutoSpinning) {
        indicator.style.opacity = '0';
      }
    }, 1500);
  }

  showDragInstruction() {
    const instruction = document.getElementById('drag-instruction');
    if (instruction) {
      setTimeout(() => { instruction.style.opacity = '1'; }, 500);
      setTimeout(() => { instruction.style.opacity = '0'; }, 3500);
    }
  }

  updateTooltip(e, muscleId) {
    if (!this.tooltipEl) return;

    if (!muscleId) {
      this.tooltipEl.style.opacity = '0';
      this.tooltipEl.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (this.tooltipEl.style.opacity === '0') {
          this.tooltipEl.style.display = 'none';
        }
      }, 150);
      return;
    }

    const data = MUSCLE_DATABASE[muscleId];
    if (data) {
      this.tooltipEl.querySelector('.tooltip-title').innerText = data.name;
      this.tooltipEl.querySelector('.tooltip-sub').innerText = `${data.exercises.length} Exercícios Cadastrados`;
      
      this.tooltipEl.style.display = 'block';
      this.tooltipEl.offsetHeight;
      this.tooltipEl.style.opacity = '1';
      this.tooltipEl.style.transform = 'scale(1)';

      const tooltipRect = this.tooltipEl.getBoundingClientRect();
      const margin = 16;
      let left = e.clientX + margin;
      let top = e.clientY + margin;

      if (left + tooltipRect.width > window.innerWidth - margin) {
        left = e.clientX - tooltipRect.width - margin;
      }
      
      if (top + tooltipRect.height > window.innerHeight - margin) {
        top = e.clientY - tooltipRect.height - margin;
      }

      this.tooltipEl.style.left = `${left}px`;
      this.tooltipEl.style.top = `${top}px`;
    }
  }

  selectMuscle(muscleId, triggerCallback = true, pinX = null, pinY = null) {
    this.selectedMuscleId = muscleId;

    if (!pinX || !pinY) {
      if (this.container) {
        const area = this.container.querySelector(`.anatomy-trigger-area[data-muscle="${muscleId}"]`);
        if (area && area.dataset) {
          pinX = area.dataset.pinX;
          pinY = area.dataset.pinY;
        }
      }
    }

    const pin = document.getElementById('muscle-target-pin');
    if (pin && pinX && pinY) {
      const x = parseFloat(pinX) * 10;
      const y = parseFloat(pinY) * 10;
      pin.setAttribute('transform', `translate(${x}, ${y})`);
      pin.style.display = 'block';
    }

    if (triggerCallback && this.onSelectCallback) {
      this.onSelectCallback(muscleId);
    }
  }

  rotateToFront() {
    this.setFrame(0);
    this.selectMuscle('pecho', true, 38, 24);
  }

  rotateToBack() {
    this.setFrame(4);
    this.selectMuscle('espalda', true, 50, 28);
  }

  toggleAutoSpin() {
    if (this.isAutoSpinning) {
      this.stopAutoSpin();
      return false;
    }
    this.isAutoSpinning = true;
    this.showAngleIndicator();
    this.autoSpinInterval = setInterval(() => {
      const next = (this.currentFrame + 1) % this.totalFrames;
      this.setFrame(next);
    }, 600);
    return true;
  }

  stopAutoSpin() {
    this.isAutoSpinning = false;
    if (this.autoSpinInterval) {
      clearInterval(this.autoSpinInterval);
      this.autoSpinInterval = null;
    }
  }
}