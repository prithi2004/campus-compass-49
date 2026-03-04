import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfText } = await req.json();

    if (!pdfText || typeof pdfText !== "string" || pdfText.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "No PDF text provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a question paper parser. You receive the text content extracted from a PDF question paper. Your job is to extract individual questions from it.

For each question, determine:
- question: The full question text
- type: One of "short", "long", "mcq", "true-false", "descriptive"
- marks: The marks allocated (look for patterns like "[2 marks]", "(10 marks)", "2M", etc). Default to 5 if unclear.
- unit: The unit/section it belongs to (e.g. "Unit 1"). Default to "Unit 1" if unclear.
- difficulty: "easy", "medium", or "hard" based on mark weight and complexity. 2 marks = easy, 5-8 = medium, 10+ = hard.
- bloomLevel: One of "Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create" based on the question verb.

Extract ALL questions you can find. Ignore headers, instructions, and non-question text.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Extract questions from this PDF content:\n\n${pdfText.slice(0, 15000)}` },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "extract_questions",
                description: "Extract structured questions from a question paper PDF",
                parameters: {
                  type: "object",
                  properties: {
                    questions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          question: { type: "string" },
                          type: { type: "string", enum: ["short", "long", "mcq", "true-false", "descriptive"] },
                          marks: { type: "number" },
                          unit: { type: "string" },
                          difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                          bloomLevel: { type: "string", enum: ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"] },
                        },
                        required: ["question", "type", "marks", "unit", "difficulty", "bloomLevel"],
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
          tool_choice: { type: "function", function: { name: "extract_questions" } },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("AI did not return structured output");
    }

    const parsed = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ questions: parsed.questions || [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-questions error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
