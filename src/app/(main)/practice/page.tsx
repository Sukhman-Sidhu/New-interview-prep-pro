
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Code2, ArrowLeft, Search } from "lucide-react";

interface Question {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  topic: string;
}

export default function PracticePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch("/api/questions");
        if (!response.ok) throw new Error("Failed to load questions");
        const data = await response.json();
        setQuestions(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, []);

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch =
      question.title.toLowerCase().includes(search.toLowerCase()) ||
      question.topic.toLowerCase().includes(search.toLowerCase());

    const matchesDifficulty =
      filter === "ALL" || question.difficulty === filter;

    return matchesSearch && matchesDifficulty;
  });

  const difficultyStyle = {
    EASY: "bg-green-500/10 text-green-400",
    MEDIUM: "bg-yellow-500/10 text-yellow-400",
    HARD: "bg-red-500/10 text-red-400",
  };

  return (
    <main className="practice-page min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="practice-back mb-8 inline-flex items-center gap-2 text-sm">
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-purple-500">
            <Code2 size={22} />
            <span className="text-sm font-semibold">CODING PRACTICE</span>
          </div>

          <h1 className="text-3xl font-bold md:text-4xl">
            DSA Practice
          </h1>

          <p className="practice-muted mt-2">
            Improve your problem-solving skills one question at a time.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="practice-card rounded-xl border p-5">
            <p className="practice-muted text-sm">Total Questions</p>
            <h2 className="mt-2 text-3xl font-bold">{questions.length}</h2>
          </div>

          <div className="practice-card rounded-xl border p-5">
            <p className="practice-muted text-sm">Easy Questions</p>
            <h2 className="mt-2 text-3xl font-bold text-green-500">
              {questions.filter((q) => q.difficulty === "EASY").length}
            </h2>
          </div>

          <div className="practice-card rounded-xl border p-5">
            <p className="practice-muted text-sm">Medium Questions</p>
            <h2 className="mt-2 text-3xl font-bold text-yellow-500">
              {questions.filter((q) => q.difficulty === "MEDIUM").length}
            </h2>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="practice-card flex flex-1 items-center gap-3 rounded-xl border px-4">
            <Search size={18} className="practice-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions or topics..."
              className="practice-input w-full py-3 text-sm outline-none"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="practice-card practice-input rounded-xl border px-4 py-3 text-sm outline-none"
          >
            <option value="ALL">All difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        {loading ? (
          <p className="practice-muted py-10 text-center">
            Loading questions...
          </p>
        ) : filteredQuestions.length === 0 ? (
          <div className="practice-card rounded-xl border p-10 text-center">
            <p className="practice-muted">No questions found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((question) => (
              <Link
                key={question.id}
                href={`/practice/${question.slug}`}
                className="practice-card block rounded-xl border p-5 transition hover:border-purple-500"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {question.title}
                    </h2>
                    <p className="practice-muted mt-2 text-sm">
                      {question.description}
                    </p>
                    <p className="practice-muted mt-3 text-xs">
                      Topic: {question.topic}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${difficultyStyle[question.difficulty]}`}
                  >
                    {question.difficulty}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
