import { BlobNotFoundError, head, put } from "@vercel/blob";
import { createSeedData } from "./seed";
import type { AppData } from "./types";

const BLOB_PATHNAME = "net-worth.json";

function serialize(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

async function downloadBlob(): Promise<AppData> {
  const blob = await head(BLOB_PATHNAME);
  const response = await fetch(blob.downloadUrl);
  if (!response.ok) {
    throw new Error(`Failed to read blob (${response.status})`);
  }
  return (await response.json()) as AppData;
}

export async function readDataFromBlob(): Promise<AppData> {
  try {
    return await downloadBlob();
  } catch (error) {
    if (!(error instanceof BlobNotFoundError)) {
      throw error;
    }

    const seed = createSeedData();
    await writeDataToBlob(seed);
    return seed;
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
