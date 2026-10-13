import * as THREE from 'three';
import gsap from 'gsap';

export class CharacterController {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);
    
    this.state = 'idle'; // idle, mixing, scratch, transition
    this.time = 0;
    this.scratchTween = null;
    this.mesh = null;
    
    this.createDJSprite();
  }

  createDJSprite() {
    // Optimized 'Perfect' scale for Avatar 3.0
    const djGeometry = new THREE.PlaneGeometry(9, 6);  

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('/dj_avatar_perfect.png', (texture) => {
      // Force sharp filtering to prevent muddy mipmaps, and configure proper color space
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.colorSpace = THREE.SRGBColorSpace;
      
      
      const djAlphaShader = {
        uniforms: {
          tDiffuse: { value: texture },
          uEmissive: { value: 0.0 },
          uBlinkEye: { value: 1.0 } // 1.0 = open, 0.0 = dark closed
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D tDiffuse;
          uniform float uEmissive;
          uniform float uBlinkEye;
          varying vec2 vUv;

          void main() {
            vec4 texel = texture2D(tDiffuse, vUv);
            
            // Full image alpha! No more blurred circular cutout.
            float alpha = 1.0;
            
            // Targeted Emissive Glow (Isolate Bright Reds/Golds for Eyes & Necklace)
            float isGlowy = smoothstep(0.5, 0.9, texel.r) * smoothstep(0.1, 0.5, texel.r - texel.b);
            
            // Separate Eyes (top half) from Necklace (bottom half)
            float isEyeArea = step(0.5, vUv.y);
            float eyeMask = isGlowy * isEyeArea;
            float necklaceMask = isGlowy * (1.0 - isEyeArea);
            
            // When blinking, physically darken the base pixels of the red eyes
            vec3 baseColor = texel.rgb;
            if (eyeMask > 0.1) {
              // Interpolate original red towards black to simulate eyelids closing
              baseColor = mix(vec3(0.0), baseColor, uBlinkEye); 
            }
            
            // Apply glow
            vec3 glowAddition = baseColor * (uEmissive * 2.5 * (eyeMask * uBlinkEye + necklaceMask));
            vec3 finalColor = baseColor + glowAddition + (baseColor * (uEmissive * 0.1));
            
            gl_FragColor = vec4(finalColor, alpha);
            
            #include <colorspace_fragment>
          }
        `
      };

      const djMaterial = new THREE.ShaderMaterial({
        uniforms: djAlphaShader.uniforms,
        vertexShader: djAlphaShader.vertexShader,
        fragmentShader: djAlphaShader.fragmentShader,
        transparent: true,
      });

      this.mesh = new THREE.Mesh(djGeometry, djMaterial);
      // Centered Y to perfectly match the camera height
      this.mesh.position.set(0, 1.8, 0); 
      this.group.add(this.mesh);
    });
  }

  getIntersectableMeshes() {
    return this.mesh ? [this.mesh] : [];
  }

  triggerScratch() {
    // We removed the vibration animation per request.
    // We still update the state in case other modules depend on it, 
    // but the DJ will no longer visibly shake or wobble when hovered.
    if (this.state === 'scratch' || !this.mesh) return;
    this.state = 'scratch';

    if (this.scratchTween) this.scratchTween.kill();
    
    // Just quietly return to mixing state after a short delay
    this.scratchTween = gsap.timeline({
      onComplete: () => {
        this.state = 'mixing'; 
      }
    });

    this.scratchTween.to({}, { duration: 0.5 });
  }

  triggerBlink() {
    if (this.isBlinking || !this.mesh) return;
    this.isBlinking = true;

    // Fast blink: 0.05s close, 0.05s open
    gsap.to(this.mesh.material.uniforms.uBlinkEye, {
      value: 0.0, 
      duration: 0.08, 
      yoyo: true, 
      repeat: 1,
      ease: 'power1.inOut',
      onComplete: () => {
        // Cooldown so he doesn't blink constantly if mouse is resting there
        setTimeout(() => {
          this.isBlinking = false;
        }, 800);
      }
    });
  }

  triggerTransition() {
    this.state = 'transition';
    if (!this.mesh) return;
    
    gsap.to(this.mesh.rotation, {
      z: 0.1, duration: 0.15, yoyo: true, repeat: 3,
      onComplete: () => {
        gsap.to(this.mesh.rotation, { z: 0, duration: 0.2 });
        this.state = 'mixing';
      }
    });
  }

  setMixing(isMixing) {
    this.state = isMixing ? 'mixing' : 'idle';
  }

  update(delta, frequencyData) {
    this.time += delta;
    
    if (!this.mesh) return;
    
    const bass = frequencyData.bass;
    
    const beatScale = 1.0 + (bass * 0.1);
    this.mesh.scale.set(beatScale, beatScale, 1);
    
    // Emissive Shader Glow pulses to beat safely via Uniform
    this.mesh.material.uniforms.uEmissive.value = bass * 1.5;

    // Movement animation
    if (this.state === 'idle') {
      this.mesh.position.y = 2 + Math.sin(this.time * 2.5) * 0.03;
    } else if (this.state === 'mixing' || this.state === 'transition' || this.state === 'scratch') {
      const groove = Math.abs(Math.sin(this.time * 8)) * 0.05; 
      const kickBounce = bass * 0.4;
      this.mesh.position.y = 2 + groove + kickBounce;
      
      this.mesh.rotation.z = Math.sin(this.time * 4) * 0.02 * (1.0 + bass);
    }
  }
}
