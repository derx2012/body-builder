import { getExercise } from '../data/exercises';
import { REST_BETWEEN_EXERCISES, REST_BETWEEN_ROUNDS, ROUNDS, type Workout } from '../data/program';
import { initialProgress, REP_SECONDS, STAGES, type ExerciseProgress } from './progression';

export type Phase = 'warmup' | 'main' | 'cooldown';

/** Шаг плеера: упражнение (на повторы или время) либо отдых перед следующим упражнением. */
export type Step =
  | {
      kind: 'exercise';
      phase: Phase;
      exerciseId: string;
      measure: 'reps' | 'time';
      amount: number;
      perSide: boolean;
      round?: number;
      stage?: number;
      stageHint?: string;
    }
  | { kind: 'rest'; seconds: number; nextExerciseId: string };

/** Разворачивает тренировку в линейный список шагов с текущими целями прогрессии. */
export function buildSteps(workout: Workout, progress: Record<string, ExerciseProgress>): Step[] {
  const steps: Step[] = [];
  const timed = (phase: Phase, exerciseId: string, seconds: number) => {
    steps.push({ kind: 'exercise', phase, exerciseId, measure: 'time', amount: seconds, perSide: !!getExercise(exerciseId).perSide });
  };

  workout.warmup.forEach((w) => timed('warmup', w.exerciseId, w.seconds));

  for (let round = 1; round <= ROUNDS; round++) {
    workout.main.forEach((item, i) => {
      const ex = getExercise(item.exerciseId);
      const p = progress[item.exerciseId] ?? initialProgress(item);
      if (i > 0 || round > 1) {
        steps.push({ kind: 'rest', seconds: i === 0 ? REST_BETWEEN_ROUNDS : REST_BETWEEN_EXERCISES, nextExerciseId: ex.id });
      }
      steps.push({
        kind: 'exercise',
        phase: 'main',
        exerciseId: ex.id,
        measure: ex.measure,
        amount: p.target,
        perSide: !!ex.perSide,
        round,
        stage: p.stage,
        stageHint: p.stage > 0 ? STAGES[p.stage] : undefined,
      });
    });
  }

  workout.cooldown.forEach((c) => timed('cooldown', c.exerciseId, c.seconds));
  return steps;
}

/** Оценка длительности шага в секундах с учётом темпа; повторы на сторону удваиваются. */
export function stepSeconds(step: Step): number {
  if (step.kind === 'rest') return step.seconds;
  if (step.measure === 'time') return step.amount;
  return step.amount * REP_SECONDS[step.stage ?? 0] * (step.perSide ? 2 : 1);
}

export function estimateMinutes(steps: Step[]): number {
  return Math.round(steps.reduce((s, x) => s + stepSeconds(x), 0) / 60);
}
