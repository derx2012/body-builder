import { PROGRAM, type WorkoutId } from '../data/program';
import type { ExerciseProgress, Rating } from './progression';

/** Завершённая тренировка в истории. */
export interface Session {
  id: string;
  workoutId: WorkoutId;
  startedAt: string;
  finishedAt: string;
  ratings: Record<string, Rating>;
  targets: Record<string, number>;
}

export interface Settings {
  sound: boolean;
  voice: boolean;
}

/** Всё состояние приложения; хранится целиком на устройстве, сервера нет. */
export interface AppState {
  version: 1;
  progress: Record<string, ExerciseProgress>;
  sessions: Session[];
  settings: Settings;
}

const KEY = 'workout-state-v1';

export function emptyState(): AppState {
  return { version: 1, progress: {}, sessions: [], settings: { sound: true, voice: true } };
}

/** Читает состояние из localStorage; битые или чужие данные заменяются пустым состоянием. */
export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? parseState(raw) : emptyState();
  } catch {
    return emptyState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Хранилище недоступно (приватный режим) — работаем в памяти.
  }
}

/** Разбирает JSON резервной копии; бросает ошибку, если это не наш формат. */
export function parseState(raw: string): AppState {
  const data = JSON.parse(raw) as Partial<AppState>;
  if (data.version !== 1 || !Array.isArray(data.sessions) || typeof data.progress !== 'object') {
    throw new Error('Неподходящий файл');
  }
  return { ...emptyState(), ...data, settings: { ...emptyState().settings, ...data.settings } } as AppState;
}

/** Следующая тренировка по ротации A → B → C после последней выполненной; пропуски дней не сбивают порядок. */
export function nextWorkoutId(sessions: Session[]): WorkoutId {
  const last = sessions.at(-1);
  if (!last) return PROGRAM[0].id;
  const i = PROGRAM.findIndex((w) => w.id === last.workoutId);
  return PROGRAM[(i + 1) % PROGRAM.length].id;
}
