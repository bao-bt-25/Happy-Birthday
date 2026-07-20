/* ========================================
   APP.JS - Main Application Logic
   Birthday Website Core Functionality
   ======================================== */

// ===== STATE MANAGEMENT =====
const state = {
    introComplete: false,
    giftOpened: false,
    candlesBlow: 0,
    totalCandles: 15,
    starsFound: 0,
    totalStars: 15,
    secretModeActive: false,
    cosmicModeActive: false,
    audioEnabled: true,
};

// ===== DOM ELEMENTS =====
const elements = {
    introScreen: document.getElementById('intro-screen'),
    giftButtonContainer: document.getElementById('gift-button-container'),
    giftButton: document.getElementById('gift-button'),
    mainContent: document.getElementById('main-content'),
    typingText: document.getElementById('typing-text'),
    personName: document.getElementById('person-name'),
    card: document.getElementById('birthday-card'),
    candlesContainer: document.getElementById('candles-container'),
    candleCount: document.getElementById('candle-count'),
    starsFound: document.getElementById('stars-found'),
    gameProgress: document.getElementById('game-progress'),
    fireworksCanvas: document.getElementById('fireworks-canvas'),
    audioToggle: document.getElementById('audio-toggle'),
    confettiContainer: document.getElementById('confetti-container'),
    secretNotification: document.getElementById('secret-notification'),
    timeline: document.getElementById('timeline'),
    section7: document.getElementById('section-7'),
};

// ===== TYPING ANIMATION =====
class TypingAnimation {
    constructor(element, texts, speed = 50, delayBetween = 1000) {
        this.element = element;
        this.texts = texts;
        this.speed = speed;
        this.delayBetween = delayBetween;
        this.currentIndex = 0;
    }

    async start() {
        for (let i = 0; i < this.texts.length; i++) {
            await this.typeText(this.texts[i]);
            await this.sleep(this.delayBetween);
        }
    }

    async typeText(text) {
        this.element.textContent = '';
        for (let char of text) {
            this.element.textContent += char;
            await this.sleep(this.speed);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ===== INTRO SEQUENCE =====
async function startIntro() {
    const typingTexts = [
        'Trong hàng tỷ vì sao ngoài kia...',
        'Hôm nay...',
        'Có một ngôi sao đặc biệt vừa bước sang tuổi 15.',
    ];

    const typing = new TypingAnimation(elements.typingText, typingTexts, 40, 1500);
    await typing.start();

    // Show name
    elements.personName.style.display = 'block';
    await sleep(1500);

    // Show gift button
    elements.giftButtonContainer.style.display = 'flex';
    await sleep(500);

    state.introComplete = true;
}

// ===== GIFT BUTTON CLICK =====
function setupGiftButton() {
    elements.giftButton.addEventListener('click', async () => {
        state.giftOpened = true;
        
        // Hide intro
        elements.introScreen.classList.add('hidden');
        await sleep(500);
        
        // Show main content
        elements.mainContent.style.display = 'block';
        
        // Play sound
        AudioManager.play('gift-open');
        
        // Show confetti
        createConfetti(50);
        
        // Scroll to first section
        setTimeout(() => {
            document.getElementById('section-1').scrollIntoView({ behavior: 'smooth' });
        }, 500);
    });
}

// ===== SLEEP UTILITY =====
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== GENERATE CANDLES =====
function generateCandles() {
    const totalCandles = 15;
    const container = elements.candlesContainer;
    const cake = document.querySelector('.cake');
    
    for (let i = 0; i < totalCandles; i++) {
        const angle = (360 / totalCandles) * i;
        const radius = 60;
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;
        
        const candle = document.createElement('div');
        candle.className = 'candle';
        candle.style.left = `calc(50% + ${x}px)`;
        candle.style.bottom = `${y + 100}px`;
        candle.innerHTML = '<div class="candle-flame"></div>';
        
        candle.addEventListener('click', (e) => {
            e.stopPropagation();
            blowCandle(candle);
        });
        
        container.appendChild(candle);
    }
}

// ===== BLOW CANDLE =====
function blowCandle(candleEl) {
    if (candleEl.classList.contains('blown')) return;
    
    candleEl.classList.add('blown');
    state.candlesBlow++;
    
    // Update UI
    elements.candleCount.textContent = `${state.candlesBlow}/${state.totalCandles} cây nến`;
    const progress = (state.candlesBlow / state.totalCandles) * 100;
    document.getElementById('candle-progress').style.width = `${progress}%`;
    
    // Play sound
    AudioManager.play('candle-blow');
    
    // Create particles
    createCandleParticles(candleEl);
    
    // Check if all candles blown
    if (state.candlesBlow === state.totalCandles) {
        onAllCandlesBlow();
    }
}

// ===== CREATE CANDLE PARTICLES =====
function createCandleParticles(candleEl) {
    const rect = candleEl.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    // Fire particles
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.fontSize = '1.2rem';
        particle.textContent = '✨';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '8000';
        
        document.body.appendChild(particle);
        
        const angle = (Math.PI * 2 * i) / 5;
        const velocity = 3 + Math.random() * 3;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity - 2;
        
        let px = x, py = y;
        const duration = 1000;
        const startTime = Date.now();
        
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            px += vx;
            py += vy;
            vy += 0.1; // gravity
            
            particle.style.left = px + 'px';
            particle.style.top = py + 'px';
            particle.style.opacity = 1 - progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        }
        
        animate();
    }
}

// ===== ALL CANDLES BLOWN =====
function onAllCandlesBlow() {
    AudioManager.play('success');
    createConfetti(100);
    
    setTimeout(() => {
        // Trigger fireworks
        if (elements.fireworksCanvas && elements.fireworksCanvas.getContext) {
            FireworksManager.trigger(window.innerWidth / 2, window.innerHeight / 2);
        }
    }, 500);
}

// ===== CONFETTI CREATION =====
function createConfetti(count) {
    for (let i = 0; i < count; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.top = '-10px';
        confetti.textContent = ['🎉', '✨', '🎊', '⭐', '💫'][Math.floor(Math.random() * 5)];
        confetti.style.fontSize = Math.random() * 2 + 1 + 'rem';
        confetti.style.animation = `confettiFall ${2 + Math.random() * 2}s linear forwards`;
        
        elements.confettiContainer.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 5000);
    }
}

