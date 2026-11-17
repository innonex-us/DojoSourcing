import { NextResponse } from "next/server";

type QuotePayload = {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  interests?: string[];
  message?: string;
  techPackName?: string;
  techPackSize?: number;
};

export async function POST(req: Request) {
  let body: QuotePayload;
  try {
    body = (await req.json()) as QuotePayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!name || !email || !email.includes("@") || !message) {
    return NextResponse.json(
      {
        ok: false,
        error: "Please provide your name, a valid email, and project details.",
      },
      { status: 400 },
    );
  }

  const referenceId = `DJ-${Math.floor(100000 + Math.random() * 900000)}`;

  return NextResponse.json(
    {
      ok: true,
      referenceId,
      receivedAt: new Date().toISOString(),
      summary: {
        name,
        company: body.company?.trim() || "Independent Brand",
        email,
        interests: Array.isArray(body.interests) ? body.interests : [],
        techPackName: body.techPackName || null,
      },
    },
    { status: 200 },
  );
}
