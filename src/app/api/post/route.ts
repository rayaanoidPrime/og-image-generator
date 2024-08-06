import dbConnect from "@/lib/dbConnect";
import { Post as PostType, MongoPost as MongoPostType } from "@/types/post";
import { NextRequest, NextResponse } from "next/server";
import { GridFSBucket } from "mongodb";

export async function GET(req: NextRequest) {
  const client = await dbConnect();
  const db = client.db("test");
  const collection = db.collection("posts");

  try {
    const searchParams = req.nextUrl.searchParams;
    const postId = searchParams.get("postId");

    if (postId) {
      const post = await collection.findOne({ id: postId });

      if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }

      return NextResponse.json(
        {
          id: post.id,
          title: post.title,
          content: post.content,
          imageUrl: `/api/post/images/${post.imageId}`,
        },
        { status: 200 }
      );
    } else {
      const posts = await collection.find().toArray();

      const postsWithImageUrls = posts.map((post) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        imageUrl: `/api/post/images/${post.imageId}`,
      }));

      return NextResponse.json(postsWithImageUrls, { status: 200 });
    }
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
export async function POST(req: NextRequest) {
  const client = await dbConnect();
  const db = client.db("test");
  const collection = db.collection("posts");
  const bucket = new GridFSBucket(db, { bucketName: "images" });

  try {
    const { id, title, content, image } = (await req.json()) as PostType;

    if (!id || !title || !content) {
      return NextResponse.json(
        { error: "Id, Title and content are required" },
        { status: 400 }
      );
    }

    let newPost: MongoPostType = {
      id,
      title,
      content,
    };

    let imageBuffer: Buffer | null = null;
    if (image) {
      imageBuffer = Buffer.from(image.split(",")[1], "base64");
      // Save image to GridFS
      const uploadStream = bucket.openUploadStream(id);
      uploadStream.end(imageBuffer);

      newPost.imageId = uploadStream.id;
      newPost.image = imageBuffer;
    }
    await collection.insertOne(newPost);
    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Failed to create post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      {
        status: 500,
      }
    );
  }
}
