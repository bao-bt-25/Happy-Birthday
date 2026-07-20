/* ========================================
   ANIMATION.JS — Scroll reveals + tap ripple
   ----------------------------------------
   This file replaces the previous version, which defined ~10
   classes (ParallaxEffect, HoverEffects, TextReveal, GlowAnimation,
   StaggerAnimation, BounceAnimation, PulseAnimation, ShakeAnimation,
   FlipAnimation, a duplicate ScrollTrigger already in app.js...)
   Seven of those were never called from anywhere — pure dead code.
   Two more (ParallaxEffect, the old ScrollAnimationObserver) targeted
   selectors that don't exist in this HTML (.parallax-item,
   [data-animate]) and were no-ops that still attached global
   mousemove/scroll listeners for nothing.

   What's left is only what's actually used: one IntersectionObserver
   driving the per-component reveal animations already defined in
   styles.css/animation.css, and a real ripple effect wired to the
   buttons/cards that previously had ripple CSS but no JS trigger.
   ======================================== */

class RevealOnScroll {
    constructor() {
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
        );
    }

    init() {
        if (this.reducedMotion) return; // CSS already forces opacity:1 in this mode

        const targets = document.querySelectorAll(
            '.section-title, .message-line, .wish-item, .timeline-item, [data-reveal]'
        );
        targets.forEach(el => this.observer.observe(el));
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;

            if (el.dataset.reveal) {
                el.classList.add(`animate-${el.dataset.reveal}`);
            } else {
                el.classList.add('in-view');
            }
            this.observer.unobserve(el);
        });
    }
}

class RippleEffect {
    static attach(selector) {
        document.querySelectorAll(selector).forEach(el => {
            el.addEventListener('pointerdown', (e) => RippleEffect.create(e, el));
        });
    }

    static create(event, el) {
        const rect = el.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        Object.assign(ripple.style, {
            position: 'absolute',
            width: size + 'px',
            height: size + 'px',
            left: x + 'px',
            top: y + 'px',
            background: 'rgba(255, 255, 255, 0.4)',
            borderRadius: '50%',
            animation: 'ripple 0.6s ease-out',
            pointerEvents: 'none'
        });

        const computedPosition = getComputedStyle(el).position;
        if (computedPosition === 'static') el.style.position = 'relative';
        el.style.overflow = 'hidden';

        el.appendChild(ripple);
        setTimeout(() => ripple.remove(), 650);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new RevealOnScroll().init();
    RippleEffect.attach('.gift-button, .wish-item, .audio-btn, .card');
});