// ===== CARD FLIP =====
function setupCardFlip() {
    if (!elements.card) return;
    
    elements.card.addEventListener('click', () => {
        elements.card.classList.toggle('flipped');
    });
}

// ===== TIMELINE GENERATION =====
function generateTimeline() {
    const timelineData = [
        { year: 2026, message: '🎂 Chúc mừng tuổi 15. Em sẽ tỏa sáng!' },
        { year: 2027, message: '🌸 Mong em luôn giữ nụ cười' },
        { year: 2028, message: '📚 Chúc em học thật tốt' },
        { year: 2029, message: '🌈 Có thật nhiều bạn tốt' },
        { year: 2030, message: '🌎 Được đi đến những nơi mình thích' },
        { year: 2032, message: '✨ Luôn mạnh khỏe' },
        { year: 2035, message: '⭐ Đừng bao giờ từ bỏ ước mơ' },
        { year: 2040, message: '💖 Mong rằng khi nhìn lại, em sẽ mỉm cười' },
    ];

    elements.timeline.innerHTML = '';
    
    timelineData.forEach((item, index) => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        
        timelineItem.innerHTML = `
            <div class="timeline-marker"></div>
            <div class="timeline-content">
                <div class="timeline-year">${item.year}</div>
                <div class="timeline-message">${item.message}</div>
            </div>
        `;
        
        elements.timeline.appendChild(timelineItem);
    });
}

// ===== SCROLL TRIGGER ANIMATIONS =====
class ScrollTrigger {
    constructor() {
        this.elements = document.querySelectorAll('[data-animate]');
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            { threshold: 0.1 }
        );
        this.init();
    }

    init() {
        this.elements.forEach(el => this.observer.observe(el));
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const animationType = entry.target.dataset.animate;
                entry.target.classList.add(`animate-${animationType}`);
                this.observer.unobserve(entry.target);
            }
        });
    }
}

// ===== HIDDEN STARS SETUP =====
function setupHiddenStars() {
    for (let i = 0; i < 15; i++) {
        const star = document.createElement('div');
        star.className = 'hidden-star';
        star.textContent = '⭐';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.id = `star-${i}`;
        
        document.body.appendChild(star);
        
        star.addEventListener('click', (e) => {
            e.stopPropagation();
            findStar(star);
        });
    }
}

