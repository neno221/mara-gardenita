import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The journal goes, and the header gains its button.
 *
 * Schema first, then content: the content steps write `header.cta_*`, which
 * the schema step adds.
 *
 * The generated SQL dropped `posts` with CASCADE and then dropped the three
 * foreign keys that CASCADE had already taken with it, which fails on a real
 * database. Those three are `IF EXISTS` now.
 */
export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  // A lock held on a post would otherwise outlive the post as an empty row.
  await db.execute(sql`
   DELETE FROM "payload_locked_documents" WHERE "id" IN (
     SELECT "parent_id" FROM "payload_locked_documents_rels" WHERE "posts_id" IS NOT NULL
   );
   DELETE FROM "pages_rels" WHERE "posts_id" IS NOT NULL;
   DELETE FROM "_pages_v_rels" WHERE "posts_id" IS NOT NULL;`)

  await db.execute(sql`
   ALTER TABLE "pages_blocks_journal_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_journal_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_journal_list" CASCADE;
  DROP TABLE "_pages_v_blocks_journal_list" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  ALTER TABLE "pages_rels" DROP CONSTRAINT IF EXISTS "pages_rels_posts_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT IF EXISTS "_pages_v_rels_posts_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_posts_fk";
  
  DROP INDEX IF EXISTS "pages_rels_posts_id_idx";
  DROP INDEX IF EXISTS "_pages_v_rels_posts_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_posts_id_idx";
  ALTER TABLE "header" ADD COLUMN "cta_label" varchar;
  ALTER TABLE "header" ADD COLUMN "cta_page_id" integer;
  ALTER TABLE "header" ADD COLUMN "cta_external_url" varchar;
  ALTER TABLE "header" ADD CONSTRAINT "header_cta_page_id_pages_id_fk" FOREIGN KEY ("cta_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "header_cta_cta_page_idx" ON "header" USING btree ("cta_page_id");
  ALTER TABLE "pages_rels" DROP COLUMN "posts_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "posts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "posts_id";
  DROP TYPE "public"."enum_pages_blocks_journal_list_mode";
  DROP TYPE "public"."enum__pages_v_blocks_journal_list_mode";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_status";`)

  // The content steps are SQL rather than the Local API. The Local API reads the
  // database through the config as it stands when the migration runs, and a later
  // migration (localization) changes the schema that config expects — so on a
  // database migrating from scratch these steps would query tables that do not
  // exist yet. SQL against the schema as of this migration has no such problem.

  // The journal page, and its versions; the blocks of both cascade.
  await db.execute(sql`
   DELETE FROM "_pages_v" WHERE "parent_id" IN (SELECT "id" FROM "pages" WHERE "slug" = 'blog');
   DELETE FROM "pages" WHERE "slug" = 'blog';`)

  // An empty database — a fresh environment migrating before its first seed —
  // has no pages to point the header at, and the seed writes this same nav.
  const { rows: pages } = await db.execute(sql`
   SELECT "id", "slug" FROM "pages" WHERE "slug" IN ('about', 'portfolio', 'services', 'contact')`)
  const page = (slug: string) =>
    (pages as { id: number; slug: string }[]).find((row) => row.slug === slug)?.id
  const { rows: header } = await db.execute(sql`SELECT "id" FROM "header" LIMIT 1`)
  const headerId = (header as { id: number }[])[0]?.id
  if (headerId && page('about') && page('portfolio') && page('services') && page('contact')) {
    // One statement per call: a parameterised query cannot carry several.
    await db.execute(sql`DELETE FROM "header_nav" WHERE "_parent_id" = ${headerId}`)
    await db.execute(sql`
     INSERT INTO "header_nav" ("_order", "_parent_id", "id", "label", "page_id") VALUES
       (1, ${headerId}, substr(md5(random()::text), 1, 24), 'About', ${page('about')}),
       (2, ${headerId}, substr(md5(random()::text), 1, 24), 'Gallery', ${page('portfolio')}),
       (3, ${headerId}, substr(md5(random()::text), 1, 24), 'Services', ${page('services')})`)
    await db.execute(sql`
     UPDATE "header" SET "cta_label" = 'Contact', "cta_page_id" = ${page('contact')}
     WHERE "id" = ${headerId}`)
  }

  // The journal's photographs, unless something else on the site took one up.
  // Rows only: production ran an earlier version of this migration that deleted
  // the Blob files through the Local API, and a fresh database never had them.
  const { rows: journalMedia } = await db.execute(sql`
   SELECT "id", "filename" FROM "media" WHERE "filename" LIKE 'journal-%'`)
  for (const media of journalMedia as { id: number; filename: string }[]) {
    if (await isReferenced(db, media.id)) {
      payload.logger.info(`Keeping ${media.filename}: still referenced outside the journal.`)
      continue
    }
    await db.execute(sql`DELETE FROM "media" WHERE "id" = ${media.id}`)
  }
}

