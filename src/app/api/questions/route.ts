
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  Prisma,
  Difficulty,
} from "@/generated/prisma/client";

type QuestionInput = {
  title: string;
  slug: string;
  description: string;
  difficulty?: Difficulty;
  topic: string;
  examples?: Prisma.InputJsonValue;
};

const validDifficulties = ["EASY", "MEDIUM", "HARD"];

export async function GET() {
  try {
    const questions = await prisma.dsaQuestion.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Fetch questions error:", error);

    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Support both a single question and multiple questions.
    const rawQuestions = Array.isArray(body.questions)
      ? body.questions
      : [body];

    if (rawQuestions.length === 0) {
      return NextResponse.json(
        { error: "No questions provided" },
        { status: 400 }
      );
    }

    // Validate all questions before inserting.
    for (const question of rawQuestions) {
      if (
        !question ||
        typeof question.title !== "string" ||
        !question.title.trim() ||
        typeof question.slug !== "string" ||
        !question.slug.trim() ||
        typeof question.description !== "string" ||
        !question.description.trim() ||
        typeof question.topic !== "string" ||
        !question.topic.trim()
      ) {
        return NextResponse.json(
          {
            error:
              "Every question must have title, slug, description and topic",
          },
          { status: 400 }
        );
      }

      if (
        question.difficulty &&
        !validDifficulties.includes(question.difficulty)
      ) {
        return NextResponse.json(
          {
            error: `Invalid difficulty for ${question.title}`,
          },
          { status: 400 }
        );
      }
    }

    // Convert validated input into Prisma-compatible data.
    const questions: QuestionInput[] = rawQuestions.map(
      (question) => ({
        title: question.title.trim(),
        slug: question.slug.trim(),
        description: question.description.trim(),
        difficulty: question.difficulty || "EASY",
        topic: question.topic.trim(),
        examples: question.examples,
      })
    );

    const result = await prisma.dsaQuestion.createMany({
      data: questions.map((question) => ({
        title: question.title,
        slug: question.slug,
        description: question.description,
        difficulty: question.difficulty ?? "EASY",
        topic: question.topic,
        ...(question.examples !== undefined && {
          examples: question.examples,
        }),
      })),
      skipDuplicates: true,
    });

    return NextResponse.json(
      {
        message: "Questions added successfully",
        added: result.count,
        skipped: questions.length - result.count,
        totalReceived: questions.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create questions error:", error);

    return NextResponse.json(
      { error: "Failed to create questions" },
      { status: 500 }
    );
  }
}
