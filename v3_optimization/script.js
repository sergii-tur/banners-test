document.addEventListener('DOMContentLoaded', (e) => {
  // const btn = document.getElementById("button");
  const appearText = document.querySelector(".row-txt-and-btn");
  
  // animation start
  setTimeout(() => {
    // btn.classList.remove("hidden");
    appearText.classList.remove("hidden");
  }, 200);

  // ================= CONFIG =================
  const CONFIG = {
      particleCount: 85,

      speed: {
          min: 2,
          max: 4,
          acceleration: 1.03
      },

      particle: {
          size: 2,
          tailLength: 105,
          spawnInnerRadius: 20,
          spawnOuterRadius: 90
      },

      // black hole void in the center
      void: {
          radius: 100,
          blur: 40,
          opacity: 1.0
      },

      color: {
          r: 255,
          g: 30,
          b: 30,
          alpha: 0.9,
          glow: 12
      },

      innerLine: {
          enabled: true,
          sizeRatio: 0.2,
          color: { r: 255, g: 187, b: 196, alpha: .3 }
      },

      fadeAlpha: 0.35
  };

  // ================= CACHED VALUES =================
  const TWO_PI = Math.PI * 2;
  const TAIL_MULTIPLIER = CONFIG.particle.tailLength * 0.08;
  
  let mainStrokeStyle, innerStrokeStyle, shadowColor, voidGradient;
  
  function updateCachedValues() {
    mainStrokeStyle = `rgba(${CONFIG.color.r},${CONFIG.color.g},${CONFIG.color.b},${CONFIG.color.alpha})`;
    innerStrokeStyle = `rgba(${CONFIG.innerLine.color.r},${CONFIG.innerLine.color.g},${CONFIG.innerLine.color.b},${CONFIG.innerLine.color.alpha})`;
    shadowColor = `rgba(${CONFIG.color.r},0,0,1)`;
    
    // Create void gradient once
    const r0 = CONFIG.void.radius;
    const r1 = CONFIG.void.radius + CONFIG.void.blur;
    voidGradient = ctx.createRadialGradient(cx, cy, r0, cx, cy, r1);
    voidGradient.addColorStop(0, `rgba(0,0,0,${CONFIG.void.opacity})`);
    voidGradient.addColorStop(1, `rgba(0,0,0,0)`);
  }

  // ================= CANVAS =================
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  let width, height, cx, cy, dpr;
  let particles = [];
  let fadeStyle;

  function resize() {
      dpr = window.devicePixelRatio || 1;
      width = 336;
      height = 280;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cx = width / 2;
      cy = height / 2;
      
      fadeStyle = `rgba(0,0,0,${CONFIG.fadeAlpha})`;
      updateCachedValues();
  }

  // ================= PARTICLE =================
  class Particle {
      constructor() {
          this.reset();
      }

      reset() {
          this.angle = Math.random() * TWO_PI;

          const radius =
              CONFIG.particle.spawnInnerRadius +
              Math.random() *
              (CONFIG.particle.spawnOuterRadius - CONFIG.particle.spawnInnerRadius);

          const cos = Math.cos(this.angle);
          const sin = Math.sin(this.angle);
          
          this.x = cx + cos * radius;
          this.y = cy + sin * radius;

          const speed =
              CONFIG.speed.min +
              Math.random() * (CONFIG.speed.max - CONFIG.speed.min);

          this.vx = cos * speed;
          this.vy = sin * speed;
      }

      update() {
          const px = this.x;
          const py = this.y;

          this.x += this.vx;
          this.y += this.vy;

          this.vx *= CONFIG.speed.acceleration;
          this.vy *= CONFIG.speed.acceleration;

          const tx = this.x - this.vx * TAIL_MULTIPLIER;
          const ty = this.y - this.vy * TAIL_MULTIPLIER;

          // Outer streak
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(tx, ty);
          ctx.stroke();

          // Inner core line
          if (CONFIG.innerLine.enabled && CONFIG.innerLine.sizeRatio > 0) {
              ctx.lineWidth = CONFIG.particle.size * CONFIG.innerLine.sizeRatio;
              ctx.strokeStyle = innerStrokeStyle;
              ctx.shadowBlur = 0;

              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(tx, ty);
              ctx.stroke();
              
              // Restore main settings
              ctx.lineWidth = CONFIG.particle.size;
              ctx.strokeStyle = mainStrokeStyle;
              ctx.shadowBlur = CONFIG.color.glow;
          }

          if (
              this.x < -120 || this.x > width + 120 ||
              this.y < -120 || this.y > height + 120
          ) {
              this.reset();
          }
      }
  }

  // ================= VOID MASK =================
  function drawVoid() {
      const r1 = CONFIG.void.radius + CONFIG.void.blur;

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = voidGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, r1, 0, TWO_PI);
      ctx.fill();
  }

  // ================= INIT =================
  function initParticles() {
      particles.length = 0;
      for (let i = 0; i < CONFIG.particleCount; i++) {
          particles.push(new Particle());
      }
  }

  // ================= LOOP =================
  function animate() {
      ctx.fillStyle = fadeStyle;
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = "lighter";
      ctx.lineWidth = CONFIG.particle.size;
      ctx.strokeStyle = mainStrokeStyle;
      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = CONFIG.color.glow;

      for (let i = 0; i < particles.length; i++) {
          particles[i].update();
      }

      ctx.shadowBlur = 0;

      drawVoid();

      requestAnimationFrame(animate);
  }

  // ================= START =================
  resize();
  initParticles();
  animate();
  window.addEventListener("resize", resize);
});