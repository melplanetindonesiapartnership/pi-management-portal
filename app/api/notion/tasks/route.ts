import { Client } from "@notionhq/client";

const token = process.env.NOTION_TOKEN;
const dataSourceId =
  process.env.NOTION_TASKS_DATA_SOURCE_ID;

type UnknownRecord = Record<string, unknown>;

function isRecord(
  value: unknown
): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function getTextFromRichText(
  value: unknown
): string {
  if (!Array.isArray(value)) {
    return "";
  }

  return value
    .filter(isRecord)
    .map((item) => {
      const plainText =
        item["plain_text"];

      return typeof plainText === "string"
        ? plainText
        : "";
    })
    .join("");
}

function getTitle(
  properties: UnknownRecord
): string {
  const titleProperty =
    Object.values(properties).find(
      (item) =>
        isRecord(item) &&
        item["type"] === "title"
    );

  if (!isRecord(titleProperty)) {
    return "(Untitled)";
  }

  return (
    getTextFromRichText(
      titleProperty["title"]
    ) || "(Untitled)"
  );
}

function getRichText(
  properties: UnknownRecord,
  propertyName: string
): string {
  const property =
    properties[propertyName];

  if (
    !isRecord(property) ||
    property["type"] !== "rich_text"
  ) {
    return "";
  }

  return getTextFromRichText(
    property["rich_text"]
  );
}

function getStatus(
  properties: UnknownRecord
): string | null {
  const property =
    properties["Status"];

  if (
    !isRecord(property) ||
    property["type"] !== "status"
  ) {
    return null;
  }

  const status =
    property["status"];

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
  const property =
    properties[propertyName];

  if (
    !isRecord(property) ||
    property["type"] !== "select"
  ) {
    return null;
  }

  const select =
    property["select"];

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
  const property =
    properties[propertyName];

  if (
    !isRecord(property) ||
    property["type"] !== "date"
  ) {
    return null;
  }

  const date =
    property["date"];

  if (!isRecord(date)) {
    return null;
  }

  return typeof date["start"] === "string"
    ? date["start"]
    : null;
}

/**
 * Mengambil property people.
 *
 * Prioritas nama property:
 * 1. Assigned to
 * 2. PIC
 * 3. Assignee
 *
 * Kalau tidak ada, cari property bertipe "people".
 */
function findPeopleProperty(
  properties: UnknownRecord
): UnknownRecord | null {
  const aliases = [
    "assigned to",
    "pic",
    "assignee",
  ];

  for (
    const alias of aliases
  ) {
    const found =
      Object.entries(
        properties
      ).find(
        ([key, value]) =>
          key
            .trim()
            .toLowerCase() ===
            alias &&
          isRecord(value) &&
          value["type"] === "people"
      );

    if (
      found &&
      isRecord(found[1])
    ) {
      return found[1];
    }
  }

  const fallback =
    Object.values(
      properties
    ).find(
      (value) =>
        isRecord(value) &&
        value["type"] === "people"
    );

  if (
    isRecord(fallback)
  ) {
    return fallback;
  }

  return null;
}

/**
 * Ambil nama PIC dari property people.
 */
function getPeopleFromProperty(
  property: UnknownRecord
): string[] {
  const people =
    property["people"];

  if (!Array.isArray(people)) {
    return [];
  }

  return people
    .filter(isRecord)
    .map((person) => {
      const name =
        person["name"];

      return typeof name === "string"
        ? name.trim()
        : "";
    })
    .filter(
      (name) =>
        name.length > 0
    );
}

/**
 * Ambil PIC dari properties page.
 */
function getPeople(
  properties: UnknownRecord
): string[] {
  const property =
    findPeopleProperty(
      properties
    );

  if (!property) {
    return [];
  }

  return getPeopleFromProperty(
    property
  );
}

/**
 * Fallback:
 * ambil user langsung berdasarkan ID.
 *
 * Ini digunakan hanya ketika object people
 * tidak memiliki nama.
 */
async function getPeopleWithUserLookup(
  properties: UnknownRecord,
  notion: Client
): Promise<string[]> {
  const property =
    findPeopleProperty(
      properties
    );

  if (!property) {
    return [];
  }

  const people =
    property["people"];

  if (!Array.isArray(people)) {
    return [];
  }

  const names =
    await Promise.all(
      people
        .filter(isRecord)
        .map(async (person) => {
          const directName =
            person["name"];

          if (
            typeof directName ===
              "string" &&
            directName.trim()
          ) {
            return directName.trim();
          }

          const userId =
            person["id"];

          if (
            typeof userId !==
              "string" ||
            !userId.trim()
          ) {
            return "";
          }

          try {
            const user =
              await notion.users.retrieve(
                {
                  user_id: userId,
                }
              );

            if (
              isRecord(user)
            ) {
              const name =
                user["name"];

              if (
                typeof name ===
                  "string" &&
                name.trim()
              ) {
                return name.trim();
              }

             const personInfo =
  "person" in user
    ? user.person
    : undefined;

if (
  isRecord(
    personInfo
  )
) {
  const email =
    personInfo[
      "email"
    ];

                if (
                  typeof email ===
                    "string" &&
                  email.trim()
                ) {
                  return email.trim();
                }
              }
            }
          } catch (
            error
          ) {
            console.warn(
              "Unable to retrieve Notion user:",
              userId,
              error
            );
          }

          return "";
        })
    );

  return names.filter(
    (name) =>
      name.length > 0
  );
}

