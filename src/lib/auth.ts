import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function getCurrentUser() {
  try {
    const token = (await cookies()).get("session")?.value;

    if (!token) {
      return null;
    }

    const secret = process.env.SESSION_SECRET;

    if (!secret) {
      throw new Error("SESSION_SECRET is not configured");
    }

    const secretKey = new TextEncoder().encode(secret);

    const { payload } = await jwtVerify(token, secretKey);

    if (!payload.sub) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}