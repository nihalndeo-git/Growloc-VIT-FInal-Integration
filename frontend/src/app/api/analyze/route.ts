import { NextResponse } from "next/server";

export const runtime = "nodejs";

type AiAnalyzeResponse = {
  canopy_height: number;
  canopy_width: number;
  canopy_area: number;
};

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid multipart body." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Missing file field \"file\"." },
      { status: 400 },
    );
  }

  const aiForm = new FormData();
  aiForm.append("file", file);

  let aiJson: AiAnalyzeResponse;
  try {
    const aiRes = await fetch("http://localhost:8001/analyze", {
      method: "POST",
      body: aiForm,
    });
    if (!aiRes.ok) {
      const text = await aiRes.text();
      return NextResponse.json(
        {
          error: "AI service request failed.",
          detail: text.slice(0, 500),
        },
        { status: 502 },
      );
    }
    aiJson = (await aiRes.json()) as AiAnalyzeResponse;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "AI service unreachable.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const canopyHeight = Number(aiJson.canopy_height);
  const canopyWidth = Number(aiJson.canopy_width);
  const canopyArea = Number(aiJson.canopy_area);
  if (
    !Number.isFinite(canopyHeight) ||
    !Number.isFinite(canopyWidth) ||
    !Number.isFinite(canopyArea)
  ) {
    return NextResponse.json(
      { error: "AI service returned invalid metrics." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    canopyHeight,
    canopyWidth,
    canopyArea,
  });
}
