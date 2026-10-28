import { useState } from 'react';
import { getExercise } from '../data/exercises';
import type { Workout } from '../data/program';
import { RATING_LABELS, type Rating } from '../lib/progression';

interface Props {
  workout: Workout;
  onSave: (ratings: Record<string, Rating>) => void;
}

/** Экран после тренировки: оценка каждого основного упражнения, из которой считается цель на следующий раз. */
export function Rate({ workout, onSave }: Props) {
  const [ratings, setRatings] = useState<Record<string, Rating>>(() =>
    Object.fromEntries(workout.main.map((m) => [m.exerciseId, 'ok' as Rating])),
  );

  return (
    <div className="screen">
      <h1>Как прошло?</h1>
      <p className="muted">«Легко» — в следующий раз +2, «Норм» — +1, «Тяжело» — оставить как есть.</p>
      <ul className="rate-list">
        {workout.main.map((m) => (
          <li key={m.exerciseId}>
            <strong>{getExercise(m.exerciseId).name}</strong>
            <div className="segmented">
              {(Object.keys(RATING_LABELS) as Rating[]).map((r) => (
                <button
                  key={r}
                  className={ratings[m.exerciseId] === r ? `active ${r}` : ''}
                  onClick={() => setRatings({ ...ratings, [m.exerciseId]: r })}
                >
                  {RATING_LABELS[r]}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <button className="primary big" onClick={() => onSave(ratings)}>
        Сохранить
      </button>
    </div>
  );
}
