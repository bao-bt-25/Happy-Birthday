class AudioManager {
    static sounds = {};
    static enabled = true;
    static audioContext = null;
    static audioToggle = null;
    static bgMusic = null;
    static _unlocked = false;

    static init() {
        this.audioToggle = document.getElementById('audio-toggle');

        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.audioContext = new AC();

        // Nhạc nền
        this.bgMusic = new Audio('assets/audio/Happy.mp3');
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.35;
        this.bgMusic.preload = 'auto';

        if (this.audioToggle) {
            this.audioToggle.addEventListener('click', () => this.toggle());
        }

        const unlock = () => {
            if (!this._unlocked) {

                if (this.audioContext &&
                    this.audioContext.state === 'suspended') {
                    this.audioContext.resume().catch(() => {});
                }

                if (this.enabled) {
                    this.bgMusic.play().catch(() => {});
                }

                this._unlocked = true;

                ['pointerdown','touchstart','keydown','click'].forEach(evt =>
                    document.removeEventListener(evt, unlock)
                );
            }
        };

        ['pointerdown','touchstart','keydown','click'].forEach(evt =>
            document.addEventListener(evt, unlock, { passive: true })
        );

        this.enabled = true;
    }

    static play(soundName) {
        if (!this.enabled || !this.audioContext) return;

        switch (soundName) {
            case 'gift-open':
                this.playSound(400,200,0.1);
                this.playSound(600,200,0.1,100);
                break;

            case 'candle-blow':
                this.playSound(300,100,0.05);
                break;

            case 'star-found':
                this.playSound(800,150,0.08);
                this.playSound(1000,150,0.08,75);
                break;

            case 'success':
                this.playSound(600,200,0.1);
                this.playSound(800,200,0.1,100);
                this.playSound(1000,200,0.1,200);
                break;

            case 'secret-unlock':
                this.playSound(1200,300,0.1);
                this.playSound(1500,300,0.1,150);
                break;

            case 'click':
                this.playSound(500,50,0.05);
                break;
        }
    }

    static playSound(frequency, duration, volume = 0.1, delay = 0) {
        if (!this.audioContext || this.audioContext.state !== 'running') return;

        const now = this.audioContext.currentTime + delay / 1000;

        const oscillator = this.audioContext.createOscillator();
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(volume, now);
        gainNode.gain.exponentialRampToValueAtTime(
            0.001,
            now + duration / 1000
        );

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start(now);
        oscillator.stop(now + duration / 1000);

        oscillator.onended = () => {
            oscillator.disconnect();
            gainNode.disconnect();
        };
    }

    static toggle() {
        this.enabled = !this.enabled;

        if (this.audioToggle) {
            this.audioToggle.classList.toggle('muted');
            this.audioToggle.textContent = this.enabled ? '🔊' : '🔇';
        }

        if (this.bgMusic) {
            if (this.enabled) {
                this.bgMusic.play().catch(() => {});
            } else {
                this.bgMusic.pause();
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => AudioManager.init());
