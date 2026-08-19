import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File | null;
    const message = formData.get("message") as string;
    const language = formData.get("language") as string || "en";

    if (!message && !image) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    // If there is an image, we use Gemini 1.5 Flash
    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Data = buffer.toString('base64');
      const mimeType = image.type;

      const prompt = `You are RoboDoc, an elite medical AI analyst. 
      The user has uploaded a photo. Carefully analyze the image for any visible health indicators or symptoms (e.g. rashes, redness, cuts, burns). 
      You MUST respond using exactly the following format and nothing else. Talk naturally, use commas where appropriate, and do not sound robotic:

      Hey! I am RoboDoc.
      According to my Diagnosis,
      <<Disease/Infection/Cut Name>>: [Include a brief 1-2 sentence description of what you see and what it likely is].
      
      How to treat this disease:
      * [Point 1 on how to improve condition]
      * [Point 2 on how to improve condition]
      * [Point 3 on how to improve condition]
      * [Point 4 on how to improve condition]
      
      What kind of doctor you should see: [Specify the specialist or medical professional].
      
      Emergency Contact: In case of severe emergencies, please dial 911 (US), 112 (Europe), or 108 (India) immediately.

      Language Requirement: 
      ${language === "hi" ? "YOU MUST GENERATE THE ENTIRE RESPONSE IN FLUENT HINDI (Devanagari script). DO NOT USE ENGLISH." : "Generate the response in English."}

      CRITICAL EMERGENCY RULE: If the condition is an emergency (such as a burn, cut, bruise, choking, or cardiac arrest requiring CPR), you MUST skip the diagnosis format above. Instead, you MUST output a brief 1-sentence warning, followed immediately by ONE of the exact EMERGENCY_REDIRECT links below. **CRITICAL: DO NOT TRANSLATE THE "EMERGENCY_REDIRECT:" KEYWORD OR THE URL INTO HINDI. YOU MUST KEEP IT EXACTLY AS WRITTEN IN ENGLISH NO MATTER WHAT LANGUAGE YOU ARE SPEAKING.**
      For Cuts or Bruises:
      EMERGENCY_REDIRECT: https://www.youtube.com/embed/AhANvBB9hz0?autoplay=1
      For Choking:
      EMERGENCY_REDIRECT: https://www.youtube.com/embed/4j329wUsl3s?autoplay=1
      For CPR / Cardiac Arrest:
      EMERGENCY_REDIRECT: https://www.youtube.com/embed/TsJ49Np3HS0?autoplay=1
      For Burns:
      EMERGENCY_REDIRECT: https://www.youtube.com/embed/B51VgoEZcDs?autoplay=1
      For any other emergency, find the closest match.
      
      User message: ${message || "Analyze this image."}`;

      let geminiRes;
      let errText = "";
      let retries = 5;
      let delay = 2000;

      while (retries > 0) {
        const apiKey = process.env.GEMINI_API_KEY || "";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:streamGenerateContent?alt=sse`;
            
        const headers: any = {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey
        };

        geminiRes = await fetch(url, {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data
                  }
                }
              ]
            }],
            generationConfig: {
              temperature: 0.7,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_NONE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_NONE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_NONE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_NONE"
              }
            ]
          })
        });

        if (geminiRes.ok) break;

        errText = await geminiRes.text();
        if (geminiRes.status === 503) {
          await new Promise(res => setTimeout(res, delay));
          delay += 1500;
          retries--;
        } else {
          break; // Fatal error or rate limit, break immediately
        }
      }

      if (!geminiRes || !geminiRes.ok) {
         if (geminiRes?.status === 503) {
            return NextResponse.json({ response: "I apologize, but my visual processing servers are currently experiencing extreme global demand and are temporarily overloaded. Please wait exactly 1 minute and give me a Thumbs Up again!" }, { status: 200 });
         }
         
         if (geminiRes?.status === 429) {
            return NextResponse.json({ response: "I have reached my maximum speed limit! Google only allows me to process a certain number of images per minute. Please wait about 30 seconds and give me a Thumbs Up again!" }, { status: 200 });
         }
         throw new Error(`AI Vision Error: ${errText}`);
      }
      
      // Return the raw SSE stream to the client
      return new Response(geminiRes.body, {
         headers: {
           "Content-Type": "text/event-stream",
           "Cache-Control": "no-cache, no-transform",
           "Connection": "keep-alive",
         },
      });

    } else {
      // Text only: use Llama on Groq
      let systemPrompt = "You are an elite AI health assistant for RoboDoc. Keep your responses short, crisp, and to the point (aim for 2 to 4 sentences). Provide enough detail to be genuinely helpful, but avoid long essays or giant paragraphs. Directly answer the question. DO NOT use disclaimers, do not say 'I cannot provide', and do not refuse to answer.";

      const openAiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "qwen/qwen3.6-27b",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          temperature: 0.7,
          stream: true
        })
      });

      if (!openAiResponse.ok) {
        const errorText = await openAiResponse.text();
        throw new Error(`Groq API Error: ${errorText}`);
      }

      return new Response(openAiResponse.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
        },
      });
    }
  } catch (error: any) {
    console.error("Chat Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process chat" }, { status: 500 });
  }
}
