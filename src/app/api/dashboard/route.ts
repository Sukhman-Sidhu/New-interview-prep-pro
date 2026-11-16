
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getIndiaDateKey(date: Date) {
  return new Date(date.getTime() + 330 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const [submissions, interviews] = await Promise.all([
      prisma.submission.findMany({
        where: { userId: user.id },
        include: {
          question: {
            select: {
              title: true,
              topic: true,
              difficulty: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 1000,
      }),

      prisma.interviewSession.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const completedInterviews = interviews.filter(
      (interview) => interview.score !== null
    );

    const averageScore =
      completedInterviews.length > 0
        ? Math.round(
            completedInterviews.reduce(
              (total, interview) => total + (interview.score ?? 0),
              0
            ) / completedInterviews.length
          )
        : 0;

    // Count submissions for the last seven days.
    const today = new Date();
    const todayKey = getIndiaDateKey(today);

    const weeklyActivity = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(
        today.getTime() + 330 * 60 * 1000
      );

      date.setUTCHours(0, 0, 0, 0);
      date.setUTCDate(date.getUTCDate() - (6 - index));

      const key = date.toISOString().slice(0, 10);

      const count = submissions.filter(
        (submission) =>
          getIndiaDateKey(submission.createdAt) === key
      ).length;

      return {
        day: new Intl.DateTimeFormat("en", {
          weekday: "short",
          timeZone: "Asia/Kolkata",
        }).format(new Date(`${key}T12:00:00+05:30`)),
        date: key,
        count,
      };
    });

    // Calculate consecutive days with at least one submission.
    const activeDays = new Set(
      submissions.map((submission) =>
        getIndiaDateKey(submission.createdAt)
      )
    );

    let streak = 0;
    const checkDate = new Date(
      `${todayKey}T00:00:00+05:30`
    );

    // If there was no activity today, allow yesterday's streak to continue.
    if (!activeDays.has(todayKey)) {
      checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    }

    while (activeDays.has(getIndiaDateKey(checkDate))) {
      streak++;
      checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    }

    const recentActivity = submissions.slice(0, 5).map(
      (submission) => ({
        id: submission.id,
        title: submission.question.title,
        category: submission.question.topic,
        difficulty: submission.question.difficulty,
        time: submission.createdAt,
      })
    );

    return NextResponse.json({
      stats: {
        totalSubmissions: submissions.length,
        questionsAttempted: new Set(
          submissions.map((submission) => submission.questionId)
        ).size,
        currentStreak: streak,
        totalInterviews: completedInterviews.length,
        averageInterviewScore: averageScore,
      },
      weeklyActivity,
      recentActivity,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      { message: "Unable to load dashboard data" },
      { status: 500 }
    );
  }
}
