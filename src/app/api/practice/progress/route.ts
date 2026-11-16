
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const submissions = await prisma.submission.findMany({
      where: { userId: user.id },
      select: { questionId: true },
      distinct: ["questionId"],
    });

    return NextResponse.json({
      attemptedQuestionIds: submissions.map(
        (submission) => submission.questionId
      ),
    });
  } catch (error) {
    console.error("Practice progress error:", error);

    return NextResponse.json(
      { message: "Unable to load practice progress" },
      { status: 500 }
    );
  }
}
