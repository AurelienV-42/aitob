import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface ToolCall {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}

interface ToolOutput {
  tool_call_id: string;
  output: string;
}

const OPENAI_API_BASE = "https://api.openai.com/v1";
const ASSISTANT_ID = "asst_GkV4N63WzlyJvrRWRRFNaWWX";

serve(async (req) => {
  try {
    // Handle preflight request
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers":
            "authorization, x-client-info, apikey, content-type",
        },
      });
    }

    // Validate request method
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

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

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key missing" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // Parse and validate request body
    const requestData = await req.json();
    const { topic, post_type, audience, length } = requestData;

    if (!topic || !post_type || !audience || !length) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required parameters: topic, post_type, audience, and length are required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // Validate post_type
    const validPostTypes = ["article", "update", "image", "video"];
    if (!validPostTypes.includes(post_type)) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid post_type. Must be one of: article, update, image, video",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // Validate length
    if (typeof length !== "number" || length <= 0) {
      return new Response(
        JSON.stringify({
          error: "Length must be a positive number",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // console.log("[Step 1] Creating thread");
    const thread = await fetch(
      `${OPENAI_API_BASE}/threads`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2",
        },
      },
    );

    if (!thread.ok) {
      throw new Error(`Failed to create thread: ${await thread.text()}`);
    }

    const threadData = await thread.json();
    const threadId = threadData.id;

    // console.log("[Step 2] Adding message to thread");
    const message = await fetch(
      `${OPENAI_API_BASE}/threads/${threadId}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2",
        },
        body: JSON.stringify({
          role: "user",
          content:
            `Generate a LinkedIn ${post_type} about ${topic} targeted at ${audience}. The post should be approximately ${length} words long.`,
        }),
      },
    );

    if (!message.ok) {
      throw new Error(`Failed to add message: ${await message.text()}`);
    }

    // console.log("[Step 3] Running assistant");
    const run = await fetch(
      `${OPENAI_API_BASE}/threads/${threadId}/runs`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2",
        },
        body: JSON.stringify({
          assistant_id: ASSISTANT_ID,
        }),
      },
    );

    if (!run.ok) {
      throw new Error(`Failed to run assistant: ${await run.text()}`);
    }

    const runData = await run.json();
    const runId = runData.id;

    // console.log("[Step 4] Waiting for completion");
    let runStatus;
    do {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const runCheck = await fetch(
        `${OPENAI_API_BASE}/threads/${threadId}/runs/${runId}`,
        {
          headers: {
            "Authorization": `Bearer ${openaiApiKey}`,
            "OpenAI-Beta": "assistants=v2",
          },
        },
      );
      if (!runCheck.ok) {
        throw new Error(`Failed to check run status: ${await runCheck.text()}`);
      }
      runStatus = await runCheck.json();
    } while (
      runStatus.status === "queued" || runStatus.status === "in_progress"
    );

    if (runStatus.status === "requires_action") {
      // console.log("[Step 4.1] Handling required actions");
      const toolCalls: ToolCall[] =
        runStatus.required_action.submit_tool_outputs.tool_calls;

      // console.log("Tool calls received:", JSON.stringify(toolCalls, null, 2));

      const toolOutputs: ToolOutput[] = toolCalls.map((call) => {
        // Parse the function arguments
        const args = JSON.parse(call.function.arguments);
        // console.log(`Function ${call.function.name} called with:`, args);

        // Return a meaningful response based on the function
        return {
          tool_call_id: call.id,
          output: JSON.stringify({
            success: true,
            message: `Function ${call.function.name} executed successfully.`,
            // Include any relevant data the assistant might need
            data: args,
          }),
        };
      });

      // console.log("[Step 4.2] Submitting tool outputs");
      const submitTools = await fetch(
        `${OPENAI_API_BASE}/threads/${threadId}/runs/${runId}/submit_tool_outputs`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openaiApiKey}`,
            "Content-Type": "application/json",
            "OpenAI-Beta": "assistants=v2",
          },
          body: JSON.stringify({
            tool_outputs: toolOutputs,
          }),
        },
      );

      if (!submitTools.ok) {
        throw new Error(
          `Failed to submit tool outputs: ${await submitTools.text()}`,
        );
      }

      // Continue checking run status
      do {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const runCheck = await fetch(
          `${OPENAI_API_BASE}/threads/${threadId}/runs/${runId}`,
          {
            headers: {
              "Authorization": `Bearer ${openaiApiKey}`,
              "OpenAI-Beta": "assistants=v2",
            },
          },
        );
        if (!runCheck.ok) {
          throw new Error(
            `Failed to check run status: ${await runCheck.text()}`,
          );
        }
        runStatus = await runCheck.json();
      } while (
        runStatus.status === "queued" || runStatus.status === "in_progress"
      );
    }

    if (runStatus.status !== "completed") {
      throw new Error(`Run failed with status: ${runStatus.status}`);
    }

    // console.log("[Step 5] Getting messages");
    const messages = await fetch(
      `${OPENAI_API_BASE}/threads/${threadId}/messages`,
      {
        headers: {
          "Authorization": `Bearer ${openaiApiKey}`,
          "OpenAI-Beta": "assistants=v2",
        },
      },
    );

    if (!messages.ok) {
      throw new Error(`Failed to get messages: ${await messages.text()}`);
    }

    const messagesData = await messages.json();
    const generatedText = String(messagesData.data[0].content[0].text.value)
      .replaceAll(
        "**",
        "",
      ).replaceAll(
        "***",
        "",
      ).replaceAll(
        "##",
        "",
      ).replaceAll(
        "###",
        "",
      );

    // console.log("[Step 6] Saving to database");

    const { error: dbError } = await supabase
      .from("posts")
      .insert({
        user_id: "rKeotMe9mI",
        text: generatedText,
        topics: [topic],
      });

    if (dbError) {
      throw new Error(`Failed to save post: ${dbError.message}`);
    }

    // console.log("[Step 7] Returning response");
    return new Response(
      JSON.stringify({
        text: generatedText,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers":
            "authorization, x-client-info, apikey, content-type",
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers":
            "authorization, x-client-info, apikey, content-type",
        },
      },
    );
  }
});
