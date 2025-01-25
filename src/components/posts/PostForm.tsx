import { useUpdatePost } from "@/lib/hooks/usePosts";
import { type Post } from "@/lib/supabase";
import { useState } from "react";

interface PostFormProps {
  post?: Post;
  onClose: () => void;
}

export function PostForm({ post, onClose }: PostFormProps) {
  const updatePost = useUpdatePost();
  const [text, setText] = useState(post?.text ?? "");
  const [topicsInput, setTopicsInput] = useState(
    post?.topics?.join(", ") ?? ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const topics = topicsInput
      .split(",")
      .map((topic) => topic.trim())
      .filter((topic) => topic.length > 0);

    if (post) {
      await updatePost.mutateAsync({
        id: post.id,
        post: {
          text,
          topics,
          posted_at: post.posted_at,
          user_id: post.user_id,
        },
      });
    }

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="text"
          className="block text-sm font-medium text-gray-700"
        >
          Texte
        </label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={16}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label
          htmlFor="topics"
          className="block text-sm font-medium text-gray-700"
        >
          Sujets (séparés par des virgules)
        </label>
        <input
          type="text"
          id="topics"
          value={topicsInput}
          onChange={(e) => setTopicsInput(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="tech, dev, web"
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          Envoyer
        </button>
      </div>
    </form>
  );
}
