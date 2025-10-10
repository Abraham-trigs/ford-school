import { FinanceRecord } from "@/types/finance";
// you'd typically use OpenAI, here is abstraction:

interface InsightResponse {
  narrative: string;
}

/**
 * generateFinanceInsight
 * Takes raw finance records, composes a prompt, sends to GPT, returns narrative.
 * You can guard length, token count, fallback behavior.
 */
export async function generateFinanceInsight(records: FinanceRecord[]): Promise<InsightResponse> {
  // Basic fallback
  if (!records.length) {
    return { narrative: "No finance records available to analyze." };
  }

  // Prepare a brief summary data
  const totalIncome = records.filter(r => r.type.toUpperCase().includes("INCOME"))
    .reduce((a, r) => a + r.amount, 0);
  const totalExpense = records.filter(r => !r.type.toUpperCase().includes("INCOME"))
    .reduce((a, r) => a + r.amount, 0);
  const balance = totalIncome - totalExpense;

  // Pick top 3 categories
  const catMap: Record<string, number> = {};
  for (const r of records) {
    const cat = r.type.trim().toLowerCase();
    catMap[cat] = (catMap[cat] || 0) + r.amount;
  }
  const topCats = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat, amt]) => `${cat} (₵${amt.toLocaleString()})`)
    .join(", ");

  // Compose prompt
  const prompt = `
You are a financial insights assistant. Given the following summary:
- Total Income: ${totalIncome}
- Total Expense: ${totalExpense}
- Balance: ${balance}
- Top categories: ${topCats}

Generate a few short, human-readable insights, e.g. trends, warnings, suggestions (max 3 sentences).
`;

  // Invoke GPT / OpenAI API (pseudo code)
  const openaiResponse = await callOpenAI(prompt);

  // Safeguard length
  const narrative = openaiResponse.trim().slice(0, 500); // max 500 chars

  return { narrative };
}

// stub call to OpenAI
async function callOpenAI(prompt: string): Promise<string> {
  // e.g. using OpenAI SDK:
  // const resp = await openai.chat.completions.create({ model: "gpt-4", messages: [{ role: "user", content: prompt }] });
  // return resp.choices[0].message.content;

  // For now, dummy:
  return `Insight: Income is ₵${prompt} ...`; // Replace with real call
}
