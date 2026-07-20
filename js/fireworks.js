/* ========================================
   FIREWORKS.JS — Canvas fireworks
   ----------------------------------------
   Fixes vs. previous version:
   - shadowBlur (expensive on mobile GPUs) is now applied once per
     frame instead of once per particle.
   - devicePixelRatio-aware canvas sizing (crisp on Android, capped
     at 2x so it doesn't push 4x the pixels).
   - Exposes stop()/clear() so callers (cosmic mode) can always
     turn it off — previously nothing ever called stop().
   ======================================== */

class FireworksManager {
    static canvas = null;
    static ctx = null;
    static particles = [];
    static isRunning = false;
    static dpr = Math.min(window.devicePixelRatio || 1, 2);

    static init() {
        this.canvas = document.getElementById('fireworks-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && (this.isRunning || this.particles.length)) this.animate();
        });
        this.start();
    }

    static resizeCanvas() {
        if (!this.canvas) return;
        const w = window.innerWidth, h = window.innerHeight;
        this.canvas.width = w * this.dpr;
        this.canvas.height = h * this.dpr;
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        this.cssWidth = w;
        this.cssHeight = h;
    }

    static start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.animate();
    }

    static stop() {
        this.isRunning = false;
    }

    static clear() {
        this.particles = [];
    }

    static trigger(x, y, count = 50) {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#a29bfe', '#fd79a8', '#fdcb6e'];
        // Hard cap so a burst of easter-egg calls can never runaway the particle count.
        const safeCount = Math.min(count, 100);
        for (let i = 0; i < safeCount; i++) {
            const angle = (Math.PI * 2 * i) / safeCount;
            const velocity = 3 + Math.random() * 6;
            const life = 60 + Math.random() * 60;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                color: colors[Math.floor(Math.random() * colors.length)],
                life, maxLife: life,
                size: 2 + Math.random() * 3
            });
        }
        // Never let a runaway sequence of triggers hold more than ~600
        // live particles at once (cosmic mode fires every 300ms).
        if (this.particles.length > 600) {
            this.particles.splice(0, this.particles.length - 600);
        }
        if (!this.isRunning) this.start();
    }

    static update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx; p.y += p.vy;
            p.vy += 0.15; p.vx *= 0.99; p.life--;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    static draw() {
        this.ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);
        this.ctx.shadowBlur = 12;
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life / p.maxLife;
            this.ctx.fillStyle = p.color;
            this.ctx.shadowColor = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = 0;
    }

    static animate() {
        if (document.hidden) return; // resumes via visibilitychange listener
        this.update();
        this.draw();
        if (this.isRunning || this.particles.length > 0) {
            requestAnimationFrame(() => this.animate());
        }
    }
}

document.addEventListener('DOMContentLoaded', () => FireworksManager.init());
