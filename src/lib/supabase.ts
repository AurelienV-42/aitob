import { createClient } from "@supabase/supabase-js";
import { Database } from "./types";

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type InsertPost = Database["public"]["Tables"]["posts"]["Insert"];
export type UpdatePost = Database["public"]["Tables"]["posts"]["Update"];
