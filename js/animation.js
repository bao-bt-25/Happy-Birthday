/* ========================================
   ANIMATION.JS - Animation Utilities
   Scroll-based and interactive animations
   ======================================== */

// ===== SCROLL OBSERVER =====
class ScrollAnimationObserver {
    constructor() {
        this.options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.observer = new IntersectionObserver(
            (entries) => this.handleObserve(entries),
            this.options
        );
    }

    init() {
        // Animate message lines
        document.querySelectorAll('.message-line').forEach((el, index) => {
            el.style.animation = `fadeInUp 0.8s ease-out ${index * 0.2}s forwards`;
            el.style.opacity = '0';
        });

        // Animate wish items
        document.querySelectorAll('.wish-item').forEach((el, index) => {
            el.style.animation = `fadeIn 0.8s ease-out ${index * 0.1}s forwards`;
            el.style.opacity = '0';
        });

        // Animate album items
        document.querySelectorAll('.album-item').forEach((el, index) => {
            el.style.animation = `fadeIn 0.8s ease-out ${index * 0.1}s forwards`;
            el.style.opacity = '0';
        });

        // Observe elements
        document.querySelectorAll('.section').forEach(section => {
            this.observer.observe(section);
        });
    }

    handleObserve(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }
}

// ===== PARALLAX EFFECT =====
class ParallaxEffect {
    constructor() {
        this.elements = document.querySelectorAll('.parallax-item');
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.handleScroll());
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    }

    handleScroll() {
        const scrollTop = window.scrollY;
        
        this.elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const elementTop = rect.top + scrollTop;
            const distance = scrollTop - elementTop;
            const parallaxValue = distance * 0.5;
            
            if (Math.abs(parallaxValue) < 200) {
                el.style.transform = `translateY(${parallaxValue}px)`;
            }
        });
    }

    handleMouseMove(e) {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        this.elements.forEach(el => {
            const moveX = (mouseX - 0.5) * 20;
            const moveY = (mouseY - 0.5) * 20;
            
            el.style.transform += `translateX(${moveX}px) translateY(${moveY}px)`;
        });
    }
}

// ===== HOVER EFFECTS =====
class HoverEffects {
    constructor() {
        this.setupButtons();
        this.setupCards();
        this.setupItems();
    }

    setupButtons() {
        document.querySelectorAll('.gift-button, .audio-btn').forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.05) translateY(-3px)';
            });
            
            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1) translateY(0)';
            });
        });
    }

    setupCards() {
        document.querySelectorAll('.card, .wish-item').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.boxShadow = '0 15px 40px rgba(139, 92, 246, 0.5)';
                this.style.transform = 'translateY(-10px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.boxShadow = '';
                this.style.transform = '';
            });
        });
    }

    setupItems() {
        document.querySelectorAll('.album-item, .hidden-star').forEach(item => {
            item.addEventListener('mouseenter', function() {
                if (this.classList.contains('album-item')) {
                    this.querySelector('img').style.transform = 'scale(1.1)';
                }
            });
            
            item.addEventListener('mouseleave', function() {
                if (this.classList.contains('album-item')) {
                    this.querySelector('img').style.transform = '';
                }
            });
        });
    }
}

// ===== RIPPLE EFFECT =====
class RippleEffect {
    static create(event) {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.background = 'rgba(255, 255, 255, 0.5)';
        ripple.style.borderRadius = '50%';
        ripple.style.animation = 'ripple 0.6s ease-out';
        ripple.style.pointerEvents = 'none';
        
        if (!button.style.position || button.style.position === 'static') {
            button.style.position = 'relative';
            button.style.overflow = 'hidden';
        }
        
        button.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
}

// ===== FLOATING ANIMATION =====
class FloatingAnimation {
    constructor() {
        this.floatingElements = document.querySelectorAll('.card-icon, .ending-star');
        this.init();
    }

    init() {
        this.floatingElements.forEach((el, index) => {
            el.style.animation = `float 3s ease-in-out infinite`;
            el.style.animationDelay = `${index * 0.5}s`;
        });
    }
}

// ===== TEXT REVEAL ANIMATION =====
class TextReveal {
    constructor() {
        this.elements = document.querySelectorAll('.message-line, .ending-line');
        this.init();
    }

    init() {
        this.elements.forEach((el, index) => {
            const text = el.textContent;
            const chars = text.split('');
            el.textContent = '';
            
            chars.forEach((char, charIndex) => {
                const span = document.createElement('span');
                span.textContent = char;
                span.style.opacity = '0';
                span.style.animation = `fadeIn 0.05s ease-out ${charIndex * 0.05}s forwards`;
                el.appendChild(span);
            });
        });
    }
}

// ===== GLOW ANIMATION =====
class GlowAnimation {
    static addGlow(element) {
        element.style.boxShadow = `0 0 20px rgba(139, 92, 246, 0.6), inset 0 0 10px rgba(139, 92, 246, 0.3)`;
    }

    static removeGlow(element) {
        element.style.boxShadow = '';
    }
}

// ===== STAGGER ANIMATION =====
class StaggerAnimation {
    static apply(elements, delay = 0.1) {
        elements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.animation = `fadeInUp 0.8s ease-out ${index * delay}s forwards`;
        });
    }
}

// ===== BOUNCE ANIMATION =====
class BounceAnimation {
    static trigger(element) {
        element.style.animation = 'none';
        setTimeout(() => {
            element.style.animation = 'bounce 0.6s ease-in-out';
        }, 10);
    }
}

// ===== PULSE ANIMATION =====
class PulseAnimation {
    static start(element) {
        element.style.animation = 'pulse 2s ease-in-out infinite';
    }

    static stop(element) {
        element.style.animation = 'none';
    }
}

// ===== SHAKE ANIMATION =====
class ShakeAnimation {
    static trigger(element, intensity = 5, duration = 500) {
        const startTime = Date.now();
        const startX = parseInt(element.style.transform.split('translateX(')[1]) || 0;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed < duration) {
                const shake = Math.sin(elapsed / 50) * intensity;
                element.style.transform = `translateX(${startX + shake}px)`;
                requestAnimationFrame(animate);
            } else {
                element.style.transform = `translateX(${startX}px)`;
            }
        };
        
        animate();
    }
}

// ===== FLIP ANIMATION =====
class FlipAnimation {
    static triggerFlip(element, duration = 600) {
        element.style.animation = `flip ${duration}ms ease-in-out`;
    }
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    const scrollObserver = new ScrollAnimationObserver();
    scrollObserver.init();

    new ParallaxEffect();
    new HoverEffects();
    new FloatingAnimation();
    new TextReveal();
});
