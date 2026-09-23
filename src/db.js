import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import dotenv from "dotenv";

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(backendDir, ".env") });

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;
export const pool = connectionString ? new Pool({ connectionString, max: 10, ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined }) : null;

export const DEMO_PATIENT_ID = "00000000-0000-0000-0000-000000000001";
export const DEMO_DOCTOR_ID = "00000000-0000-0000-0000-000000000002";
export const DEMO_STAFF_ID = "00000000-0000-0000-0000-000000000003";

export async function query(text, params = []) {
  if (!pool) throw new Error("DATABASE_URL is not configured");
  return pool.query(text, params);
}

export async function initDb() {
  if (!pool) {
    if (process.env.DEMO_MODE === "true") return;
    throw new Error("DATABASE_URL is required unless DEMO_MODE=true");
  }
  const schemaPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../sql/schema.sql");
  const schema = await fs.readFile(schemaPath, "utf8");
  await pool.query(schema);
}

const defaultState = {
  user: { name: "Swyom Sharma", email: "patient@carepath.demo", role: "patient", authenticated: true },
  records: [
    { id: "r1", name: "Complete Blood Count.pdf", type: "Blood report", date: "2026-08-12", size: "1.2 MB" },
    { id: "r2", name: "Chest X-Ray.png", type: "X-ray", date: "2026-07-28", size: "2.8 MB" },
    { id: "r3", name: "Prescription - Dr. Mehta.pdf", type: "Prescription", date: "2026-08-02", size: "640 KB" }
  ],
  shares: [], shareAudit: [], allergies: [],
  meds: [
    { id: "m1", name: "Amoxicillin 500 mg", schedule: "08:00", frequency: "Twice daily", instructions: "After food", taken: {} },
    { id: "m2", name: "Paracetamol 500 mg", schedule: "14:00", frequency: "Once daily", instructions: "Only if needed", taken: {} },
    { id: "m3", name: "Vitamin D3", schedule: "20:00", frequency: "Once daily", instructions: "After dinner", taken: {} }
  ]
};

import { loadJson, saveJson } from "./persistence.js";

let inMemoryStates = loadJson("meta_patient_states.json", {});

export function cloneDefaultState() {
  return JSON.parse(JSON.stringify(defaultState));
}

export async function ensurePatientState(userId) {
  if (!pool) {
    if (!inMemoryStates[userId]) {
      inMemoryStates[userId] = cloneDefaultState();
      saveJson("meta_patient_states.json", inMemoryStates);
    }
    return inMemoryStates[userId];
  }
  const existing = await query("SELECT state FROM patient_state WHERE user_id=$1", [userId]);
  if (existing.rowCount) return existing.rows[0].state;
  const state = cloneDefaultState();
  await query("INSERT INTO patient_state(user_id,state) VALUES($1,$2::jsonb) ON CONFLICT (user_id) DO NOTHING", [userId, JSON.stringify(state)]);
  return state;
}

export async function savePatientState(userId, state) {
  if (!pool) {
    inMemoryStates[userId] = state;
    saveJson("meta_patient_states.json", inMemoryStates);
    return state;
  }
  await query("INSERT INTO patient_state(user_id,state) VALUES($1,$2::jsonb) ON CONFLICT (user_id) DO UPDATE SET state=EXCLUDED.state,updated_at=now()", [userId, JSON.stringify(state)]);
  return state;
}
