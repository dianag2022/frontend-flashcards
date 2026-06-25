import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/constants";

interface SessionPayload {
  idToken: string;
  refreshToken: string;
  user: {
    uid: string;
    email: string;
    role: "admin" | "end-user" | null;
  };
}

export async function GET() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  try {
    const session = JSON.parse(raw) as SessionPayload;
    return NextResponse.json({
      user: session.user,
      idToken: session.idToken,
    });
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as SessionPayload;
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, JSON.stringify(body), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
