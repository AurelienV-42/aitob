import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response(JSON.stringify({ error: "Code non fourni" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const clientId = Deno.env.get("LINKEDIN_CLIENT_ID");
  const clientSecret = Deno.env.get("LINKEDIN_CLIENT_SECRET");
  const redirectUri = Deno.env.get("LINKEDIN_REDIRECT_URI");

  if (!clientId || !clientSecret || !redirectUri) {
    return new Response(JSON.stringify({ error: "Configuration manquante" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Échange le code contre un access_token
  const response = await fetch(
    "https://www.linkedin.com/oauth/v2/accessToken",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    return new Response(JSON.stringify(data), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Get the anon key for internal function calls
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseAnonKey) {
    return new Response(
      JSON.stringify({ error: "Supabase anon key missing" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // Call the userinfo function with the access token
  const userinfoResponse = await fetch(
    `https://whfdkupwskspkcpzqwfn.supabase.co/functions/v1/linkedin-userinfo`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ access_token: data.access_token }),
    },
  );

  const userinfoData = await userinfoResponse.json();

  if (!userinfoResponse.ok) {
    return new Response(JSON.stringify(userinfoData), {
      status: userinfoResponse.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(userinfoData), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
