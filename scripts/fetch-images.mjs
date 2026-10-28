// Скачивает фото упражнений из free-exercise-db (public domain) в public/exercises по imageId из справочника.
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';

const BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main';
const source = await readFile(new URL('../src/data/exercises.ts', import.meta.url), 'utf8');
const wanted = [...source.matchAll(/imageId: '([^']+)'/g)].map((m) => m[1]);

const db = await (await fetch(`${BASE}/dist/exercises.json`)).json();
const byId = new Map(db.map((e) => [e.id, e]));
const missing = [];

for (const id of wanted) {
  const entry = byId.get(id);
  if (!entry) {
    missing.push(id);
    continue;
  }
  const dir = new URL(`../public/exercises/${id}/`, import.meta.url);
  await mkdir(dir, { recursive: true });
  for (const [n, img] of entry.images.slice(0, 2).entries()) {
    const file = new URL(`${n}.jpg`, dir);
    if (await access(file).then(() => true, () => false)) continue;
    const res = await fetch(`${BASE}/exercises/${img}`);
    if (!res.ok) throw new Error(`${img}: HTTP ${res.status}`);
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
  }
  console.log(`ok  ${id}`);
}

// Для ненайденных подсказываем похожие id по словам из названия.
for (const id of missing) {
  const words = id.toLowerCase().split(/[_-]+/).filter((w) => w.length > 2);
  const hints = db
    .map((e) => [e.id, words.filter((w) => e.id.toLowerCase().includes(w)).length])
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([hint]) => hint);
  console.log(`MISS ${id} → ${hints.join(', ') || '—'}`);
}
