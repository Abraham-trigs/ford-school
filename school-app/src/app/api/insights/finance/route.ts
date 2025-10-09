// src/app/api/insights/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth/cookies";
import { z } from "zod";
import { getCache, setCache, financeCacheKey } from "@/lib/redis";
import OpenAI from "openai";

// 🔹 Schema validation for GPT output
const financeInsightSchema = z.object({
  summary: z.string(),
  trends: z.array(z.string()),
  recommendations: z.array(z.string()),
});

// 🔹 TTL (seconds)
const CACHE_TTL = 3600; // 1 hour

// 🔹 OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function GET(req: NextRequest) {
  const user = await getUserFromCookie();
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const forceRefresh = searchParams.get("refresh") === "true";
  const cacheKey = financeCacheKey(user.schoolId, "insights");

  try {
    // 🧠 Try cached insight first
    if (!forceRefresh) {
      const cached = await getCache(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    // 📊 Fetch finance data for insight generation
    const records = await prisma.financeRecord.findMany({
      where: { schoolId: user.schoolId },
      select: { type: true, amount: true, date: true, description: true },
      orderBy: { date: "desc" },
    });

    if (!records.length) {
      return NextResponse.json(
        { message: "No finance records found for insight generation." },
        { status: 404 }
      );
    }

    // 🧾 GPT prompt
    const prompt = `
You are an AI financial analyst for a school institution.
Analyze the following finance records:
${JSON.stringify(records, null, 2)}

Respond ONLY in valid JSON with:
{
  "summary": "string",
  "trends": ["string", ...],
  "recommendations": ["string", ...]
}
`;

    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.4,
    });

    const content = gptResponse.choices[0]?.message?.content ?? "{}";

    let parsedData;
    try {
      parsedData = JSON.parse(content);
    } catch {
      throw new Error("Invalid JSON returned by GPT");
    }

    // 🧩 Validate GPT response
    const validated = financeInsightSchema.safeParse(parsedData);
    if (!validated.success) {
      console.error("Invalid GPT output format:", validated.error);
      throw new Error("Invalid GPT output structure");
    }

    // 💾 Cache it
    await setCache(cacheKey, validated.data, CACHE_TTL);

    return NextResponse.json(validated.data);
  } catch (err: any) {
    console.error("❌ Finance Insight Error:", err);
    return NextResponse.json(
      { message: err.message || "Insight generation failed" },
      { status: 500 }
    );
  }
}