/** Whether any foreign key on the site still points at this Media row. */
async function isReferenced(db: MigrateUpArgs['db'], id: number): Promise<boolean> {
  const { rows } = await db.execute(sql`
   SELECT kcu.table_name, kcu.column_name
   FROM information_schema.referential_constraints rc
   JOIN information_schema.key_column_usage kcu
     ON kcu.constraint_name = rc.constraint_name AND kcu.constraint_schema = rc.constraint_schema
   JOIN information_schema.constraint_column_usage ccu
     ON ccu.constraint_name = rc.unique_constraint_name AND ccu.constraint_schema = rc.unique_constraint_schema
   WHERE ccu.table_name = 'media' AND kcu.table_schema = 'public'`)

  for (const { table_name, column_name } of rows as { table_name: string; column_name: string }[]) {
    const { rows: hits } = await db.execute(
      sql`SELECT 1 FROM ${sql.identifier(table_name)} WHERE ${sql.identifier(column_name)} = ${id} LIMIT 1`,
    )
    if (hits.length) return true
  }
  return false
}

/** The schema only. The posts, the `blog` page and the journal's photographs do not come back. */
export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_journal_list_mode" AS ENUM('latest', 'picked');
  CREATE TYPE "public"."enum__pages_v_blocks_journal_list_mode" AS ENUM('latest', 'picked');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "pages_blocks_journal_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"mode" "enum_pages_blocks_journal_list_mode" DEFAULT 'latest',
  	"limit" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_journal_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"mode" "enum__pages_v_blocks_journal_list_mode" DEFAULT 'latest',
  	"limit" numeric,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"published" timestamp(3) with time zone,
  	"excerpt" varchar,
  	"card_id" integer,
  	"hero_id" integer,
  	"body" jsonb,
  	"order" numeric DEFAULT 0,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"meta_no_index" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_published" timestamp(3) with time zone,
  	"version_excerpt" varchar,
  	"version_card_id" integer,
  	"version_hero_id" integer,
  	"version_body" jsonb,
  	"version_order" numeric DEFAULT 0,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_no_index" boolean,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "header" DROP CONSTRAINT "header_cta_page_id_pages_id_fk";
  
  DROP INDEX "header_cta_cta_page_idx";
  ALTER TABLE "pages_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "pages_blocks_journal_list" ADD CONSTRAINT "pages_blocks_journal_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_journal_list" ADD CONSTRAINT "_pages_v_blocks_journal_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_card_id_media_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_hero_id_media_id_fk" FOREIGN KEY ("hero_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_card_id_media_id_fk" FOREIGN KEY ("version_card_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_hero_id_media_id_fk" FOREIGN KEY ("version_hero_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_journal_list_order_idx" ON "pages_blocks_journal_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_journal_list_parent_id_idx" ON "pages_blocks_journal_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_journal_list_path_idx" ON "pages_blocks_journal_list" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_journal_list_order_idx" ON "_pages_v_blocks_journal_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_journal_list_parent_id_idx" ON "_pages_v_blocks_journal_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_journal_list_path_idx" ON "_pages_v_blocks_journal_list" USING btree ("_path");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_card_idx" ON "posts" USING btree ("card_id");
  CREATE INDEX "posts_hero_idx" ON "posts" USING btree ("hero_id");
  CREATE INDEX "posts_order_idx" ON "posts" USING btree ("order");
  CREATE INDEX "posts_meta_meta_image_idx" ON "posts" USING btree ("meta_image_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_card_idx" ON "_posts_v" USING btree ("version_card_id");
  CREATE INDEX "_posts_v_version_version_hero_idx" ON "_posts_v" USING btree ("version_hero_id");
  CREATE INDEX "_posts_v_version_version_order_idx" ON "_posts_v" USING btree ("version_order");
  CREATE INDEX "_posts_v_version_meta_version_meta_image_idx" ON "_posts_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rels_posts_id_idx" ON "pages_rels" USING btree ("posts_id");
  CREATE INDEX "_pages_v_rels_posts_id_idx" ON "_pages_v_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  ALTER TABLE "header" DROP COLUMN "cta_label";
  ALTER TABLE "header" DROP COLUMN "cta_page_id";
  ALTER TABLE "header" DROP COLUMN "cta_external_url";`)
}
