import { readDataFromBlob, resetDataInBlob, writeDataToBlob } from "./store-blob";
import {
  readDataFromFile,
  resetDataInFile,
  writeDataToFile,
} from "./store-file";
import type { AppData } from "./types";

function isBlobStoreEnabled(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      process.env.BLOB_STORE_ID ||
      process.env.VERCEL === "1",
  );
}

function assertPersistentStoreConfigured(): void {
  if (process.env.VERCEL === "1" && !isBlobStoreEnabled()) {
    throw new Error(
      "Vercel deployment requires a Blob store. Create one in the Vercel project (BLOB_STORE_ID or BLOB_READ_WRITE_TOKEN).",
    );
  }
}

export async function readData(): Promise<AppData> {
  assertPersistentStoreConfigured();
  if (isBlobStoreEnabled()) {
    return readDataFromBlob();
  }
  return readDataFromFile();
}

export async function writeData(data: AppData): Promise<void> {
  assertPersistentStoreConfigured();
  if (isBlobStoreEnabled()) {
    await writeDataToBlob(data);
    return;
  }
  await writeDataToFile(data);
}

export async function resetData(): Promise<AppData> {
  assertPersistentStoreConfigured();
  if (isBlobStoreEnabled()) {
    return resetDataInBlob();
  }
  return resetDataInFile();
}
