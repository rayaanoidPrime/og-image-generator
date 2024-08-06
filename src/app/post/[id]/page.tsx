import { BASE_URL } from "@/lib/utils";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const id = params.id;

  const { title, content, imageUrl } = await fetchPost(id);

  return {
    title: title,
    description: content.slice(0, 10),
    openGraph: {
      images: [
        {
          url: `${BASE_URL}${imageUrl}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  };
}

const fetchPost = async (id: string) => {
  const res = await fetch(`${BASE_URL}/api/post?postId=${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const post = await res.json();
  return post;
};

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await fetchPost(params.id);

  return (
    <div>
      <div>
        <h1>{post.title}</h1>
        <p>{post.content}</p>
      </div>
    </div>
  );
}