function getProgress(
  properties: UnknownRecord
): number | null {
  const property =
    properties["% Progress"];

  if (
    !isRecord(property) ||
    property["type"] !== "rollup"
  ) {
    return null;
  }

  const rollup =
    property["rollup"];

  if (!isRecord(rollup)) {
    return null;
  }

  if (
    rollup["type"] ===
    "number"
  ) {
    const number =
      rollup["number"];

    if (
      typeof number !==
      "number"
    ) {
      return null;
    }

    return number * 100;
  }

  return null;
}

function getSubtaskCount(
  properties: UnknownRecord
): number {
  const property =
    properties["Subtasks"];

  if (
    !isRecord(property) ||
    property["type"] !==
      "relation"
  ) {
    return 0;
  }

  const relation =
    property["relation"];

  return Array.isArray(
    relation
  )
    ? relation.length
    : 0;
}

function getLastEditedTime(
  properties: UnknownRecord
): string | null {
  const property =
    properties["Last edited time"];

  if (
    !isRecord(property) ||
    property["type"] !==
      "last_edited_time"
  ) {
    return null;
  }

  const lastEdited =
    property[
      "last_edited_time"
    ];

  return typeof lastEdited ===
    "string"
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
          error:
            "NOTION_TOKEN belum tersedia di .env.local.",
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

    const notion =
      new Client({
        auth: token,
      });

    const allTasks: Task[] = [];

    let cursor:
      | string
      | undefined =
      undefined;

    while (true) {
      const response =
        await notion.dataSources.query(
          {
            data_source_id:
              dataSourceId,
            page_size: 100,
            ...(cursor
              ? {
                  start_cursor:
                    cursor,
                }
              : {}),
          }
        );

      for (
        const item of
          response.results
      ) {
        if (
          !("properties" in item) ||
          !isRecord(
            item.properties
          )
        ) {
          continue;
        }

        const queryProperties =
          item.properties as UnknownRecord;

        /*
         * Pertama ambil PIC langsung
         * dari hasil query.
         */
        let assignedTo =
          getPeople(
            queryProperties
          );

        /*
         * Kalau kosong, coba ambil
         * page Notion secara langsung.
         */
        if (
          assignedTo.length === 0
        ) {
          try {
            const fullPage =
              await notion.pages.retrieve(
                {
                  page_id:
                    item.id,
                }
              );

            if (
              "properties" in
                fullPage &&
              isRecord(
                fullPage.properties
              )
            ) {
              const fullProperties =
                fullPage.properties as UnknownRecord;

              /*
               * Coba lagi dari
               * full page properties.
               */
              assignedTo =
                getPeople(
                  fullProperties
                );

              /*
               * Kalau masih belum dapat nama,
               * lookup user berdasarkan ID.
               */
              if (
                assignedTo.length ===
                0
              ) {
                assignedTo =
                  await getPeopleWithUserLookup(
                    fullProperties,
                    notion
                  );
              }
            }
          } catch (
            error
          ) {
            console.warn(
              "Unable to retrieve full Notion page:",
              item.id,
              error
            );
          }
        }

        const task: Task = {
          id: item.id,

          name:
            getTitle(
              queryProperties
            ),

          description:
            getRichText(
              queryProperties,
              "Description"
            ),

          assignedTo,

          status:
            getStatus(
              queryProperties
            ),

          progress:
            getProgress(
              queryProperties
            ),

          priority:
            getSelect(
              queryProperties,
              "Priority"
            ),

          sprint:
            getSelect(
              queryProperties,
              "Sprint planning"
            ),

          startDate:
            getDate(
              queryProperties,
              "Start Sprint Date"
            ),

          dueDate:
            getDate(
              queryProperties,
              "Due Date"
            ),

          subtaskCount:
            getSubtaskCount(
              queryProperties
            ),

          lastEdited:
            getLastEditedTime(
              queryProperties
            ),
        };

        allTasks.push(task);
      }

      if (
        !response.has_more ||
        !response.next_cursor
      ) {
        break;
      }

      cursor =
        response.next_cursor;
    }

    return Response.json({
      success: true,
      count:
        allTasks.length,
      hasMore: false,
      tasks:
        allTasks,
    });
  } catch (
    error: unknown
  ) {
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