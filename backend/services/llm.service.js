/**
 * Rewrite article using A4F LLM (Gemini 2.0 Flash)
 * Uses Node 20+ native fetch
 * MUST return strict JSON
 */
async function rewriteArticleWithLLM({ original, competitor1, competitor2 }) {
  const prompt = `
You are a senior SEO content editor.

TASK:
Rewrite the ORIGINAL article so that its:
- Structure
- Depth
- Clarity
- Section flow

are comparable to the two COMPETITOR articles, but:
- DO NOT plagiarize
- DO NOT copy sentences
- DO NOT mention competitors

RULES:
- Keep factual accuracy
- Improve clarity and formatting
- Use headings and subheadings
- Make it SEO-optimized
- Neutral, editorial tone (no marketing fluff)

CITATIONS:
At the END, include a section titled "References" listing the competitor URLs.

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "title": "string",
  "content": "string",
  "citations": [
    { "title": "string", "url": "string" }
  ]
}

--- ORIGINAL ARTICLE ---
Title: ${original.title}
Content:
${original.originalContent}

--- COMPETITOR ARTICLE 1 ---
Title: ${competitor1.title}
URL: ${competitor1.url}
Content:
${competitor1.content}

--- COMPETITOR ARTICLE 2 ---
Title: ${competitor2.title}
URL: ${competitor2.url}
Content:
${competitor2.content}
`;

  const response = await fetch("https://api.a4f.co/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.A4F_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "provider-8/gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    }),
  });

  const data = await response.json();

  if (!data?.choices?.[0]?.message?.content) {
    throw new Error("LLM returned empty response");
  }

  // Gemini may wrap JSON in ```json
  const raw = data.choices[0].message.content
    .replace(/```json|```/g, "")
    .trim();

  return JSON.parse(raw);
}

module.exports = { rewriteArticleWithLLM };
