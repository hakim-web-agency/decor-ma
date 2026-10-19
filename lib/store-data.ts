import { del } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";
import { randomUUID } from "node:crypto";
import { DEFAULT_PRICING, type PricingSettings } from "@/lib/pricing";

export type CatalogCategory = "fabric" | "project";

export type CatalogImage = {
  id: string;
  category: CatalogCategory;
  title: string;
  src: string;
};

type StoreData = {
  pricing: PricingSettings;
  catalog: CatalogImage[];
};

function getDatabase() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error("Set DATABASE_URL (or POSTGRES_URL) to your Neon/Vercel Postgres connection string.");
  }
  return neon(connectionString);
}

function getBlobToken() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("Set BLOB_READ_WRITE_TOKEN to enable persistent image storage.");
  return token;
}

function isPricingSettings(value: unknown): value is PricingSettings {
  if (typeof value !== "object" || value === null) return false;
  const pricing = value as Partial<PricingSettings>;
  return [pricing.singleFace, pricing.doubleFace, pricing.shippingCost].every(
    (price) => typeof price === "number" && Number.isFinite(price) && price >= 0,
  );
}

async function ensureStoreTables() {
  const sql = getDatabase();
  await sql`
    CREATE TABLE IF NOT EXISTS decor_store_settings (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS decor_catalog_images (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL CHECK (category IN ('fabric', 'project')),
      title TEXT NOT NULL,
      src TEXT NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS decor_store_meta (
      key TEXT PRIMARY KEY
    )
  `;
  await sql`
    INSERT INTO decor_store_settings (key, value)
    VALUES ('pricing', ${JSON.stringify(DEFAULT_PRICING)}::jsonb)
    ON CONFLICT (key) DO NOTHING
  `;
  await sql`
    WITH seed AS (
      INSERT INTO decor_store_meta (key)
      VALUES ('catalog_seed_v1')
      ON CONFLICT (key) DO NOTHING
      RETURNING key
    )
    INSERT INTO decor_catalog_images (id, category, title, src)
    SELECT defaults.id, defaults.category, defaults.title, defaults.src
    FROM seed
    CROSS JOIN (
      VALUES
        ('fabric-1', 'fabric', 'خامة صوف', '/image1.jpg'),
        ('fabric-2', 'fabric', 'مخمل فاخر', '/image2.jpg'),
        ('fabric-3', 'fabric', 'نسيج كلاسيكي', '/image3.jpg'),
        ('fabric-4', 'fabric', 'لمسة حريرية', '/image4.jpg'),
        ('fabric-5', 'fabric', 'قماش جاكار', '/image5.jpg'),
        ('fabric-6', 'fabric', 'نسيج ناعم', '/image6.jpg'),
        ('fabric-7', 'fabric', 'خامة راقية', '/image7.jpg'),
        ('fabric-8', 'fabric', 'قماش متين', '/image8.jpg'),
        ('fabric-9', 'fabric', 'نسيج مغربي', '/image9.jpg'),
        ('fabric-10', 'fabric', 'مخمل ناعم', '/image10.jpg'),
        ('fabric-11', 'fabric', 'قماش فاخر', '/image11.jpg'),
        ('fabric-12', 'fabric', 'نسيج مميز', '/image12.jpg'),
        ('project-1', 'project', 'مشروع صالون 1', '/salon1.jpg'),
        ('project-2', 'project', 'مشروع صالون 2', '/salon2.jpg'),
        ('project-3', 'project', 'مشروع صالون 3', '/salon3.jpg'),
        ('project-4', 'project', 'مشروع صالون 4', '/salon4.jpg'),
        ('project-5', 'project', 'مشروع صالون 5', '/salon5.jpg'),
        ('project-6', 'project', 'مشروع صالون 6', '/salon6.jpg'),
        ('project-7', 'project', 'مشروع صالون 7', '/salon7.jpg')
    ) AS defaults(id, category, title, src)
    ON CONFLICT (id) DO NOTHING
  `;
}

export async function readStore(): Promise<StoreData> {
  await ensureStoreTables();
  const sql = getDatabase();
  const [pricingRows, catalogRows] = await Promise.all([
    sql`SELECT value FROM decor_store_settings WHERE key = 'pricing'`,
    sql`SELECT id, category, title, src FROM decor_catalog_images ORDER BY category, id`,
  ]);
  const pricingValue: unknown = pricingRows[0]?.value;
  if (!isPricingSettings(pricingValue)) {
    throw new Error("The pricing record in the database has an invalid structure.");
  }
  return {
    pricing: pricingValue,
    catalog: catalogRows.map((row) => ({
      id: String(row.id),
      category: row.category as CatalogCategory,
      title: String(row.title),
      src: String(row.src),
    })),
  };
}

