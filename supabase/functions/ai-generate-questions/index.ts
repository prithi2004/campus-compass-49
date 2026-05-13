import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json() as {
      messages: ChatMessage[];
      context?: { subject?: string; units?: string[] };
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are an expert academic question-paper assistant for university exams.
You help faculty design and generate exam questions on demand.

Subject: ${context?.subject || "(not specified)"}
Available Units: ${(context?.units || []).join(", ") || "(not specified)"}

When the user asks you to generate questions, ALWAYS call the "generate_questions" tool with a list of well-formed questions.
For ordinary chat (clarifications, explanations, follow-ups) reply in plain text WITHOUT calling the tool.

Guidelines for generated questions:
- Match the requested unit(s), difficulty, Bloom's level, marks and count.
- Vary question types appropriately (short/descriptive/numerical/mcq).
- Prefer concise, clear, exam-quality wording.
- Default marks: 2 for short, 8 for descriptive, 16 for long; respect explicit user marks.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          tools: [
            {
              type: "function",
              function: {
                name: "generate_questions",
                description:
                  "Return a list of newly authored exam questions matching the user's request.",
                parameters: {
                  type: "object",
                  properties: {
                    intro: {
                      type: "string",
                      description: "Short message to display alongside the questions.",
                    },
                    questions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          question: { type: "string" },
                          type: {
                            type: "string",
                            enum: ["short", "descriptive", "mcq", "numerical"],
                          },
                          marks: { type: "number" },
                          unit: { type: "string", description: "e.g. 'Unit 1'" },
                          difficulty: {
                            type: "string",
                            enum: ["easy", "medium", "hard"],
                          },
                          bloom_level: {
                            type: "string",
                            enum: [
                              "Remember",
                              "Understand",
                              "Apply",
                              "Analyze",
                              "Evaluate",
                              "Create",
                            ],
                          },
                        },
                        required: [
                          "question",
                          "type",
                          "marks",
                          "unit",
                          "difficulty",
                          "bloom_level",
                        ],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["questions"],
                  additionalProperties: false,
                },
              },
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please retry shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error:
              "AI credits exhausted. Add credits in Settings → Workspace → Usage.",
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const msg = data.choices?.[0]?.message;
    const toolCall = msg?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(
        JSON.stringify({
          reply: parsed.intro || `Generated ${parsed.questions?.length ?? 0} question(s).`,
          questions: parsed.questions || [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ reply: msg?.content || "(no response)", questions: [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("ai-generate-questions error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
