"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useToast } from "@/components/ui/use-toast";
import { Post } from "@/types/post";
import { BASE_URL } from "@/lib/utils";

const CopyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const Feed: React.FC = () => {
  const [posts, setPosts] = React.useState<
    (Omit<Post, "image"> & { imageUrl: string })[]
  >([]);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/post");
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        const { dismiss } = toast({
          title: "Failed to fetch posts",
          description: `${(error as Error).message}`,
        });
        setTimeout(() => {
          dismiss();
        }, 1500);
      }
    };

    fetchPosts();
  }, []);

  const copyPostUrl = (postId: string) => {
    const url = `${BASE_URL}/post/${postId}`;
    navigator.clipboard.writeText(url);
    const { dismiss } = toast({
      title: "Copied URL to clipboard!",
      description: "You can now share this post URL with others.",
    });
    setTimeout(() => {
      dismiss();
    }, 1500);
  };

  return (
    <div className="w-full  max-w-lg mx-auto mt-8 space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="border-2 shadow-sm">
          <CardContent className="p-4">
            <h2 className="text-xl font-bold mb-2 text-left">{post.title}</h2>
            <p className="mb-4 text-left">{post.content}</p>
            {post.imageUrl && (
              <Image
                src={post.imageUrl}
                alt="Post image"
                width={300}
                height={200}
                className="w-full h-auto max-h-[300px] object-cover rounded-lg mb-4"
              />
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-blue-500 hover:bg-blue-50"
              onClick={() => copyPostUrl(post.id)}
            >
              <CopyIcon />
              Copy URL
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Feed;
