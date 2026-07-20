/* ========================================
   GAME.JS - Game Mechanics
   Candle blowing and star finding games
   ======================================== */

// ===== GAME MANAGER =====
class GameManager {
    static candleBlow = 0;
    static candleTotal = 15;
    static starsFound = 0;
    static starsTotal = 15;

    static initCandleGame() {
        const candles = document.querySelectorAll('.candle');
        candles.forEach((candle, index) => {
            candle.style.cursor = 'pointer';
            candle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.blowCandle(candle);
            });
        });
    }

    static blowCandle(candleEl) {
        if (candleEl.classList.contains('blown')) return;
        
        candleEl.classList.add('blown');
        this.candleBlow++;
        
        // Update progress
        const progress = (this.candleBlow / this.candleTotal) * 100;
        const progressBar = document.getElementById('candle-progress');
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
        
        const countEl = document.getElementById('candle-count');
        if (countEl) {
            countEl.textContent = `${this.candleBlow}/${this.candleTotal} cây nến`;
        }
        
        // Play sound
        AudioManager.play('candle-blow');
        
        // Particle effect
        this.createCandleEffect(candleEl);
        
        // Check completion
        if (this.candleBlow === this.candleTotal) {
            this.onCandleGameComplete();
        }
    }

    static createCandleEffect(el) {
        const rect = el.getBoundingClientRect();
        
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.textContent = '✨';
            particle.style.position = 'fixed';
            particle.style.left = rect.left + 'px';
            particle.style.top = rect.top + 'px';
            particle.style.fontSize = '1rem';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '8000';
            
            document.body.appendChild(particle);
            
            const angle = (Math.PI * 2 * i) / 8;
            const distance = 60;
            const endX = rect.left + Math.cos(angle) * distance;
            const endY = rect.top + Math.sin(angle) * distance;
            
            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${endX - rect.left}px, ${endY - rect.top}px) scale(0)`, opacity: 0 }
            ], {
                duration: 600,
                easing: 'ease-out'
            }).onfinish = () => particle.remove();
        }
    }

    static onCandleGameComplete() {
        AudioManager.play('success');
        
        // Create confetti
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.top = '-10px';
            confetti.textContent = ['🎉', '✨', '🎊'][Math.floor(Math.random() * 3)];
            confetti.style.fontSize = Math.random() * 2 + 1 + 'rem';
            confetti.style.animation = `confettiFall ${2 + Math.random() * 2}s linear forwards`;
            
            document.getElementById('confetti-container').appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 5000);
        }
        
        // Trigger fireworks
        setTimeout(() => {
            FireworksManager.trigger(window.innerWidth / 2, window.innerHeight / 2, 80);
        }, 500);
    }

    static initStarGame() {
        const stars = document.querySelectorAll('.hidden-star');
        stars.forEach(star => {
            star.style.cursor = 'pointer';
            star.addEventListener('click', (e) => {
                e.stopPropagation();
                this.findStar(star);
            });
        });
    }

    static findStar(starEl) {
        if (starEl.classList.contains('found')) return;
        
        starEl.classList.add('found');
        starEl.style.opacity = '0.2';
        starEl.style.pointerEvents = 'none';
        
        this.starsFound++;
        
        // Update progress
        const progress = (this.starsFound / this.starsTotal) * 100;
        const progressBar = document.getElementById('game-progress');
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
        
        const countEl = document.getElementById('stars-found');
        if (countEl) {
            countEl.textContent = `${this.starsFound}/${this.starsTotal} sao`;
        }
        
        // Play sound
        AudioManager.play('star-found');
        
        // Effect
        this.createStarEffect(starEl);
        
        // Check completion
        if (this.starsFound === this.starsTotal) {
            this.onStarGameComplete();
        }
    }

    static createStarEffect(el) {
        const rect = el.getBoundingClientRect();
        
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.textContent = '⭐';
            particle.style.position = 'fixed';
            particle.style.left = rect.left + 'px';
            particle.style.top = rect.top + 'px';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '8000';
            
            document.body.appendChild(particle);
            
            const angle = (Math.PI * 2 * i) / 12;
            const distance = 80;
            const endX = rect.left + Math.cos(angle) * distance;
            const endY = rect.top + Math.sin(angle) * distance;
            
            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${endX - rect.left}px, ${endY - rect.top}px) scale(0)`, opacity: 0 }
            ], {
                duration: 800,
                easing: 'ease-out'
            }).onfinish = () => particle.remove();
        }
    }

    static onStarGameComplete() {
        AudioManager.play('success');
        
        // Create confetti explosion
        for (let i = 0; i < 150; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.top = '-10px';
            confetti.textContent = ['🎉', '✨', '🎊', '⭐', '💫'][Math.floor(Math.random() * 5)];
            confetti.style.fontSize = Math.random() * 2.5 + 1 + 'rem';
            confetti.style.animation = `confettiFall ${2.5 + Math.random() * 2}s linear forwards`;
            
            document.getElementById('confetti-container').appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 6000);
        }
        
        // Trigger mega fireworks
        setTimeout(() => {
            for (let i = 0; i < 3; i++) {
                FireworksManager.trigger(
                    Math.random() * window.innerWidth,
                    Math.random() * window.innerHeight * 0.5,
                    100
                );
            }
        }, 500);
    }
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    GameManager.initCandleGame();
    GameManager.initStarGame();
});
