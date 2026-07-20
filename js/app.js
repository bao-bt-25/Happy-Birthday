/* ========================================
   APP.JS — Main application logic
   ----------------------------------------
   Consolidated single source of truth. Previously this same logic
   was split (and duplicated!) across app.js, game.js and secret.js:
   - game.js re-implemented the candle game and star hunt with its
     own separate counters, attaching a second click handler to
     every candle/star — but it ran in a DOMContentLoaded listener
     that fired BEFORE this file created those elements (script load
     order), so in practice it silently did nothing. Dead code.
   - secret.js re-implemented the Konami code + secret-text detector
     that already existed below, each with its own `setInterval`
     fireworks loop that was never cleared — a real, unbounded
     memory/CPU leak that got WORSE by existing twice.
   - This file itself registered `DOMContentLoaded` twice (once
     unconditionally, once again in the "fallback" branch that
     always evaluates true at this point in the load timeline),
     which doubled the intro typing, doubled the candles (30
     instead of 15, visually overlapping), and doubled the hidden
     stars (with duplicate DOM ids).

   All three files are now merged into this one, initialised once.
   ======================================== */

const state = {
    introComplete: false,
    giftOpened: false,
    candlesBlown: 0,
    totalCandles: 15,
    starsFound: 0,
    totalStars: 15,
    secretModeActive: false,
    cosmicModeActive: false,
};

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
    candleProgress: document.getElementById('candle-progress'),
    starsFoundLabel: document.getElementById('stars-found'),
    gameProgress: document.getElementById('game-progress'),
    fireworksCanvas: document.getElementById('fireworks-canvas'),
    confettiContainer: document.getElementById('confetti-container'),
    secretNotification: document.getElementById('secret-notification'),
    timeline: document.getElementById('timeline'),
    section7: document.getElementById('section-7'),
};

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ===== SLEEP UTILITY ===== */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* ===== TYPING ANIMATION ===== */
class TypingAnimation {
    constructor(element, texts, speed = 50, delayBetween = 1000) {
        this.element = element;
        this.texts = texts;
        this.speed = speed;
        this.delayBetween = delayBetween;
    }

    async start() {
        if (reducedMotion) {
            this.element.textContent = this.texts[this.texts.length - 1];
            return;
        }
        for (const text of this.texts) {
            await this.typeText(text);
            await sleep(this.delayBetween);
        }
    }

    async typeText(text) {
        this.element.textContent = '';
        for (const char of text) {
            this.element.textContent += char;
            await sleep(this.speed);
        }
    }
}

/* ===== INTRO SEQUENCE ===== */
async function startIntro() {
    const typingTexts = [
        'Trong hàng tỷ vì sao ngoài kia...',
        'Hôm nay...',
        'Có một ngôi sao đặc biệt vừa bước sang tuổi 15.',
    ];

    await new TypingAnimation(elements.typingText, typingTexts, 40, 1500).start();

    elements.personName.style.display = 'block';
    await sleep(reducedMotion ? 200 : 1200);

    elements.giftButtonContainer.style.display = 'flex';
    state.introComplete = true;
}

/* ===== GIFT BUTTON ===== */
function setupGiftButton() {
    elements.giftButton.addEventListener('click', async () => {
        if (state.giftOpened) return;
        state.giftOpened = true;

        elements.introScreen.classList.add('hidden');
        await sleep(reducedMotion ? 50 : 500);

        elements.introScreen.style.display = 'none';
        elements.mainContent.style.display = 'block';

        AudioManager.play('gift-open');
        createConfetti(50);

        setTimeout(() => {
            document.getElementById('section-1').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
        }, 400);
    });
}

/* ===== CARD FLIP ===== */
function setupCardFlip() {
    if (!elements.card) return;
    elements.card.addEventListener('click', () => {
        elements.card.classList.toggle('flipped');
        AudioManager.play('click');
    });
}

/* ===== CANDLE GAME ===== */
function generateCandles() {
    const container = elements.candlesContainer;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < state.totalCandles; i++) {
        const angle = (360 / state.totalCandles) * i;
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

        fragment.appendChild(candle);
    }
    container.appendChild(fragment);
}

