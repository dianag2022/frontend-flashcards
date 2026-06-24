import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/constants";

function getSetupSecret() {
  return process.env.ADMIN_SETUP_SECRET ?? "";
}

export async function POST(request: Request) {
  const { email, password } = (await request.json()) as {
    email: string;
    password: string;
  };

  const setupSecret = getSetupSecret();
  if (!setupSecret) {
    return NextResponse.json(
      { error: "Server misconfigured", message: "ADMIN_SETUP_SECRET is not set." },
      { status: 500 },
    );
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/sign-up-admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, setupSecret }),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
