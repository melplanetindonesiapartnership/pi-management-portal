import { Client } from "@notionhq/client";

const token = process.env.NOTION_TOKEN;
const dataSourceId = process.env.NOTION_TASKS_DATA_SOURCE_ID;

type UnknownRecord = Record<string, unknown>;

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

function getRichText(
  properties: UnknownRecord,
  propertyName: string
): string {
  const property = properties[propertyName];

  if (!isRecord(property) || property["type"] !== "rich_text") {
    return "";
  }

  return getTextFromRichText(property["rich_text"]);
}

function getStatus(properties: UnknownRecord): string | null {
  const property = properties["Status"];

  if (!isRecord(property) || property["type"] !== "status") {
    return null;
  }

  const status = property["status"];

  if (!isRecord(status)) {
    return null;
  }

  return typeof status["name"] === "string"
    ? status["name"]
    : null;
}

function getSelect(
  properties: UnknownRecord,
  propertyName: string
): string | null {
  const property = properties[propertyName];

  if (!isRecord(property) || property["type"] !== "select") {
    return null;
  }

  const select = property["select"];

  if (!isRecord(select)) {
    return null;
  }

  return typeof select["name"] === "string"
    ? select["name"]
    : null;
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

  return typeof date["start"] === "string"
    ? date["start"]
    : null;
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

function getProgress(properties: UnknownRecord): number | null {
  const property = properties["% Progress"];

  if (!isRecord(property) || property["type"] !== "rollup") {
    return null;
  }

  const rollup = property["rollup"];

  if (!isRecord(rollup)) {
    return null;
  }

  if (rollup["type"] === "number") {
    const number = rollup["number"];

    if (typeof number !== "number") {
      return null;
    }

    // Notion rollup returns a ratio such as 0.75.
    // Convert it to percentage: 75.
    return number * 100;
  }

  return null;
}

function getSubtaskCount(properties: UnknownRecord): number {
  const property = properties["Subtasks"];

  if (!isRecord(property) || property["type"] !== "relation") {
    return 0;
  }

  const relation = property["relation"];

  return Array.isArray(relation) ? relation.length : 0;
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

  const lastEdited = property["last_edited_time"];

  return typeof lastEdited === "string"
    ? lastEdited
    : null;
}

type Task = {
  id: string;
  name: string;
  description: string;
  assignedTo: string[];
  status: string | null;
  progress: number | null;
  priority: string | null;
  sprint: string | null;
  startDate: string | null;
  dueDate: string | null;
  subtaskCount: number;
  lastEdited: string | null;
};

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
          error:
            "NOTION_TASKS_DATA_SOURCE_ID belum tersedia di .env.local.",
        },
        { status: 500 }
      );
    }

    const notion = new Client({
      auth: token,
    });

    const allTasks: Task[] = [];

    let cursor: string | undefined = undefined;

    while (true) {
      const response = await notion.dataSources.query({
        data_source_id: dataSourceId,
        page_size: 100,
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

        const task: Task = {
          id: item.id,
          name: getTitle(properties),
          description: getRichText(
            properties,
            "Description"
          ),
          assignedTo: getPeople(properties),
          status: getStatus(properties),
          progress: getProgress(properties),
          priority: getSelect(
            properties,
            "Priority"
          ),
          sprint: getSelect(
            properties,
            "Sprint planning"
          ),
          startDate: getDate(
            properties,
            "Start Sprint Date"
          ),
          dueDate: getDate(
            properties,
            "Due Date"
          ),
          subtaskCount: getSubtaskCount(
            properties
          ),
          lastEdited: getLastEditedTime(
            properties
          ),
        };

        allTasks.push(task);
      }

      if (!response.has_more || !response.next_cursor) {
        break;
      }

      cursor = response.next_cursor;
    }

    return Response.json({
      success: true,
      count: allTasks.length,
      hasMore: false,
      tasks: allTasks,
    });
  } catch (error: unknown) {
    console.error(
      "Notion tasks error:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal membaca task dari Notion.",
      },
      { status: 500 }
    );
  }
}