import { Client } from "@notionhq/client";

const token = process.env.NOTION_TOKEN;
const dataSourceId = process.env.NOTION_TASKS_DATA_SOURCE_ID;

export async function GET(): Promise<Response> {
  try {
    if (!token) {
      return Response.json(
        {
          success: false,
          error: "NOTION_TOKEN belum tersedia di .env.local.",
        },
        { status: 500 }
      );
    }

    if (!dataSourceId) {
      return Response.json(
        {
          success: false,
          error: "NOTION_TASKS_DATA_SOURCE_ID belum tersedia di .env.local.",
        },
        { status: 500 }
      );
    }

    const notion = new Client({
      auth: token,
    });

    const dataSource = await notion.dataSources.retrieve({
      data_source_id: dataSourceId,
    });

    const properties = Object.entries(dataSource.properties).map(
      ([name, property]) => ({
        name,
        type: property.type,
        id: property.id,
      })
    );

    return Response.json({
      success: true,
      dataSourceId,
      properties,
    });
  } catch (error: unknown) {
    console.error("Notion schema error:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal membaca schema Tasks dari Notion.",
      },
      { status: 500 }
    );
  }
}