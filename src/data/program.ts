export type WorkoutId = 'A' | 'B' | 'C';

/** Основное упражнение круга: диапазон повторов (или секунд), внутри которого идёт прогрессия. */
export interface MainItem {
  exerciseId: string;
  min: number;
  max: number;
}

/** Упражнение разминки или заминки с фиксированным временем без прогрессии. */
export interface TimedItem {
  exerciseId: string;
  seconds: number;
}

/** Одна тренировка недели: разминка, круг основных упражнений и заминка. */
export interface Workout {
  id: WorkoutId;
  title: string;
  focus: string;
  day: string;
  warmup: TimedItem[];
  main: MainItem[];
  cooldown: TimedItem[];
}

export const ROUNDS = 2;
export const REST_BETWEEN_EXERCISES = 10;
export const REST_BETWEEN_ROUNDS = 30;

const WARMUP: TimedItem[] = [
  { exerciseId: 'jumping-jacks', seconds: 30 },
  { exerciseId: 'arm-circles', seconds: 30 },
  { exerciseId: 'inchworm', seconds: 30 },
  { exerciseId: 'cat-cow', seconds: 30 },
];

const COOLDOWN: TimedItem[] = [
  { exerciseId: 'cobra', seconds: 20 },
  { exerciseId: 'childs-pose', seconds: 30 },
  { exerciseId: 'spinal-twist', seconds: 40 },
];

/** Недельная программа в порядке ротации A → B → C. */
export const PROGRAM: Workout[] = [
  {
    id: 'A',
    title: 'Жим + ноги',
    focus: 'Грудь, плечи, трицепс, квадрицепс',
    day: 'ПН',
    warmup: WARMUP,
    main: [
      { exerciseId: 'pushups', min: 8, max: 15 },
      { exerciseId: 'goblet-squat', min: 12, max: 20 },
      { exerciseId: 'arnold-press', min: 8, max: 15 },
      { exerciseId: 'reverse-lunge', min: 8, max: 12 },
      { exerciseId: 'overhead-triceps', min: 10, max: 15 },
    ],
    cooldown: COOLDOWN,
  },
  {
    id: 'B',
    title: 'Тяга + кор',
    focus: 'Спина, задняя поверхность бедра, бицепс, пресс',
    day: 'СР',
    warmup: WARMUP,
    main: [
      { exerciseId: 'db-row', min: 10, max: 15 },
      { exerciseId: 'rdl', min: 10, max: 15 },
      { exerciseId: 'band-pull-apart', min: 12, max: 15 },
      { exerciseId: 'hammer-curl', min: 10, max: 15 },
      { exerciseId: 'dead-bug', min: 6, max: 8 },
      { exerciseId: 'plank', min: 30, max: 45 },
    ],
    cooldown: COOLDOWN,
  },
  {
    id: 'C',
    title: 'Всё тело + мобильность',
    focus: 'Ноги, ягодицы, верх спины, пресс, растяжка',
    day: 'ПТ',
    warmup: WARMUP,
    main: [
      { exerciseId: 'split-squat', min: 8, max: 10 },
      { exerciseId: 'close-pushups', min: 6, max: 10 },
      { exerciseId: 'face-pull', min: 12, max: 15 },
      { exerciseId: 'single-leg-bridge', min: 8, max: 10 },
      { exerciseId: 'mountain-climbers', min: 20, max: 30 },
      { exerciseId: 'reverse-crunch', min: 10, max: 12 },
    ],
    cooldown: [...COOLDOWN, { exerciseId: 'hip-flexor', seconds: 40 }],
  },
];

/** Возвращает тренировку по id; id берётся только из PROGRAM, поэтому отсутствие — ошибка. */
export function getWorkout(id: WorkoutId): Workout {
  const w = PROGRAM.find((x) => x.id === id);
  if (!w) throw new Error(`Unknown workout: ${id}`);
  return w;
}
