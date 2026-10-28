import { useEffect, useState } from 'react';
import type { Exercise } from '../data/exercises';

/** Показывает два кадра упражнения попеременно как анимацию; без фото — заглушка с первой буквой. */
export function ExerciseImage({ exercise, size = 'md' }: { exercise: Exercise; size?: 'sm' | 'md' | 'lg' }) {
  const [frame, setFrame] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    const t = setInterval(() => setFrame((f) => 1 - f), 1000);
    return () => clearInterval(t);
  }, [exercise.id]);

  if (!exercise.imageId || failed) {
    return <div className={`ex-img ex-img-${size} ex-img-placeholder`}>{exercise.name[0]}</div>;
  }

  const src = (n: number) => `${import.meta.env.BASE_URL}exercises/${exercise.imageId}/${n}.jpg`;
  return (
    <div className={`ex-img ex-img-${size}`}>
      {[0, 1].map((n) => (
        <img
          key={n}
          src={src(n)}
          alt={exercise.name}
          style={{ opacity: frame === n ? 1 : 0 }}
          onError={() => setFailed(true)}
        />
      ))}
    </div>
  );
}
