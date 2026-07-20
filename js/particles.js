/* ========================================
   PARTICLES.JS — Galaxy background
   ----------------------------------------
   Fixes vs. previous version:
   - rAF loop now pauses on document.hidden (tab switch / phone
     lock) instead of running forever in the background.
   - devicePixelRatio is capped at 2 and used to size the canvas
     backing store, so the background is crisp on high-DPI
     Android screens instead of blurry, without drawing 3-4x the
     pixels of an uncapped DPR.
   - Star/aurora counts scale down on narrow viewports and are
     skipped entirely under prefers-reduced-motion.
   ======================================== */

class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.particles = [];
        this.stars = [];
        this.meteors = [];
        this.auroraWaves = [];
        this.running = false;
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);

        if (!this.canvas) return;

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.running = false;
            } else if (!this.running) {
                this.running = true;
                requestAnimationFrame(() => this.animate());
            }
        });

        this.init();
    }

    resizeCanvas() {
        const { innerWidth: w, innerHeight: h } = window;
        this.canvas.width = w * this.dpr;
        this.canvas.height = h * this.dpr;
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        this.cssWidth = w;
        this.cssHeight = h;
    }

    init() {
        this.createStars();
        this.createAuroraWaves();
        this.running = true;
        this.animate();
    }

    starCount() {
        // Fewer stars on small/low-power screens; none of the continuous
        // twinkle work if the user asked for reduced motion.
        if (this.reducedMotion) return 60;
        return this.cssWidth < 480 ? 110 : 200;
    }

    createStars() {
        const count = this.starCount();
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * this.cssWidth,
                y: Math.random() * this.cssHeight,
                radius: Math.random() * 1.5,
                opacity: Math.random() * 0.7 + 0.3,
                twinkleSpeed: this.reducedMotion ? 0 : Math.random() * 0.03 + 0.01,
                twinklePhase: Math.random() * Math.PI * 2,
                color: ['#ffffff', '#fbbf24', '#a78bfa', '#60a5fa'][Math.floor(Math.random() * 4)]
            });
        }
    }

    createAuroraWaves() {
        if (this.reducedMotion) return;
        const colors = [
            'rgba(139, 92, 246, 0.3)', 'rgba(59, 130, 246, 0.3)',
            'rgba(6, 182, 212, 0.3)', 'rgba(251, 191, 36, 0.2)'
        ];
        const waveCount = this.cssWidth < 480 ? 2 : 4;
        for (let i = 0; i < waveCount; i++) {
            this.auroraWaves.push({
                x: -this.cssWidth,
                y: Math.random() * this.cssHeight * 0.3,
                width: this.cssWidth * 2,
                height: 100 + Math.random() * 100,
                speed: 0.2 + Math.random() * 0.3,
                color: colors[i % colors.length]
            });
        }
    }

    addParticle(x, y, vx, vy, life, color, size = 2) {
        this.particles.push({ x, y, vx, vy, life, maxLife: life, color, size });
    }

    addMeteor(x, y) {
        const angle = Math.random() * Math.PI * 0.5 + Math.PI * 0.25;
        const speed = 3 + Math.random() * 3;
        this.meteors.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 120, maxLife: 120, trail: [] });
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life--;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    updateMeteors() {
        for (let i = this.meteors.length - 1; i >= 0; i--) {
            const m = this.meteors[i];
            m.x += m.vx; m.y += m.vy; m.life--;
            m.trail.push({ x: m.x, y: m.y });
            if (m.trail.length > 20) m.trail.shift();
            if (m.life <= 0) this.meteors.splice(i, 1);
        }
    }

    updateStars() {
        if (this.reducedMotion) return;
        this.stars.forEach(star => {
            star.twinklePhase += star.twinkleSpeed;
            star.opacity = Math.sin(star.twinklePhase) * 0.3 + 0.4;
        });
    }

    updateAurora() {
        this.auroraWaves.forEach(wave => {
            wave.x += wave.speed;
            if (wave.x > this.cssWidth) {
                wave.x = -wave.width;
                wave.y = Math.random() * this.cssHeight * 0.3;
            }
        });
    }

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

    drawParticles() {
        this.particles.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.life / p.maxLife;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
    }

    drawMeteors() {
        this.meteors.forEach(m => {
            const alpha = m.life / m.maxLife;
            for (let i = 0; i < m.trail.length; i++) {
                const point = m.trail[i];
                this.ctx.globalAlpha = (i / m.trail.length) * alpha;
                this.ctx.fillStyle = '#fbbf24';
                this.ctx.fillRect(point.x, point.y, 2, 2);
            }
            this.ctx.fillStyle = '#ffff00';
            this.ctx.globalAlpha = alpha;
            this.ctx.beginPath();
            this.ctx.arc(m.x, m.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
    }

    drawAurora() {
        this.auroraWaves.forEach(wave => {
            this.ctx.fillStyle = wave.color;
            this.ctx.beginPath();
            this.ctx.moveTo(wave.x, wave.y);
            for (let i = 0; i < wave.width; i += 24) {
                const waveY = wave.y + Math.sin((i + wave.x) * 0.01) * 20;
                this.ctx.lineTo(wave.x + i, waveY);
            }
            this.ctx.lineTo(wave.x + wave.width, wave.y + wave.height);
            this.ctx.lineTo(wave.x, wave.y + wave.height);
            this.ctx.closePath();
            this.ctx.fill();
        });
    }

    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.cssHeight);
        gradient.addColorStop(0, '#0f0f23');
        gradient.addColorStop(0.5, '#1a1a3f');
        gradient.addColorStop(1, '#0f0f23');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);
    }

    animate() {
        if (!this.running) return;
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

/* Small effect used by the star-hunt / secret unlock to sprinkle a
   few extra particles from the galaxy canvas at a given point. */
class SparkleEffect {
    static create(x, y, count = 10, color = '#a78bfa') {
        if (!window.galaxyParticles) return;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const velocity = 2 + Math.random() * 2;
            window.galaxyParticles.addParticle(
                x, y, Math.cos(angle) * velocity, Math.sin(angle) * velocity,
                60 + Math.random() * 40, color, 1 + Math.random() * 1.5
            );
        }
    }
}

class MeteorRainEffect {
    static start(duration = 8000) {
        if (!window.galaxyParticles) return null;
        const interval = setInterval(() => {
            window.galaxyParticles.addMeteor(Math.random() * window.innerWidth, -50);
        }, 120);
        setTimeout(() => clearInterval(interval), duration);
        return interval;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.galaxyParticles = new ParticleSystem('galaxy-canvas');

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reducedMotion) {
        setInterval(() => {
            if (Math.random() > 0.7 && window.galaxyParticles && !document.hidden) {
                SparkleEffect.create(Math.random() * window.innerWidth, Math.random() * window.innerHeight, 3);
            }
        }, 1000);
    }
});
