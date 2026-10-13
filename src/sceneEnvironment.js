import * as THREE from 'three';

export class SceneEnvironment {
  constructor(scene) {
    this.scene = scene;
    this.lights = [];
    this.setupEnvironment();
  }

  setupEnvironment() {
    // Transparent background to show the CSS image behind
    this.scene.background = null;
    
    // Ambient light - minimal
    const ambient = new THREE.AmbientLight(0xffffff, 0.1);
    this.scene.add(ambient);

    // Central glow (under DJ)
    const centerGlow = new THREE.PointLight(0xff2a2a, 2, 20);
    centerGlow.position.set(0, 0, 0);
    this.scene.add(centerGlow);
    this.lights.push({ light: centerGlow, baseIntensity: 2, reactiveFactor: 5 });

    // Gold accents lights back and high
    const goldLight1 = new THREE.PointLight(0xffbc00, 1.5, 30);
    goldLight1.position.set(-5, 5, -5);
    this.scene.add(goldLight1);
    this.lights.push({ light: goldLight1, baseIntensity: 1.5, reactiveFactor: 3 });

    const goldLight2 = new THREE.PointLight(0xffbc00, 1.5, 30);
    goldLight2.position.set(5, 5, -5);
    this.scene.add(goldLight2);
    this.lights.push({ light: goldLight2, baseIntensity: 1.5, reactiveFactor: 3 });

    // Add some structural background elements (Temple pillars mockups)
    const pillarGeo = new THREE.CylinderGeometry(0.5, 0.5, 10, 8);
    const pillarMat = new THREE.MeshStandardMaterial({ 
      color: 0x111111,
      roughness: 0.8,
      metalness: 0.2
    });

    for (let i = -1; i <= 1; i += 2) {
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(i * 6, 5, -8);
      this.scene.add(pillar);
    }
    
    this.setupParticles();

    // Lasers and floor grid lines removed per user request
    this.lasers = [];
  }

  createLasers() {
    this.lasers = [];
  }

  setupParticles() {
    const particleCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
       // Spread them around the DJ
       positions[i * 3] = (Math.random() - 0.5) * 20;     // x
       positions[i * 3 + 1] = Math.random() * 10;         // y
       positions[i * 3 + 2] = (Math.random() - 0.5) * 10; // z
       
       velocities.push({
          y: 0.01 + Math.random() * 0.02,
          x: (Math.random() - 0.5) * 0.01
       });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Create soft glowing point material
    const material = new THREE.PointsMaterial({
       color: 0xff4400,
       size: 0.1,
       transparent: true,
       opacity: 0.6,
       blending: THREE.AdditiveBlending,
       depthWrite: false
    });

    this.particles = new THREE.Points(geometry, material);
    this.particleVelocities = velocities;
    this.scene.add(this.particles);
  }

  update(frequencyData) {
    const { bass, mid, treble } = frequencyData;
    
    if (this.lights[0]) {
      this.lights[0].light.intensity = this.lights[0].baseIntensity + (bass * this.lights[0].reactiveFactor);
    }
    
    if (this.lights[1] && this.lights[2]) {
      const goldPulse = (mid + treble) * 0.5;
      this.lights[1].light.intensity = this.lights[1].baseIntensity + (goldPulse * this.lights[1].reactiveFactor);
      this.lights[2].light.intensity = this.lights[2].baseIntensity + (goldPulse * this.lights[2].reactiveFactor);
    }
    
    // Animate Embers
    if (this.particles) {
       const positions = this.particles.geometry.attributes.position.array;
       for (let i = 0; i < this.particleVelocities.length; i++) {
          // Add extra velocity on bass hits
          const push = bass * 0.02;
          
          positions[i*3] += this.particleVelocities[i].x;
          positions[i*3+1] += this.particleVelocities[i].y + push;
          
          // Reset if they float too high
          if (positions[i*3+1] > 10) {
             positions[i*3+1] = -1; // respawn at bottom
          }
       }
       this.particles.geometry.attributes.position.needsUpdate = true;
       // Brighter embers on loud parts
       this.particles.material.size = 0.05 + bass * 0.1;
    }

    // Animate Lasers
    const time = Date.now() * 0.001;
    this.lasers.forEach((l) => {
        l.mesh.rotation.y = Math.sin(time * l.speed + l.offset) * 0.5;
        l.mesh.rotation.z = Math.cos(time * l.speed * 0.3 + l.offset) * 0.4;
        l.mesh.material.opacity = 0.1 + treble * 0.9; // Pulse intensely to treble/snares
    });
  }
}
