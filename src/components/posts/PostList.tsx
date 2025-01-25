"use client";

import { usePosts } from "@/lib/hooks/usePosts";
import { addDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { PostGenerator } from "./PostGenerator";
import { PostItem } from "./PostItem";
import {
  PostListEmpty,
  PostListHeader,
  PostListLoading,
} from "./PostListStates";

export function PostList() {
  const { data: posts, isLoading } = usePosts();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  if (isLoading) {
    return <PostListLoading />;
  }

  const getPostingTime = (index: number) => {
    const now = new Date();
    const today8h30 = new Date(now);
    today8h30.setHours(8, 30, 0, 0);

    if (index === 0) {
      if (now < today8h30) {
        return "Aujourd'hui autour de 8h30";
      } else {
        return "Demain autour de 8h30";
      }
    } else if (index === 1) {
      if (now < today8h30) {
        return "Demain autour de 8h30";
      } else {
        return "Après-demain autour de 8h30";
      }
    } else {
      const date = addDays(today8h30, index + 1);
      return format(date, "eeee d MMMM 'autour de 8h30'", {
        locale: fr,
      }).replace(/^\w/, (c) => c.toUpperCase());
    }
  };

  return (
    <div className="space-y-8">
      <PostListHeader onCreateClick={() => setIsCreating(true)} />

      {isCreating && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <PostGenerator onClose={() => setIsCreating(false)} />
        </div>
      )}

      <div className="grid gap-8">
        {posts?.length === 0 ? (
          <PostListEmpty />
        ) : (
          posts?.map((post, index) => (
            <div key={post.id}>
              {getPostingTime(index) && (
                <>
                  <p className="text-sm font-semibold mb-2">
                    {getPostingTime(index)}
                  </p>
                  {/* <div className="h-px bg-gray-200 my-2" /> */}
                </>
              )}
              <PostItem
                post={post}
                editingId={editingId}
                onEdit={setEditingId}
                onEditCancel={() => setEditingId(null)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
