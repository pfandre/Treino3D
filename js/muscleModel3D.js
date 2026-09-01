/**
 * MuscleModel3D - Modelo Anatômico Humanoide 3D com Rotação 360° Realista
 * Reproduz fielmente a anatomia e esquema de cores vibrantes do mapa de treinamento.
 */

import { MUSCLE_DATABASE } from './database.js';

export class MuscleModel3D {
  constructor(containerId, onSelectCallback) {
    this.container = document.getElementById(containerId);
    this.onSelectCallback = onSelectCallback;
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    
    this.muscleMeshes = {};
    this.selectedMuscleId = null;
    this.hoveredMuscleId = null;
    
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    this.autoRotate = true;
    
    // Mapeamento de Cores Fiéis à Anatomia do Usuário
    this.COLOR_MAP = {
      cuello: 0xcc0000,       // Vermelho Escuro
      pecho: 0xff4500,        // Vermelho-Laranja
      hombros: 0xe52b2b,      // Vermelho
      biceps: 0xffcc00,       // Amarelo
      triceps: 0xffcc00,      // Amarelo
      antebrazos: 0x28a745,   // Verde
      abdominales: 0xff7700,  // Laranja Vívido (6-Pack) & Teal
      espalda: 0xff4500,      // Vermelho-Laranja (Dorsal & Trapézio)
      gluteos: 0x006666,      // Verde Petróleo / Azul Escuro
      quadriceps: 0x6f42c1,   // Roxo / Violeta
      femorales: 0x5a2a82,    // Roxo Escuro
      pantorrillas: 0x8a2be2  // Magenta / Roxo Vívido
    };

    this.init();
  }

