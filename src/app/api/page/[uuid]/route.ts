import { NextRequest, NextResponse } from "next/server";

// Interface for the save payload
interface SavePagePayload {
  uuid: string;
  html: string;
  metadata?: {
    pageTitle?: string;
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const body: SavePagePayload = await request.json();
    const { uuid } = await params;

    // Validate the request
    if (!body.html) {
      return NextResponse.json(
        { error: "HTML content is required" },
        { status: 400 }
      );
    }

    // Validate UUID format (basic validation)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(uuid)) {
      return NextResponse.json(
        { error: "Invalid UUID format" },
        { status: 400 }
      );
    }

    // Here you would typically save to a database
    // For now, we'll just log and return success
    console.log("Saving page:", {
      uuid,
      html: body.html.substring(0, 100) + "...", // Log first 100 chars
      metadata: body.metadata,
      timestamp: new Date().toISOString(),
    });

    // Simulate some processing time
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      message: "Page saved successfully",
      uuid,
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error saving page:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
