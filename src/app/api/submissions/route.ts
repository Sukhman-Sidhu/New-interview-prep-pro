import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code, language, questionId } = body;

    if (
      typeof code !== "string" ||
      !code.trim() ||
      code.length > 100000 ||
      typeof language !== "string" ||
      !language.trim() ||
      typeof questionId !== "string" ||
      !questionId.trim()
    ) {
      return NextResponse.json(
        { error: "Invalid submission data." },
        { status: 400 }
      );
    }

    const question = await prisma.dsaQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found." },
        { status: 404 }
      );
    }

    const submission = await prisma.submission.create({
      data: {
        code,
        language,
        status: "PENDING",
        userId: user.id,
        questionId: question.id,
      },
    });

    return NextResponse.json(
      {
        message: "Submission saved successfully.",
        submission,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Submission API error:", error);

    return NextResponse.json(
      { error: "Unable to save submission." },
      { status: 500 }
    );
  }
}