  init() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // 1. Scene com fundo transparente que herda exatamente a cor da página
    this.scene = new THREE.Scene();
    this.scene.background = null;

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    this.camera.position.set(0, 0.95, 3.2);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // 4. OrbitControls (Giro 360°)
    if (window.THREE.OrbitControls) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI - 0.1;
      this.controls.minDistance = 1.3;
      this.controls.maxDistance = 5.2;
      this.controls.target.set(0, 0.85, 0);
      this.controls.autoRotate = this.autoRotate;
      this.controls.autoRotateSpeed = 1.4;
    }

    // 5. Iluminação de Foco (Spotlight centralizado no boneco)
    this.setupSpotlightFocus();

    // 6. Construir Manequim Anatômico 3D Fiel
    this.buildFullColorAnatomicalMannequin();

    // 7. Event Listeners
    window.addEventListener('resize', () => this.onWindowResize());
    this.renderer.domElement.addEventListener('mousemove', (e) => this.onPointerMove(e));
    this.renderer.domElement.addEventListener('click', (e) => this.onPointerClick(e));

    // 8. Loop de Animação
    this.animate();
  }

  setupSpotlightFocus() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambient);

    // Spotlight principal focalizando o boneco no centro
    const spotLight = new THREE.SpotLight(0xffffff, 1.6);
    spotLight.position.set(0, 4, 4);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    spotLight.decay = 2;
    spotLight.distance = 50;
    this.scene.add(spotLight);

    // Rim light para destacar os contornos da pele branca do boneco
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
    rimLight.position.set(0, 3, -4);
    this.scene.add(rimLight);
  }

  buildFullColorAnatomicalMannequin() {
    this.mannequinGroup = new THREE.Group();
    this.scene.add(this.mannequinGroup);

    // Material da Pele Branca Neutra (Fiel ao desenho)
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.3,
      metalness: 0.1
    });

    // --- A. Cabeça & Pescoço ---
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.76, 0);
    const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.125, 24, 24), skinMaterial);
    cranium.scale.set(0.88, 1.1, 0.95);
    headGroup.add(cranium);
    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.11), skinMaterial);
    jaw.position.set(0, -0.07, 0.035);
    headGroup.add(jaw);
    this.mannequinGroup.add(headGroup);

    // Pescoço (Vermelho)
    const neckGeo = new THREE.CylinderGeometry(0.075, 0.095, 0.14, 20);
    this.addMusclePart("cuello", neckGeo, { x: 0, y: 1.58, z: 0 });

    // --- B. Peitoral (Pecho - Laranja/Vermelho) ---
    const pecUpperGeo = new THREE.BoxGeometry(0.19, 0.11, 0.08);
    this.addMusclePart("pecho", pecUpperGeo, { x: 0.105, y: 1.34, z: 0.11 }, { x: 1, y: 1, z: 1 }, { x: 0.1, y: 0.1, z: -0.1 });
    this.addMusclePart("pecho", pecUpperGeo, { x: -0.105, y: 1.34, z: 0.11 }, { x: 1, y: 1, z: 1 }, { x: 0.1, y: -0.1, z: 0.1 });

    const pecLowerGeo = new THREE.BoxGeometry(0.20, 0.13, 0.09);
    this.addMusclePart("pecho", pecLowerGeo, { x: 0.11, y: 1.23, z: 0.11 }, { x: 1, y: 1, z: 1 }, { x: 0, y: 0.08, z: -0.05 });
    this.addMusclePart("pecho", pecLowerGeo, { x: -0.11, y: 1.23, z: 0.11 }, { x: 1, y: 1, z: 1 }, { x: 0, y: -0.08, z: 0.05 });

    // --- C. Ombros (Hombros - Vermelho) ---
    const deltGeo = new THREE.SphereGeometry(0.11, 16, 16);
    this.addMusclePart("hombros", deltGeo, { x: 0.28, y: 1.38, z: 0.05 }, { x: 1.1, y: 1.3, z: 1.1 });
    this.addMusclePart("hombros", deltGeo, { x: 0.31, y: 1.37, z: -0.03 }, { x: 1.0, y: 1.2, z: 1.0 });
    this.addMusclePart("hombros", deltGeo, { x: -0.28, y: 1.38, z: 0.05 }, { x: 1.1, y: 1.3, z: 1.1 });
    this.addMusclePart("hombros", deltGeo, { x: -0.31, y: 1.37, z: -0.03 }, { x: 1.0, y: 1.2, z: 1.0 });

    // --- D. Bíceps (Amarelo) ---
    const bicepsGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.22, 16);
    this.addMusclePart("biceps", bicepsGeo, { x: 0.32, y: 1.14, z: 0.05 }, { x: 1, y: 1, z: 1 }, { x: 0, y: 0, z: -0.12 });
    this.addMusclePart("biceps", bicepsGeo, { x: -0.32, y: 1.14, z: 0.05 }, { x: 1, y: 1, z: 1 }, { x: 0, y: 0, z: 0.12 });

    // --- E. Tríceps (Amarelo) ---
    const tricepsGeo = new THREE.CylinderGeometry(0.07, 0.055, 0.24, 16);
    this.addMusclePart("triceps", tricepsGeo, { x: 0.32, y: 1.14, z: -0.06 }, { x: 1, y: 1, z: 1 }, { x: 0, y: 0, z: -0.1 });
    this.addMusclePart("triceps", tricepsGeo, { x: -0.32, y: 1.14, z: -0.06 }, { x: 1, y: 1, z: 1 }, { x: 0, y: 0, z: 0.1 });

    // --- F. Antebraços (Verde) ---
    const forearmGeo = new THREE.CylinderGeometry(0.06, 0.042, 0.28, 16);
    this.addMusclePart("antebrazos", forearmGeo, { x: 0.36, y: 0.85, z: 0.06 }, { x: 1, y: 1, z: 1 }, { x: 0, y: 0, z: -0.15 });
    this.addMusclePart("antebrazos", forearmGeo, { x: -0.36, y: 0.85, z: 0.06 }, { x: 1, y: 1, z: 1 }, { x: 0, y: 0, z: 0.15 });

    // Mão esquerda e direita (Pele Branca)
    const handGeo = new THREE.BoxGeometry(0.06, 0.12, 0.04);
    const handL = new THREE.Mesh(handGeo, skinMaterial);
    handL.position.set(0.42, 0.65, 0.08);
    const handR = new THREE.Mesh(handGeo, skinMaterial);
    handR.position.set(-0.42, 0.65, 0.08);
    this.mannequinGroup.add(handL);
    this.mannequinGroup.add(handR);

    // --- G. Abdominais & Core (6-Pack Laranja & Oblíquo Verde-Petróleo) ---
    const absPackGeo = new THREE.BoxGeometry(0.09, 0.08, 0.04);
    this.addMusclePart("abdominales", absPackGeo, { x: 0.052, y: 1.09, z: 0.11 });
    this.addMusclePart("abdominales", absPackGeo, { x: -0.052, y: 1.09, z: 0.11 });
    this.addMusclePart("abdominales", absPackGeo, { x: 0.052, y: 0.99, z: 0.11 });
    this.addMusclePart("abdominales", absPackGeo, { x: -0.052, y: 0.99, z: 0.11 });
    this.addMusclePart("abdominales", absPackGeo, { x: 0.052, y: 0.89, z: 0.10 });
    this.addMusclePart("abdominales", absPackGeo, { x: -0.052, y: 0.89, z: 0.10 });

    const obliquesGeo = new THREE.BoxGeometry(0.08, 0.24, 0.07);
    this.addMusclePart("abdominales", obliquesGeo, { x: 0.15, y: 0.99, z: 0.06 }, { x: 1, y: 1, z: 1 }, { x: 0, y: 0.2, z: -0.15 });
    this.addMusclePart("abdominales", obliquesGeo, { x: -0.15, y: 0.99, z: 0.06 }, { x: 1, y: 1, z: 1 }, { x: 0, y: -0.2, z: 0.15 });

    // --- H. Costas (Trapézio & Dorsal Laranja/Vermelho) ---
    const trapSlopeGeo = new THREE.BoxGeometry(0.24, 0.14, 0.12);
    this.addMusclePart("espalda", trapSlopeGeo, { x: 0, y: 1.46, z: -0.04 }, { x: 1, y: 1, z: 1 }, { x: 0.2, y: 0, z: 0 });

    const latsWingGeo = new THREE.BoxGeometry(0.18, 0.32, 0.08);
    this.addMusclePart("espalda", latsWingGeo, { x: 0.15, y: 1.18, z: -0.08 }, { x: 1, y: 1, z: 1 }, { x: 0, y: -0.25, z: 0.15 });
    this.addMusclePart("espalda", latsWingGeo, { x: -0.15, y: 1.18, z: -0.08 }, { x: 1, y: 1, z: 1 }, { x: 0, y: 0.25, z: -0.15 });

    const midBackGeo = new THREE.BoxGeometry(0.16, 0.22, 0.07);
    this.addMusclePart("espalda", midBackGeo, { x: 0, y: 1.20, z: -0.09 });

    // --- I. Glúteos (Verde Petróleo/Azul) ---
    const gluteGeo = new THREE.SphereGeometry(0.155, 20, 20);
    this.addMusclePart("gluteos", gluteGeo, { x: 0.125, y: 0.63, z: -0.11 }, { x: 1.0, y: 0.9, z: 0.95 });
    this.addMusclePart("gluteos", gluteGeo, { x: -0.125, y: 0.63, z: -0.11 }, { x: 1.0, y: 0.9, z: 0.95 });

    // --- J. Quadríceps (Roxo/Violeta) ---
    const vastusLatGeo = new THREE.CylinderGeometry(0.09, 0.065, 0.44, 16);
    this.addMusclePart("quadriceps", vastusLatGeo, { x: 0.17, y: 0.30, z: 0.04 }, { x: 1, y: 1, z: 1 }, { x: 0.08, y: 0, z: -0.08 });
    this.addMusclePart("quadriceps", vastusLatGeo, { x: -0.17, y: 0.30, z: 0.04 }, { x: 1, y: 1, z: 1 }, { x: 0.08, y: 0, z: 0.08 });

    const rectusFemGeo = new THREE.CylinderGeometry(0.07, 0.05, 0.40, 16);
    this.addMusclePart("quadriceps", rectusFemGeo, { x: 0.10, y: 0.31, z: 0.07 }, { x: 1, y: 1, z: 1 }, { x: 0.08, y: 0, z: 0 });
    this.addMusclePart("quadriceps", rectusFemGeo, { x: -0.10, y: 0.31, z: 0.07 }, { x: 1, y: 1, z: 1 }, { x: 0.08, y: 0, z: 0 });

    const vastusMedGeo = new THREE.SphereGeometry(0.07, 16, 16);
    this.addMusclePart("quadriceps", vastusMedGeo, { x: 0.075, y: 0.14, z: 0.07 }, { x: 0.9, y: 1.4, z: 0.9 });
    this.addMusclePart("quadriceps", vastusMedGeo, { x: -0.075, y: 0.14, z: 0.07 }, { x: 0.9, y: 1.4, z: 0.9 });

    // --- K. Isquiotibiais / Femorais (Roxo Escuro) ---
    const hamGeo = new THREE.CylinderGeometry(0.085, 0.06, 0.42, 16);
    this.addMusclePart("femorales", hamGeo, { x: 0.13, y: 0.30, z: -0.06 }, { x: 1, y: 1, z: 1 }, { x: -0.08, y: 0, z: 0 });
    this.addMusclePart("femorales", hamGeo, { x: -0.13, y: 0.30, z: -0.06 }, { x: 1, y: 1, z: 1 }, { x: -0.08, y: 0, z: 0 });

    // --- L. Panturrilhas (Magenta/Roxo Vívido) ---
    const calfGeo = new THREE.SphereGeometry(0.085, 16, 16);
    this.addMusclePart("pantorrillas", calfGeo, { x: 0.15, y: -0.16, z: -0.04 }, { x: 0.9, y: 1.6, z: 0.9 });
    this.addMusclePart("pantorrillas", calfGeo, { x: 0.11, y: -0.16, z: -0.03 }, { x: 0.8, y: 1.5, z: 0.8 });
    this.addMusclePart("pantorrillas", calfGeo, { x: -0.15, y: -0.16, z: -0.04 }, { x: 0.9, y: 1.6, z: 0.9 });
    this.addMusclePart("pantorrillas", calfGeo, { x: -0.11, y: -0.16, z: -0.03 }, { x: 0.8, y: 1.5, z: 0.8 });

    // Pés (Pele Branca)
    const footGeo = new THREE.BoxGeometry(0.09, 0.06, 0.18);
    const footL = new THREE.Mesh(footGeo, skinMaterial);
    footL.position.set(0.14, -0.38, 0.04);
    const footR = new THREE.Mesh(footGeo, skinMaterial);
    footR.position.set(-0.14, -0.38, 0.04);
    this.mannequinGroup.add(footL);
    this.mannequinGroup.add(footR);
  }

  addMusclePart(muscleId, geometry, position, scale = { x: 1, y: 1, z: 1 }, rotation = { x: 0, y: 0, z: 0 }) {
    const colorHex = this.COLOR_MAP[muscleId] || 0xff1a40;

    const material = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.35,
      metalness: 0.2,
      emissive: colorHex,
      emissiveIntensity: 0.15
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x, position.y, position.z);
    mesh.scale.set(scale.x, scale.y, scale.z);
    mesh.rotation.set(rotation.x || 0, rotation.y || 0, rotation.z || 0);

    mesh.userData = { muscleId: muscleId, baseColor: colorHex };

    this.mannequinGroup.add(mesh);

    if (!this.muscleMeshes[muscleId]) {
      this.muscleMeshes[muscleId] = [];
    }
    this.muscleMeshes[muscleId].push(mesh);
  }

  onPointerMove(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.mannequinGroup.children);

    let newHoveredId = null;
    if (intersects.length > 0) {
      const hit = intersects.find(i => i.object.userData && i.object.userData.muscleId);
      if (hit) {
        newHoveredId = hit.object.userData.muscleId;
      }
    }

    if (this.hoveredMuscleId !== newHoveredId) {
      this.hoveredMuscleId = newHoveredId;
      this.updateHighlightState();
      this.container.style.cursor = newHoveredId ? 'pointer' : 'grab';
    }
  }

  onPointerClick(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.mannequinGroup.children);

    if (intersects.length > 0) {
      const hit = intersects.find(i => i.object.userData && i.object.userData.muscleId);
      if (hit) {
        const clickedMuscleId = hit.object.userData.muscleId;
        this.selectMuscle(clickedMuscleId, true);
      }
    }
  }

  selectMuscle(muscleId, triggerCallback = true) {
    this.selectedMuscleId = muscleId;
    this.updateHighlightState();

    if (triggerCallback && this.onSelectCallback) {
      this.onSelectCallback(muscleId);
    }
  }

  updateHighlightState() {
    Object.keys(this.muscleMeshes).forEach(id => {
      const meshes = this.muscleMeshes[id];
      const isSelected = id === this.selectedMuscleId;
      const isHovered = id === this.hoveredMuscleId;

      meshes.forEach(mesh => {
        if (isSelected) {
          mesh.material.emissiveIntensity = 0.95;
          mesh.scale.setScalar(1.08);
        } else if (isHovered) {
          mesh.material.emissiveIntensity = 0.55;
          mesh.scale.setScalar(1.04);
        } else {
          mesh.material.emissiveIntensity = 0.15;
          mesh.scale.setScalar(1.0);
        }
      });
    });
  }

  rotateToFront() {
    this.animateCameraTo(new THREE.Vector3(0, 0.95, 3.2), new THREE.Vector3(0, 0.85, 0));
  }

  rotateToBack() {
    this.animateCameraTo(new THREE.Vector3(0, 0.95, -3.2), new THREE.Vector3(0, 0.85, 0));
  }

  toggleAutoSpin(enable = null) {
    if (enable !== null) {
      this.autoRotate = enable;
    } else {
      this.autoRotate = !this.autoRotate;
    }
    if (this.controls) {
      this.controls.autoRotate = this.autoRotate;
    }
    return this.autoRotate;
  }

  animateCameraTo(targetPos, lookAtPos) {
    if (!this.controls) return;
    this.autoRotate = false;
    this.controls.autoRotate = false;

    const startPos = this.camera.position.clone();
    const duration = 750;
    const startTime = performance.now();

    const animateStep = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      this.camera.position.lerpVectors(startPos, targetPos, ease);
      this.controls.target.lerpVectors(this.controls.target, lookAtPos, ease);
      this.controls.update();

      if (progress < 1) {
        requestAnimationFrame(animateStep);
      }
    };

    requestAnimationFrame(animateStep);
  }

  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (this.controls) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }
}
