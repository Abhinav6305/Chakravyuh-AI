export async function generateRiskExplanation(account) {
  const prompt = `Explain this banking fraud risk in 3 concise executive sentences. Account ${account.id}, risk score ${account.risk_score}, level ${account.risk_level}. Signals: ${(account.explanation || []).join("; ")}.`;

  const groqKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if (groqKey) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "You explain fraud graph risk to bank investigators with calm, precise language." },
          { role: "user", content: prompt }
        ]
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    }
  }

  try {
    const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);
    if (response.ok) return await response.text();
  } catch {
    // Fall through to local deterministic explanation.
  }

  return `${account.id} is classified as ${account.risk_level} risk with a score of ${Number(account.risk_score).toFixed(2)}. The strongest indicators are ${(account.explanation || ["limited graph evidence"]).join(", ")}. Investigators should review connected accounts, shared infrastructure, and recent transaction paths before allowing further exposure.`;
}
