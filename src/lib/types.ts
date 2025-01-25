export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: number;
          created_at: string;
          user_id: string;
          text: string;
          topics: string[];
          posted_at: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["posts"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<
          Omit<
            Database["public"]["Tables"]["posts"]["Row"],
            "id" | "created_at"
          >
        >;
      };
    };
  };
}
