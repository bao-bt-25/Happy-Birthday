/* ========================================
   SECRET.JS - Secret Mode & Easter Eggs
   Hidden features and secret unlocks
   ======================================== */

// ===== SECRET MODE MANAGER =====
class SecretModeManager {
    static konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    static konamiIndex = 0;
    static secretKeys = ['happy15', 'birthday', 'secret'];
    static keySequence = [];
    static activated = {
        konamiCode: false,
        textSecret: false
    };

    static init() {
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    static handleKeydown(e) {
        // Konami code detection
        if (e.key.toLowerCase() === this.konamiCode[this.konamiIndex]) {
            this.konamiIndex++;
            if (this.konamiIndex === this.konamiCode.length) {
                this.activateKonamiMode();
                this.konamiIndex = 0;
            }
        } else {
            this.konamiIndex = 0;
        }
        
        // Text sequence detection
        this.keySequence.push(e.key.toLowerCase());
        this.keySequence = this.keySequence.slice(-20);
        
        const sequence = this.keySequence.join('');
        
        this.secretKeys.forEach(key => {
            if (sequence.includes(key) && !this.activated.textSecret) {
                this.activateTextSecret();
            }
        });
    }

    static activateKonamiMode() {
        if (this.activated.konamiCode) return;
        this.activated.konamiCode = true;
        
        this.showNotification('🌌 COSMIC MODE ACTIVATED! 🌌');
        AudioManager.play('secret-unlock');
        
        // Apply cosmic theme
        document.body.style.background = 'linear-gradient(45deg, #ff00ff, #00ffff, #ffff00, #ff00ff)';
        document.body.style.backgroundSize = '400% 400%';
        document.body.style.animation = 'gradientShift 8s ease infinite';
        
        // Trigger continuous fireworks
        const cosmicInterval = setInterval(() => {
            FireworksManager.trigger(
                Math.random() * window.innerWidth,
                Math.random() * window.innerHeight * 0.5,
                80
            );
        }, 300);
        
        // Trigger meteor rain
        MeteorRainEffect.start(10000);
    }

    static activateTextSecret() {
        if (this.activated.textSecret) return;
        this.activated.textSecret = true;
        
        this.showNotification('✨ Chúc mừng! Bạn đã khám phá bí mật! ✨');
        AudioManager.play('secret-unlock');
        
        // Create special effect
        for (let i = 0; i < 200; i++) {
            const particle = document.createElement('div');
            particle.textContent = '✨';
            particle.style.position = 'fixed';
            particle.style.left = Math.random() * window.innerWidth + 'px';
            particle.style.top = Math.random() * window.innerHeight + 'px';
            particle.style.fontSize = '1.5rem';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '9000';
            particle.style.animation = `float 3s ease-in-out infinite`;
            
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 10000);
        }
    }

    static showNotification(message) {
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.top = '50%';
        notification.style.left = '50%';
        notification.style.transform = 'translate(-50%, -50%)';
        notification.style.padding = '2rem';
        notification.style.background = 'linear-gradient(135deg, #8b5cf6, #3b82f6)';
        notification.style.color = '#f0f0f5';
        notification.style.borderRadius = '1rem';
        notification.style.fontSize = '1.5rem';
        notification.style.fontWeight = 'bold';
        notification.style.textAlign = 'center';
        notification.style.zIndex = '10000';
        notification.style.border = '2px solid #a78bfa';
        notification.style.animation = 'scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        notification.style.boxShadow = '0 10px 40px rgba(139, 92, 246, 0.5)';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.6s ease-out';
            setTimeout(() => notification.remove(), 600);
        }, 3000);
    }
}

// ===== EASTER EGGS =====
class EasterEggs {
    static clickCount = 0;
    static lastClickTime = 0;
    static tripleClickThreshold = 500;

    static init() {
        // Triple click on title for easter egg
        const title = document.querySelector('h1');
        if (title) {
            title.addEventListener('click', () => this.handleTitleClick());
        }
    }

    static handleTitleClick() {
        const now = Date.now();
        
        if (now - this.lastClickTime < this.tripleClickThreshold) {
            this.clickCount++;
        } else {
            this.clickCount = 1;
        }
        
        this.lastClickTime = now;
        
        if (this.clickCount === 3) {
            this.triggerEasterEgg();
            this.clickCount = 0;
        }
    }

    static triggerEasterEgg() {
        const messages = [
            '🎉 Bạn tìm thấy easter egg!',
            '✨ Chúc mừng sinh nhật!',
            '💖 Mong bạn luôn vui vẻ!'
        ];
        
        const message = messages[Math.floor(Math.random() * messages.length)];
        SecretModeManager.showNotification(message);
        AudioManager.play('success');
        
        // Trigger fireworks
        FireworksManager.trigger(window.innerWidth / 2, window.innerHeight / 2, 100);
    }
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    SecretModeManager.init();
    EasterEggs.init();
});
