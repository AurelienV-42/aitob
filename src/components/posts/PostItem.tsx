import { type Post } from "@/lib/supabase";
import { useState } from "react";
import { PostActions } from "./PostActions";
import { PostForm } from "./PostForm";

interface PostItemProps {
  post: Post;
  editingId: number | null;
  onEdit: (id: number) => void;
  onEditCancel: () => void;
}

export function PostItem({
  post,
  editingId,
  onEdit,
  onEditCancel,
}: PostItemProps) {
  const isEditing = editingId === post.id;
  const [isMoreVisible, setIsMoreVisible] = useState<boolean>(false);

  if (isEditing) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <PostForm post={post} onClose={onEditCancel} />
      </div>
    );
  }

  return (
    <div
      onClick={() => onEdit(post.id)}
      className="border border-gray-300 rounded-lg p-4 space-y-2 bg-white hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div>
            <div className="flex items-center gap-2 h-12 mb-2">
              <div className="w-12 h-12 bg-gray-200 rounded-sm" />
              <div className="ml-1">
                <p className="text-[16px] font-semibold h-[19px] mb-0.5">
                  Aurélien Vandaële
                </p>
                <p className="text-gray-400 font-light text-[12px] h-[14px]">
                  2,300 482 followers
                </p>
                <p className="text-gray-400 font-light text-[12px] h-[14px]">
                  2d
                </p>
              </div>
            </div>
            <p
              className={`text-gray-600 whitespace-pre-wrap ${
                !isMoreVisible && "line-clamp-3"
              }`}
            >
              {post.text}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMoreVisible(!isMoreVisible);
              }}
              className="text-gray-500 text-sm hover:underline mt-1"
            >
              {isMoreVisible ? "...moins" : "...plus"}
            </button>
          </div>
        </div>
        <PostActions post={post} />
      </div>
    </div>
  );
}
