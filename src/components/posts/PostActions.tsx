import { useDeletePost } from "@/lib/hooks/usePosts";
import { type Post } from "@/lib/supabase";
import { X } from "lucide-react";

interface PostActionsProps {
  post: Post;
}

export function PostActions({ post }: PostActionsProps) {
  const deletePost = useDeletePost();

  const handleDelete = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm("Voulez-vous vraiment supprimer cette publication ?")) {
      try {
        await deletePost.mutateAsync(post.id);
      } catch {
        alert("Une erreur est survenue lors de la suppression");
      }
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleDelete}
        disabled={deletePost.isPending}
        className="text-gray-800 hover:text-red-600 transition-colors disabled:opacity-50"
      >
        {deletePost.isPending ? "Suppression..." : <X className="w-4 h-4" />}
      </button>
    </div>
  );
}
