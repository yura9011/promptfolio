import fs from 'node:fs';
import path from 'node:path';

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');
const CONFIG_PATH = path.join(process.cwd(), 'src', 'lib', 'images.config.json');

function getExcludedSet() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    const { exclude } = JSON.parse(raw);
    return new Set(exclude || []);
  } catch {
    return new Set();
  }
}

function parseTimestamp(str) {
  const year = str.slice(0, 4);
  const month = str.slice(4, 6);
  const day = str.slice(6, 8);
  const hour = str.slice(8, 10);
  const min = str.slice(10, 12);
  return new Date(`${year}-${month}-${day}T${hour}:${min}:00`);
}

function formatDateLabel(date) {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return {
    dayName: days[date.getDay()],
    day: date.getDate(),
    month: months[date.getMonth()],
    year: date.getFullYear(),
    numeric: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
  };
}

export function getAllImages(base = '') {
  if (!fs.existsSync(IMAGES_DIR)) return [];

  const files = fs.readdirSync(IMAGES_DIR);
  const excluded = getExcludedSet();
  const images = [];

  for (const f of files) {
    if (!/\.(jpe?g|png|webp|gif|avif)$/i.test(f)) continue;
    if (excluded.has(f)) continue;

    const stats = fs.statSync(path.join(IMAGES_DIR, f));
    const tsMatch = f.match(/(\d{12})/);
    const date = tsMatch ? parseTimestamp(tsMatch[1]) : stats.mtime;

    const title = f
      .replace(/\s*\(\d+\)/g, '')
      .replace(/_\d{12}.*/, '')
      .replace(/\.[^.]+$/, '')
      .replace(/[_-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, c => c.toUpperCase());

    images.push({
      src: `${base}/images/${f}`,
      date,
      dayKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      title,
    });
  }

  images.sort((a, b) => b.date - a.date);
  return images;
}

export function groupByDay(images) {
  const groups = {};
  for (const img of images) {
    if (!groups[img.dayKey]) {
      groups[img.dayKey] = {
        ...formatDateLabel(img.date),
        dayKey: img.dayKey,
        date: img.date,
        images: [],
      };
    }
    groups[img.dayKey].images.push(img);
  }
  return Object.values(groups).sort((a, b) => b.date - a.date);
}
