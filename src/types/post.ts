import { ObjectId } from "mongodb";

export interface Post {
  id: string;
  title: string;
  content: string;
  image?: string | null;
}

export interface MongoPost extends Omit<Post, "image"> {
  image?: Buffer | null;
  imageId?: ObjectId;
}
