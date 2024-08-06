"usee client";

import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "./ui/use-toast";
import Image from "next/image";
import { usePosts } from "@/context/PostContext";
import { Post } from "@/types/post";

// Inline SVG icons
const ImageIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    width="240"
    height="24"
  >
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      {" "}
      <path
        d="M14.2647 15.9377L12.5473 14.2346C11.758 13.4519 11.3633 13.0605 10.9089 12.9137C10.5092 12.7845 10.079 12.7845 9.67922 12.9137C9.22485 13.0605 8.83017 13.4519 8.04082 14.2346L4.04193 18.2622M14.2647 15.9377L14.606 15.5991C15.412 14.7999 15.8149 14.4003 16.2773 14.2545C16.6839 14.1262 17.1208 14.1312 17.5244 14.2688C17.9832 14.4253 18.3769 14.834 19.1642 15.6515L20 16.5001M14.2647 15.9377L18.22 19.9628M18.22 19.9628C17.8703 20 17.4213 20 16.8 20H7.2C6.07989 20 5.51984 20 5.09202 19.782C4.7157 19.5903 4.40973 19.2843 4.21799 18.908C4.12583 18.7271 4.07264 18.5226 4.04193 18.2622M18.22 19.9628C18.5007 19.9329 18.7175 19.8791 18.908 19.782C19.2843 19.5903 19.5903 19.2843 19.782 18.908C20 18.4802 20 17.9201 20 16.8V13M11 4H7.2C6.07989 4 5.51984 4 5.09202 4.21799C4.7157 4.40973 4.40973 4.71569 4.21799 5.09202C4 5.51984 4 6.0799 4 7.2V16.8C4 17.4466 4 17.9066 4.04193 18.2622M18 9V6M18 6V3M18 6H21M18 6H15"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>{" "}
    </g>
  </svg>
);

const CloseIcon = () => (
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
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PostForm: React.FC = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addPost } = usePosts();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    const newPost: Post = {
      id: Date.now().toString(),
      title,
      content,
      image,
    };
    try {
      const res = await fetch("/api/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPost),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(
          `Failed to add post, ${resData.error || "Unknown error"}`
        );
      }

      addPost(newPost); // Add the new post to the global context
      setTitle("");
      setContent("");
      setImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      const { dismiss } = toast({
        title: "Post created!",
        description: "Your post has been successfully added to the feed.",
      });
      setTimeout(() => {
        dismiss();
      }, 1500);
    } catch (error) {
      const { dismiss } = toast({
        title: "Error",
        description: `${(error as Error).message}`,
        variant: "destructive",
      });
      setTimeout(() => {
        dismiss();
      }, 2000);
    }
  };

  return (
    <div className="w-svw  max-w-2xl mx-auto mt-8">
      <Card className="border-none shadow-none mb-8  ">
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>RG</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Input
                placeholder="Title"
                value={title}
                onChange={handleTitleChange}
                className="mb-2 text-xl border-none focus:ring-0"
              />
              <Textarea
                placeholder="What's happening?"
                value={content}
                onChange={handleContentChange}
                className="min-h-[100px] text-xl border-none resize-none focus:ring-0"
              />
              {image && (
                <div className="relative mt-2 rounded-2xl overflow-hidden">
                  <Image
                    src={image}
                    alt="Uploaded preview"
                    width={600}
                    height={300}
                    className="w-full h-auto max-h-[300px] object-cover rounded-2xl"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 left-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2"
                    onClick={removeImage}
                  >
                    <CloseIcon />
                  </Button>
                </div>
              )}
              <div className="mt-4 flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-blue-400 hover:bg-blue-50 p-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon />
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 py-2"
                  onClick={handleSubmit}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostForm;
