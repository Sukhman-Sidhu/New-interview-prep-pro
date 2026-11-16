
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  apiVersion: "v1beta",
});

// START GEMINI ANALYSIS
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please log in first." },
        { status: 401 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { role, type, answers } = body;

    if (
      typeof role !== "string" ||
      typeof type !== "string" ||
      !Array.isArray(answers) ||
      answers.length !== 5 ||
      !answers.every(
        (item) =>
          item &&
          typeof item.question === "string" &&
          typeof item.answer === "string" &&
          item.question.length <= 1000 &&
          item.answer.length <= 5000
      )
    ) {
      return NextResponse.json(
        { error: "Please provide five valid interview answers." },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert interview evaluator.

Job Role: ${role}
Interview Type: ${type}

Questions and Answers:
${JSON.stringify(answers, null, 2)}

Evaluate relevance, clarity, completeness and communication.

Use simple English and give honest, helpful feedback.
All scores must be between 0 and 10.

Return ONLY valid JSON in this format:

{
  "overallScore": 0,
  "overallFeedback": "Overall feedback",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "answers": [
    {
      "question": "Question",
      "score": 0,
      "feedback": "Feedback",
      "improvedAnswer": "Improved sample answer"
    }
  ]
}

Include exactly five answer evaluations.
`;

    console.log("Starting background Gemini analysis...");

    const interaction = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input: prompt,
      background: true,
     labels: {
  user_id: user.id,
  role: role.slice(0, 63),
  type: type.slice(0, 63),
},
    });

    if (!interaction.id) {
      throw new Error("Gemini did not return an interaction ID.");
    }

    console.log("Gemini interaction started:", interaction.id);

    return NextResponse.json({
      interactionId: interaction.id,
      status: interaction.status,
    });
  } catch (error) {
    console.error("Interview start error:", error);

    return NextResponse.json(
      { error: "Unable to start interview analysis." },
      { status: 500 }
    );
  }
}

// CHECK GEMINI ANALYSIS STATUS
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please log in first." },
        { status: 401 }
      );
    }

    const interactionId = request.nextUrl.searchParams.get("id");

    if (!interactionId) {
      return NextResponse.json(
        { error: "Interaction ID is required." },
        { status: 400 }
      );
    }

    const interaction = await ai.interactions.get(interactionId);

    // Make sure the interaction belongs to this user.
    if (interaction.labels?.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized interaction." },
        { status: 403 }
      );
    }

 if (interaction.status === "in_progress") {
  return NextResponse.json({
    status: "processing",
  });
}

if (interaction.status !== "completed") {
  console.error("Gemini interaction status:", interaction.status);
  console.error("Gemini interaction errors:", interaction.errors);

  return NextResponse.json(
    { error: "Gemini could not complete the analysis." },
    { status: 500 }
  );
}



    const output = interaction.output_text;
    console.log("Gemini output received:", !!output);
console.log("Gemini output length:", output?.length);

    if (!output) {
      throw new Error("Gemini returned an empty response.");
    }

    const cleanedOutput = output
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const analysis = JSON.parse(cleanedOutput);

    if (
      typeof analysis.overallScore !== "number" ||
      !Array.isArray(analysis.strengths) ||
      !Array.isArray(analysis.improvements) ||
      !Array.isArray(analysis.answers) ||
      analysis.answers.length !== 5
    ) {
      throw new Error("Invalid evaluation format.");
    }

    // Avoid saving the same completed evaluation twice.
    const existing = await prisma.interviewSession.findFirst({
      where: {
        userId: user.id,
        feedback: {
          contains: interactionId,
        },
      },
    });

    if (!existing) {
      await prisma.interviewSession.create({
        data: {
          role: String(interaction.labels?.role || "Interview"),
          type: String(interaction.labels?.type || "General"),
          score: analysis.overallScore,
          feedback: JSON.stringify({
            ...analysis,
            interactionId,
          }),
          userId: user.id,
        },
      });
    }

    return NextResponse.json({
      status: "completed",
      analysis,
    });
  } catch (error) {
    console.error("Interview status error:", error);

    return NextResponse.json(
      { error: "Unable to retrieve interview analysis." },
      { status: 500 }
    );
  }
}