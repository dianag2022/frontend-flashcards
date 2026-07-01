import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE_URL, SESSION_COOKIE } from "@/lib/constants";
import type { SessionPayload } from "@/lib/session";

export async function POST() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;

  if (!raw) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  let session: SessionPayload;
  try {
    session = JSON.parse(raw) as SessionPayload;
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  if (!session.refreshToken) {
    return NextResponse.json({ error: "Missing refresh token" }, { status: 401 });
  }

  const backendRes = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  });

  const data = await backendRes.json();

  if (!backendRes.ok) {
    return NextResponse.json(
      {
        error: data.error ?? "Refresh failed",
        message: data.message ?? "No se pudo renovar la sesión.",
      },
      { status: backendRes.status },
    );
  }

  const updated: SessionPayload = {
    idToken: data.idToken,
    refreshToken: data.refreshToken,
    user: {
      uid: data.uid,
      email: data.email,
      role: data.role,
    },
  };

  const response = NextResponse.json({
    idToken: updated.idToken,
    user: updated.user,
  });

  response.cookies.set(SESSION_COOKIE, JSON.stringify(updated), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
