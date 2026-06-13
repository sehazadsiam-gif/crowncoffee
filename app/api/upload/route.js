import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_DIMENSION = 1600;
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

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

  let pipeline;
  try {
    pipeline = sharp(buffer).rotate();
    const metadata = await pipeline.metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error("Could not read image dimensions");
    }
  } catch {
    return NextResponse.json({ error: "Unsupported or corrupted image" }, { status: 400 });
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.webp`;
  const outputPath = path.join(UPLOAD_DIR, filename);

  await sharp(buffer)
    .rotate()
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toFile(outputPath);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
