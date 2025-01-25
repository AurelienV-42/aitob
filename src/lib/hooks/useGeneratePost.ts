import { useMutation, useQueryClient } from "@tanstack/react-query";

interface GeneratePostParams {
  topic: string;
  post_type: "article";
  audience: string;
  length: number;
}

export function useGeneratePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: GeneratePostParams) => {
      const response = await fetch(
        "https://whfdkupwskspkcpzqwfn.supabase.co/functions/v1/gen-post",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(params),
        },
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la génération");
      }

      const { text } = await response.json();

      return text;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
