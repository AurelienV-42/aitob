"use client";

import { useGeneratePost } from "@/lib/hooks/useGeneratePost";
import { useState } from "react";

interface PostGeneratorProps {
  onClose: () => void;
}

export function PostGenerator({ onClose }: PostGeneratorProps) {
  const [topic, setTopic] = useState("Je recommence à poster !");
  const [audience, setAudience] = useState("managers et entrepreneurs");
  const [length, setLength] = useState(80);
  const generatePost = useGeneratePost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await generatePost.mutateAsync({
        topic,
        post_type: "article",
        audience,
        length,
      });
      onClose();
    } catch {
      alert("Une erreur est survenue lors de la génération");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-4">
      <div>
        <label
          htmlFor="topic"
          className="block text-sm font-medium text-gray-700"
        >
          Sujet
        </label>
        <input
          type="text"
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label
          htmlFor="audience"
          className="block text-sm font-medium text-gray-700"
        >
          Audience
        </label>
        <input
          type="text"
          id="audience"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label
          htmlFor="length"
          className="block text-sm font-medium text-gray-700"
        >
          Longueur
        </label>
        <input
          type="number"
          id="length"
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          min={1}
          max={280}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
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
          disabled={generatePost.isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {generatePost.isPending ? "Génération..." : "Générer"}
        </button>
      </div>
    </form>
  );
}
