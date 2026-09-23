import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const storageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../storage");

try {
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
} catch (e) {
  console.warn("Could not ensure storage directory:", e.message);
}

export function loadJson(filename, defaultValue) {
  const filePath = path.join(storageDir, filename);
  try {
    if (!fs.existsSync(filePath)) return defaultValue;
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.warn("[Persistence] Failed to read " + filename + ":", e.message);
    return defaultValue;
  }
}

export function saveJson(filename, data) {
  if (process.env.NODE_ENV === "test" && !process.env.TEST_PERSISTENCE) {
    // In normal test runs, avoid polluting disk unless explicitly testing persistence
    return;
  }
  const filePath = path.join(storageDir, filename);
  const tmpPath = filePath + "." + Date.now() + "." + Math.random().toString(36).slice(2, 8) + ".tmp";
  try {
    const raw = JSON.stringify(data, null, 2);
    fs.writeFileSync(tmpPath, raw, "utf8");
    fs.renameSync(tmpPath, filePath);
  } catch (e) {
    console.warn("[Persistence] Failed to write " + filename + ":", e.message);
    try {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    } catch {}
  }
}
