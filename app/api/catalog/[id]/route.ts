import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { deleteCatalogImage } from "@/lib/store-data";

export const runtime = "nodejs";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "غير مصرّح بهذا الإجراء." }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    const result = await deleteCatalogImage(id);
    if (result.kind === "missing") {
      return NextResponse.json({ error: "الصورة المطلوبة غير موجودة." }, { status: 404 });
    }
    if (result.kind === "last-fabric") {
      return NextResponse.json({ error: "يجب الاحتفاظ بصورة قماش واحدة على الأقل للحاسبة." }, { status: 409 });
    }
    return NextResponse.json({ catalog: result.catalog }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Unable to delete the catalog image.", error);
    return NextResponse.json({ error: "تعذّر حذف الصورة حالياً." }, { status: 500 });
  }
}
