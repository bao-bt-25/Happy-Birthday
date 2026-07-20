/* ========================================
   FIREWORKS.JS - Fireworks Manager
   Canvas-based fireworks animation
   ======================================== */

// ===== FIREWORKS MANAGER =====
class FireworksManager {
    static canvas = null;
    static ctx = null;
    static particles = [];
    static isRunning = false;

    static init() {
        this.canvas = document.getElementById('fireworks-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.start();
    }

    static resizeCanvas() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    static start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.animate();
    }

    static stop() {
        this.isRunning = false;
    }

    static trigger(x, y, count = 50) {
        const colors = [
            '#ff6b6b', '#4ecdc4', '#45b7d1',
            '#96ceb4', '#ffeaa7', '#dfe6e9',
            '#a29bfe', '#fd79a8', '#fdcb6e'
        ];

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const velocity = 3 + Math.random() * 6;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const life = 60 + Math.random() * 60;

            this.particles.push({
                x, y, vx, vy,
                color, life,
                maxLife: life,
                size: 2 + Math.random() * 3,
                trail: []
            });
        }
    }

    static update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.15; // gravity
            p.vx *= 0.99; // air resistance
            p.life--;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    static draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw particles
        this.particles.forEach(p => {
            const alpha = p.life / p.maxLife;
            
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = alpha;
            this.ctx.shadowColor = p.color;
            this.ctx.shadowBlur = 15;
            
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = 0;
    }

    static animate() {
        this.update();
        this.draw();
        
        if (this.isRunning || this.particles.length > 0) {
            requestAnimationFrame(() => this.animate());
        }
    }
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    FireworksManager.init();
});
