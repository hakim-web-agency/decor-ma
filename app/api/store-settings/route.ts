import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { readStore, savePricing } from "@/lib/store-data";
import type { PricingSettings } from "@/lib/pricing";

export const runtime = "nodejs";

const jsonHeaders = { "Cache-Control": "no-store" };

export async function GET() {
  try {
    const store = await readStore();
    return NextResponse.json({ pricing: store.pricing }, { headers: jsonHeaders });
  } catch (error) {
    console.error("Unable to read store pricing.", error);
    return NextResponse.json({ error: "تعذّر تحميل الأسعار حالياً." }, { status: 500, headers: jsonHeaders });
  }
}

export async function PUT(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "غير مصرّح بهذا الإجراء." }, { status: 401, headers: jsonHeaders });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "البيانات المرسلة غير صالحة." }, { status: 400, headers: jsonHeaders });
  }

  if (typeof body !== "object" || body === null || !("pricing" in body)) {
    return NextResponse.json({ error: "يرجى إدخال الأسعار المطلوبة." }, { status: 400, headers: jsonHeaders });
  }
  if (typeof body.pricing !== "object" || body.pricing === null) {
    return NextResponse.json({ error: "يرجى إدخال الأسعار المطلوبة." }, { status: 400, headers: jsonHeaders });
  }
  const pricing = body.pricing as Partial<PricingSettings>;
  const values = [pricing.singleFace, pricing.doubleFace, pricing.shippingCost];
  if (values.some((value) => typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1_000_000)) {
    return NextResponse.json({ error: "يجب أن تكون الأسعار أرقاماً بين 0 و1,000,000 درهم." }, { status: 400, headers: jsonHeaders });
  }

  try {
    const savedPricing = await savePricing({
      singleFace: pricing.singleFace!,
      doubleFace: pricing.doubleFace!,
      shippingCost: pricing.shippingCost!,
    });
    return NextResponse.json({ pricing: savedPricing }, { headers: jsonHeaders });
  } catch (error) {
    console.error("Unable to save store pricing.", error);
    return NextResponse.json({ error: "تعذّر حفظ الأسعار. تحققوا من إعداد التخزين وحاولوا مجدداً." }, { status: 500, headers: jsonHeaders });
  }
}
