import { BASE_URL } from "@/lib/utils";
import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

// Function to fetch image and extract dominant colors
async function extractDominantColors(imageUrl: string): Promise<string[]> {
  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const { createCanvas, loadImage } = require("canvas");

  const canvas = createCanvas(1, 1);
  const ctx = canvas.getContext("2d");

  const image = await loadImage(buffer);
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const colors = extractColors(imageData.data);
  const dominantColors = getDominantColors(colors);

  return dominantColors;
}

interface ColorsMap {
  [key: string]: number;
}

function extractColors(data: Uint8ClampedArray): ColorsMap {
  const colors: ColorsMap = {};

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const key = `${r},${g},${b}`;
    colors[key] = (colors[key] || 0) + 1;
  }

  return colors;
}

function getDominantColors(colors: ColorsMap): string[] {
  const sortedColors = Object.entries(colors)
    .sort((a, b) => b[1] - a[1])
    .map(([color]) => color);

  return sortedColors.map((color) => {
    const [r, g, b] = color.split(",").map(Number);
    return `rgb(${r},${g},${b})`;
  });
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const postId = searchParams.get("postId");
  const post = await fetch(`/api/post?postId=${postId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());

  const imageUrl = `${post.imageUrl}`;
  const hasImage = post.imageUrl.split("images/")[1] === "" ? false : true;
  const dominantColors = await extractDominantColors(imageUrl);
  const backgroundImage = `linear-gradient(to top, ${
    dominantColors[dominantColors.length - 1]
  } ${hasImage ? "20" : "100"}% , transparent 80%) ${
    hasImage ? `, url(${imageUrl})` : ""
  }`;

  try {
    return new ImageResponse(
      (
        <div
          style={{
            position: "relative",
            display: "flex",
            height: "100%",
            width: "100%",
            backgroundColor: "white",
            color: `white`,
          }}
        >
          <div
            style={{
              position: "absolute",
              backgroundImage,
              height: "100%",
              width: "100%",
              backgroundSize: "100% 100%",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat", // Ensure the image does not repeat
              display: "flex",
              padding: "40px",
              flexDirection: "column",
              // justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignSelf: "flex-end",
                // marginRight: "60px",
              }}
            >
              <img
                src="https://static.vecteezy.com/system/resources/previews/027/395/710/original/twitter-brand-new-logo-3-d-with-new-x-shaped-graphic-of-the-world-s-most-popular-social-media-free-png.png"
                alt="Twitter Logo"
                width="100px"
                height="100px"
                style={{
                  borderRadius: "50px",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                marginTop: hasImage ? "100px" : "0px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignSelf: "stretch",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                  }}
                >
                  <img
                    src="https://github.com/shadcn.png"
                    alt="Profile Photo"
                    width="56"
                    height="56"
                    style={{
                      borderRadius: "28px",
                    }}
                  />
                  <span
                    style={{
                      alignSelf: "center",
                      marginLeft: "10px",
                      fontSize: "30px",
                      fontWeight: "900",
                    }}
                  >
                    @johndoe
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    fontSize: "35px",
                    letterSpacing: "-2px",
                    fontWeight: "600",
                    display: "flex",
                  }}
                >
                  {post.title}
                </div>

                <div
                  style={{
                    marginTop: "20px",
                    fontSize: "25px",
                    display: "flex",
                  }}
                >
                  {post.content.slice(0, 100)}...
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch {
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
