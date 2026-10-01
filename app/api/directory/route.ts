import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type DirectoryRow = Record<string, unknown>;

export async function GET() {
  const apiUrl = process.env.DIRECTORY_SHEET_API_URL;

  if (!apiUrl) {
    return NextResponse.json(
      {
        ok: false,
        error: "DIRECTORY_SHEET_API_URL belum tersedia.",
      },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
      headers: {
        Accept: "application/json,text/plain,*/*",
      },
    });

    const rawText = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `Google Apps Script mengembalikan HTTP ${response.status}.`,
          status: response.status,
          contentType: response.headers.get("content-type"),
          preview: rawText.slice(0, 500),
        },
        { status: 502 }
      );
    }

    let result: {
      ok?: boolean;
      count?: number;
      data?: DirectoryRow[];
      error?: string;
    };

    try {
      // Bersihkan BOM/whitespace yang kadang muncul dari response Google
      const cleanText = rawText.replace(/^\uFEFF/, "").trim();

      result = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("DIRECTORY_JSON_PARSE_ERROR:", parseError);

      return NextResponse.json(
        {
          ok: false,
          error: "Respons dari Google Apps Script bukan JSON yang valid.",
          contentType: response.headers.get("content-type"),
          preview: rawText.slice(0, 1000),
        },
        { status: 502 }
      );
    }

    if (result.ok !== true) {
      return NextResponse.json(
        {
          ok: false,
          error: result.error || "Google Apps Script mengembalikan error.",
        },
        { status: 502 }
      );
    }

    const data: DirectoryRow[] = Array.isArray(result.data)
      ? result.data
      : [];

    return NextResponse.json({
      ok: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("DIRECTORY_FETCH_ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Gagal mengambil data Directory dari Google Sheet.",
        detail:
          error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}