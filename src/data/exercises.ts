export type Measure = 'reps' | 'time';

/** Описание упражнения для экрана и плеера; объём (повторы/секунды) задаётся в программе, не здесь. */
export interface Exercise {
  id: string;
  name: string;
  measure: Measure;
  /** Выполняется на каждую сторону: повторы считаются на сторону, время делится пополам. */
  perSide?: boolean;
  cues: string[];
  /** Папка с фото в free-exercise-db (public/exercises/<imageId>/0.jpg, 1.jpg). */
  imageId?: string;
}

const list: Exercise[] = [
  // Разминка
  {
    id: 'jumping-jacks',
    name: 'Прыжки «звёздочка»',
    measure: 'time',
    imageId: 'Star_Jump',
    cues: ['Мягко на носках', 'Руки над головой на каждом прыжке', 'Соседи снизу? Шагай в стороны без прыжка'],
  },
  {
    id: 'arm-circles',
    name: 'Вращения руками',
    measure: 'time',
    imageId: 'Arm_Circles',
    cues: ['Руки в стороны', 'Половину времени вперёд, половину назад', 'Круги постепенно шире'],
  },
  {
    id: 'inchworm',
    name: 'Гусеница',
    measure: 'time',
    imageId: 'Inchworm',
    cues: ['Наклон, ладони на пол', 'Шагай руками в планку', 'Возвращайся шагами рук к ногам'],
  },
  {
    id: 'cat-cow',
    name: 'Кошка — корова',
    measure: 'time',
    imageId: 'Cat_Stretch',
    cues: ['На четвереньках', 'Выдох — спина круглая, вдох — прогиб', 'Медленно, без рывков'],
  },

  // A — жим и ноги
  {
    id: 'pushups',
    name: 'Отжимания на упорах',
    measure: 'reps',
    imageId: 'Pushups',
    cues: ['Тело — одна прямая линия', 'Локти под 45° к корпусу', 'Грудь ниже уровня упоров', 'Тяжело — с колен'],
  },
  {
    id: 'goblet-squat',
    name: 'Гоблет-присед',
    measure: 'reps',
    imageId: 'Goblet_Squat',
    cues: ['Гантель вертикально у груди', 'Колени по направлению носков', 'Вниз медленно, вверх энергично'],
  },
  {
    id: 'arnold-press',
    name: 'Жим Арнольда',
    measure: 'reps',
    imageId: 'Arnold_Dumbbell_Press',
    cues: ['Старт: ладони к себе у плеч', 'Разворачивай ладони вперёд на подъёме', 'Пресс напряжён, поясницу не прогибать'],
  },
  {
    id: 'reverse-lunge',
    name: 'Обратные выпады с гантелями',
    measure: 'reps',
    perSide: true,
    imageId: 'Dumbbell_Rear_Lunge',
    cues: ['Шаг назад, колено почти касается пола', 'Вес на передней пятке', 'Корпус прямой'],
  },
  {
    id: 'overhead-triceps',
    name: 'Разгибание гантели из-за головы',
    measure: 'reps',
    imageId: 'Standing_Dumbbell_Triceps_Extension',
    cues: ['Одна гантель двумя руками', 'Локти смотрят вперёд и не расходятся', 'Опускай за голову медленно'],
  },

  // B — тяга и кор
  {
    id: 'db-row',
    name: 'Тяга гантелей в наклоне',
    measure: 'reps',
    imageId: 'Bent_Over_Two-Dumbbell_Row',
    cues: ['Наклон ~45°, спина ровная', 'Тяни локти к поясу', 'Сведи лопатки в верхней точке'],
  },
  {
    id: 'rdl',
    name: 'Румынская тяга с гантелями',
    measure: 'reps',
    imageId: 'Stiff-Legged_Dumbbell_Deadlift',
    cues: ['Колени слегка согнуты', 'Таз назад, гантели скользят по ногам', 'Опускай до натяжения задней поверхности бедра'],
  },
  {
    id: 'band-pull-apart',
    name: 'Разведение резинки перед грудью',
    measure: 'reps',
    imageId: 'Band_Pull_Apart',
    cues: ['Руки прямые на уровне плеч', 'Растягивай резинку до груди', 'Лопатки вместе, плечи вниз'],
  },
  {
    id: 'hammer-curl',
    name: 'Молотковые сгибания',
    measure: 'reps',
    imageId: 'Hammer_Curls',
    cues: ['Обе руки одновременно', 'Ладони смотрят друг на друга', 'Локти прижаты, без раскачки'],
  },
  {
    id: 'dead-bug',
    name: 'Мёртвый жук',
    measure: 'reps',
    perSide: true,
    imageId: 'Dead_Bug',
    cues: ['Поясница прижата к полу всё время', 'Опускай противоположные руку и ногу', 'Медленно, с выдохом'],
  },
  {
    id: 'plank',
    name: 'Планка',
    measure: 'time',
    imageId: 'Plank',
    cues: ['Локти под плечами', 'Ягодицы и пресс напряжены', 'Таз не провисает и не задирается'],
  },

  // C — всё тело
  {
    id: 'split-squat',
    name: 'Сплит-присед с гантелями',
    measure: 'reps',
    perSide: true,
    imageId: 'Split_Squat_with_Dumbbells',
    cues: ['Ноги в широком шаге, стопы на месте', 'Опускайся вертикально вниз', 'Переднее колено не уходит внутрь'],
  },
  {
    id: 'close-pushups',
    name: 'Узкие отжимания',
    measure: 'reps',
    imageId: 'Push-Ups_-_Close_Triceps_Position',
    cues: ['Ладони под плечами или уже', 'Локти вдоль корпуса', 'Тяжело — с колен'],
  },
  {
    id: 'face-pull',
    name: 'Тяга резинки к лицу',
    measure: 'reps',
    imageId: 'Face_Pull',
    cues: ['Резинка закреплена на уровне лица', 'Тяни к переносице, локти высоко', 'В конце разверни кисти наружу'],
  },
  {
    id: 'single-leg-bridge',
    name: 'Ягодичный мостик на одной ноге',
    measure: 'reps',
    perSide: true,
    imageId: 'Single_Leg_Glute_Bridge',
    cues: ['Опорная пятка близко к тазу', 'Поднимай таз ягодицей, не поясницей', 'Пауза 1 сек вверху'],
  },
  {
    id: 'mountain-climbers',
    name: 'Альпинист',
    measure: 'time',
    imageId: 'Mountain_Climbers',
    cues: ['Планка на прямых руках', 'Колени к груди поочерёдно', 'Таз не подпрыгивает'],
  },
  {
    id: 'reverse-crunch',
    name: 'Обратные скручивания',
    measure: 'reps',
    imageId: 'Reverse_Crunch',
    cues: ['Руки вдоль тела', 'Подкручивай таз к груди, не размах ногами', 'Медленно опускай'],
  },

  // Заминка
  {
    id: 'cobra',
    name: 'Кобра',
    measure: 'time',
    imageId: 'Lower_Back_Curl',
    cues: ['Лёжа на животе, ладони под плечами', 'Мягко выпрями руки, таз на полу', 'Плечи вниз от ушей'],
  },
  {
    id: 'childs-pose',
    name: 'Поза ребёнка',
    measure: 'time',
    imageId: 'Childs_Pose',
    cues: ['Таз к пяткам', 'Руки вытянуты вперёд', 'Глубокое дыхание животом'],
  },
  {
    id: 'spinal-twist',
    name: 'Скручивание лёжа',
    measure: 'time',
    perSide: true,
    imageId: 'Knee_Across_The_Body',
    cues: ['Колено через корпус к полу', 'Плечи остаются на полу', 'Сигнал на середине — смени сторону'],
  },
  {
    id: 'hip-flexor',
    name: 'Растяжка сгибателей бедра',
    measure: 'time',
    perSide: true,
    imageId: 'Kneeling_Hip_Flexor',
    cues: ['Выпад с коленом на коврике', 'Подкрути таз, сожми ягодицу сзади', 'Сигнал на середине — смени сторону'],
  },
];

/** Справочник упражнений по id; единственный источник названий и подсказок техники. */
export const EXERCISES: Record<string, Exercise> = Object.fromEntries(list.map((e) => [e.id, e]));

/** Возвращает упражнение по id или бросает ошибку — опечатка в программе должна падать сразу. */
export function getExercise(id: string): Exercise {
  const e = EXERCISES[id];
  if (!e) throw new Error(`Unknown exercise: ${id}`);
  return e;
}
