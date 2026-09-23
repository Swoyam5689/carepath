import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

import { fileURLToPath } from "node:url";

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(backendDir, ".env") });

const bucket = process.env.S3_BUCKET;
export const hasS3 = Boolean(bucket && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY);
const s3 = hasS3 ? new S3Client({
  region: process.env.S3_REGION || "ap-south-1",
  endpoint: process.env.S3_ENDPOINT || undefined,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY }
}) : null;
const localRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../storage");

function assertSafePathSegment(value, label) {
  if (!value || typeof value !== "string" || value.includes("..") || value.includes("/") || value.includes("\\")) {
    throw new Error(`Invalid ${label}`);
  }
}

export async function putRecord({ ownerId, recordId, buffer, mime }) {
  assertSafePathSegment(ownerId, "owner id");
  assertSafePathSegment(recordId, "record id");
  const key = `${ownerId}/${recordId}`;
  if (s3) {
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: mime, ServerSideEncryption: "AES256" }));
    return { key, provider: "s3" };
  }
  if (process.env.NODE_ENV === "production" || process.env.DEMO_MODE !== "true") throw new Error("S3 object storage is not configured");
  await fs.mkdir(path.join(localRoot, ownerId), { recursive: true });
  await fs.writeFile(path.join(localRoot, key), buffer, { mode: 0o600 });
  return { key, provider: "local-demo" };
}

export async function signedRecordUrl(key) {
  if (s3) return getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 300 });
  if (process.env.NODE_ENV === "production" || process.env.DEMO_MODE !== "true") throw new Error("S3 object storage is not configured");
  return `/api/files/local/${encodeURIComponent(key)}`;
}

export async function readLocalRecord(key) {
  if (!key || key.includes("..")) throw new Error("Invalid storage key");
  return fs.readFile(path.join(localRoot, key));
}

export function newRecordId() { return randomUUID(); }
