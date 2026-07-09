import { promises as fs } from "fs";
import path from "path";
import { put, get } from "@vercel/blob";

const DATA_DIR = path.join(process.cwd(), "data");
const MENU_FILE = path.join(DATA_DIR, "menu.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const BANNERS_FILE = path.join(DATA_DIR, "banners.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

const MENU_BLOB_KEY = "data/menu.json";
const SETTINGS_BLOB_KEY = "data/settings.json";
const BANNERS_BLOB_KEY = "data/banners.json";
const ORDERS_BLOB_KEY = "data/orders.json";

// When BLOB_READ_WRITE_TOKEN is set (Vercel Blob is connected to the project),
// the menu and settings are stored in Vercel Blob so admin edits persist on
// Vercel's read-only filesystem. Locally (no token), they're read from / written
// to the JSON files in /data, so `npm run dev` keeps working with no setup.
const USE_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

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

async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

async function readJsonFile(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return fallback;
    throw err;
  }
}

async function writeJsonFile(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

async function readJsonBlob(key, fallback) {
  const result = await get(key, { access: "public" });
  if (!result || !result.stream) return fallback;
  const text = await streamToString(result.stream);
  if (!text) return fallback;
  return JSON.parse(text);
}

async function writeJsonBlob(key, data) {
  try {
    await put(key, JSON.stringify(data, null, 2), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    });
    return data;
  } catch (err) {
    console.error(`Failed to write JSON blob for key ${key}:`, err);
    throw err;
  }
}

async function readJson(key, filePath, fallback) {
  if (USE_BLOB) {
    try {
      const data = await readJsonBlob(key, null);
      if (data) return data;
    } catch (err) {
      console.error(`Failed to read JSON blob for key ${key}, falling back to local file:`, err);
    }
  }
  return readJsonFile(filePath, fallback);
}

async function writeJson(key, filePath, data) {
  if (USE_BLOB) return writeJsonBlob(key, data);
  await writeJsonFile(filePath, data);
  return data;
}

export async function getMenu() {
  return readJson(MENU_BLOB_KEY, MENU_FILE, { categories: [], items: [] });
}

export async function saveMenu(menu) {
  return writeJson(MENU_BLOB_KEY, MENU_FILE, menu);
}

export async function getSettings() {
  const settings = await readJson(SETTINGS_BLOB_KEY, SETTINGS_FILE, {});
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
  return writeJson(SETTINGS_BLOB_KEY, SETTINGS_FILE, settings);
}

export async function getBanners() {
  const data = await readJson(BANNERS_BLOB_KEY, BANNERS_FILE, { banners: [] });
  return { banners: Array.isArray(data.banners) ? data.banners : [] };
}

export async function saveBanners(data) {
  return writeJson(BANNERS_BLOB_KEY, BANNERS_FILE, data);
}

// ─── Orders ────────────────────────────────────────────────────────────────

export async function getOrders() {
  const data = await readJson(ORDERS_BLOB_KEY, ORDERS_FILE, { orders: [], counter: 0 });
  return {
    orders: Array.isArray(data.orders) ? data.orders : [],
    counter: data.counter || 0,
  };
}

export async function saveOrders(data) {
  return writeJson(ORDERS_BLOB_KEY, ORDERS_FILE, data);
}

export async function addOrder(orderData) {
  const store = await getOrders();
  const newCounter = (store.counter || 0) + 1;
  const newOrder = {
    ...orderData,
    orderId: String(newCounter).padStart(3, "0"),
    orderNumber: `#${String(newCounter).padStart(3, "0")}`,
    status: "pending",
    placedAt: new Date().toISOString(),
  };
  store.orders.unshift(newOrder); // newest first
  store.counter = newCounter;
  await saveOrders(store);
  return newOrder;
}

export async function updateOrder(orderId, patch) {
  const store = await getOrders();
  const idx = store.orders.findIndex((o) => o.orderId === orderId);
  if (idx === -1) return null;
  store.orders[idx] = { ...store.orders[idx], ...patch };
  await saveOrders(store);
  return store.orders[idx];
}

export async function deleteOrder(orderId) {
  const store = await getOrders();
  store.orders = store.orders.filter((o) => o.orderId !== orderId);
  await saveOrders(store);
  return true;
}

// ─── Menu helpers ───────────────────────────────────────────────────────────

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
