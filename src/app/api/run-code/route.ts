
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

const JUDGE0_URL = "https://ce.judge0.com";

const languageIds: Record<string, number> = {
  javascript: 63,
  python: 71,
  java: 62,
};

export async function POST(request: Request) {
  try {
    // Check login
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please log in first." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code, language, stdin = "" } = body;

    // Validate input
    if (
      typeof code !== "string" ||
      !code.trim() ||
      code.length > 20000 ||
      typeof language !== "string" ||
      typeof stdin !== "string" ||
      stdin.length > 10000 ||
      !languageIds[language]
    ) {
      return NextResponse.json(
        { error: "Invalid code or programming language." },
        { status: 400 }
      );
    }

    // Send code to Judge0
    const submissionResponse = await fetch(
      `${JUDGE0_URL}/submissions/?base64_encoded=false&wait=false`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_code: code,
          language_id: languageIds[language],
          stdin,
        }),
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!submissionResponse.ok) {
      const errorText = await submissionResponse.text();
      console.error("Judge0 submission error:", errorText);

      return NextResponse.json(
        { error: "Judge0 could not accept your code. Try again." },
        { status: 502 }
      );
    }

    const submissionData = await submissionResponse.json();
    const token = submissionData.token;

    if (!token) {
      return NextResponse.json(
        { error: "Judge0 did not return a submission token." },
        { status: 502 }
      );
    }

    // Check execution result
    let result: any = null;

    for (let attempt = 0; attempt < 15; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const resultResponse = await fetch(
        `${JUDGE0_URL}/submissions/${encodeURIComponent(token)}?base64_encoded=false`,
        {
          signal: AbortSignal.timeout(10000),
        }
      );

      if (!resultResponse.ok) {
        throw new Error("Unable to retrieve execution result.");
      }

      result = await resultResponse.json();

      // Status 1 = In Queue, 2 = Processing
      if (result.status?.id > 2) {
        break;
      }
    }

    if (!result || !result.status || result.status.id <= 2) {
      return NextResponse.json(
        {
          token,
          status: "Processing",
          message: "Your code is still being processed. Please try again.",
        },
        { status: 202 }
      );
    }

    return NextResponse.json({
      token,
      status: result.status.description,
      stdout: result.stdout,
      stderr: result.stderr,
      compile_output: result.compile_output,
      message: result.message,
      time: result.time,
      memory: result.memory,
    });
  } catch (error) {
    console.error("Code execution error:", error);

    return NextResponse.json(
      { error: "Unable to execute code. Please try again." },
      { status: 500 }
    );
  }
}
