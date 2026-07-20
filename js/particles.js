/* ========================================
   PARTICLES.JS - Particle System
   Galaxy background and particle effects
   ======================================== */

// ===== PARTICLE SYSTEM =====
class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.particles = [];
        this.stars = [];
        this.meteors = [];
        this.auroraWaves = [];
        
        if (this.canvas) {
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
            this.init();
        }
    }

    resizeCanvas() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        this.createStars();
        this.createAuroraWaves();
        this.animate();
    }

    // ===== CREATE STARS =====
    createStars() {
        for (let i = 0; i < 200; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 1.5,
                opacity: Math.random() * 0.7 + 0.3,
                twinkleSpeed: Math.random() * 0.03 + 0.01,
                twinklePhase: Math.random() * Math.PI * 2,
                color: ['#ffffff', '#fbbf24', '#a78bfa', '#60a5fa'][Math.floor(Math.random() * 4)]
            });
        }
    }

    // ===== CREATE AURORA WAVES =====
    createAuroraWaves() {
        const colors = [
            'rgba(139, 92, 246, 0.3)',
            'rgba(59, 130, 246, 0.3)',
            'rgba(6, 182, 212, 0.3)',
            'rgba(251, 191, 36, 0.2)'
        ];

        for (let i = 0; i < 4; i++) {
            this.auroraWaves.push({
                x: -this.canvas.width,
                y: Math.random() * this.canvas.height * 0.3,
                width: this.canvas.width * 2,
                height: 100 + Math.random() * 100,
                speed: 0.2 + Math.random() * 0.3,
                color: colors[i % colors.length],
                offset: i * this.canvas.width * 0.5
            });
        }
    }

    // ===== ADD PARTICLE =====
    addParticle(x, y, vx, vy, life, color, size = 2) {
        this.particles.push({
            x, y, vx, vy,
            life, maxLife: life,
            color, size,
            decay: 1 - (1 / life)
        });
    }

    // ===== ADD METEOR =====
    addMeteor(x, y) {
        const angle = Math.random() * Math.PI * 0.5 + Math.PI * 0.25;
        const speed = 3 + Math.random() * 3;
        
        this.meteors.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 120,
            maxLife: 120,
            trail: []
        });
    }

    // ===== UPDATE PARTICLES =====
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            p.vy += 0.1; // gravity
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    // ===== UPDATE METEORS =====
    updateMeteors() {
        for (let i = this.meteors.length - 1; i >= 0; i--) {
            const m = this.meteors[i];
            
            m.x += m.vx;
            m.y += m.vy;
            m.life--;
            
            m.trail.push({ x: m.x, y: m.y });
            if (m.trail.length > 20) m.trail.shift();
            
            if (m.life <= 0) {
                this.meteors.splice(i, 1);
            }
        }
    }

    // ===== UPDATE STARS =====
    updateStars() {
        this.stars.forEach(star => {
            star.twinklePhase += star.twinkleSpeed;
            star.opacity = Math.sin(star.twinklePhase) * 0.3 + 0.4;
        });
    }

    // ===== UPDATE AURORA =====
    updateAurora() {
        this.auroraWaves.forEach(wave => {
            wave.x += wave.speed;
            if (wave.x > this.canvas.width) {
                wave.x = -wave.width;
                wave.y = Math.random() * this.canvas.height * 0.3;
            }
        });
    }

    // ===== DRAW STARS =====
    drawStars() {
        this.stars.forEach(star => {
            this.ctx.fillStyle = star.color;
            this.ctx.globalAlpha = star.opacity;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
    }

    // ===== DRAW PARTICLES =====
    drawParticles() {
        this.particles.forEach(p => {
            const alpha = (p.life / p.maxLife);
            
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = alpha;
            this.ctx.shadowColor = p.color;
            this.ctx.shadowBlur = 10;
            
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = 0;
    }

    // ===== DRAW METEORS =====
    drawMeteors() {
        this.meteors.forEach(m => {
            const alpha = (m.life / m.maxLife);
            
            // Draw trail
            for (let i = 0; i < m.trail.length; i++) {
                const point = m.trail[i];
                const opacity = (i / m.trail.length) * alpha;
                
                this.ctx.fillStyle = `rgba(251, 191, 36, ${opacity})`;
                this.ctx.globalAlpha = opacity;
                this.ctx.fillRect(point.x, point.y, 2, 2);
            }
            
            // Draw meteor head
            this.ctx.fillStyle = '#ffff00';
            this.ctx.globalAlpha = alpha;
            this.ctx.beginPath();
            this.ctx.arc(m.x, m.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.globalAlpha = 1;
    }

    // ===== DRAW AURORA =====
    drawAurora() {
        this.auroraWaves.forEach(wave => {
            this.ctx.fillStyle = wave.color;
            
            // Create wavy effect
            this.ctx.beginPath();
            this.ctx.moveTo(wave.x, wave.y);
            
            for (let i = 0; i < wave.width; i += 20) {
                const waveY = wave.y + Math.sin((i + wave.x) * 0.01) * 20;
                this.ctx.lineTo(wave.x + i, waveY);
            }
            
            this.ctx.lineTo(wave.x + wave.width, wave.y + wave.height);
            this.ctx.lineTo(wave.x, wave.y + wave.height);
            this.ctx.closePath();
            this.ctx.fill();
        });
    }

    // ===== DRAW BACKGROUND GRADIENT =====
    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0f0f23');
        gradient.addColorStop(0.5, '#1a1a3f');
        gradient.addColorStop(1, '#0f0f23');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // ===== ANIMATE =====
    animate() {
        this.drawBackground();
        this.drawAurora();
        this.drawStars();
        this.drawParticles();
        this.drawMeteors();
        
        this.updateParticles();
        this.updateMeteors();
        this.updateStars();
        this.updateAurora();
        
        requestAnimationFrame(() => this.animate());
    }
}

// ===== SPARKLE EFFECT =====
class SparkleEffect {
    static create(x, y, count = 10, color = '#a78bfa') {
        const canvas = document.getElementById('galaxy-canvas');
        if (!window.galaxyParticles) return;
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const velocity = 2 + Math.random() * 2;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            window.galaxyParticles.addParticle(
                x, y, vx, vy,
                60 + Math.random() * 40,
                color,
                1 + Math.random() * 1.5
            );
        }
    }
}

// ===== BURST EFFECT =====
class BurstEffect {
    static create(x, y, count = 20) {
        if (!window.galaxyParticles) return;
        
        const colors = [
            'rgba(139, 92, 246, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(6, 182, 212, 0.8)',
            'rgba(251, 191, 36, 0.8)'
        ];
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const velocity = 3 + Math.random() * 4;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            window.galaxyParticles.addParticle(
                x, y, vx, vy,
                80 + Math.random() * 60,
                color,
                2 + Math.random() * 2
            );
        }
    }
}

// ===== RAIN EFFECT =====
class RainEffect {
    static create(count = 50) {
        if (!window.galaxyParticles) return;
        
        for (let i = 0; i < count; i++) {
            const x = Math.random() * window.innerWidth;
            const y = -20;
            const vx = (Math.random() - 0.5) * 2;
            const vy = 2 + Math.random() * 3;
            
            window.galaxyParticles.addParticle(
                x, y, vx, vy,
                100 + Math.random() * 50,
                'rgba(167, 139, 250, 0.6)',
                1
            );
        }
    }
}

// ===== METEOR RAIN EFFECT =====
class MeteorRainEffect {
    static start(duration = 3000) {
        if (!window.galaxyParticles) return;
        
        const interval = setInterval(() => {
            const x = Math.random() * window.innerWidth;
            const y = -50;
            
            window.galaxyParticles.addMeteor(x, y);
        }, 100);
        
        setTimeout(() => clearInterval(interval), duration);
    }
}

// ===== Initialize Galaxy Background =====
document.addEventListener('DOMContentLoaded', () => {
    // Create particle system for galaxy canvas
    window.galaxyParticles = new ParticleSystem('galaxy-canvas');
    
    // Random particle creation for continuous effect
    setInterval(() => {
        if (Math.random() > 0.7 && window.galaxyParticles) {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            SparkleEffect.create(x, y, 3);
        }
    }, 1000);
});
