
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const [submissionCount, interviewCount] = await Promise.all([
      prisma.submission.count({
        where: { userId: user.id },
      }),
      prisma.interviewSession.count({
        where: { userId: user.id },
      }),
    ]);

    return NextResponse.json({
      submissionCount,
      interviewCount,
    });
  } catch (error) {
    console.error("Achievements API error:", error);

    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}
