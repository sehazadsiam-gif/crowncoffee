import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const MENU_FILE = path.join(DATA_DIR, "menu.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

export const DEFAULT_THEME = {
  accent: "#B6862C",
  secondary: "#54614A",
  fontPair: "heritage",
};

export const DEFAULT_HOURS = {
  sun: { open: "08:00", close: "22:00", closed: false },
  mon: { open: "08:00", close: "22:00", closed: false },
  tue: { open: "08:00", close: "22:00", closed: false },
  wed: { open: "08:00", close: "22:00", closed: false },
  thu: { open: "08:00", close: "22:00", closed: false },
  fri: { open: "14:30", close: "23:00", closed: false },
  sat: { open: "08:00", close: "22:00", closed: false },
};

async function readJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return fallback;
    throw err;
  }
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

export async function getMenu() {
  return readJson(MENU_FILE, { categories: [], items: [] });
}

export async function saveMenu(menu) {
  await writeJson(MENU_FILE, menu);
  return menu;
}

export async function getSettings() {
  const settings = await readJson(SETTINGS_FILE, {});
  return {
    siteName: "Crown Coffee",
    tagline: "",
    description: "",
    address: "",
    phone: "",
    mapUrl: "",
    hours: DEFAULT_HOURS,
    theme: DEFAULT_THEME,
    ...settings,
    hours: { ...DEFAULT_HOURS, ...(settings.hours || {}) },
    theme: { ...DEFAULT_THEME, ...(settings.theme || {}) },
  };
}

export async function saveSettings(settings) {
  await writeJson(SETTINGS_FILE, settings);
  return settings;
}

/** Returns items grouped by category, in saved order, only for categories that have items. */
export function groupMenuByCategory(menu) {
  const items = [...(menu.items || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const categories = menu.categories && menu.categories.length
    ? menu.categories
    : Array.from(new Set(items.map((i) => i.category)));

  return categories
    .map((category) => ({
      category,
      items: items.filter((item) => item.category === category),
    }))
    .filter((group) => group.items.length > 0);
}
