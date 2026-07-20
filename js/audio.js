/* ========================================
   AUDIO.JS - Audio Manager
   Sound effects and background music
   ======================================== */

// ===== AUDIO MANAGER =====
class AudioManager {
    static sounds = {};
    static enabled = true;
    static audioToggle = document.getElementById('audio-toggle');

    static init() {
        // Create audio context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Setup toggle button
        if (this.audioToggle) {
            this.audioToggle.addEventListener('click', () => this.toggle());
        }
        
        this.enabled = true;
    }

    static play(soundName) {
        if (!this.enabled || !this.audioContext) return;
        
        // Create different sounds based on name
        switch(soundName) {
            case 'gift-open':
                this.playSound(400, 200, 0.1);
                this.playSound(600, 200, 0.1, 100);
                break;
            case 'candle-blow':
                this.playSound(300, 100, 0.05);
                break;
            case 'star-found':
                this.playSound(800, 150, 0.08);
                this.playSound(1000, 150, 0.08, 75);
                break;
            case 'success':
                this.playSound(600, 200, 0.1);
                this.playSound(800, 200, 0.1, 100);
                this.playSound(1000, 200, 0.1, 200);
                break;
            case 'secret-unlock':
                this.playSound(1200, 300, 0.1);
                this.playSound(1500, 300, 0.1, 150);
                break;
            case 'click':
                this.playSound(500, 50, 0.05);
                break;
        }
    }

    static playSound(frequency, duration, volume = 0.1, delay = 0) {
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime + (delay / 1000);
        
        // Create oscillator
        const oscillator = this.audioContext.createOscillator();
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        // Create gain node
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + (duration / 1000));
        
        // Connect and play
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start(now);
        oscillator.stop(now + (duration / 1000));
    }

    static toggle() {
        this.enabled = !this.enabled;
        
        if (this.audioToggle) {
            this.audioToggle.classList.toggle('muted');
            this.audioToggle.textContent = this.enabled ? '🔊' : '🔇';
        }
    }
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    AudioManager.init();
});
