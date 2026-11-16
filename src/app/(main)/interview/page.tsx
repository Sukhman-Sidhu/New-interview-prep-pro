
"use client";

import { useState } from "react";

const questionBank = {
  HR: [
    "Tell me about yourself.",
    "What are your strengths and weaknesses?",
    "Why should we hire you?",
    "Where do you see yourself in five years?",
    "Why do you want to join our company?",
  ],
  Technical: [
    "What is the difference between let, const and var in JavaScript?",
    "Explain the concept of Object-Oriented Programming.",
    "What is the difference between SQL and NoSQL?",
    "Explain how a REST API works.",
    "What is the difference between an array and a linked list?",
  ],
  Behavioral: [
    "Tell me about a challenge you faced and how you handled it.",
    "Describe a time when you worked in a team.",
    "How do you handle pressure and deadlines?",
    "Tell me about a mistake you made and what you learned.",
    "How do you handle disagreements with teammates?",
  ],
};

type Analysis = {
  overallScore: number;
  overallFeedback: string;
  strengths: string[];
  improvements: string[];
  answers: {
    question: string;
    score: number;
    feedback: string;
    improvedAnswer: string;
  }[];
};

export default function InterviewPage() {
  const [role, setRole] = useState("Software Engineer");
  const [type, setType] = useState<keyof typeof questionBank>("HR");
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState("");

  const questions = questionBank[type];

  function startInterview() {
    setCurrentQuestion(0);
    setAnswers([]);
    setFinished(false);
    setAnalysis(null);
    setError("");
    setStarted(true);
  }

  function updateAnswer(value: string) {
    const updated = [...answers];
    updated[currentQuestion] = value;
    setAnswers(updated);
  }

  function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setFinished(true);
    }
  }

  function previousQuestion() {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  }


