import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { cookies } from "next/headers";
import { isValidSession, SESSION_COOKIE } from "@/lib/auth";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

import { getCloudflareContext } from "@opennextjs/cloudflare";

function getNativeR2() {
  try {
    const ctx = getCloudflareContext();
    return ctx?.env?.R2_BUCKET || null;
  } catch {
    return null;
  }
}

function useBlob() {
  return Boolean(getNativeR2() || process.env.R2_ACCESS_KEY_ID?.trim());
}

let _r2 = null;
function getR2() {
  if (_r2) return _r2;
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  _r2 = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId:     process.env.R2_ACCESS_KEY_ID?.trim(),
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY?.trim(),
    },
  });
  return _r2;
}

export async function POST(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!(await isValidSession(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Image is too large (max 8MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.jpg`;

  if (useBlob()) {
    const key = `uploads/${filename}`;
    const nativeR2 = getNativeR2();
    if (nativeR2) {
      await nativeR2.put(key, buffer, {
        httpMetadata: { contentType: "image/jpeg" },
      });
    } else {
      await getR2().send(new PutObjectCommand({
        Bucket:      process.env.R2_BUCKET_NAME?.trim(),
        Key:         key,
        Body:        buffer,
        ContentType: "image/jpeg",
      }));
    }
    // Return the public R2 URL (requires public access enabled on the bucket)
    return NextResponse.json({ url: `${process.env.R2_PUBLIC_URL?.trim()}/${key}` });
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return NextResponse.json({ url: `/uploads/${filename}` });
}
