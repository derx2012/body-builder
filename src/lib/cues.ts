let ctx: AudioContext | null = null;

/** Короткий звуковой сигнал через WebAudio; без файлов, работает офлайн. */
export function beep(frequency = 880, durationMs = 150): void {
  try {
    ctx ??= new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch {
    // Звук недоступен — тренировка идёт без него.
  }
}

/** Озвучивает фразу русским голосом системы, обрывая предыдущую. */
export function say(text: string): void {
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ru-RU';
    speechSynthesis.speak(u);
  } catch {
    // Синтез речи недоступен.
  }
}

export function vibrate(ms = 200): void {
  try {
    navigator.vibrate?.(ms);
  } catch {
    // Вибрация недоступна.
  }
}
