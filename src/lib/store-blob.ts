import { BlobNotFoundError, get, put } from "@vercel/blob";
import { createSeedData } from "./seed";
import type { AppData } from "./types";

const BLOB_PATHNAME = "net-worth.json";

function serialize(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

function isMissingBlobError(error: unknown): boolean {
  if (error instanceof BlobNotFoundError) {
    return true;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes("does not exist") ||
      message.includes("not found") ||
      message.includes("(404)")
    ) {
      return true;
    }
  }

  if (typeof error === "object" && error !== null) {
    const status =
      "status" in error
        ? (error as { status?: unknown }).status
        : "statusCode" in error
          ? (error as { statusCode?: unknown }).statusCode
          : undefined;
    if (status === 404 || status === "404") {
      return true;
    }
  }

  return false;
}

async function seedBlobData(): Promise<AppData> {
  const seed = createSeedData();
  await writeDataToBlob(seed);
  return seed;
}

async function readBlobData(): Promise<AppData> {
  const result = await get(BLOB_PATHNAME, {
    access: "private",
    useCache: false,
  });
  if (!result) {
    throw new BlobNotFoundError();
  }
  if (result.statusCode !== 200 || !result.stream) {
    throw new Error("Failed to read blob");
  }

  const text = await new Response(result.stream).text();
  return JSON.parse(text) as AppData;
}

export async function readDataFromBlob(): Promise<AppData> {
  try {
    return await readBlobData();
  } catch (error) {
    if (!isMissingBlobError(error)) {
      throw error;
    }

    return seedBlobData();
  }
}

export async function writeDataToBlob(data: AppData): Promise<void> {
  await put(BLOB_PATHNAME, serialize(data), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function resetDataInBlob(): Promise<AppData> {
  const seed = createSeedData();
  await writeDataToBlob(seed);
  return seed;
}
