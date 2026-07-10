import { promises as fs } from "fs";
import path from "path";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { unstable_noStore as noStore } from "next/cache";

const DATA_DIR = path.join(process.cwd(), "data");
const MENU_FILE = path.join(DATA_DIR, "menu.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const BANNERS_FILE = path.join(DATA_DIR, "banners.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

const MENU_BLOB_KEY = "data/menu.json";
const SETTINGS_BLOB_KEY = "data/settings.json";
const BANNERS_BLOB_KEY = "data/banners.json";
const ORDERS_BLOB_KEY = "data/orders.json";

// When R2_ACCESS_KEY_ID is set the app uses Cloudflare R2 for persistence
// (required on Vercel's read-only filesystem). Locally — no env var needed —
// everything falls back to the JSON files in /data, so `npm run dev` keeps
// working with zero setup.
const USE_BLOB = Boolean(process.env.R2_ACCESS_KEY_ID);

// ─── R2 / S3 client (created lazily so the server doesn't crash locally) ──────
let _r2 = null;
function getR2() {
  if (_r2) return _r2;
  const accountId = process.env.R2_ACCOUNT_ID;
  _r2 = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId:     process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
  return _r2;
}

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

// ─── Local file helpers ───────────────────────────────────────────────────────
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

// ─── R2 helpers ───────────────────────────────────────────────────────────────
async function readJsonBlob(key, fallback) {
  try {
    const r2 = getR2();
    const res = await r2.send(new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    }));
    // res.Body is a ReadableStream in Node 18+
    const chunks = [];
    for await (const chunk of res.Body) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    const text = Buffer.concat(chunks).toString("utf-8");
    if (!text) return fallback;
    return JSON.parse(text);
  } catch (err) {
    // NoSuchKey → file doesn't exist yet, return fallback
    if (err.name === "NoSuchKey" || err.$metadata?.httpStatusCode === 404) {
      return fallback;
    }
    throw err;
  }
}

async function writeJsonBlob(key, data) {
  const r2 = getR2();
  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: JSON.stringify(data, null, 2),
    ContentType: "application/json",
    // No CacheControl — we never want stale JSON served from R2's CDN cache.
    // All reads go through the S3 API directly (GetObjectCommand), not the
    // public URL, so CDN caching is irrelevant for correctness.
  }));
  return data;
}

async function listBlobs(prefix) {
  const r2 = getR2();
  const res = await r2.send(new ListObjectsV2Command({
    Bucket: process.env.R2_BUCKET_NAME,
    Prefix: prefix,
  }));
  // Normalise to the same shape as Vercel Blob's list() result
  return (res.Contents || []).map((obj) => ({
    pathname: obj.Key,
    // R2 public URL for direct fetch
    url: `${process.env.R2_PUBLIC_URL}/${obj.Key}`,
  }));
}

// ─── Unified read / write ─────────────────────────────────────────────────────
async function readJson(key, filePath, fallback) {
  if (USE_BLOB) {
    try {
      const data = await readJsonBlob(key, null);
      if (data !== null) return data;
    } catch (err) {
      console.error(`Failed to read R2 blob for key ${key}, falling back to local file:`, err);
    }
  }
  return readJsonFile(filePath, fallback);
}

async function writeJson(key, filePath, data) {
  if (USE_BLOB) return writeJsonBlob(key, data);
  await writeJsonFile(filePath, data);
  return data;
}

// ─── Menu ─────────────────────────────────────────────────────────────────────
export async function getMenu() {
  noStore();
  return readJson(MENU_BLOB_KEY, MENU_FILE, { categories: [], items: [] });
}

