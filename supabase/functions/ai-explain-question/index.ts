import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, subject, unit, marks, type } = await req.json();

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Question text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are an expert academic content generator for university exam papers.
Given a question, produce a clear explanation and any supplementary visual/code content that the question requires.

Detect the question's needs and generate ANY of the following that apply:
- "diagram": ASCII art OR Mermaid syntax for flowcharts, block diagrams, ER diagrams, UML, circuit diagrams etc.
- "graph": ASCII plot OR a textual description of axes/curve, plus Mermaid where suitable.
- "program": Full working source code (specify language), well commented.
- "table": Markdown table.
- "formula": LaTeX/plain math derivations step by step.
- "explanation": Plain-language explanation of the concept being tested.
- "answer_outline": Bullet outline of an expected model answer suitable for the marks.

Always include "explanation" and "answer_outline". Include the others only when the question genuinely needs them.
Keep content concise but exam-ready. Use Mermaid (mermaid code block) when a diagram is structural; use ASCII when geometric.`;

    const userMsg = `Subject: ${subject || "N/A"}
Unit: ${unit || "N/A"}
Marks: ${marks || "N/A"}
Type: ${type || "N/A"}

Question:
${question}`;

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
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMsg },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "generate_supplementary_content",
                description: "Return structured supplementary content for an exam question.",
                parameters: {
                  type: "object",
                  properties: {
                    explanation: { type: "string" },
                    answer_outline: { type: "string" },
                    diagram: {
                      type: "object",
                      properties: {
                        format: { type: "string", enum: ["mermaid", "ascii", "none"] },
                        content: { type: "string" },
                        caption: { type: "string" },
                      },
                      required: ["format", "content"],
                      additionalProperties: false,
                    },
                    graph: {
                      type: "object",
                      properties: {
                        format: { type: "string", enum: ["mermaid", "ascii", "description", "none"] },
                        content: { type: "string" },
                        caption: { type: "string" },
                      },
                      required: ["format", "content"],
                      additionalProperties: false,
                    },
                    program: {
                      type: "object",
                      properties: {
                        language: { type: "string" },
                        code: { type: "string" },
                      },
                      required: ["language", "code"],
                      additionalProperties: false,
                    },
                    formula: { type: "string" },
                    table: { type: "string" },
                    notes: { type: "string" },
                  },
                  required: ["explanation", "answer_outline"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "generate_supplementary_content" },
          },
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
          JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
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

    return new Response(JSON.stringify({ result: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-explain-question error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
