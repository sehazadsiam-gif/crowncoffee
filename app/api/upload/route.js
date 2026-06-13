import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { put } from "@vercel/blob";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_DIMENSION = 1600;
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

// When Vercel Blob is connected, uploaded photos are stored there so they
// persist on Vercel's read-only filesystem. Locally, they're written to
// /public/uploads, same as before.
const USE_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Image is too large (max 8MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const metadata = await sharp(buffer).rotate().metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error("Could not read image dimensions");
    }
  } catch {
    return NextResponse.json({ error: "Unsupported or corrupted image" }, { status: 400 });
  }

  const resized = await sharp(buffer)
    .rotate()
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer();

  const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.webp`;

  if (USE_BLOB) {
    const blob = await put(`uploads/${filename}`, resized, {
      access: "public",
      addRandomSuffix: false,
      contentType: "image/webp",
    });
    return NextResponse.json({ url: blob.url });
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, filename), resized);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
