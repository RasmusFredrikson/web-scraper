import { InvocationContext } from "@azure/functions";
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const storageAccountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
const containerName = "last-sent-email-timestamp";
const blobName = "last-email-sent.txt";

const blobServiceClient = new BlobServiceClient(
  `https://${storageAccountName}.blob.core.windows.net`,
  new StorageSharedKeyCredential(storageAccountName, storageAccountKey)
);

async function getLastEmailTimestamp(
  context: InvocationContext
): Promise<number | null> {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    if (!(await blobClient.exists())) {
      return null;
    }

    const downloadBlockBlobResponse = await blobClient.download();
    const lastTimestamp = await streamToText(
      downloadBlockBlobResponse.readableStreamBody
    );

    return Number(lastTimestamp);
  } catch (error) {
    context.error("Error reading from Blob Storage:", error);
    return null;
  }
}

export async function shouldSendNewEmail(
  delayMs: number,
  context: InvocationContext
): Promise<boolean> {
  const lastEmailSent = await getLastEmailTimestamp(context);

  if (!lastEmailSent) {
    return true;
  }

  const timeInMsPassed = Date.now() - lastEmailSent;
  return timeInMsPassed > delayMs;
}

export async function updateLastEmailTimestamp(
  lastSent: number,
  context: InvocationContext
): Promise<void> {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlockBlobClient(blobName);

    const now = lastSent.toString();
    await blobClient.upload(now, now.length);
  } catch (error) {
    context.error("Error updating Blob Storage:", error);
  }
}

async function streamToText(
  readable: NodeJS.ReadableStream | undefined
): Promise<string> {
  if (!readable) {
    return "";
  }

  const chunks: Uint8Array[] = [];
  for await (const chunk of readable) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}
