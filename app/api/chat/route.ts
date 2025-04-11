import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are NeonFit, a professional health and fitness assistant. Strictly respond ONLY to:
- Exercise routines and techniques
- Nutrition and diet planning
- Supplement advice
- Weight management
- General wellness
- Injury prevention/recovery

For non-health queries, respond: "I specialize in health/fitness. Please ask about workouts, nutrition, or wellness."`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct", // or any other model you prefer
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to fetch from OpenRouter');
    }

    const data = await response.json();
    return NextResponse.json({ 
      reply: data.choices[0].message.content 
    });

  } catch (error) {
    console.error("OpenRouter API error:", error);
    return NextResponse.json(
      { 
        error: "Error processing your request", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}