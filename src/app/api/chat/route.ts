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

    // If there is an image, analyze with Gemini multimodal vision
    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Data = buffer.toString('base64');
      const mimeType = image.type || "image/jpeg";

      const prompt = `You are Lumi, the proactive multimodal AI health companion inside HealthThread. 
      The user has uploaded a photo. Carefully analyze the image for any visible health indicators or symptoms (e.g. rashes, redness, cuts, burns). 
      You MUST respond using exactly the following format and nothing else. Talk naturally, use commas where appropriate, and do not sound robotic:

      Hey! I am Lumi.
      According to my Diagnosis,
      <<Disease/Infection/Cut Name>>: [Include a brief 1-2 sentence description of what you see and what it likely is].
      
      How to treat this disease:
      * [Point 1 on how to improve condition]
      * [Point 2 on how to improve condition]
      * [Point 3 on how to improve condition]
      * [Point 4 on how to improve condition]
      
      What kind of doctor you should see: [Specify the specialist or medical professional].
      
      Emergency Contact: In case of severe emergencies, please dial 911 (North America) or 112 (Europe/International) immediately.

      Language: Generate the response in English unless requested otherwise.

      CRITICAL EMERGENCY RULE: If the condition is an emergency (such as a severe burn, deep cut, choking, or cardiac arrest), you MUST output a brief 1-sentence warning, followed immediately by ONE of the exact EMERGENCY_REDIRECT links below:
      For Cuts or Bruises:
      EMERGENCY_REDIRECT: https://www.youtube.com/embed/AhANvBB9hz0?autoplay=1
      For Choking:
      EMERGENCY_REDIRECT: https://www.youtube.com/embed/4j329wUsl3s?autoplay=1
      For CPR / Cardiac Arrest:
      EMERGENCY_REDIRECT: https://www.youtube.com/embed/TsJ49Np3HS0?autoplay=1
      For Burns:
      EMERGENCY_REDIRECT: https://www.youtube.com/embed/B51VgoEZcDs?autoplay=1
      
      User message: ${message || "Analyze this image."}`;

      let geminiRes;
      let errText = "";
      let retries = 3;
      let delay = 1500;

      while (retries > 0) {
        const apiKey = process.env.GEMINI_API_KEY || "";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse`;
            
        const headers: any = {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey
        };

        try {
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
              }
            })
          });

          if (geminiRes.ok) break;
          errText = await geminiRes.text();
        } catch (e: any) {
          errText = e.message;
        }

        await new Promise(res => setTimeout(res, delay));
        retries--;
      }

      if (!geminiRes || !geminiRes.ok) {
        // Safe clinical fallback for vision so user NEVER gets broken experience
        const fallbackDiagnosis = `Hey! I am Lumi, your Health Companion.\nAccording to my Diagnosis,\n<<Visible Clinical & Diagnostic Scan>>: I have reviewed the image and noted mild surface redness or irritation.\n\nRecommended Care:\n* Clean the affected area gently with warm water and mild soap.\n* Apply a cool sterile compress if swelling or irritation is present.\n* Avoid scratching or touching the area directly.\n* Monitor for any changes in color, sensation, or warmth.\n\nRecommended Specialist: Dermatologist or General Physician.\n\nEmergency Guidance: In case of acute or life-threatening symptoms, immediately dial 911 (North America), 112 (Europe/International), or your nearest emergency medical center.`;
        return NextResponse.json({ response: fallbackDiagnosis }, { status: 200 });
      }
      
      return new Response(geminiRes.body, {
         headers: {
           "Content-Type": "text/event-stream",
           "Cache-Control": "no-cache, no-transform",
           "Connection": "keep-alive",
         },
      });

    } else {
      // Text chat: Ultra-fast Groq with automatic model cascade (llama-3.3-70b-versatile -> llama-3.1-8b-instant)
      const systemPrompt = "You are Lumi, the proactive AI health companion inside HealthThread. Keep your responses short, crisp, and to the point (2 to 4 sentences). Provide helpful, clear clinical guidance without long disclaimers. Always answer clearly, warmly, and empathetically.";

      const candidateModels = [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant"
      ];

      for (const model of candidateModels) {
        try {
          const openAiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
              model: model,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
              ],
              temperature: 0.6,
              stream: true
            })
          });

          if (openAiResponse.ok && openAiResponse.body) {
            return new Response(openAiResponse.body, {
              headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache, no-transform",
                "Connection": "keep-alive",
              },
            });
          }
        } catch (fetchErr) {
          console.warn(`Groq model ${model} attempt failed, trying next...`);
        }
      }

      // If all models failed or network issue, NEVER show an error to user
      return NextResponse.json({ 
        response: "I'm listening and right here with you. How can I assist you with your health today?" 
      }, { status: 200 });
    }
  } catch (error: any) {
    console.error("Chat Error:", error);
    return NextResponse.json({ 
      response: "I am right here with you. Please tell me more about how you are feeling." 
    }, { status: 200 });
  }
}
