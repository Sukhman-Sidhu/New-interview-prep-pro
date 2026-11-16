
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Question = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  topic: string;
};

export default function QuestionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();

  const [question, setQuestion] = useState<Question | null>(null);
  const [code, setCode] = useState("// Write your solution here");
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [submissionError, setSubmissionError] = useState(false);
  const [running, setRunning] = useState(false);
const [output, setOutput] = useState("");
const [executionStatus, setExecutionStatus] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadQuestion() {
      try {
        const { slug } = await params;

        if (cancelled) return;

        const response = await fetch(`/api/questions/${slug}`);

        if (!response.ok) {
          router.push("/practice");
          return;
        }

        const data = await response.json();

        if (!cancelled) setQuestion(data);
      } catch (error) {
        console.error("Error fetching question:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadQuestion();

    return () => {
      cancelled = true;
    };
  }, [params, router]);

  async function handleSubmit() {
    if (!question || !code.trim()) {
      setSubmissionError(true);
      setSubmissionMessage("Please write some code before submitting.");
      return;
    }

    setSubmitting(true);
    setSubmissionMessage("");

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language,
          questionId: question.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Submission failed.");
      }

      setSubmissionError(false);
      setSubmissionMessage("Your code has been saved successfully!");
    } catch (error) {
      setSubmissionError(true);
      setSubmissionMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRunCode() {
  if (!code.trim()) {
    setOutput("Please write some code first.");
    return;
  }

  setRunning(true);
  setOutput("Running your code...");
  setExecutionStatus("");

  try {
    const response = await fetch("/api/run-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        language,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Code execution failed.");
    }

    if (response.status === 202) {
      setExecutionStatus("Processing");
      setOutput(data.message || "Your code is still processing.");
      return;
    }

    setExecutionStatus(data.status);

    const result =
      data.stdout ||
      data.stderr ||
      data.compile_output ||
      data.message ||
      "Program executed successfully. No output.";

    setOutput(result);

    if (data.time) {
      setOutput(
        `${result}\n\nExecution time: ${data.time} seconds`
      );
    }
  } catch (error) {
    setExecutionStatus("Error");
    setOutput(
      error instanceof Error
        ? error.message
        : "Unable to execute code."
    );
  } finally {
    setRunning(false);
  }
}

  if (loading) {
    return (
<div className="question-detail-page min-h-screen p-10">        Loading question...
      </div>
    );
  }

  if (!question) {
    return (
<div className="question-detail-page min-h-screen p-10">        Question not found.
      </div>
    );
  }

  return (
    <main className="question-detail-page min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/practice" className="text-purple-400">
          ← Back to Practice
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="question-card rounded-2xl border p-6">
            <h1 className="text-3xl font-bold">{question.title}</h1>

            <div className="mt-4 flex gap-3">
              <span className="question-difficulty rounded-full bg-purple-500/20 px-3 py-1 text-sm text-purple-300">
                {question.difficulty}
              </span>

              <span className="question-topic rounded-full bg-white/10 px-3 py-1 text-sm">
                {question.topic}
              </span>
            </div>

            <h2 className="mt-8 text-lg font-semibold">
              Problem Description
            </h2>

            <p className="mt-3 whitespace-pre-line leading-7 text-gray-300">
              {question.description}
            </p>
          </section>

          <section className="question-editor-card rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Code Editor</h2>

              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  setSubmissionMessage("");
                }}
                className="question-language rounded-lg border border-white/10 bg-[#151a2e] p-2 text-sm"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
              </select>
            </div>

            <textarea
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setSubmissionMessage("");
              }}
              spellCheck={false}
              className="question-editor mt-5 h-96 w-full resize-y rounded-xl border border-white/10 bg-[#080b18] p-4 font-mono text-sm text-green-300 outline-none focus:border-purple-500"
            />

           <div className="mt-4 flex flex-wrap gap-3">
  <button
    onClick={() => {
      setCode("// Write your solution here");
      setOutput("");
      setExecutionStatus("");
    }}
    className="question-reset-button rounded-lg border border-white/20 px-4 py-2 text-sm"
  >
    Reset Code
  </button>

  <button
    onClick={handleRunCode}
    disabled={running}
    className="question-run-button rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium disabled:opacity-50"
  >
    {running ? "Running..." : "Run Code"}
  </button>

  <button
    onClick={handleSubmit}
    disabled={submitting}
    className="question-submit-button rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium disabled:opacity-50"
  >
    {submitting ? "Submitting..." : "Submit Code"}
  </button>
</div>

<div className="question-output mt-6 rounded-xl border border-white/10 bg-[#080b18] p-4">
  <div className="flex items-center justify-between">
    <h3 className="font-semibold text-white">Output</h3>

    {executionStatus && (
      <span className="question-output-status text-xs text-purple-300">
        {executionStatus}
      </span>
    )}
  </div>

  <pre className="question-output-text mt-3 whitespace-pre-wrap break-words text-sm text-green-300">
    {output || "Your program output will appear here."}
  </pre>
</div>

            {submissionMessage && (
              <p
                role="status"
                className={`mt-4 text-sm ${
                  submissionError ? "text-red-400" : "text-green-400"
                }`}
              >
                {submissionMessage}
              </p>
            )}

            <p className="mt-3 text-xs text-gray-500">
              Language selected: {language}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