function blowCandle(candleEl) {
    if (candleEl.classList.contains('blown')) return;

    candleEl.classList.add('blown');
    state.candlesBlown++;

    elements.candleCount.textContent = `${state.candlesBlown}/${state.totalCandles} cây nến`;
    const progress = (state.candlesBlown / state.totalCandles) * 100;
    elements.candleProgress.style.width = `${progress}%`;

    AudioManager.play('candle-blow');
    spawnBurstParticles(candleEl, '✨', 5, 60);

    if (state.candlesBlown === state.totalCandles) {
        onAllCandlesBlown();
    }
}

function onAllCandlesBlown() {
    elements.candleProgress.classList.add('complete');
    AudioManager.play('success');
    createConfetti(100);

    setTimeout(() => {
        FireworksManager.trigger(window.innerWidth / 2, window.innerHeight / 2, 80);
    }, 400);
}

/* Shared helper for the small "particles fly outward" effect used by
   both the candle game and the star hunt (previously duplicated
   almost verbatim in three different files). */
function spawnBurstParticles(originEl, glyph, count, distance) {
    if (reducedMotion) return;
    const rect = originEl.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.textContent = glyph;
        Object.assign(particle.style, {
            position: 'fixed',
            left: originX + 'px',
            top: originY + 'px',
            fontSize: '1rem',
            pointerEvents: 'none',
            zIndex: '800',
        });
        document.body.appendChild(particle);

        const angle = (Math.PI * 2 * i) / count;
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;

        const anim = particle.animate(
            [
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${endX}px, ${endY}px) scale(0)`, opacity: 0 },
            ],
            { duration: 650, easing: 'ease-out' }
        );
        anim.onfinish = () => particle.remove();
    }
}

/* ===== CONFETTI ===== */
function createConfetti(count) {
    const glyphs = ['🎉', '✨', '🎊', '⭐', '💫'];
    for (let i = 0; i < count; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
        confetti.style.fontSize = (Math.random() * 2 + 1) + 'rem';
        confetti.style.animation = `confettiFall ${2 + Math.random() * 2}s linear forwards`;

        elements.confettiContainer.appendChild(confetti);
        setTimeout(() => confetti.remove(), 4500);
    }
}

/* ===== TIMELINE ===== */
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

    const fragment = document.createDocumentFragment();
    timelineData.forEach(item => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        timelineItem.innerHTML = `
            <div class="timeline-marker"></div>
            <div class="timeline-content">
                <div class="timeline-year">${item.year}</div>
                <div class="timeline-message">${item.message}</div>
            </div>
        `;
        fragment.appendChild(timelineItem);
    });
    elements.timeline.appendChild(fragment);
}

/* ===== HIDDEN STAR HUNT ===== */
function setupHiddenStars() {
    for (let i = 0; i < state.totalStars; i++) {
        const star = document.createElement('div');
        star.className = 'hidden-star';
        star.textContent = '⭐';
        // Keep stars within a safe 5%-90% band so they never land
        // under the fixed audio button or get clipped off-screen.
        star.style.left = (5 + Math.random() * 85) + '%';
        star.style.top = (5 + Math.random() * 85) + '%';
        star.id = `star-${i}`;
        star.setAttribute('role', 'button');
        star.setAttribute('aria-label', 'Ngôi sao bí mật');

        document.body.appendChild(star);

        star.addEventListener('click', (e) => {
            e.stopPropagation();
            findStar(star);
        });
    }
}

function findStar(starEl) {
    if (starEl.classList.contains('found')) return;

    starEl.classList.add('found');
    state.starsFound++;

    const progress = (state.starsFound / state.totalStars) * 100;
    elements.gameProgress.style.width = `${progress}%`;
    elements.starsFoundLabel.textContent = `${state.starsFound}/${state.totalStars} sao`;

    AudioManager.play('star-found');
    spawnBurstParticles(starEl, '⭐', 8, 70);

    if (state.starsFound === state.totalStars) {
        onAllStarsFound();
    }
}

function onAllStarsFound() {
    AudioManager.play('success');
    createConfetti(80);

    setTimeout(() => {
        elements.section7.style.display = 'flex';
        elements.section7.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    }, 400);
}

/* ===== SECRET CODES & EASTER EGGS ===== */
const konamiCode = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
let konamiIndex = 0;
let keySequence = [];
const secretKeys = ['happy15', 'birthday', 'secret'];
let cosmicFireworksInterval = null;
let cosmicMeteorInterval = null;

function showSecretNotification(message, extraStyle = {}) {
    const el = elements.secretNotification;
    el.textContent = message;
    Object.assign(el.style, extraStyle);
    el.classList.remove('is-hiding');
    el.classList.add('is-visible');

    clearTimeout(showSecretNotification._hideTimer);
    showSecretNotification._hideTimer = setTimeout(() => {
        el.classList.add('is-hiding');
        setTimeout(() => {
            el.classList.remove('is-visible', 'is-hiding');
            el.style.background = '';
        }, 400);
    }, 3000);
}

function activateSecretMode() {
    if (state.secretModeActive) return;
    state.secretModeActive = true;

    showSecretNotification('🎉 Chúc mừng! Bạn đã mở khóa Thiên Hà Bí Mật.');
    AudioManager.play('secret-unlock');
    if (!reducedMotion) {
        for (let i = 0; i < 40; i++) {
            SparkleEffect.create(Math.random() * window.innerWidth, Math.random() * window.innerHeight, 3);
        }
    }
}

function activateCosmicMode() {
    if (state.cosmicModeActive) return;
    state.cosmicModeActive = true;

    showSecretNotification('🌌 Cosmic Mode Unlocked!', {
        background: 'linear-gradient(135deg, #ff00ff, #00ffff)',
    });
    AudioManager.play('secret-unlock');

    if (reducedMotion) return; // skip the heavy visual sequence entirely

    document.body.style.background = 'linear-gradient(45deg, #ff00ff, #00ffff, #ffff00, #ff00ff)';
    document.body.style.backgroundSize = '400% 400%';
    document.body.style.animation = 'gradientShift 8s ease infinite';

    // Both intervals are stored and explicitly capped/cleared — the
    // previous implementation(s) left this running forever.
    const COSMIC_DURATION = 10000;
    cosmicFireworksInterval = setInterval(() => {
        FireworksManager.trigger(Math.random() * window.innerWidth, Math.random() * window.innerHeight * 0.5, 60);
    }, 300);
    cosmicMeteorInterval = MeteorRainEffect.start(COSMIC_DURATION);

    setTimeout(() => {
        clearInterval(cosmicFireworksInterval);
        document.body.style.background = '';
        document.body.style.backgroundSize = '';
        document.body.style.animation = '';
        state.cosmicModeActive = false; // allow re-triggering later
    }, COSMIC_DURATION);
}

function setupSecretDetection() {
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();

        if (key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                activateCosmicMode();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = key === konamiCode[0] ? 1 : 0;
        }

        keySequence.push(key);
        keySequence = keySequence.slice(-20);
        const sequence = keySequence.join('');
        if (!state.secretModeActive && secretKeys.some(k => sequence.includes(k))) {
            activateSecretMode();
        }
    });
}

/* Triple-tap the intro name for a small easter egg — kept from the
   old secret.js but now the only implementation, and guarded so it
   can't fire once the intro has been dismissed (its container gets
   pointer-events: none at that point anyway). */
function setupNameEasterEgg() {
    let clickCount = 0;
    let lastClickTime = 0;
    elements.personName.addEventListener('click', () => {
        const now = Date.now();
        clickCount = (now - lastClickTime < 500) ? clickCount + 1 : 1;
        lastClickTime = now;

        if (clickCount === 3) {
            clickCount = 0;
            const messages = ['🎉 Bạn tìm thấy easter egg!', '✨ Chúc mừng sinh nhật!', '💖 Mong bạn luôn vui vẻ!'];
            showSecretNotification(messages[Math.floor(Math.random() * messages.length)]);
            AudioManager.play('success');
            FireworksManager.trigger(window.innerWidth / 2, window.innerHeight / 2, 60);
        }
    });
}

/* ===== INITIALISATION (runs exactly once) ===== */
async function init() {
    setupGiftButton();
    setupCardFlip();
    generateCandles();
    generateTimeline();
    setupHiddenStars();
    setupSecretDetection();
    setupNameEasterEgg();

    await startIntro();

    console.log('🎂 Happy Birthday Website Ready!');
    console.log('✨ Try typing: happy15 or birthday');
    console.log('🎮 Try Konami code: ↑ ↑ ↓ ↓ ← → ← → B A');
}

document.addEventListener('DOMContentLoaded', init, { once: true });