export async function saveMenu(menu) {
  return writeJson(MENU_BLOB_KEY, MENU_FILE, menu);
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export async function getSettings() {
  noStore();
  const settings = await readJson(SETTINGS_BLOB_KEY, SETTINGS_FILE, {});
  return {
    siteName: "Crown Coffee",
    tagline: "",
    description: "",
    address: "",
    phone: "",
    mapUrl: "",
    deliveryCharge: 120,
    tableCount: 50,
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

// ─── Banners ──────────────────────────────────────────────────────────────────
export async function getBanners() {
  noStore();
  const data = await readJson(BANNERS_BLOB_KEY, BANNERS_FILE, { banners: [] });
  return { banners: Array.isArray(data.banners) ? data.banners : [] };
}

export async function saveBanners(data) {
  return writeJson(BANNERS_BLOB_KEY, BANNERS_FILE, data);
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export async function getOrders() {
  noStore();

  // 1. Read the consolidated orders list
  const store = await readJson(ORDERS_BLOB_KEY, ORDERS_FILE, { orders: [], counter: 0 });
  const orders = Array.isArray(store.orders) ? store.orders : [];
  const counter = store.counter || 0;

  // 2. List all individual order files in data/orders/
  const individualOrders = [];
  try {
    if (USE_BLOB) {
      // R2 listing
      const blobs = await listBlobs("data/orders/");
      const missingBlobs = blobs.filter((b) => {
        const match = b.pathname.match(/order-(ord-[^.]+)\.json/);
        if (match) {
          const id = match[1];
          return !orders.some((o) => o.orderId === id);
        }
        return false;
      });

      if (missingBlobs.length > 0) {
        const fetched = await Promise.all(
          missingBlobs.map(async (b) => {
            try {
              const res = await fetch(b.url);
              if (res.ok) return await res.json();
            } catch (e) {
              console.error("Failed to fetch missing R2 order:", e);
            }
            return null;
          })
        );
        individualOrders.push(...fetched.filter((x) => x && x.status !== "deleted"));
      }
    } else {
      // Local directory listing
      const dirPath = path.join(DATA_DIR, "orders");
      await fs.mkdir(dirPath, { recursive: true });
      const files = await fs.readdir(dirPath);
      const missingFiles = files.filter((f) => {
        const match = f.match(/order-(ord-[^.]+)\.json/);
        if (match) {
          const id = match[1];
          return !orders.some((o) => o.orderId === id);
        }
        return false;
      });

      if (missingFiles.length > 0) {
        const readFiles = await Promise.all(
          missingFiles.map((f) => readJsonFile(path.join(dirPath, f), null))
        );
        individualOrders.push(...readFiles.filter((x) => x && x.status !== "deleted"));
      }
    }
  } catch (err) {
    console.error("Error during order list reconciliation:", err);
  }

  // 3. Self-healing: Merge missing orders back into compiled list
  if (individualOrders.length > 0) {
    orders.push(...individualOrders);
    orders.sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
    store.orders = orders;
    await saveOrders(store);
  }

  return { orders, counter };
}

export async function saveOrders(data) {
  return writeJson(ORDERS_BLOB_KEY, ORDERS_FILE, data);
}

export async function addOrder(orderData) {
  const store = await getOrders();
  const newCounter = (store.counter || 0) + 1;

  const uniqueId = `ord-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const newOrder = {
    ...orderData,
    orderId: uniqueId,
    orderNumber: `#${String(newCounter).padStart(3, "0")}`,
    status: "pending",
    placedAt: new Date().toISOString(),
  };

  // 1. Write isolated order file (guarantees order can never be lost/overwritten)
  const orderFile = path.join(DATA_DIR, "orders", `order-${uniqueId}.json`);
  const orderBlobKey = `data/orders/order-${uniqueId}.json`;
  await writeJson(orderBlobKey, orderFile, newOrder);

  // 2. Optimistically append to compiled list
  store.orders.unshift(newOrder);
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

  try {
    const orderFile = path.join(DATA_DIR, "orders", `order-${orderId}.json`);
    const orderBlobKey = `data/orders/order-${orderId}.json`;
    await writeJson(orderBlobKey, orderFile, store.orders[idx]);
  } catch (err) {
    console.error(`Failed to update isolated order file for ${orderId}:`, err);
  }

  return store.orders[idx];
}

export async function deleteOrder(orderId) {
  const store = await getOrders();
  store.orders = store.orders.filter((o) => o.orderId !== orderId);
  await saveOrders(store);

  try {
    const orderFile = path.join(DATA_DIR, "orders", `order-${orderId}.json`);
    const orderBlobKey = `data/orders/order-${orderId}.json`;
    await writeJson(orderBlobKey, orderFile, { orderId, status: "deleted" });
  } catch (err) {
    console.error(`Failed to mark isolated order file as deleted for ${orderId}:`, err);
  }

  return true;
}

// ─── Menu helpers ─────────────────────────────────────────────────────────────
export function groupMenuByCategory(menu) {
  const items = [...(menu.items || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const categories =
    menu.categories && menu.categories.length
      ? menu.categories
      : Array.from(new Set(items.map((i) => i.category)));

  return categories
    .map((category) => ({
      category,
      items: items.filter((item) => item.category === category),
    }))
    .filter((group) => group.items.length > 0);
}
