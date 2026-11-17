
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const JUDGE0_URL = "https://ce.judge0.com";

const languageIds: Record<string, number> = {
  javascript: 63,
  python: 71,
  java: 62,
};

type TestCase = {
  input: string;
  expectedOutput: string;
};

function normalizeOutput(value: string | null | undefined) {
  return (value ?? "").replace(/\r\n/g, "\n").trim();
}

async function runTestCase(
  code: string,
  languageId: number,
  testCase: TestCase
) {
  const submissionResponse = await fetch(
    `${JUDGE0_URL}/submissions/?base64_encoded=false&wait=false`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_code: code,
        language_id: languageId,
        stdin: testCase.input,
      }),
      signal: AbortSignal.timeout(15000),
    }
  );

  if (!submissionResponse.ok) {
    throw new Error("Judge0 could not accept the code.");
  }

  const submission = await submissionResponse.json();
  const token = submission.token;

  if (!token) {
    throw new Error("Judge0 did not return a token.");
  }

  let result: any = null;

  for (let attempt = 0; attempt < 20; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await fetch(
      `${JUDGE0_URL}/submissions/${encodeURIComponent(token)}?base64_encoded=false`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) {
      throw new Error("Unable to retrieve Judge0 result.");
    }

    result = await response.json();

    if (result.status?.id > 2) break;
  }

  if (!result || !result.status || result.status.id <= 2) {
    return {
      status: "PROCESSING",
      actualOutput: result?.stdout ?? "",
      expectedOutput: testCase.expectedOutput,
      time: null,
    };
  }

  const statusId = result.status.id;
  const actualOutput = result.stdout ?? "";

  let status = "RUNTIME_ERROR";

  if (statusId === 3) {
    status =
      normalizeOutput(actualOutput) ===
      normalizeOutput(testCase.expectedOutput)
        ? "PASSED"
        : "WRONG_ANSWER";
  } else if (statusId === 4) {
    status = "WRONG_ANSWER";
  } else if (statusId === 5) {
    status = "TIME_LIMIT_EXCEEDED";
  } else if (statusId === 6) {
    status = "COMPILATION_ERROR";
  }

  return {
    status,
    actualOutput,
    expectedOutput: testCase.expectedOutput,
    stderr: result.stderr ?? "",
    compileOutput: result.compile_output ?? "",
    time: result.time ? Number(result.time) : null,
    memory: result.memory ?? null,
  };
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code, language, questionId } = body;

    if (
      typeof code !== "string" ||
      !code.trim() ||
      code.length > 20000 ||
      typeof language !== "string" ||
      !languageIds[language] ||
      typeof questionId !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid submission data." },
        { status: 400 }
      );
    }

    const question = await prisma.dsaQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found." },
        { status: 404 }
      );
    }

    const testCases = question.testCases;

    if (!Array.isArray(testCases) || testCases.length === 0) {
      return NextResponse.json(
        { error: "No test cases are available for this question." },
        { status: 422 }
      );
    }

    const validTestCases = testCases.filter(
      (item): item is { input: string; expectedOutput: string } =>
        typeof item === "object" &&
        item !== null &&
        "input" in item &&
        "expectedOutput" in item &&
        typeof item.input === "string" &&
        typeof item.expectedOutput === "string"
    );

    if (validTestCases.length !== testCases.length) {
      return NextResponse.json(
        { error: "Some test cases have an invalid format." },
        { status: 422 }
      );
    }

    const results = await Promise.all(
      validTestCases.map((testCase) =>
        runTestCase(code, languageIds[language], testCase)
      )
    );

    const processing = results.some(
      (result) => result.status === "PROCESSING"
    );

    let finalStatus = "ACCEPTED";

    if (processing) {
      finalStatus = "PENDING";
    } else if (results.some((result) => result.status === "COMPILATION_ERROR")) {
      finalStatus = "COMPILATION_ERROR";
    } else if (results.some((result) => result.status === "TIME_LIMIT_EXCEEDED")) {
      finalStatus = "TIME_LIMIT_EXCEEDED";
    } else if (results.some((result) => result.status === "RUNTIME_ERROR")) {
      finalStatus = "RUNTIME_ERROR";
    } else if (results.some((result) => result.status !== "PASSED")) {
      finalStatus = "WRONG_ANSWER";
    }

    const totalRuntime = results.reduce(
      (total, result) => total + (result.time ?? 0),
      0
    );

    const savedSubmission = await prisma.submission.create({
      data: {
        code,
        language,
        status: finalStatus,
        runtime: Math.round(totalRuntime * 1000),
        userId: user.id,
        questionId: question.id,
      },
    });

    return NextResponse.json({
      message:
        finalStatus === "ACCEPTED"
          ? "All test cases passed!"
          : "Code evaluation completed.",
      status: finalStatus,
      passed: results.filter((result) => result.status === "PASSED").length,
      total: results.length,
      testResults: results,
      submission: savedSubmission,
    });
  } catch (error) {
    console.error("Submission evaluation error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to evaluate submission.",
      },
      { status: 500 }
    );
  }
}