export async function savePricing(pricing: PricingSettings) {
  await ensureStoreTables();
  const sql = getDatabase();
  const rows = await sql`
    INSERT INTO decor_store_settings (key, value)
    VALUES ('pricing', ${JSON.stringify(pricing)}::jsonb)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    RETURNING value
  `;
  const savedPricing: unknown = rows[0]?.value;
  if (!isPricingSettings(savedPricing)) {
    throw new Error("The saved pricing record in the database has an invalid structure.");
  }
  return savedPricing;
}

async function removeBlob(src: string) {
  let hostname: string;
  try {
    hostname = new URL(src).hostname;
  } catch {
    return;
  }
  if (!hostname.endsWith(".public.blob.vercel-storage.com")) return;
  await del(src, { token: getBlobToken() });
}

async function removeBlobAfterDatabaseChange(src: string | undefined) {
  if (!src) return;
  try {
    await removeBlob(src);
  } catch (error) {
    console.error("The catalog was updated, but an old Vercel Blob could not be deleted.", error);
  }
}

export async function persistCatalogImage(
  blobUrl: string,
  category: CatalogCategory,
  title: string,
  id?: string,
  imageId = randomUUID(),
) {
  let image: CatalogImage;
  let previousSrc: string | undefined;
  try {
    await ensureStoreTables();
    const sql = getDatabase();
    if (id) {
      const rows = await sql`
        WITH previous AS (
          SELECT src FROM decor_catalog_images WHERE id = ${id}
        ),
        updated AS (
          UPDATE decor_catalog_images
          SET title = ${title}, src = ${blobUrl}
          WHERE id = ${id}
          RETURNING id, category, title, src
        )
        SELECT updated.id, updated.category, updated.title, updated.src,
          previous.src AS previous_src
        FROM updated LEFT JOIN previous ON TRUE
      `;
      if (!rows.length) {
        await removeBlobAfterDatabaseChange(blobUrl);
        return { notFound: true as const };
      }
      image = rowToCatalogImage(rows[0]);
      previousSrc = rows[0].previous_src ? String(rows[0].previous_src) : undefined;
    } else {
      const rows = await sql`
        INSERT INTO decor_catalog_images (id, category, title, src)
        VALUES (${imageId}, ${category}, ${title}, ${blobUrl})
        ON CONFLICT (id) DO UPDATE
          SET title = EXCLUDED.title, src = EXCLUDED.src
          WHERE decor_catalog_images.category = EXCLUDED.category
        RETURNING id, category, title, src
      `;
      if (!rows.length) throw new Error("The image ID already exists in another catalog category.");
      image = rowToCatalogImage(rows[0]);
    }
  } catch (error) {
    await removeBlobAfterDatabaseChange(blobUrl);
    throw error;
  }
  if (previousSrc !== blobUrl) await removeBlobAfterDatabaseChange(previousSrc);
  return {
    notFound: false as const,
    image,
    catalog: (await readStore()).catalog,
  };
}

export async function deleteCatalogImage(id: string) {
  await ensureStoreTables();
  const sql = getDatabase();
  const rows = await sql`
    DELETE FROM decor_catalog_images
    WHERE id = ${id}
      AND (
        category <> 'fabric'
        OR (SELECT COUNT(*) FROM decor_catalog_images WHERE category = 'fabric') > 1
      )
    RETURNING id, category, title, src
  `;
  if (!rows.length) {
    const existing = await sql`SELECT id, category FROM decor_catalog_images WHERE id = ${id}`;
    if (existing.length && existing[0].category === "fabric") {
      const count = await sql`SELECT COUNT(*)::int AS count FROM decor_catalog_images WHERE category = 'fabric'`;
      if (Number(count[0]?.count) <= 1) return { kind: "last-fabric" as const };
    }
    return { kind: "missing" as const };
  }
  const image = rowToCatalogImage(rows[0]);
  await removeBlobAfterDatabaseChange(image.src);
  const catalog = await readStore().then((store) => store.catalog);
  return { kind: "deleted" as const, catalog };
}

function rowToCatalogImage(row: Record<string, unknown>): CatalogImage {
  if (row.category !== "fabric" && row.category !== "project") {
    throw new Error("The image record in the database has an invalid category.");
  }
  return {
    id: String(row.id),
    category: row.category,
    title: String(row.title),
    src: String(row.src),
  };
}
