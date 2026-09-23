import { Client } from "@notionhq/client";

const token = process.env.NOTION_TOKEN;
const dataSourceId = process.env.NOTION_SUBTASKS_DATA_SOURCE_ID;

type UnknownRecord = Record<string, unknown>;

type Subtask = {
  id: string;
  name: string;
  assignedTo: string[];
  done: boolean;
  dueDate: string | null;
  notes: string;
  lastEdited: string | null;
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function getTextFromRichText(value: unknown): string {
  if (!Array.isArray(value)) {
    return "";
  }

  return value
    .filter(isRecord)
    .map((item) => {
      const plainText = item["plain_text"];

      return typeof plainText === "string" ? plainText : "";
    })
    .join("");
}

function getTitle(properties: UnknownRecord): string {
  const property = Object.values(properties).find(
    (item) => isRecord(item) && item["type"] === "title"
  );

  if (!isRecord(property)) {
    return "(Untitled)";
  }

  return getTextFromRichText(property["title"]) || "(Untitled)";
}

function getPeople(properties: UnknownRecord): string[] {
  const property = properties["Assigned to"];

  if (!isRecord(property) || property["type"] !== "people") {
    return [];
  }

  const people = property["people"];

  if (!Array.isArray(people)) {
    return [];
  }

  return people
    .filter(isRecord)
    .map((person) => {
      const name = person["name"];

      return typeof name === "string" ? name : "";
    })
    .filter((name) => name.length > 0);
}

function getDone(properties: UnknownRecord): boolean {
  const property = properties["Done?"];

  if (!isRecord(property) || property["type"] !== "checkbox") {
    return false;
  }

  return property["checkbox"] === true;
}

function getDate(
  properties: UnknownRecord,
  propertyName: string
): string | null {
  const property = properties[propertyName];

  if (!isRecord(property) || property["type"] !== "date") {
    return null;
  }

  const date = property["date"];

  if (!isRecord(date)) {
    return null;
  }

  const start = date["start"];

  return typeof start === "string" ? start : null;
}

function getNotes(properties: UnknownRecord): string {
  const property = properties["Notes"];

  if (!isRecord(property) || property["type"] !== "rich_text") {
    return "";
  }

  return getTextFromRichText(property["rich_text"]);
}

function getLastEditedTime(
  properties: UnknownRecord
): string | null {
  const property = properties["Last edited time"];

  if (
    !isRecord(property) ||
    property["type"] !== "last_edited_time"
  ) {
    return null;
  }

  const value = property["last_edited_time"];

  return typeof value === "string" ? value : null;
}

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ taskId: string }>;
  }
): Promise<Response> {
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
          error:
            "NOTION_SUBTASKS_DATA_SOURCE_ID belum tersedia di .env.local.",
        },
        { status: 500 }
      );
    }

    const { taskId } = await context.params;

    if (!taskId) {
      return Response.json(
        {
          success: false,
          error: "Task ID belum diberikan.",
        },
        { status: 400 }
      );
    }

    const notion = new Client({
      auth: token,
    });

    const allSubtasks: Subtask[] = [];

    let cursor: string | undefined = undefined;

    while (true) {
      const response = await notion.dataSources.query({
        data_source_id: dataSourceId,
        page_size: 100,
        filter: {
          property: "Parent Main Tasks",
          relation: {
            contains: taskId,
          },
        },
        ...(cursor ? { start_cursor: cursor } : {}),
      });

      for (const item of response.results) {
        if (
          !("properties" in item) ||
          !isRecord(item.properties)
        ) {
          continue;
        }

        const properties = item.properties as UnknownRecord;

        allSubtasks.push({
          id: item.id,
          name: getTitle(properties),
          assignedTo: getPeople(properties),
          done: getDone(properties),
          dueDate: getDate(properties, "Due Date"),
          notes: getNotes(properties),
          lastEdited: getLastEditedTime(properties),
        });
      }

      if (!response.has_more || !response.next_cursor) {
        break;
      }

      cursor = response.next_cursor;
    }

    const completedCount = allSubtasks.filter(
      (subtask) => subtask.done
    ).length;

    return Response.json({
      success: true,
      taskId,
      count: allSubtasks.length,
      completedCount,
      remainingCount:
        allSubtasks.length - completedCount,
      subtasks: allSubtasks,
    });
  } catch (error: unknown) {
    console.error("Notion subtasks error:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal membaca subtasks dari Notion.",
      },
      { status: 500 }
    );
  }
}