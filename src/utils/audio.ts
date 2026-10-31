// Web Audio API sound generator for app notifications and rewards

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export const playPomodoroChime = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Harmonic bell sequence: C5, E5, G5, C6
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 1.3);
    });
  } catch (e) {
    console.warn('Audio playback not permitted or failed', e);
  }
};

export const playCoinSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Two bright metallic clinks
    [987.77, 1318.51].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.45);
    });
  } catch (e) {
    console.warn('Coin audio failed', e);
  }
};

export const playButtonTap = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch {
    // ignore
  }
};

// Continuous Procedural Ambience Generator
let activeAmbienceNodes: {
  source?: AudioBufferSourceNode;
  gain?: GainNode;
  filter?: BiquadFilterNode;
  intervalId?: NodeJS.Timeout;
} | null = null;

let currentAmbienceVolume = 0.3;

export const setAmbienceVolume = (vol: number) => {
  currentAmbienceVolume = Math.max(0, Math.min(1, vol));
  if (activeAmbienceNodes?.gain && audioCtx) {
    activeAmbienceNodes.gain.gain.setValueAtTime(
      currentAmbienceVolume * 0.15,
      audioCtx.currentTime
    );
  }
};

export const stopAmbience = () => {
  if (activeAmbienceNodes) {
    if (activeAmbienceNodes.intervalId) {
      clearInterval(activeAmbienceNodes.intervalId);
    }
    if (activeAmbienceNodes.gain && audioCtx) {
      try {
        activeAmbienceNodes.gain.gain.linearRampToValueAtTime(
          0.0001,
          audioCtx.currentTime + 0.3
        );
        setTimeout(() => {
          try {
            activeAmbienceNodes?.source?.stop();
            activeAmbienceNodes?.source?.disconnect();
          } catch {
            // ignore
          }
          activeAmbienceNodes = null;
        }, 350);
      } catch {
        activeAmbienceNodes = null;
      }
    } else {
      activeAmbienceNodes = null;
    }
  }
};

export const startAmbience = (type: 'white_noise' | 'forest_sounds', volume = 0.3) => {
  stopAmbience();
  currentAmbienceVolume = volume;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Create 4-second looping noise buffer
    const bufferSize = ctx.sampleRate * 4;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    if (type === 'white_noise') {
      // Soft White/Pink noise for focus
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.1;
        b6 = white * 0.115926;
      }

      const whiteNoiseSource = ctx.createBufferSource();
      whiteNoiseSource.buffer = noiseBuffer;
      whiteNoiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume * 0.18, ctx.currentTime + 0.4);

      whiteNoiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoiseSource.start();
      activeAmbienceNodes = { source: whiteNoiseSource, gain, filter };
    } else {
      // Forest Sounds: Ambient gentle canopy wind + procedural bird chirps
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 2.5; // Brown noise for forest wind
      }

      const windSource = ctx.createBufferSource();
      windSource.buffer = noiseBuffer;
      windSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);
      filter.Q.setValueAtTime(1.2, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume * 0.22, ctx.currentTime + 0.4);

      windSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      windSource.start();

      // Procedural occasional gentle bird chirps every 3-5 seconds
      const birdInterval = setInterval(() => {
        try {
          if (!activeAmbienceNodes || ctx.state === 'suspended') return;
          const chirpNow = ctx.currentTime;
          const osc = ctx.createOscillator();
          const chirpGain = ctx.createGain();

          osc.type = 'sine';
          const baseFreq = 2200 + Math.random() * 800;
          osc.frequency.setValueAtTime(baseFreq, chirpNow);
          osc.frequency.exponentialRampToValueAtTime(baseFreq + 600, chirpNow + 0.08);
          osc.frequency.exponentialRampToValueAtTime(baseFreq - 200, chirpNow + 0.16);

          chirpGain.gain.setValueAtTime(0.001, chirpNow);
          chirpGain.gain.linearRampToValueAtTime(volume * 0.06, chirpNow + 0.03);
          chirpGain.gain.exponentialRampToValueAtTime(0.0001, chirpNow + 0.18);

          osc.connect(chirpGain);
          chirpGain.connect(ctx.destination);

          osc.start(chirpNow);
          osc.stop(chirpNow + 0.2);
        } catch {
          // ignore
        }
      }, 3800);

      activeAmbienceNodes = {
        source: windSource,
        gain,
        filter,
        intervalId: birdInterval,
      };
    }
  } catch (err) {
    console.warn('Ambience playback failed', err);
  }
};
