
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Code2,
  ArrowLeft,
  Search,
  Layers,
  Link2,
  Brackets,
  Database,
  GitBranch,
  CheckCircle2,
  Circle,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";

interface Question {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  topic: string;
}

const topicIcons: Record<string, typeof Code2> = {
  arrays: Layers,
  "linked lists": Link2,
  stacks: Brackets,
  queues: Database,
  trees: GitBranch,
  graphs: GitBranch,
};

async function loadPracticeData(): Promise<{
  questions: Question[];
  attemptedQuestionIds: string[];
}> {
  const [questionsResponse, progressResponse] = await Promise.all([
    fetch("/api/questions", { cache: "no-store" }),
    fetch("/api/practice/progress", { cache: "no-store" }),
  ]);

  if (!questionsResponse.ok) {
    throw new Error("Failed to load questions.");
  }

  if (!progressResponse.ok) {
    throw new Error("Failed to load your practice progress.");
  }

  const [questions, progress] = await Promise.all([
    questionsResponse.json(),
    progressResponse.json(),
  ]);

  return {
    questions,
    attemptedQuestionIds: progress.attemptedQuestionIds ?? [],
  };
}

export default function PracticePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attemptedIds, setAttemptedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [error, setError] = useState("");

  async function fetchData() {
    try {
      const data = await loadPracticeData();
      setError("");
      setQuestions(data.questions);
      setAttemptedIds(data.attemptedQuestionIds);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    loadPracticeData()
      .then((data) => {
        if (cancelled) return;

        setError("");
        setQuestions(data.questions);
        setAttemptedIds(data.attemptedQuestionIds);
      })
      .catch((err) => {
        if (cancelled) return;

        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const attemptedCount = questions.filter((question) =>
    attemptedIds.includes(question.id)
  ).length;

  const remainingCount = questions.length - attemptedCount;

  const easyCount = questions.filter(
    (question) => question.difficulty === "EASY"
  ).length;

  const mediumCount = questions.filter(
    (question) => question.difficulty === "MEDIUM"
  ).length;

  const hardCount = questions.filter(
    (question) => question.difficulty === "HARD"
  ).length;

  const filteredQuestions = questions.filter((question) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      question.title.toLowerCase().includes(searchText) ||
      question.topic.toLowerCase().includes(searchText) ||
      question.description.toLowerCase().includes(searchText);

    const matchesDifficulty =
      filter === "ALL" || question.difficulty === filter;

    return matchesSearch && matchesDifficulty;
  });

  function getTopicIcon(topic: string) {
    const normalizedTopic = topic.toLowerCase().trim();
    const Icon = topicIcons[normalizedTopic] ?? Code2;

    return Icon;
  }

  const difficultyStyle = {
    EASY: "easy",
    MEDIUM: "medium",
    HARD: "hard",
  };

  return (
    <main className="practice-page min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="practice-back inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <button
            onClick={() => {
              setLoading(true);
              fetchData();
            }}
            className="practice-refresh flex items-center gap-2 rounded-xl px-4 py-2 text-sm"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {/* Page introduction */}
        <div className="mb-9">
          <div className="mb-3 flex items-center gap-2 text-purple-500">
            <Code2 size={22} />
            <span className="text-sm font-bold tracking-wider">
              CODING PRACTICE
            </span>
          </div>

          <h1 className="text-3xl font-bold md:text-4xl">
            DSA Practice
          </h1>

          <p className="practice-muted mt-2">
            Improve your problem-solving skills one question at a time.
          </p>
        </div>

        {/* Progress summary */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="practice-stat">
            <div className="practice-stat-icon purple">
              <Code2 size={20} />
            </div>
            <p className="practice-muted text-sm">Total Questions</p>
            <h2>{questions.length}</h2>
            <span className="practice-muted text-xs">
              Available challenges
            </span>
          </div>

          <div className="practice-stat">
            <div className="practice-stat-icon green">
              <CheckCircle2 size={20} />
            </div>
            <p className="practice-muted text-sm">Attempted</p>
            <h2>{attemptedCount}</h2>
            <span className="practice-muted text-xs">
              Questions with saved submissions
            </span>
          </div>

          <div className="practice-stat">
            <div className="practice-stat-icon orange">
              <Circle size={20} />
            </div>
            <p className="practice-muted text-sm">Not Attempted</p>
            <h2>{remainingCount}</h2>
            <span className="practice-muted text-xs">
              Challenges waiting for you
            </span>
          </div>

          <div className="practice-stat">
            <div className="practice-stat-icon blue">
              <Layers size={20} />
            </div>
            <p className="practice-muted text-sm">Easy / Medium / Hard</p>
            <h2>{easyCount} / {mediumCount} / {hardCount}</h2>
            <span className="practice-muted text-xs">
              Difficulty distribution
            </span>
          </div>
        </section>

        {/* Progress bar */}
        <div className="practice-progress-panel mb-8">
          <div className="mb-3 flex justify-between gap-3">
            <div>
              <h3 className="font-semibold">Your Practice Progress</h3>
              <p className="practice-muted mt-1 text-xs">
                Keep attempting new challenges.
              </p>
            </div>

            <strong className="text-purple-500">
              {questions.length > 0
                ? Math.round((attemptedCount / questions.length) * 100)
                : 0}%
            </strong>
          </div>

          <div className="practice-progress-track">
            <div
              style={{
                width: `${
                  questions.length > 0
                    ? (attemptedCount / questions.length) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* Search and filter */}
        <div className="mb-7 flex flex-col gap-3 sm:flex-row">
          <div className="practice-search flex flex-1 items-center gap-3">
            <Search size={19} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions, topics or descriptions..."
              className="w-full bg-transparent py-3 text-sm outline-none"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="practice-input rounded-xl border px-4 py-3 text-sm outline-none"
          >
            <option value="ALL">All difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        {/* Question list */}
        {loading ? (
          <div className="practice-empty">
            <RefreshCw className="mx-auto mb-3 animate-spin" size={25} />
            <p>Loading your challenges...</p>
          </div>
        ) : error ? (
          <div className="practice-empty">
            <p>{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                fetchData();
              }}
              className="mt-4 rounded-lg bg-purple-600 px-5 py-2 text-white"
            >
              Try Again
            </button>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="practice-empty">
            <Search size={30} className="mx-auto mb-3 opacity-50" />
            <h3 className="font-semibold">No questions found</h3>
            <p className="practice-muted mt-2 text-sm">
              Try another search or difficulty filter.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setFilter("ALL");
              }}
              className="mt-4 text-sm font-semibold text-purple-500"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((question) => {
              const Icon = getTopicIcon(question.topic);
              const attempted = attemptedIds.includes(question.id);

              return (
                <Link
                  key={question.id}
                  href={`/practice/${question.slug}`}
                  className="practice-question-card group block"
                >
                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                    <div className="flex min-w-0 items-start gap-4">
                      <div className="practice-topic-icon">
                        <Icon size={23} />
                      </div>

                      <div className="min-w-0">
                        <h2 className="text-lg font-bold transition group-hover:text-purple-500">
                          {question.title}
                        </h2>

                        <p className="practice-muted mt-2 text-sm leading-6">
                          {question.description}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <span className="practice-topic-label">
                            {question.topic}
                          </span>

                          <span
                            className={`practice-difficulty ${difficultyStyle[question.difficulty]}`}
                          >
                            {question.difficulty}
                          </span>

                          <span
                            className={`practice-status ${
                              attempted ? "attempted" : "not-attempted"
                            }`}
                          >
                            {attempted ? (
                              <CheckCircle2 size={13} />
                            ) : (
                              <Circle size={13} />
                            )}

                            {attempted ? "Attempted" : "Not Attempted"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="practice-solve-action">
                      <span>
                        {attempted ? "Practice Again" : "Solve Challenge"}
                      </span>
                      <ArrowUpRight size={17} />
                    </div>

                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="practice-muted text-sm">
            Every problem you attempt makes you a better problem solver.
          </p>
        </div>

      </div>
    </main>
  );
}
