import { EXERCISES } from '../data/exercises';
import { getWorkout } from '../data/program';
import { RATING_LABELS } from '../lib/progression';
import { parseState, type AppState, type Settings } from '../lib/storage';

interface Props {
  state: AppState;
  onSettings: (s: Settings) => void;
  onImport: (s: AppState) => void;
}

const dateFmt = new Intl.DateTimeFormat('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' });

/** История тренировок, настройки звука и резервная копия данных в JSON-файл. */
export function History({ state, onSettings, onImport }: Props) {
  const sessions = [...state.sessions].reverse();
  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const lastWeek = state.sessions.filter((s) => Date.parse(s.finishedAt) > weekAgo).length;

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `workout-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importData = async (file: File | undefined) => {
    if (!file) return;
    try {
      const next = parseState(await file.text());
      if (confirm(`Заменить данные? В файле ${next.sessions.length} тренировок.`)) onImport(next);
    } catch {
      alert('Это не резервная копия приложения');
    }
  };

  return (
    <div className="screen">
      <h1>История</h1>
      <div className="stats">
        <div>
          <strong>{state.sessions.length}</strong>
          <span className="muted small">всего</span>
        </div>
        <div>
          <strong>{lastWeek}/3</strong>
          <span className="muted small">за 7 дней</span>
        </div>
      </div>

      {sessions.length === 0 && <p className="muted">Пока пусто — первая тренировка появится здесь.</p>}
      <ul className="history">
        {sessions.map((s) => {
          const minutes = Math.round((Date.parse(s.finishedAt) - Date.parse(s.startedAt)) / 60000);
          return (
            <li key={s.id}>
              <div className="history-head">
                <strong>
                  {s.workoutId} · {getWorkout(s.workoutId).title}
                </strong>
                <span className="muted small">
                  {dateFmt.format(new Date(s.finishedAt))} · {minutes} мин
                </span>
              </div>
              <p className="muted small">
                {Object.entries(s.ratings)
                  .map(([id, r]) => `${EXERCISES[id]?.name ?? id} ${s.targets[id]} — ${RATING_LABELS[r].toLowerCase()}`)
                  .join(' · ')}
              </p>
            </li>
          );
        })}
      </ul>

      <h2>Настройки</h2>
      <label className="toggle">
        <input type="checkbox" checked={state.settings.sound} onChange={(e) => onSettings({ ...state.settings, sound: e.target.checked })} />
        Звуковые сигналы
      </label>
      <label className="toggle">
        <input type="checkbox" checked={state.settings.voice} onChange={(e) => onSettings({ ...state.settings, voice: e.target.checked })} />
        Голосовые подсказки
      </label>

      <h2>Резервная копия</h2>
      <div className="row">
        <button className="secondary" onClick={exportData}>
          Сохранить в файл
        </button>
        <label className="secondary file">
          Загрузить из файла
          <input type="file" accept="application/json" onChange={(e) => importData(e.target.files?.[0])} hidden />
        </label>
      </div>
      <p className="muted small">Фото упражнений — free-exercise-db (public domain).</p>
    </div>
  );
}
