import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

serve(async () => {
  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Supabase configuration missing" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users with access tokens
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("access_token, sub");

    if (usersError || !users) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch users" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const results = [];

    // Process each user
    for (const user of users) {
      // Get pending post for this user
      const { data: post, error: postError } = await supabase
        .from("posts")
        .select("text")
        .eq("user_id", user.sub)
        .is("posted_at", null)
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      if (postError) {
        console.error(`Error fetching posts for user ${user.sub}:`, postError);
        continue;
      }

      try {
        const postResponse = await fetch(
          "https://api.linkedin.com/v2/ugcPosts",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${user.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              author: `urn:li:person:${user.sub}`,
              lifecycleState: "PUBLISHED",
              specificContent: {
                "com.linkedin.ugc.ShareContent": {
                  shareCommentary: {
                    text: post.text,
                  },
                  shareMediaCategory: "NONE",
                },
              },
              visibility: {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
              },
            }),
          },
        );

        if (!postResponse.ok) {
          const error = await postResponse.text();
          console.error(`LinkedIn API error for user ${user.sub}:`, error);
          results.push({
            userId: user.sub,
            status: "error",
            error: `LinkedIn API error: ${error}`,
          });
          continue;
        }

        const postData = await postResponse.json();
        results.push({
          userId: user.sub,
          status: "success",
          post: postData,
        });

        // Mark post as processed by setting posted_at
        await supabase
          .from("posts")
          .update({ posted_at: new Date().toISOString() })
          .eq("user_id", user.sub)
          .eq("text", post.text);
      } catch (error) {
        console.error(`Error posting for user ${user.sub}:`, error);
        results.push({
          userId: user.sub,
          status: "error",
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: "Processing completed",
        results,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message}` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});