// ===== FIND STAR =====
function findStar(starEl) {
    if (starEl.classList.contains('found')) return;
    
    starEl.classList.add('found');
    starEl.style.opacity = '0.3';
    starEl.style.pointerEvents = 'none';
    
    state.starsFound++;
    
    // Update progress
    const progress = (state.starsFound / state.totalStars) * 100;
    document.getElementById('game-progress').style.width = `${progress}%`;
    elements.starsFound.textContent = `${state.starsFound}/${state.totalStars} sao`;
    
    // Play sound
    AudioManager.play('star-found');
    
    // Create effect
    createStarEffect(starEl);
    
    // Check if all found
    if (state.starsFound === state.totalStars) {
        onAllStarsFound();
    }
}

// ===== CREATE STAR EFFECT =====
function createStarEffect(starEl) {
    const rect = starEl.getBoundingClientRect();
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.textContent = '✨';
        particle.style.position = 'fixed';
        particle.style.left = rect.left + 'px';
        particle.style.top = rect.top + 'px';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '8000';
        
        document.body.appendChild(particle);
        
        const angle = (Math.PI * 2 * i) / 8;
        const distance = 50;
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

// ===== ALL STARS FOUND =====
function onAllStarsFound() {
    AudioManager.play('success');
    createConfetti(80);
    
    // Unlock final gift
    setTimeout(() => {
        elements.section7.style.display = 'flex';
        elements.section7.scrollIntoView({ behavior: 'smooth' });
    }, 500);
}

// ===== KEYBOARD INPUT =====
let keySequence = [];
const secretKeys = ['happy15', 'birthday'];
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    // Konami code detection
    if (e.key.toLowerCase() === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            activateCosmicMode();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
    
    // Text sequence detection
    keySequence.push(e.key.toLowerCase());
    keySequence = keySequence.slice(-20);
    
    const sequence = keySequence.join('');
    
    secretKeys.forEach(key => {
        if (sequence.includes(key)) {
            activateSecretMode();
        }
    });
});

// ===== ACTIVATE SECRET MODE =====
function activateSecretMode() {
    if (state.secretModeActive) return;
    
    state.secretModeActive = true;
    
    // Show notification
    elements.secretNotification.style.display = 'block';
    elements.secretNotification.textContent = '🎉 Chúc mừng! Bạn đã mở khóa Thiên Hà Bí Mật.';
    
    AudioManager.play('secret-unlock');
    
    setTimeout(() => {
        elements.secretNotification.style.display = 'none';
    }, 3000);
}

// ===== ACTIVATE COSMIC MODE =====
function activateCosmicMode() {
    if (state.cosmicModeActive) return;
    
    state.cosmicModeActive = true;
    
    // Show notification
    elements.secretNotification.style.display = 'block';
    elements.secretNotification.textContent = '🌌 Cosmic Mode Unlocked!';
    elements.secretNotification.style.background = 'linear-gradient(135deg, #ff00ff, #00ffff)';
    
    // Trigger infinite fireworks
    setInterval(() => {
        FireworksManager.trigger(
            Math.random() * window.innerWidth,
            Math.random() * window.innerHeight / 2
        );
    }, 200);
    
    // Change background
    document.body.style.background = 'linear-gradient(45deg, #ff00ff, #00ffff, #ffff00)';
    
    setTimeout(() => {
        elements.secretNotification.style.display = 'none';
    }, 3000);
}

// ===== INITIALIZATION =====
async function init() {
    // Start intro
    await startIntro();
    
    // Setup event listeners
    setupGiftButton();
    setupCardFlip();
    
    // Generate candles
    generateCandles();
    
    // Generate timeline
    generateTimeline();
    
    // Setup hidden stars
    setupHiddenStars();
    
    // Initialize scroll animations
    new ScrollTrigger();
    
    // Log ready
    console.log('🎂 Happy Birthday Website Ready!');
    console.log('✨ Try typing: happy15 or birthday');
    console.log('🎮 Try Konami code: ↑ ↑ ↓ ↓ ← → ← → B A');
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Fallback if DOM already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
