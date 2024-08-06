import dbConnect from "@/lib/dbConnect";
import { downloadImage } from "@/lib/utils";
import { GridFSBucket, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await dbConnect();
  const db = client.db("test");
  const bucket = new GridFSBucket(db, { bucketName: "images" });

  try {
    const imageId = params.id;

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID not provided" },
        { status: 400 }
      );
    }

    const imageBuffer = await downloadImage(new ObjectId(imageId), bucket);

    // Determine the content type (you might want to store this information with your images)
    const contentType = "image/png"; // Default to PNG, adjust as necessary

    return new NextResponse(imageBuffer, {
      headers: { "Content-Type": contentType },
    });
  } catch (error) {
    console.error("Failed to fetch image:", error);
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 }
    );
  }
}
