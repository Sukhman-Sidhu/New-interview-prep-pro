
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
  difficulty: Difficulty;
  topic: string;
  examples?: Prisma.InputJsonValue;
  testCases?: Prisma.InputJsonValue;
};

type RawQuestion = {
  title?: unknown;
  slug?: unknown;
  description?: unknown;
  difficulty?: unknown;
  topic?: unknown;
  examples?: unknown;
  testCases?: unknown;
};

const validDifficulties = ["EASY", "MEDIUM", "HARD"] as const;

function isDifficulty(value: unknown): value is Difficulty {
  return (
    typeof value === "string" &&
    validDifficulties.includes(value as (typeof validDifficulties)[number])
  );
}

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

    const rawQuestions: RawQuestion[] = Array.isArray(body.questions)
      ? body.questions
      : [body];

    if (rawQuestions.length === 0) {
      return NextResponse.json(
        { error: "No questions provided" },
        { status: 400 }
      );
    }

    // Validate all questions.
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
        question.difficulty !== undefined &&
        question.difficulty !== null &&
        !isDifficulty(question.difficulty)
      ) {
        return NextResponse.json(
          {
            error: `Invalid difficulty for ${question.title}`,
          },
          { status: 400 }
        );
      }
    }

    // Convert validated data into Prisma-compatible data.
    const questions: QuestionInput[] = rawQuestions.map((question) => ({
      title: question.title as string,
      slug: question.slug as string,
      description: question.description as string,
      difficulty: isDifficulty(question.difficulty)
        ? question.difficulty
        : "EASY",
      topic: question.topic as string,
      ...(question.examples !== undefined && {
        examples: question.examples as Prisma.InputJsonValue,
      }),
      ...(question.testCases !== undefined && {
        testCases: question.testCases as Prisma.InputJsonValue,
      }),
    }));

    const result = await prisma.dsaQuestion.createMany({
      data: questions,
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

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const rawQuestions: RawQuestion[] = Array.isArray(body.questions)
      ? body.questions
      : [];

    if (rawQuestions.length === 0) {
      return NextResponse.json(
        { error: "No questions provided" },
        { status: 400 }
      );
    }

    const results: {
      slug: string;
      status: "INVALID_DATA" | "UPDATED" | "SLUG_NOT_FOUND";
    }[] = [];

    for (const question of rawQuestions) {
      if (
        typeof question.slug !== "string" ||
        !Array.isArray(question.testCases)
      ) {
        results.push({
          slug:
            typeof question.slug === "string"
              ? question.slug
              : "unknown",
          status: "INVALID_DATA",
        });
        continue;
      }

      const result = await prisma.dsaQuestion.updateMany({
        where: {
          slug: question.slug.trim(),
        },
        data: {
          testCases: question.testCases as Prisma.InputJsonValue,
        },
      });

      results.push({
        slug: question.slug,
        status: result.count > 0 ? "UPDATED" : "SLUG_NOT_FOUND",
      });
    }

    const updated = results.filter(
      (item) => item.status === "UPDATED"
    ).length;

    return NextResponse.json({
      message: "Test case import completed",
      updated,
      skipped: results.length - updated,
      totalReceived: results.length,
      results,
    });
  } catch (error) {
    console.error("Update test cases error:", error);

    return NextResponse.json(
      {
        error: "Failed to update test cases",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
