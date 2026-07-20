/* ========================================
   CURSOR.JS - Custom Cursor System
   Trail and glow effects for cursor
   ======================================== */

// ===== CUSTOM CURSOR =====
class CustomCursor {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.trailPoints = [];
        this.maxTrail = 15;
        this.cursorElement = document.getElementById('custom-cursor');
        this.init();
    }

    init() {
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseenter', () => this.show());
        document.addEventListener('mouseleave', () => this.hide());
    }

    handleMouseMove(e) {
        this.x = e.clientX;
        this.y = e.clientY;
        
        this.trailPoints.push({ x: this.x, y: this.y });
        if (this.trailPoints.length > this.maxTrail) {
            this.trailPoints.shift();
        }
        
        this.draw();
    }

    draw() {
        if (!this.cursorElement) return;
        
        // Draw trail
        const trailContainer = document.getElementById('cursor-trail');
        if (trailContainer) {
            trailContainer.innerHTML = '';
            
            this.trailPoints.forEach((point, index) => {
                const opacity = index / this.trailPoints.length;
                const size = 2 + (index / this.trailPoints.length) * 6;
                
                const dot = document.createElement('div');
                dot.style.position = 'fixed';
                dot.style.left = point.x + 'px';
                dot.style.top = point.y + 'px';
                dot.style.width = size + 'px';
                dot.style.height = size + 'px';
                dot.style.borderRadius = '50%';
                dot.style.background = `rgba(139, 92, 246, ${opacity * 0.6})`;
                dot.style.pointerEvents = 'none';
                dot.style.zIndex = '9999';
                dot.style.boxShadow = `0 0 ${size}px rgba(139, 92, 246, ${opacity * 0.8})`;
                
                trailContainer.appendChild(dot);
            });
        }
        
        // Update cursor position
        this.cursorElement.style.left = this.x + 'px';
        this.cursorElement.style.top = this.y + 'px';
    }

    show() {
        if (this.cursorElement) {
            this.cursorElement.style.display = 'block';
        }
    }

    hide() {
        if (this.cursorElement) {
            this.cursorElement.style.display = 'none';
        }
    }
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    new CustomCursor();
});
