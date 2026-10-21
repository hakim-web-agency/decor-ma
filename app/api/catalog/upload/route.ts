import { randomUUID } from "node:crypto";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  persistCatalogImage,
  type CatalogCategory,
} from "@/lib/store-data";

export const runtime = "nodejs";

type UUID = `${string}-${string}-${string}-${string}-${string}`;

type UploadMetadata = {
  category: CatalogCategory;
  title: string;
  id?: string;
  imageId: UUID;
  pathname: string;
};

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const validId = /^(?:(?:fabric|project)-[1-9]\d*|[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i;
const validPathname = /^images\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:jpg|png|webp)$/i;

function isUuid(value: string): value is UUID {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function parseClientPayload(value: string | null) {
  if (!value) return null;
  try {
    const payload: unknown = JSON.parse(value);
    if (typeof payload !== "object" || payload === null) return null;
    if (
      !("category" in payload) ||
      (payload.category !== "fabric" && payload.category !== "project") ||
      !("title" in payload) ||
      typeof payload.title !== "string" ||
      payload.title.trim().length === 0 ||
      payload.title.trim().length > 100
    ) {
      return null;
    }
    if ("id" in payload && payload.id !== undefined && (typeof payload.id !== "string" || !validId.test(payload.id))) {
      return null;
    }
    return {
      category: payload.category,
      title: payload.title.trim(),
      id: "id" in payload && typeof payload.id === "string" ? payload.id : undefined,
    } satisfies Omit<UploadMetadata, "imageId" | "pathname">;
  } catch {
    return null;
  }
}

function parseTokenPayload(value: string | null): UploadMetadata | null {
  if (!value) return null;
  try {
    const payload: unknown = JSON.parse(value);
    if (
      typeof payload !== "object" ||
      payload === null ||
      !("category" in payload) ||
      (payload.category !== "fabric" && payload.category !== "project") ||
      !("title" in payload) ||
      typeof payload.title !== "string" ||
      !("imageId" in payload) ||
      typeof payload.imageId !== "string" ||
      !isUuid(payload.imageId) ||
      !("pathname" in payload) ||
      typeof payload.pathname !== "string" ||
      !validPathname.test(payload.pathname)
    ) {
      return null;
    }
    if ("id" in payload && payload.id !== undefined && (typeof payload.id !== "string" || !validId.test(payload.id))) {
      return null;
    }
    return {
      category: payload.category,
      title: payload.title,
      imageId: payload.imageId,
      pathname: payload.pathname,
      id: "id" in payload && typeof payload.id === "string" ? payload.id : undefined,
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  let body: HandleUploadBody;
  try {
    body = await request.json() as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "طلب رفع الصورة غير صالح." }, { status: 400 });
  }

  if (!body || (body.type !== "blob.generate-client-token" && body.type !== "blob.upload-completed")) {
    return NextResponse.json({ error: "نوع طلب الرفع غير معروف." }, { status: 400 });
  }
  if (body.type === "blob.generate-client-token" && !(await isAdminRequest(request))) {
    return NextResponse.json({ error: "غير مصرّح بهذا الإجراء." }, { status: 401 });
  }
  if (body.type === "blob.generate-client-token") {
    if (
      !body.payload ||
      typeof body.payload.pathname !== "string" ||
      !validPathname.test(body.payload.pathname) ||
      !parseClientPayload(body.payload.clientPayload)
    ) {
      return NextResponse.json({ error: "بيانات الصورة المرسلة غير صالحة." }, { status: 400 });
    }
    const extension = body.payload.pathname.slice(body.payload.pathname.lastIndexOf(".") + 1);
    const expectedType = extension === "jpg" ? "image/jpeg" : `image/${extension}`;
    if (!allowedTypes.has(expectedType)) {
      return NextResponse.json({ error: "صيغة الصورة غير مدعومة." }, { status: 400 });
    }
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    return NextResponse.json(
      { error: "رفع الصور غير مُعدّ حالياً. يرجى ضبط BLOB_READ_WRITE_TOKEN في بيئة التشغيل." },
      { status: 503 },
    );
  }

  try {
    const result = await handleUpload({
      token: blobToken,
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const metadata = parseClientPayload(clientPayload);
        if (!metadata || !validPathname.test(pathname)) {
          throw new Error("Invalid image upload metadata.");
        }
        if (body.type !== "blob.generate-client-token") {
          throw new Error("Upload token requested for an unexpected operation.");
        }
        const extension = pathname.slice(pathname.lastIndexOf(".") + 1);
        const expectedType = extension === "jpg" ? "image/jpeg" : `image/${extension}`;
        return {
          allowedContentTypes: [...allowedTypes].filter((type) => type === expectedType),
          maximumSizeInBytes: 5 * 1024 * 1024,
          tokenPayload: JSON.stringify({
            ...metadata,
            imageId: randomUUID(),
            pathname,
          } satisfies UploadMetadata),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const metadata = parseTokenPayload(tokenPayload ?? null);
        if (!metadata || blob.pathname !== metadata.pathname) {
          throw new Error("The completed image upload metadata is invalid.");
        }
        const saved = await persistCatalogImage(
          blob.url,
          metadata.category,
          metadata.title,
          metadata.id,
          metadata.imageId,
        );
        if (saved.notFound) {
          console.warn("Discarded an uploaded image because its catalog entry was deleted during upload.");
        }
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Unable to complete the Vercel Blob upload.", error);
    return NextResponse.json({ error: "تعذّر إكمال رفع الصورة. تحققوا من إعدادات Vercel Blob وحاولوا مجدداً." }, { status: 500 });
  }
}
