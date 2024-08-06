import { type ClassValue, clsx } from "clsx";
import { ObjectId, GridFSBucket } from "mongodb";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function downloadImage(
  imageId: ObjectId,
  bucket: GridFSBucket
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    bucket
      .openDownloadStream(imageId)
      .on("data", (chunk) => chunks.push(chunk))
      .on("error", reject)
      .on("end", () => resolve(Buffer.concat(chunks)));
  });
}

export const BASE_URL = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https:${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : "http://localhost:3000";
