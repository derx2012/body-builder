import { useEffect, useMemo, useState } from 'react';
import { getExercise } from './data/exercises';
import { getWorkout, type WorkoutId } from './data/program';
import { buildSteps } from './lib/plan';
import { adjustTarget, initialProgress, nextProgress, rangeFor, STAGES, type Rating } from './lib/progression';
import { loadState, nextWorkoutId, saveState, type AppState } from './lib/storage';
import { ExerciseImage } from './components/ExerciseImage';
import { Home } from './screens/Home';
import { Player } from './screens/Player';
import { Rate } from './screens/Rate';
import { History } from './screens/History';

type Screen = 'home' | 'player' | 'rate' | 'history';

export function App() {
  const [state, setState] = useState<AppState>(loadState);
  const suggestedId = nextWorkoutId(state.sessions);
  const [workoutId, setWorkoutId] = useState<WorkoutId>(suggestedId);
  const [screen, setScreen] = useState<Screen>('home');
  const [startedAt, setStartedAt] = useState('');
  const [openExercise, setOpenExercise] = useState<string | null>(null);

  useEffect(() => saveState(state), [state]);

  const workout = getWorkout(workoutId);
  const steps = useMemo(() => buildSteps(workout, state.progress), [workout, state.progress]);

  const progressOf = (exerciseId: string) => {
    const item = workout.main.find((m) => m.exerciseId === exerciseId)!;
    return { item, current: state.progress[exerciseId] ?? initialProgress(item) };
  };

  const adjust = (exerciseId: string, delta: -1 | 1) => {
    const { item, current } = progressOf(exerciseId);
    setState((s) => ({ ...s, progress: { ...s.progress, [exerciseId]: adjustTarget(item, current, delta) } }));
  };

  const saveSession = (ratings: Record<string, Rating>) => {
    const progress = { ...state.progress };
    const targets: Record<string, number> = {};
    for (const [id, rating] of Object.entries(ratings)) {
      const { item, current } = progressOf(id);
      targets[id] = current.target;
      progress[id] = nextProgress(item, current, rating);
    }
    const session = {
      id: crypto.randomUUID(),
      workoutId,
      startedAt,
      finishedAt: new Date().toISOString(),
      ratings,
      targets,
    };
    setState((s) => ({ ...s, progress, sessions: [...s.sessions, session] }));
    setWorkoutId(nextWorkoutId([session]));
    setScreen('history');
  };

  if (screen === 'player') {
    return (
      <Player
        workout={workout}
        steps={steps}
        settings={state.settings}
        onFinish={() => setScreen('rate')}
        onQuit={(reachedMain) => setScreen(reachedMain ? 'rate' : 'home')}
      />
    );
  }

  if (screen === 'rate') return <Rate workout={workout} onSave={saveSession} />;

  const sheetEx = openExercise ? getExercise(openExercise) : null;
  const sheetItem = openExercise ? workout.main.find((m) => m.exerciseId === openExercise) : undefined;

  return (
    <>
      {screen === 'home' ? (
        <Home
          workoutId={workoutId}
          suggestedId={suggestedId}
          progress={state.progress}
          onSelect={setWorkoutId}
          onAdjust={adjust}
          onOpenExercise={setOpenExercise}
          onStart={() => {
            setStartedAt(new Date().toISOString());
            setScreen('player');
          }}
        />
      ) : (
        <History
          state={state}
          onSettings={(settings) => setState((s) => ({ ...s, settings }))}
          onImport={(next) => {
            setState(next);
            setWorkoutId(nextWorkoutId(next.sessions));
          }}
        />
      )}

      <nav className="tabs">
        <button className={screen === 'home' ? 'active' : ''} onClick={() => setScreen('home')}>
          Тренировка
        </button>
        <button className={screen === 'history' ? 'active' : ''} onClick={() => setScreen('history')}>
          История
        </button>
      </nav>

      {sheetEx && (
        <div className="sheet-backdrop" onClick={() => setOpenExercise(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <ExerciseImage exercise={sheetEx} size="lg" />
            <h2>{sheetEx.name}</h2>
            {sheetItem && (() => {
              const { stage } = progressOf(sheetItem.exerciseId).current;
              const range = rangeFor(sheetItem, stage);
              return (
                <p className="muted">
                  Диапазон {range.min}–{range.max} · {STAGES[stage]}
                </p>
              );
            })()}
            <ul className="cues">
              {sheetEx.cues.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <button className="secondary" onClick={() => setOpenExercise(null)}>
              Закрыть
            </button>
          </div>
        </div>
      )}
    </>
  );
}
