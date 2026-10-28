import { getExercise } from '../data/exercises';
import { PROGRAM, getWorkout, type WorkoutId } from '../data/program';
import { buildSteps, estimateMinutes } from '../lib/plan';
import { initialProgress, rangeFor, STAGES, type ExerciseProgress } from '../lib/progression';
import { ExerciseImage } from '../components/ExerciseImage';

interface Props {
  workoutId: WorkoutId;
  suggestedId: WorkoutId;
  progress: Record<string, ExerciseProgress>;
  onSelect: (id: WorkoutId) => void;
  onAdjust: (exerciseId: string, delta: -1 | 1) => void;
  onOpenExercise: (exerciseId: string) => void;
  onStart: () => void;
}

/** Экран выбора тренировки: ротация A/B/C, цели по упражнениям и ручная правка цели перед стартом. */
export function Home({ workoutId, suggestedId, progress, onSelect, onAdjust, onOpenExercise, onStart }: Props) {
  const workout = getWorkout(workoutId);
  const minutes = estimateMinutes(buildSteps(workout, progress));
  const warmupSec = workout.warmup.reduce((s, x) => s + x.seconds, 0);
  const cooldownSec = workout.cooldown.reduce((s, x) => s + x.seconds, 0);

  return (
    <div className="screen">
      <div className="chips">
        {PROGRAM.map((w) => (
          <button key={w.id} className={`chip ${w.id === workoutId ? 'active' : ''}`} onClick={() => onSelect(w.id)}>
            {w.id} · {w.day}
            {w.id === suggestedId && <span className="dot" title="Следующая по очереди" />}
          </button>
        ))}
      </div>

      <h1>{workout.title}</h1>
      <p className="muted">{workout.focus}</p>
      <p className="meta">≈ {minutes} мин · {workout.main.length} упражнений × 2 круга</p>

      <button className="primary big" onClick={onStart}>
        Начать
      </button>

      <h2>Разминка · {Math.round(warmupSec / 60)} мин</h2>
      <p className="muted small">{workout.warmup.map((x) => getExercise(x.exerciseId).name).join(' · ')}</p>

      <h2>Основной круг</h2>
      <ul className="ex-list">
        {workout.main.map((item) => {
          const ex = getExercise(item.exerciseId);
          const p = progress[item.exerciseId] ?? initialProgress(item);
          const range = rangeFor(item, p.stage);
          const unit = ex.measure === 'time' ? 'с' : ex.perSide ? 'на сторону' : 'повт.';
          return (
            <li key={item.exerciseId} className="ex-row">
              <button className="ex-open" onClick={() => onOpenExercise(item.exerciseId)}>
                <ExerciseImage exercise={ex} size="sm" />
                <span>
                  <strong>{ex.name}</strong>
                  <span className="muted small">
                    {range.min}–{range.max} · {STAGES[p.stage]}
                  </span>
                </span>
              </button>
              <div className="stepper">
                <button onClick={() => onAdjust(item.exerciseId, -1)} aria-label="Меньше">−</button>
                <span>
                  {p.target}
                  <small>{unit}</small>
                </span>
                <button onClick={() => onAdjust(item.exerciseId, 1)} aria-label="Больше">+</button>
              </div>
            </li>
          );
        })}
      </ul>

      <h2>Заминка · {Math.round(cooldownSec / 60)} мин</h2>
      <p className="muted small">{workout.cooldown.map((x) => getExercise(x.exerciseId).name).join(' · ')}</p>
    </div>
  );
}
