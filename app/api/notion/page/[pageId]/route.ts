import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

type Params = {
  params: Promise<{
    pageId: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const { pageId } = await params;

    if (!pageId) {
      return NextResponse.json(
        {
          success: false,
          error: "Page ID is required.",
        },
        { status: 400 }
      );
    }

    /*
     * Ambil metadata halaman
     */
    const page = await notion.pages.retrieve({
      page_id: pageId,
    });

    /*
     * Ambil block pertama
     */
    const blocks =
      await notion.blocks.children.list({
        block_id: pageId,
        page_size: 100,
      });

    /*
     * Ambil property halaman
     */
    const pageProperties =
      (page as any).properties || {};

    return NextResponse.json({
      success: true,
      page: {
        id: (page as any).id,
        url: (page as any).url || null,
        properties: pageProperties,
      },
      blocks: blocks.results,
      hasMore: blocks.has_more,
      nextCursor: blocks.next_cursor,
    });
  } catch (error) {
    console.error(
      "Notion page read error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to read Notion page.",
      },
      { status: 500 }
    );
  }
}