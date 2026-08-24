let audioCtx: AudioContext | null = null;
let scratchGain: GainNode | null = null;
let scratchSrc: AudioBufferSourceNode | null = null;

function ctx() {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) audioCtx = new AC();
  if (audioCtx.state === "suspended") void audioCtx.resume();
  return audioCtx;
}

function brownNoise(c: AudioContext, seconds = 1.4) {
  const n = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(1, n, c.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < n; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.4;
  }
  return buf;
}

export function armSfx() {
  ctx();
}

export function setScratch(on: boolean) {
  try {
    const c = ctx();
    if (!c) return;
    if (on) {
      if (scratchSrc) return;
      const src = c.createBufferSource();
      src.buffer = brownNoise(c);
      src.loop = true;
      const filter = c.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1850;
      filter.Q.value = 1.1;
      const g = c.createGain();
      g.gain.value = 0.0001;
      src.connect(filter);
      filter.connect(g);
      g.connect(c.destination);
      src.start();
      g.gain.exponentialRampToValueAtTime(0.045, c.currentTime + 0.04);
      scratchSrc = src;
      scratchGain = g;
    } else if (scratchSrc && scratchGain) {
      const g = scratchGain;
      const src = scratchSrc;
      g.gain.cancelScheduledValues(c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.08);
      scratchSrc = null;
      scratchGain = null;
      window.setTimeout(() => {
        try {
          src.stop();
          src.disconnect();
          g.disconnect();
        } catch {
          /* ignore */
        }
      }, 120);
    }
  } catch {
    /* ignore */
  }
}

export function playMarkerTap() {
  try {
    const c = ctx();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    const f = c.createBiquadFilter();
    o.type = "triangle";
    o.frequency.value = 420;
    f.type = "highpass";
    f.frequency.value = 280;
    g.gain.value = 0.05;
    o.connect(f);
    f.connect(g);
    g.connect(c.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.09);
    o.stop(c.currentTime + 0.1);
  } catch {
    /* ignore */
  }
}
