import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";

export async function GET() {
  const diagnostics = {
    env: {
      R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID ? "Configured (starts with " + process.env.R2_ACCESS_KEY_ID.slice(0, 4) + ")" : "MISSING",
      R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY ? "Configured (starts with " + process.env.R2_SECRET_ACCESS_KEY.slice(0, 4) + ")" : "MISSING",
      R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID ? "Configured (starts with " + process.env.R2_ACCOUNT_ID.slice(0, 4) + ")" : "MISSING",
      R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || "MISSING",
      R2_PUBLIC_URL: process.env.R2_PUBLIC_URL || "MISSING",
    },
    testWrite: null,
    testRead: null,
    overall: "Unknown",
  };

  if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_ACCOUNT_ID || !process.env.R2_BUCKET_NAME) {
    diagnostics.overall = "Failed: Missing Environment Variables";
    return NextResponse.json(diagnostics, { status: 400 });
  }

  let r2Client;
  try {
    r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
  } catch (err) {
    diagnostics.overall = "Failed: Client Initialization Error";
    diagnostics.clientInitError = { message: err.message, name: err.name };
    return NextResponse.json(diagnostics, { status: 500 });
  }

  // 1. Test Write
  const testKey = "data/r2-test-connection.json";
  const testData = { success: true, timestamp: new Date().toISOString() };
  try {
    await r2Client.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: testKey,
      Body: JSON.stringify(testData, null, 2),
      ContentType: "application/json",
    }));
    diagnostics.testWrite = "Success";
  } catch (err) {
    diagnostics.testWrite = "Failed";
    diagnostics.testWriteError = {
      message: err.message,
      name: err.name,
      code: err.code,
      statusCode: err.$metadata?.httpStatusCode,
    };
  }

  // 2. Test Read
  if (diagnostics.testWrite === "Success") {
    try {
      const res = await r2Client.send(new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: testKey,
      }));
      const text = await res.Body.transformToString("utf-8");
      const parsed = JSON.parse(text);
      diagnostics.testRead = parsed.success ? "Success" : "Failed (data mismatch)";
    } catch (err) {
      diagnostics.testRead = "Failed";
      diagnostics.testReadError = {
        message: err.message,
        name: err.name,
        code: err.code,
        statusCode: err.$metadata?.httpStatusCode,
      };
    }
  }

  if (diagnostics.testWrite === "Success" && diagnostics.testRead === "Success") {
    diagnostics.overall = "Success! Cloudflare R2 is fully configured and working.";
    return NextResponse.json(diagnostics);
  } else {
    diagnostics.overall = "Failed: Connection test failed. See error details.";
    return NextResponse.json(diagnostics, { status: 500 });
  }
}
