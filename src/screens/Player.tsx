import { useEffect, useMemo, useRef, useState } from 'react';
import { getExercise } from '../data/exercises';
import { ROUNDS, type Workout } from '../data/program';
import type { Step } from '../lib/plan';
import type { Settings } from '../lib/storage';
import { beep, say, vibrate } from '../lib/cues';
import { useWakeLock } from '../lib/useWakeLock';
import { ExerciseImage } from '../components/ExerciseImage';

interface Props {
  workout: Workout;
  steps: Step[];
  settings: Settings;
  onFinish: () => void;
  onQuit: (reachedMain: boolean) => void;
}

const PHASE_LABELS = { warmup: 'Разминка', main: 'Круг', cooldown: 'Заминка' } as const;
const GET_READY_SECONDS = 5;

function amountText(step: Extract<Step, { kind: 'exercise' }>): string {
  if (step.measure === 'time') return `${step.amount} с`;
  return step.perSide ? `×${step.amount} на сторону` : `×${step.amount}`;
}

function spokenAmount(step: Extract<Step, { kind: 'exercise' }>): string {
  if (step.measure === 'time') return `${step.amount} секунд`;
  return `${step.amount} повторов${step.perSide ? ' на каждую сторону' : ''}`;
}

/** Плеер тренировки: ведёт по шагам, считает время, подаёт звук/голос; повторы подтверждаются кнопкой «Готово». */
export function Player({ workout, steps: planSteps, settings, onFinish, onQuit }: Props) {
  useWakeLock();
  const steps = useMemo<Step[]>(() => {
    const first = planSteps.find((s) => s.kind === 'exercise');
    return first?.kind === 'exercise'
      ? [{ kind: 'rest', seconds: GET_READY_SECONDS, nextExerciseId: first.exerciseId }, ...planSteps]
      : planSteps;
  }, [planSteps]);

  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [paused, setPaused] = useState(false);
  const endsAt = useRef(0);
  const lastBeep = useRef(-1);
  const finished = useRef(false);

  const step = steps[index];
  const timed = step.kind === 'rest' || step.measure === 'time';
  const total = step.kind === 'rest' ? step.seconds : step.measure === 'time' ? step.amount : 0;
  const reachedMain = steps.slice(0, index + 1).some((s) => s.kind === 'exercise' && s.phase === 'main');

  const next = () => {
    if (index + 1 >= steps.length) {
      if (finished.current) return;
      finished.current = true;
      if (settings.voice) say('Тренировка завершена. Отлично!');
      onFinish();
    } else {
      setIndex(index + 1);
    }
  };

  useEffect(() => {
    setPaused(false);
    lastBeep.current = -1;
    if (timed) {
      endsAt.current = Date.now() + total * 1000;
      setRemaining(total);
    }
    if (settings.sound) beep(step.kind === 'rest' ? 520 : 880, 250);
    vibrate(150);
    if (settings.voice) {
      if (step.kind === 'rest') {
        const nextEx = getExercise(step.nextExerciseId);
        say(index === 0 ? `Приготовься. Первое: ${nextEx.name}` : `Отдых. Далее: ${nextEx.name}`);
      } else {
        say(`${getExercise(step.exerciseId).name}. ${spokenAmount(step)}`);
      }
    }
    // Шаг сменился — перезапускаем таймер и объявляем; остальные зависимости стабильны в пределах шага.
  }, [index]);

  useEffect(() => {
    if (!timed || paused) return;
    const t = setInterval(() => {
      const left = Math.max(0, Math.ceil((endsAt.current - Date.now()) / 1000));
      setRemaining(left);
      if (left !== lastBeep.current) {
        lastBeep.current = left;
        const half = step.kind === 'exercise' && step.perSide && left === Math.floor(total / 2);
        if (half) {
          if (settings.sound) beep(660, 300);
          if (settings.voice) say('Смена стороны');
          vibrate(300);
        } else if (left > 0 && left <= 3 && settings.sound) {
          beep(440, 120);
        }
      }
      if (left === 0) next();
    }, 200);
    return () => clearInterval(t);
  }, [index, paused, timed]);

  const togglePause = () => {
    if (paused) endsAt.current = Date.now() + remaining * 1000;
    setPaused(!paused);
  };

  const upcoming = steps.slice(index + 1).find((s) => s.kind === 'exercise');
  const exerciseId = step.kind === 'rest' ? step.nextExerciseId : step.exerciseId;
  const ex = getExercise(exerciseId);
  const progressPct = Math.round((index / steps.length) * 100);

  return (
    <div className={`screen player ${step.kind === 'rest' ? 'resting' : ''}`}>
      <div className="player-top">
        <button className="ghost" onClick={() => (confirm('Завершить тренировку?') ? onQuit(reachedMain) : undefined)}>
          ✕
        </button>
        <span className="muted">
          {step.kind === 'rest'
            ? index === 0
              ? 'Приготовься'
              : 'Отдых'
            : step.phase === 'main'
              ? `${PHASE_LABELS.main} ${step.round}/${ROUNDS}`
              : PHASE_LABELS[step.phase]}
          {' · '}
          {workout.id}
        </span>
        <span className="muted">{progressPct}%</span>
      </div>
      <div className="bar">
        <div style={{ width: `${progressPct}%` }} />
      </div>

      <ExerciseImage exercise={ex} size="lg" />

      <h1 className="player-name">
        {step.kind === 'rest' && <span className="muted small">Далее: </span>}
        {ex.name}
      </h1>

      {timed ? (
        <div className="timer">{remaining}</div>
      ) : (
        <div className="timer reps">{amountText(step)}</div>
      )}
      {step.kind === 'exercise' && step.measure === 'time' && step.perSide && <p className="muted">Смена стороны на середине</p>}
      {step.kind === 'exercise' && step.stageHint && <p className="stage">{step.stageHint}</p>}

      {step.kind === 'exercise' && (
        <ul className="cues">
          {ex.cues.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      )}

      <div className="player-controls">
        <button className="ghost" disabled={index === 0} onClick={() => setIndex(index - 1)} aria-label="Назад">
          ⏮
        </button>
        {timed ? (
          <button className="primary" onClick={togglePause}>
            {paused ? 'Продолжить' : 'Пауза'}
          </button>
        ) : (
          <button className="primary" onClick={next}>
            Готово
          </button>
        )}
        <button className="ghost" onClick={next} aria-label="Пропустить">
          ⏭
        </button>
      </div>

      {upcoming?.kind === 'exercise' && step.kind === 'exercise' && (
        <p className="muted small center">Потом: {getExercise(upcoming.exerciseId).name}</p>
      )}
    </div>
  );
}
