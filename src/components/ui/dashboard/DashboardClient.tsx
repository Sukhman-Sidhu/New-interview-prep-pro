
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Code2,
  Flame,
  Brain,
  Target,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  RefreshCw,
} from "lucide-react";

import StatsCard from "@/components/ui/dashboard/StatsCard";
import WelcomeSection from "@/components/ui/dashboard/WelcomeSection";

type DashboardData = {
  stats: {
    totalSubmissions: number;
    questionsAttempted: number;
    currentStreak: number;
    totalInterviews: number;
    averageInterviewScore: number;
  };
  weeklyActivity: {
    day: string;
    date: string;
    count: number;
  }[];
  recentActivity: {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    time: string;
  }[];
};

export default function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [goal, setGoal] = useState(10);

  async function loadDashboard() {
    try {
      setError("");

      const response = await fetch("/api/dashboard", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load dashboard.");
      }

      const result = await response.json();
      setData(result);
    } catch {
      setError("Could not load your dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();

    const savedGoal = localStorage.getItem("weekly-submission-goal");

    if (savedGoal) {
      const parsedGoal = Number(savedGoal);
      if (Number.isFinite(parsedGoal) && parsedGoal > 0) {
        setGoal(parsedGoal);
      }
    }
  }, []);

  function updateGoal(value: number) {
    const safeValue = Math.max(1, Math.min(100, value));
    setGoal(safeValue);
    localStorage.setItem("weekly-submission-goal", String(safeValue));
  }

  if (loading) {
    return (
      <div className="page-content p-10 text-center">
        Loading your dashboard...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-content p-10 text-center">
        <p>{error || "Dashboard data is unavailable."}</p>
        <button
          onClick={loadDashboard}
          className="mt-4 rounded-lg bg-purple-600 px-5 py-2 text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  const stats = [
    {
      title: "Questions Attempted",
      value: String(data.stats.questionsAttempted),
      change: `${data.stats.totalSubmissions} total submissions`,
      icon: <Code2 size={21} />,
      color: "purple",
    },
    {
      title: "Current Streak",
      value: `${data.stats.currentStreak} Days`,
      change: "Keep your consistency going!",
      icon: <Flame size={21} />,
      color: "orange",
    },
    {
      title: "Mock Interviews",
      value: String(data.stats.totalInterviews),
      change: "Completed interviews",
      icon: <Brain size={21} />,
      color: "blue",
    },
    {
      title: "Average Interview Score",
      value: String(data.stats.averageInterviewScore),
      change: "Score from completed interviews",
      icon: <Target size={21} />,
      color: "green",
    },
  ];

  const thisWeekCount = data.weeklyActivity.reduce(
    (total, item) => total + item.count,
    0
  );

  const progress = Math.min(
    100,
    Math.round((thisWeekCount / goal) * 100)
  );

  const maxCount = Math.max(
    1,
    ...data.weeklyActivity.map((item) => item.count)
  );

  return (
    <div className="page-content">
      <WelcomeSection />

      <div className="mb-5 flex justify-end">
        <button
          onClick={loadDashboard}
          className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm transition hover:bg-white/10"
        >
          <RefreshCw size={15} />
          Refresh Dashboard
        </button>
      </div>

      <section className="stats-grid">
        {stats.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </section>

      <section className="middle-grid">
        <div className="panel progress-panel">
          <div className="panel-heading">
            <div>
              <h3>Weekly Coding Activity</h3>
              <p>Your actual coding submissions over the last 7 days</p>
            </div>
            <span className="period-label">Last 7 days</span>
          </div>

          <div className="chart-summary">
            <h2>{thisWeekCount}</h2>
            <span>Coding submissions this week</span>
          </div>

          <div className="bar-chart">
            {data.weeklyActivity.map((item) => (
              <div className="bar-column" key={item.date}>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    title={`${item.count} submissions`}
                    style={{
                      height: `${Math.max(
                        item.count === 0 ? 0 : 8,
                        (item.count / maxCount) * 100
                      )}%`,
                    }}
                  />
                </div>
                <span>{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel goal-panel">
          <div className="panel-heading">
            <div>
              <h3>Weekly Goal</h3>
              <p>Set your coding submission target</p>
            </div>
            <Target size={21} className="goal-icon" />
          </div>

          <div className="goal-circle">
            <div
              className="goal-inner"
              style={{
                background: "var(--surface)",
              }}
            >
              <strong>{progress}%</strong>
              <span>Completed</span>
            </div>
          </div>

          <h3 className="goal-message">
            {progress >= 100 ? "Goal completed! 🎉" : "Keep going!"}
          </h3>

          <p className="goal-description">
            {Math.max(0, goal - thisWeekCount)} more submissions to reach
            your weekly goal.
          </p>

          <div className="goal-footer">
            <span>{thisWeekCount} / {goal} submissions</span>
            <span>{Math.max(0, goal - thisWeekCount)} left</span>
          </div>

          <div className="goal-track">
            <div style={{ width: `${progress}%` }} />
          </div>

          <label className="mt-5 block text-sm">
            Weekly submission target
            <input
              type="number"
              min="1"
              max="100"
              value={goal}
              onChange={(e) => updateGoal(Number(e.target.value))}
              className="mt-2 w-full rounded-lg border border-white/10 bg-transparent p-2"
            />
          </label>
        </div>
      </section>

      <section className="bottom-grid">
        <div className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <h3>Recent Activity</h3>
              <p>Your latest coding submissions</p>
            </div>
            <Link href="/practice" className="view-all">
              Practice more <ChevronRight size={15} />
            </Link>
          </div>

          <div className="activity-list">
            {data.recentActivity.length === 0 ? (
              <p className="p-5 text-sm text-gray-400">
                No coding activity yet. Start with your first DSA question!
              </p>
            ) : (
              data.recentActivity.map((activity) => (
                <div className="activity-item" key={activity.id}>
                  <div className="activity-check">
                    <CheckCircle2 size={19} />
                  </div>

                  <div className="activity-details">
                    <strong>{activity.title}</strong>
                    <span>
                      {activity.category} ·{" "}
                      {new Date(activity.time).toLocaleString()}
                    </span>
                  </div>

                  <span
                    className={`difficulty ${activity.difficulty.toLowerCase()}`}
                  >
                    {activity.difficulty}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel quick-panel">
          <div className="panel-heading">
            <div>
              <h3>Quick Start</h3>
              <p>Choose your next activity</p>
            </div>
          </div>

          <Link href="/practice" className="quick-item">
            <div className="quick-icon purple">
              <Code2 size={21} />
            </div>
            <div>
              <strong>Practice DSA</strong>
              <span>Solve coding challenges</span>
            </div>
            <ChevronRight size={18} />
          </Link>

          <Link href="/interview" className="quick-item">
            <div className="quick-icon blue">
              <Brain size={21} />
            </div>
            <div>
              <strong>Mock Interview</strong>
              <span>Test your interview skills</span>
            </div>
            <ChevronRight size={18} />
          </Link>

          <Link href="/resources" className="quick-item">
            <div className="quick-icon orange">
              <BookOpenIcon />
            </div>
            <div>
              <strong>Study Resources</strong>
              <span>Explore learning materials</span>
            </div>
            <ChevronRight size={18} />
          </Link>

          <div className="daily-tip">
            <Sparkles size={18} />
            <div>
              <strong>Daily Reminder</strong>
              <p>Consistency is more important than perfection.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="dashboard-footer">
        InterviewPrep Pro © 2026 · Built for your career journey
      </footer>
    </div>
  );
}

function BookOpenIcon() {
  return <Code2 size={21} />;
}
