import type { MainItem } from '../data/program';
import { getExercise } from '../data/exercises';

export type Rating = 'easy' | 'ok' | 'hard';

/** Текущая цель по упражнению: число повторов/секунд и ступень усложнения темпа. */
export interface ExerciseProgress {
  target: number;
  stage: number;
}

/** Ступени усложнения без добавления веса: когда диапазон пройден, замедляем темп. */
export const STAGES = ['Обычный темп', 'Вниз медленно — 3 сек', 'Вниз 3 сек + пауза 1 сек внизу'];

/** Длительность одного повтора на каждой ступени темпа, сек. */
export const REP_SECONDS = [3, 4, 5];

export const RATING_LABELS: Record<Rating, string> = {
  easy: 'Легко',
  ok: 'Норм',
  hard: 'Тяжело',
};

const STEPS: Record<Rating, number> = { easy: 2, ok: 1, hard: 0 };

export function initialProgress(item: MainItem): ExerciseProgress {
  return { target: item.min, stage: 0 };
}

function isTimed(item: MainItem): boolean {
  return getExercise(item.exerciseId).measure === 'time';
}

/** Шаг изменения цели: повтор для силовых, 5 секунд для упражнений на время. */
export function unitStep(item: MainItem): number {
  return isTimed(item) ? 5 : 1;
}

/**
 * Диапазон повторов на ступени темпа: чем медленнее повтор, тем меньше повторов, чтобы время подхода не росло.
 * Упражнения на время ступеней не имеют и всегда используют базовый диапазон.
 */
export function rangeFor(item: MainItem, stage: number): { min: number; max: number } {
  if (isTimed(item)) return { min: item.min, max: item.max };
  const k = REP_SECONDS[0] / REP_SECONDS[stage];
  return { min: Math.max(1, Math.round(item.min * k)), max: Math.floor(item.max * k) };
}

/**
 * Считает цель на следующую тренировку по оценке: «легко» +2 шага, «норм» +1, «тяжело» — без изменений.
 * Выход за верх диапазона переводит на следующую ступень темпа с её минимума; на последней ступени цель упирается в максимум.
 */
export function nextProgress(item: MainItem, current: ExerciseProgress, rating: Rating): ExerciseProgress {
  const target = current.target + STEPS[rating] * unitStep(item);
  const { max } = rangeFor(item, current.stage);
  if (target <= max) return { target, stage: current.stage };
  if (!isTimed(item) && current.stage < STAGES.length - 1) {
    return { target: rangeFor(item, current.stage + 1).min, stage: current.stage + 1 };
  }
  return { target: max, stage: current.stage };
}

/** Ручная правка цели кнопками ±; держит значение в пределах диапазона текущей ступени. */
export function adjustTarget(item: MainItem, current: ExerciseProgress, delta: -1 | 1): ExerciseProgress {
  const { min, max } = rangeFor(item, current.stage);
  const target = Math.min(max, Math.max(min, current.target + delta * unitStep(item)));
  return { ...current, target };
}
