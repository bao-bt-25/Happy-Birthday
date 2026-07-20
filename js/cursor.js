/* ========================================
   CURSOR.JS — Custom cursor + trail (desktop only)
   ----------------------------------------
   Fixes vs. previous version:
   - mousemove never fires on touch devices, so on the Android
     phones this project targets the old code ran for nothing —
     it's now skipped entirely when the device has no fine
     pointer, saving the work and avoiding a stray fixed cursor
     icon that could otherwise get stuck on screen after a touch.
   - The trail no longer does `innerHTML = ''` + rebuild up to 15
     DOM nodes on every single mousemove event (a real repaint/GC
     cost). It now reuses a fixed pool of nodes and only updates
     `transform`, which the browser can composite without layout.
   ======================================== */

class CustomCursor {
    constructor() {
        this.maxTrail = 12;
        this.cursorElement = document.getElementById('custom-cursor');
        this.trailContainer = document.getElementById('cursor-trail');
        this.trailNodes = [];
        this.trailIndex = 0;
        this.rafScheduled = false;
        this.pendingX = 0;
        this.pendingY = 0;
        this.init();
    }

    init() {
        if (!this.cursorElement || !this.trailContainer) return;

        for (let i = 0; i < this.maxTrail; i++) {
            const dot = document.createElement('div');
            const size = 2 + (i / this.maxTrail) * 6;
            const opacity = i / this.maxTrail;
            Object.assign(dot.style, {
                position: 'fixed',
                left: '0', top: '0',
                width: size + 'px',
                height: size + 'px',
                borderRadius: '50%',
                background: `rgba(139, 92, 246, ${opacity * 0.6})`,
                boxShadow: `0 0 ${size}px rgba(139, 92, 246, ${opacity * 0.8})`,
                pointerEvents: 'none',
                opacity: '0',
                willChange: 'transform',
                transform: 'translate(-100px, -100px)'
            });
            this.trailContainer.appendChild(dot);
            this.trailNodes.push(dot);
        }

        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseenter', () => this.show());
        document.addEventListener('mouseleave', () => this.hide());
    }

    handleMouseMove(e) {
        this.pendingX = e.clientX;
        this.pendingY = e.clientY;
        this.show();

        if (this.rafScheduled) return;
        this.rafScheduled = true;
        requestAnimationFrame(() => {
            this.rafScheduled = false;
            this.draw(this.pendingX, this.pendingY);
        });
    }

    draw(x, y) {
        const dot = this.trailNodes[this.trailIndex];
        dot.style.transform = `translate(${x}px, ${y}px)`;
        dot.style.opacity = '1';
        this.trailIndex = (this.trailIndex + 1) % this.trailNodes.length;

        this.cursorElement.style.transform = `translate(${x}px, ${y}px)`;
        this.cursorElement.style.left = '0';
        this.cursorElement.style.top = '0';
    }

    show() { this.cursorElement.classList.add('is-visible'); }
    hide() { this.cursorElement.classList.remove('is-visible'); }
}

document.addEventListener('DOMContentLoaded', () => {
    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (hasFinePointer) {
        new CustomCursor();
    }
});
