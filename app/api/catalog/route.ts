import { NextResponse } from "next/server";
import { readStore } from "@/lib/store-data";

export const runtime = "nodejs";

const jsonHeaders = { "Cache-Control": "no-store" };

export async function GET() {
  try {
    const store = await readStore();
    return NextResponse.json({ catalog: store.catalog }, { headers: jsonHeaders });
  } catch (error) {
    console.error("Unable to read the image catalog.", error);
    return NextResponse.json({ error: "تعذّر تحميل كتالوج الصور حالياً." }, { status: 500, headers: jsonHeaders });
  }
}
