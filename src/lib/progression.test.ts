import { describe, expect, it } from 'vitest';
import { PROGRAM, getWorkout } from '../data/program';
import { getExercise } from '../data/exercises';
import { adjustTarget, nextProgress, rangeFor, STAGES } from './progression';
import { buildSteps, estimateMinutes } from './plan';
import { nextWorkoutId, type Session } from './storage';

const pushups = { exerciseId: 'pushups', min: 8, max: 15 };
const plank = { exerciseId: 'plank', min: 30, max: 60 };

describe('nextProgress', () => {
  it('прибавляет шаги по оценке', () => {
    expect(nextProgress(pushups, { target: 10, stage: 0 }, 'easy')).toEqual({ target: 12, stage: 0 });
    expect(nextProgress(pushups, { target: 10, stage: 0 }, 'ok')).toEqual({ target: 11, stage: 0 });
    expect(nextProgress(pushups, { target: 10, stage: 0 }, 'hard')).toEqual({ target: 10, stage: 0 });
  });

  it('для упражнений на время шаг 5 секунд', () => {
    expect(nextProgress(plank, { target: 30, stage: 0 }, 'ok')).toEqual({ target: 35, stage: 0 });
  });

  it('после верха диапазона переводит на следующую ступень с её минимума', () => {
    expect(nextProgress(pushups, { target: 15, stage: 0 }, 'ok')).toEqual({ target: 6, stage: 1 });
  });

  it('медленный темп уменьшает диапазон повторов пропорционально', () => {
    expect(rangeFor(pushups, 0)).toEqual({ min: 8, max: 15 });
    expect(rangeFor(pushups, 2)).toEqual({ min: 5, max: 9 });
    expect(rangeFor(plank, 2)).toEqual({ min: 30, max: 60 });
  });

  it('на последней ступени упирается в максимум', () => {
    const last = STAGES.length - 1;
    expect(nextProgress(pushups, { target: 9, stage: last }, 'easy')).toEqual({ target: 9, stage: last });
  });

  it('упражнения на время не переходят на ступени темпа', () => {
    expect(nextProgress(plank, { target: 60, stage: 0 }, 'easy')).toEqual({ target: 60, stage: 0 });
  });

  it('ручная правка не выходит за диапазон', () => {
    expect(adjustTarget(pushups, { target: 8, stage: 0 }, -1).target).toBe(8);
    expect(adjustTarget(pushups, { target: 15, stage: 0 }, 1).target).toBe(15);
  });
});

describe('программа', () => {
  it('все упражнения программы есть в справочнике', () => {
    for (const w of PROGRAM) {
      for (const x of [...w.warmup, ...w.main, ...w.cooldown]) expect(() => getExercise(x.exerciseId)).not.toThrow();
    }
  });

  it('от старта до последней ступени прогрессии укладывается в 10–15 минут', () => {
    for (const w of PROGRAM) {
      const atMin = estimateMinutes(buildSteps(w, {}));
      const atMax = Math.max(
        ...STAGES.map((_, stage) =>
          estimateMinutes(
            buildSteps(w, Object.fromEntries(w.main.map((m) => [m.exerciseId, { target: rangeFor(m, stage).max, stage }]))),
          ),
        ),
      );
      expect([w.id, atMin]).toEqual([w.id, expect.toSatisfy((m: number) => m >= 10)]);
      expect([w.id, atMax]).toEqual([w.id, expect.toSatisfy((m: number) => m <= 15)]);
    }
  });

  it('ротация A → B → C → A', () => {
    const s = (workoutId: 'A' | 'B' | 'C') => ({ workoutId }) as Session;
    expect(nextWorkoutId([])).toBe('A');
    expect(nextWorkoutId([s('A')])).toBe('B');
    expect(nextWorkoutId([s('A'), s('B'), s('C')])).toBe('A');
  });

  it('первый шаг круга — без отдыха перед ним, между кругами длинный отдых', () => {
    const steps = buildSteps(getWorkout('A'), {});
    const firstMain = steps.findIndex((s) => s.kind === 'exercise' && s.phase === 'main');
    expect(steps[firstMain - 1].kind).toBe('exercise');
  });
});