async function analyzeInterview() {
  setError("");
  setAnalysis(null);

  if (answers.length !== 5 || answers.some((answer) => !answer?.trim())) {
    setError("Please answer all five questions before submitting.");
    return;
  }

  setAnalyzing(true);

  try {
    // Step 1: Start background Gemini analysis
    const startResponse = await fetch("/api/interview/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role,
        type,
        answers: questions.map((question, index) => ({
          question,
          answer: answers[index],
        })),
      }),
    });

    const startData = await startResponse.json();

    if (!startResponse.ok) {
      throw new Error(startData.error || "Unable to start analysis.");
    }

    const interactionId = startData.interactionId;

    if (!interactionId) {
      throw new Error("Gemini did not return an interaction ID.");
    }

    // Step 2: Check Gemini status every 3 seconds
    let completed = false;

    for (let attempt = 0; attempt < 200; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const statusResponse = await fetch(
        `/api/interview/analyze?id=${encodeURIComponent(interactionId)}`,
        { cache: "no-store" }
      );

      const statusData = await statusResponse.json();

      if (!statusResponse.ok) {
        throw new Error(
          statusData.error || "Unable to retrieve analysis."
        );
      }

      if (statusData.status === "completed") {
        setAnalysis(statusData.analysis);
        completed = true;
        break;
      }

      if (statusData.status !== "processing") {
        throw new Error("Unexpected analysis status.");
      }
    }

    if (!completed) {
      throw new Error(
        "Analysis is taking too long. Please try again later."
      );
    }
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Something went wrong. Please try again."
    );
  } finally {
    setAnalyzing(false);
  }
}


  function restartInterview() {
    setStarted(false);
    setFinished(false);
    setCurrentQuestion(0);
    setAnswers([]);
    setAnalysis(null);
    setError("");
  }

  return (
<div className="interview-page min-h-screen bg-[#080b18] p-6 text-white md:p-10">
    <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">Mock Interviews</h1>

        <p className="mt-2 text-gray-400">
          Practice interview questions and improve your confidence.
        </p>

        {!started && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-xl font-semibold">
              Prepare for Your Interview
            </h2>

            <div className="mt-6">
              <label className="mb-2 block text-sm text-gray-400">
                Select Job Role
              </label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#151a2e] p-3 text-white"
              >
                <option>Software Engineer</option>
                <option>Frontend Developer</option>
                <option>Backend Developer</option>
                <option>Python Developer</option>
                <option>Full Stack Developer</option>
              </select>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm text-gray-400">
                Interview Type
              </label>

              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as keyof typeof questionBank)
                }
                className="w-full rounded-lg border border-white/10 bg-[#151a2e] p-3 text-white"
              >
                <option value="HR">HR Interview</option>
                <option value="Technical">Technical Interview</option>
                <option value="Behavioral">Behavioral Interview</option>
              </select>
            </div>

            <div className="mt-6 rounded-xl bg-purple-500/10 p-4">
              <p className="text-sm text-purple-300">
                5 questions • AI-powered feedback • Practice at your own pace
              </p>
            </div>

            <button
              onClick={startInterview}
              className="mt-6 rounded-lg bg-purple-600 px-6 py-3 font-medium hover:bg-purple-500"
            >
              Start Interview →
            </button>
          </div>
        )}

        {started && !finished && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8">
            <div className="flex flex-wrap justify-between gap-3">
              <span className="text-sm text-purple-300">{role}</span>
              <span className="text-sm text-gray-400">{type} Interview</span>
            </div>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-purple-500"
                style={{
                  width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                }}
              />
            </div>

            <p className="mt-4 text-sm text-gray-400">
              Question {currentQuestion + 1} of {questions.length}
            </p>

            <h2 className="mt-6 text-2xl font-semibold">
              {questions[currentQuestion]}
            </h2>

            <label className="mt-8 block text-sm text-gray-400">
              Write your answer
            </label>

            <textarea
              value={answers[currentQuestion] || ""}
              onChange={(e) => updateAnswer(e.target.value)}
              placeholder="Write your answer here..."
              rows={7}
              className="mt-3 w-full rounded-xl border border-white/10 bg-[#080b18] p-4 text-white outline-none focus:border-purple-500"
            />

            <div className="mt-6 flex flex-wrap justify-between gap-3">
              <button
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
                className="rounded-lg border border-white/20 px-5 py-2 disabled:opacity-30"
              >
                Previous
              </button>

              <button
                onClick={nextQuestion}
                className="rounded-lg bg-purple-600 px-5 py-2 hover:bg-purple-500"
              >
                {currentQuestion === questions.length - 1
                  ? "Finish Interview"
                  : "Next Question →"}
              </button>
            </div>
          </div>
        )}

        {finished && !analysis && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-2xl font-bold text-green-400">
              Interview Completed!
            </h2>

            <p className="mt-3 text-gray-400">
              You completed your {type} interview for the {role} role.
            </p>

            <div className="mt-6 rounded-xl bg-white/5 p-5">
              <p className="text-lg font-semibold">
                Questions answered: {answers.filter((a) => a?.trim()).length} / 5
              </p>
              <p className="mt-2 text-sm text-gray-400">
                Submit your answers to receive AI-powered feedback.
              </p>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-400">{error}</p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setFinished(false);
                  setCurrentQuestion(0);
                  setError("");
                }}
                disabled={analyzing}
                className="rounded-lg border border-white/20 px-5 py-3 disabled:opacity-50"
              >
                Review Answers
              </button>

              <button
                onClick={analyzeInterview}
                disabled={analyzing}
                className="rounded-lg bg-purple-600 px-6 py-3 font-medium hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {analyzing ? "Analyzing Answers..." : "Submit & Analyze Answers ✨"}
              </button>
            </div>
          </div>
        )}

        {analyzing && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
            <h2 className="mt-5 text-xl font-semibold">
              Gemini is analyzing your answers...
            </h2>
            <p className="mt-2 text-gray-400">
              Please wait while we prepare your interview feedback.
            </p>
          </div>
        )}

        {finished && analysis && (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <p className="text-sm font-medium text-purple-300">
                YOUR INTERVIEW RESULT
              </p>

              <h2 className="mt-3 text-2xl font-bold">
                Interview Analysis
              </h2>

              <div className="mt-6 flex flex-wrap items-center gap-6">
                <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 border-purple-500">
                  <span className="text-3xl font-bold">
                    {analysis.overallScore}
                  </span>
                  <span className="text-xs text-gray-400">out of 10</span>
                </div>

                <div className="flex-1">
                  <p className="text-lg font-semibold">
                    Overall Feedback
                  </p>
                  <p className="mt-2 text-gray-300">
                    {analysis.overallFeedback}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold text-green-400">
                  Your Strengths
                </h3>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-300">
                  {analysis.strengths.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold text-yellow-400">
                  Areas to Improve
                </h3>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-300">
                  {analysis.improvements.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <h3 className="text-xl font-bold">
                Question-by-Question Feedback
              </h3>

              <div className="mt-6 space-y-6">
                {analysis.answers.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-white/10 bg-[#080b18] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h4 className="flex-1 font-semibold">
                        {index + 1}. {item.question}
                      </h4>
                      <span className="rounded-lg bg-purple-500/20 px-3 py-1 text-sm text-purple-300">
                        Score: {item.score}/10
                      </span>
                    </div>

                    <p className="mt-4 text-sm font-semibold text-gray-400">
                      AI Feedback
                    </p>
                    <p className="mt-2 text-gray-300">{item.feedback}</p>

                    <p className="mt-4 text-sm font-semibold text-green-400">
                      Improved Sample Answer
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-gray-300">
                      {item.improvedAnswer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={restartInterview}
              className="rounded-lg bg-purple-600 px-6 py-3 font-medium hover:bg-purple-500"
            >
              Start Another Interview
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
