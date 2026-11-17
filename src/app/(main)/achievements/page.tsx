
"use client";

import { useEffect, useState } from "react";

type AchievementStats = {
  submissionCount: number;
  interviewCount: number;
};

const achievements = [
  {
    title: "First Submission",
    description: "Save your first coding submission.",
    icon: "🎯",
    category: "Coding",
    target: 1,
    type: "submission",
  },
  {
    title: "Getting Started",
    description: "Save 5 coding submissions.",
    icon: "💻",
    category: "Coding",
    target: 5,
    type: "submission",
  },
  {
    title: "Code Explorer",
    description: "Save 10 coding submissions.",
    icon: "🚀",
    category: "Coding",
    target: 10,
    type: "submission",
  },
  {
    title: "First Interview",
    description: "Complete your first AI mock interview.",
    icon: "🎤",
    category: "Interview",
    target: 1,
    type: "interview",
  },
  {
    title: "Interview Pro",
    description: "Complete 5 AI mock interviews.",
    icon: "🏆",
    category: "Interview",
    target: 5,
    type: "interview",
  },
];

export default function AchievementsPage() {
  const [stats, setStats] = useState<AchievementStats>({
    submissionCount: 0,
    interviewCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAchievements() {
      try {
        const response = await fetch("/api/achievements");

        if (!response.ok) {
          throw new Error("Unable to load achievements.");
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAchievements();
  }, []);

  const earnedCount = achievements.filter((achievement) => {
    const count =
      achievement.type === "submission"
        ? stats.submissionCount
        : stats.interviewCount;

    return count >= achievement.target;
  }).length;

  const getProgress = (achievement: (typeof achievements)[number]) => {
    const count =
      achievement.type === "submission"
        ? stats.submissionCount
        : stats.interviewCount;

    return Math.min((count / achievement.target) * 100, 100);
  };

  return (
    <main className="mt-10 space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Achievements 🏆
        </h1>
        <p className="mt-2 text-gray-400">
          Celebrate your progress and unlock new milestones.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-[#15152b] p-10 text-center text-gray-400">
          Loading your achievements...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
          {error}
        </div>
      ) : (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="achievement-stat-card rounded-2xl border border-white/10 bg-[#15152b] p-6">
              <p className="text-sm text-gray-400">Badges Earned</p>
              <h2 className="mt-3 text-3xl font-bold text-white">
                {earnedCount}
                <span className="text-lg text-gray-500">
                  /{achievements.length}
                </span>
              </h2>
            </div>

            <div className="achievement-stat-card rounded-2xl border border-white/10 bg-[#15152b] p-6">
              <p className="text-sm text-gray-400">
                Coding Submissions
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white">
                {stats.submissionCount}
              </h2>
            </div>

            <div className="achievement-stat-card rounded-2xl border border-white/10 bg-[#15152b] p-6">
              <p className="text-sm text-gray-400">
                Mock Interviews
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white">
                {stats.interviewCount}
              </h2>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="achievement-progress-card rounded-2xl border border-white/10 bg-[#15152b] p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Your Achievement Progress
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Keep learning to unlock all badges.
                </p>
              </div>

              <span className="text-xl font-bold text-purple-400">
                {Math.round(
                  (earnedCount / achievements.length) * 100
                )}%
              </span>
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-400 transition-all"
                style={{
                  width: `${
                    (earnedCount / achievements.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Achievement Badges */}
          <div>
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-white">
                All Achievements
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Unlock badges by reaching different milestones.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {achievements.map((achievement) => {
                const progress = getProgress(achievement);
                const earned = progress >= 100;

                return (
                  <div
                    key={achievement.title}
                   className={`achievement-card rounded-2xl border bg-[#15152b] p-6 ${
  earned ? "earned" : "locked"
}`}
                  >
                    <div className="flex items-start justify-between">
                      <div
                       className={`achievement-icon flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${
  earned
    ? "bg-purple-500/20"
    : "bg-white/5 grayscale"
}`}
                      >
                        {achievement.icon}
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          earned
                            ? "bg-green-500/15 text-green-400"
                            : "bg-white/10 text-gray-400"
                        }`}
                      >
                        {earned ? "Unlocked" : "Locked"}
                      </span>
                    </div>

                    <p className="mt-5 text-xs font-medium uppercase tracking-wider text-purple-400">
                      {achievement.category}
                    </p>

                    <h3 className="mt-2 text-lg font-semibold text-white">
                      {achievement.title}
                    </h3>

                    <p className="mt-2 text-sm text-gray-400">
                      {achievement.description}
                    </p>

                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-xs text-gray-400">
                        <span>Progress</span>
                        <span>
                          {Math.min(
                            achievement.type === "submission"
                              ? stats.submissionCount
                              : stats.interviewCount,
                            achievement.target
                          )}{" "}
                          / {achievement.target}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                        className="achievement-bar h-full rounded-full bg-purple-500 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
