import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

function getTitle(item: any) {
  if (!item) {
    return "Untitled";
  }

  // Database / data source title
  if (Array.isArray(item.title)) {
    return (
      item.title
        .map((part: any) => part?.plain_text || "")
        .join("")
        .trim() || "Untitled"
    );
  }

  // Page title
  if (item.properties) {
    for (const property of Object.values(
      item.properties
    ) as any[]) {
      if (
        property?.type === "title" &&
        Array.isArray(property.title)
      ) {
        const title = property.title
          .map(
            (part: any) =>
              part?.plain_text || ""
          )
          .join("")
          .trim();

        if (title) {
          return title;
        }
      }
    }
  }

  return "Untitled";
}

function getPropertySummary(
  properties: Record<string, any> | undefined
) {
  if (!properties) {
    return [];
  }

  return Object.entries(properties).map(
    ([name, property]) => ({
      name,
      type: property?.type || "unknown",
    })
  );
}

async function runSearch(
  query: string
) {
  try {
    const response =
      await notion.search({
        query,
        page_size: 50,
      });

    return {
      query,
      results: response.results.map(
        (item: any) => ({
          id: item.id,
          object: item.object,
          title: getTitle(item),
          url: item.url || null,
          properties:
            getPropertySummary(
              item.properties
            ),
        })
      ),
    };
  } catch (error) {
    return {
      query,
      error:
        error instanceof Error
          ? error.message
          : "Search failed",
      results: [],
    };
  }
}

export async function GET() {
  try {
    if (!process.env.NOTION_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error:
            "NOTION_TOKEN is missing.",
        },
        { status: 500 }
      );
    }

    /*
     * Search several likely terms.
     *
     * We are not assuming that the workspace
     * has a specific Programs database.
     */

    const queries = [
  "Program",
  "Programs",
  "SMART Patrol",
  "Data Management",
  "Dashboard",
  "Impact Dashboard",
  "Partner",
  "Partners",
  "Scaling",
  "Partnership",
];

    const results = [];

    for (const query of queries) {
      const result =
        await runSearch(query);

      results.push(result);
    }

    /*
     * Collect unique objects so the output
     * is easier to read.
     */

    const uniqueMap =
      new Map<string, any>();

    for (const searchResult of results) {
      for (const item of searchResult.results) {
        if (!uniqueMap.has(item.id)) {
          uniqueMap.set(
            item.id,
            item
          );
        }
      }
    }

    const uniqueResults = Array.from(
      uniqueMap.values()
    );

    /*
     * Try to retrieve schemas for database/
     * data_source results.
     */

    const enriched = [];

    for (const item of uniqueResults) {
      const result = {
        ...item,
        schema: null as
          | any[]
          | null,
      };

      try {
        if (item.object === "database") {
          const database =
            await notion.databases.retrieve(
              {
                database_id:
                  item.id,
              }
            );

          result.schema =
            getPropertySummary(
              (database as any)
                .properties
            );
        }

        /*
         * Newer Notion API versions may
         * return data_source objects.
         */

        if (
          item.object ===
          "data_source"
        ) {
          const dataSource =
            await (
              notion as any
            ).dataSources.retrieve(
              {
                data_source_id:
                  item.id,
              }
            );

          result.schema =
            getPropertySummary(
              dataSource.properties
            );
        }
      } catch {
        /*
         * A search result may be readable
         * while schema retrieval is not
         * available for that object.
         */

        result.schema = null;
      }

      enriched.push(result);
    }

    return NextResponse.json({
      success: true,
      searchedQueries: queries,
      count: enriched.length,
      results: enriched,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected discovery error.",
      },
      { status: 500 }
    );
  }
}