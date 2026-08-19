import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { transcript, localTime } = await req.json();

    const systemPrompt = `You are an alarm time extractor. 
    The current real-world local time is ${localTime}. 
    The user is going to say when they want an alarm to ring. 
    Your ONLY job is to figure out what time they mean and output it in strict 24-hour HH:MM format (e.g. 15:30). 
    Do NOT output ANY other text. Do NOT explain your reasoning. Just the HH:MM string.
    If the user says 'in 5 minutes', add 5 minutes to ${localTime}. 
    If the user says 'at 3 pm', output 15:00.
    If they say something completely unrelated to time, just output '12:00'.`;

    const openAiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: transcript }
        ],
        temperature: 0.1,
        max_tokens: 10
      })
    });

    if (!openAiResponse.ok) {
      throw new Error("Failed to parse time");
    }

    const data = await openAiResponse.json();
    const parsedTime = data.choices[0].message.content.trim();

    // Basic validation to ensure it's HH:MM
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (timeRegex.test(parsedTime)) {
        return NextResponse.json({ time: parsedTime }, { status: 200 });
    } else {
        // Fallback to exactly 5 minutes from current time if LLM hallucinates
        const [hh, mm] = localTime.split(":").map(Number);
        const d = new Date();
        d.setHours(hh);
        d.setMinutes(mm + 5);
        const fallback = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        return NextResponse.json({ time: fallback }, { status: 200 });
    }

  } catch (error: any) {
    console.error("Time Parse Error:", error);
    return NextResponse.json({ error: error.message || "Failed to parse time" }, { status: 500 });
  }
}
