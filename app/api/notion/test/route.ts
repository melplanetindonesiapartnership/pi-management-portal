import { Client } from "@notionhq/client";

const token = process.env.NOTION_TOKEN;
const dataSourceId = process.env.NOTION_TASKS_DATA_SOURCE_ID;

const notion = token ? new Client({ auth: token }) : null;

export async function GET(): Promise<Response> {
  try {
    if (!token) {
      return Response.json(
        {
          success: false,
          error: "NOTION_TOKEN belum tersedia.",
        },
        { status: 500 }
      );
    }

    if (!dataSourceId) {
      return Response.json(
        {
          success: false,
          error: "NOTION_TASKS_DATA_SOURCE_ID belum tersedia.",
        },
        { status: 500 }
      );
    }

    if (!notion) {
      return Response.json(
        {
          success: false,
          error: "Notion client gagal dibuat.",
        },
        { status: 500 }
      );
    }

    const dataSource = await notion.dataSources.retrieve({
      data_source_id: dataSourceId,
    });

    const properties = Object.values(dataSource.properties).map(
      (property) => ({
        name: property.name,
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
            : "Gagal membaca struktur Tasks dari Notion.",
      },
      { status: 500 }
    );
  }
}