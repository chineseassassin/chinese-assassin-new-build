import * as THREE from 'three';
import gsap from 'gsap';
import { audioManager } from './audio.js';
import { SceneEnvironment } from './sceneEnvironment.js';
import { CharacterController } from './characterController.js';
import { UIController } from './ui.js';

class MobileApp {
  constructor() {
    this.canvas = document.querySelector('#webgl-canvas');
    if (!this.canvas) return;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    this.initScene();
    this.initModules();
    this.initEvents();
    
    this.clock = new THREE.Clock();
    
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.animate();
  }

  initScene() {
    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 3, 8);
    this.cameraPivot = new THREE.Group();
    this.cameraPivot.add(this.camera);
    this.scene.add(this.cameraPivot);
    
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  initModules() {
    this.env = new SceneEnvironment(this.scene);
    this.character = new CharacterController(this.scene);
    this.ui = new UIController(audioManager, this.character);
  }

  initEvents() {
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
    
    this.scrollDepth = 0;
    this.targetScrollDepth = 0;
    this.targetHoverZoom = 0;
    this.currentHoverZoom = 0;

    const scrollWrapper = document.getElementById('scroll-wrapper');
    const header = document.querySelector('.site-header');
    if (scrollWrapper && header) {
      scrollWrapper.addEventListener('scroll', () => {
        if (scrollWrapper.scrollTop > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      });
    }
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onWheel(event) {
    this.targetScrollDepth += event.deltaY * 0.5;
    this.targetScrollDepth = Math.max(0, Math.min(this.targetScrollDepth, 1000));
  }

  onMouseMove(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    gsap.to(this.cameraPivot.rotation, {
      y: -this.mouse.x * 0.2,
      x: this.mouse.y * 0.1,
      duration: 1
    });

    // Interactive Background for Light Mode
    const appEl = document.getElementById('app');
    if (appEl && document.body.classList.contains('light-mode')) {
      const shiftX = (event.clientX / window.innerWidth - 0.5) * 30;
      const shiftY = (event.clientY / window.innerHeight - 0.5) * 30;
      appEl.style.backgroundPosition = `calc(50% + ${shiftX}px) calc(50% + ${shiftY}px)`;
    }

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.character.getIntersectableMeshes());
    
    if (intersects.length > 0) {
      this.targetHoverZoom = 1.0;
    } else {
      this.targetHoverZoom = 0.0;
    }
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();
    
    this.scrollDepth += (this.targetScrollDepth - this.scrollDepth) * 10 * delta;
    this.currentHoverZoom += (this.targetHoverZoom - this.currentHoverZoom) * 5 * delta;

    const scrollZ = 8 - (this.scrollDepth / 1000) * 5;
    this.camera.position.z = scrollZ - this.currentHoverZoom;
    
    if(this.scene.fog && this.scene.fog.density !== undefined) {
       this.scene.fog.density = 0.03 + (this.scrollDepth / 1000) * 0.05;
    }

    if (audioManager.isPlaying) {
      const frequencyData = audioManager.getFrequencyData();
      this.env.update(frequencyData);
      this.character.update(delta, frequencyData);
    } else {
      this.character.update(delta, { bass: 0, mid: 0, treble: 0 });
      this.env.update({ bass: 0, mid: 0, treble: 0 }); 
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.onload = () => {
  new MobileApp();
};
