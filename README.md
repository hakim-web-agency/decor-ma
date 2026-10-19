# DÉCOR.MA

## Persistent dashboard storage on Vercel

Dashboard settings and the image catalog use a Neon-compatible PostgreSQL database and Vercel Blob. Nothing is written to the local filesystem. Image bytes upload directly from the dashboard browser to Blob with a short-lived, administrator-authorized upload token, avoiding serverless request-body limits.

### Environment variables

- `DATABASE_URL` — pooled Neon/Vercel Postgres connection string. `POSTGRES_URL` is also accepted for existing Vercel Postgres integrations.
- `BLOB_READ_WRITE_TOKEN` — read/write token for a Vercel Blob store.
- `ADMIN_PASSWORD` and `JWT_SECRET` — existing dashboard authentication settings; use a strong password and a random secret of at least 32 bytes.

Create a Neon Postgres database (or connect a supported Vercel Postgres integration) and a Vercel Blob store, then add these variables to the Vercel project and local `.env.local`. The database schema and initial catalog/pricing values are created idempotently the first time a store API is called. Back up the database and Blob store independently.

Uploaded JPG, PNG, and WebP images are limited to 5 MB. Images are public Blob URLs so that storefront visitors can view them; upload and deletion remain restricted to authenticated dashboard administrators.
