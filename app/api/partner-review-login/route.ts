import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "partner-review-login",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const password = String(body?.password ?? "");
    const correctPassword = process.env.PARTNER_REVIEW_PASSWORD;

    // Password belum diatur di environment
    if (!correctPassword) {
      return NextResponse.json(
        {
          ok: false,
          message: "Password portal belum dikonfigurasi.",
        },
        { status: 500 }
      );
    }

    // Password salah
    if (password !== correctPassword) {
      return NextResponse.json(
        {
          ok: false,
          message: "Password salah.",
        },
        { status: 401 }
      );
    }

    // Password benar
    return NextResponse.json({
      ok: true,
      message: "Login berhasil.",
    });
  } catch (error) {
    console.error("Partner Review Login Error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Terjadi kesalahan.",
      },
      { status: 400 }
    );
  }
}