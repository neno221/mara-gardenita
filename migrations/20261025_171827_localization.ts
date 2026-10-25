import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * English and Greek (`en`, `gr`), with English as the fallback.
 *
 * First written as `20261018_114737_localization`, against a schema that still
 * had the journal. Production then removed the journal
 * (`20261025_152204_remove_journal_header_button`) before this ran, so it was
 * regenerated to come after that migration, and its posts and journal-list
 * statements were dropped. The hand edits from the original are kept: new
 * `_locale` columns arrive with a temporary `'en'` default, and existing values
 * are copied into the `*_locales` tables as English before the old columns are
 * dropped. Checked against Payload's own generated SQL: the resulting schemas
 * are identical, whether the database starts empty, before the journal
 * removal, or after it.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'gr');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('en', 'gr');
  CREATE TYPE "public"."enum__projects_v_published_locale" AS ENUM('en', 'gr');
  CREATE TABLE "pages_blocks_contact_details_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "pages_blocks_contact_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_locales" (
  	"title" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_contact_details_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_title" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "projects_locales" (
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_locales" (
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "services_locales" (
  	"title" varchar NOT NULL,
  	"summary" varchar NOT NULL,
  	"copy" jsonb NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages" DROP CONSTRAINT "pages_meta_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "projects" DROP CONSTRAINT "projects_meta_image_id_media_id_fk";
  
  ALTER TABLE "_projects_v" DROP CONSTRAINT "_projects_v_version_meta_image_id_media_id_fk";
  
  DROP INDEX "pages_meta_meta_image_idx";
  DROP INDEX "_pages_v_version_meta_version_meta_image_idx";
  DROP INDEX "projects_meta_meta_image_idx";
  DROP INDEX "_projects_v_version_meta_version_meta_image_idx";
  DROP INDEX "pages_rels_services_id_idx";
  DROP INDEX "pages_rels_projects_id_idx";
  DROP INDEX "pages_rels_testimonials_id_idx";
  DROP INDEX "pages_rels_media_id_idx";
  DROP INDEX "_pages_v_rels_services_id_idx";
  DROP INDEX "_pages_v_rels_projects_id_idx";
  DROP INDEX "_pages_v_rels_testimonials_id_idx";
  DROP INDEX "_pages_v_rels_media_id_idx";
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "lede" varchar;
  ALTER TABLE "pages_blocks_masthead" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "pages_blocks_story_split" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "pages_blocks_story_split" ADD COLUMN "signature" varchar;
  ALTER TABLE "pages_blocks_service_grid" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "pages_blocks_service_grid" ADD COLUMN "heading" varchar;
  ALTER TABLE "pages_blocks_service_grid" ADD COLUMN "intro" varchar;
  ALTER TABLE "pages_blocks_service_panels_panels" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "pages_blocks_service_panels" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "pages_blocks_portfolio_grid" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "pages_blocks_portfolio_list" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "pages_blocks_testimonials" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "pages_blocks_photo_row" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "pages_blocks_prose" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "pages_blocks_press_strip_logos" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "pages_blocks_press_strip" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "pages_blocks_instagram_feed" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "pages_rels" ADD COLUMN "locale" "_locales";
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "lede" varchar;
  ALTER TABLE "_pages_v_blocks_masthead" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "_pages_v_blocks_story_split" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "_pages_v_blocks_story_split" ADD COLUMN "signature" varchar;
  ALTER TABLE "_pages_v_blocks_service_grid" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "_pages_v_blocks_service_grid" ADD COLUMN "heading" varchar;
  ALTER TABLE "_pages_v_blocks_service_grid" ADD COLUMN "intro" varchar;
  ALTER TABLE "_pages_v_blocks_service_panels_panels" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "_pages_v_blocks_service_panels" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "_pages_v_blocks_portfolio_grid" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "_pages_v_blocks_portfolio_list" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "_pages_v_blocks_photo_row" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "_pages_v_blocks_prose" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "_pages_v_blocks_press_strip_logos" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "_pages_v_blocks_press_strip" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "_pages_v_blocks_instagram_feed" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "_pages_v" ADD COLUMN "snapshot" boolean;
  ALTER TABLE "_pages_v" ADD COLUMN "published_locale" "enum__pages_v_published_locale";
  ALTER TABLE "_pages_v_rels" ADD COLUMN "locale" "_locales";
  ALTER TABLE "_projects_v" ADD COLUMN "snapshot" boolean;
  ALTER TABLE "_projects_v" ADD COLUMN "published_locale" "enum__projects_v_published_locale";
  ALTER TABLE "pages_blocks_contact_details_items" ADD CONSTRAINT "pages_blocks_contact_details_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_contact_details"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_details" ADD CONSTRAINT "pages_blocks_contact_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_details_items" ADD CONSTRAINT "_pages_v_blocks_contact_details_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_contact_details"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_details" ADD CONSTRAINT "_pages_v_blocks_contact_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_locales" ADD CONSTRAINT "projects_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_locales" ADD CONSTRAINT "projects_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_locales" ADD CONSTRAINT "_projects_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_locales" ADD CONSTRAINT "_projects_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_locales" ADD CONSTRAINT "services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_contact_details_items_order_idx" ON "pages_blocks_contact_details_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_details_items_parent_id_idx" ON "pages_blocks_contact_details_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_details_items_locale_idx" ON "pages_blocks_contact_details_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_contact_details_order_idx" ON "pages_blocks_contact_details" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_details_parent_id_idx" ON "pages_blocks_contact_details" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_details_path_idx" ON "pages_blocks_contact_details" USING btree ("_path");
  CREATE INDEX "pages_blocks_contact_details_locale_idx" ON "pages_blocks_contact_details" USING btree ("_locale");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_details_items_order_idx" ON "_pages_v_blocks_contact_details_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_details_items_parent_id_idx" ON "_pages_v_blocks_contact_details_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_details_items_locale_idx" ON "_pages_v_blocks_contact_details_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_contact_details_order_idx" ON "_pages_v_blocks_contact_details" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_details_parent_id_idx" ON "_pages_v_blocks_contact_details" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_details_path_idx" ON "_pages_v_blocks_contact_details" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contact_details_locale_idx" ON "_pages_v_blocks_contact_details" USING btree ("_locale");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_meta_meta_image_idx" ON "projects_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "projects_locales_locale_parent_id_unique" ON "projects_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_version_meta_version_meta_image_idx" ON "_projects_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_projects_v_locales_locale_parent_id_unique" ON "_projects_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "services_locales_locale_parent_id_unique" ON "services_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_hero_locale_idx" ON "pages_blocks_hero" USING btree ("_locale");
  CREATE INDEX "pages_blocks_masthead_locale_idx" ON "pages_blocks_masthead" USING btree ("_locale");
  CREATE INDEX "pages_blocks_story_split_locale_idx" ON "pages_blocks_story_split" USING btree ("_locale");
  CREATE INDEX "pages_blocks_service_grid_locale_idx" ON "pages_blocks_service_grid" USING btree ("_locale");
  CREATE INDEX "pages_blocks_service_panels_panels_locale_idx" ON "pages_blocks_service_panels_panels" USING btree ("_locale");
  CREATE INDEX "pages_blocks_service_panels_locale_idx" ON "pages_blocks_service_panels" USING btree ("_locale");
  CREATE INDEX "pages_blocks_portfolio_grid_locale_idx" ON "pages_blocks_portfolio_grid" USING btree ("_locale");
  CREATE INDEX "pages_blocks_portfolio_list_locale_idx" ON "pages_blocks_portfolio_list" USING btree ("_locale");
  CREATE INDEX "pages_blocks_testimonials_locale_idx" ON "pages_blocks_testimonials" USING btree ("_locale");
  CREATE INDEX "pages_blocks_photo_row_locale_idx" ON "pages_blocks_photo_row" USING btree ("_locale");
  CREATE INDEX "pages_blocks_prose_locale_idx" ON "pages_blocks_prose" USING btree ("_locale");
  CREATE INDEX "pages_blocks_press_strip_logos_locale_idx" ON "pages_blocks_press_strip_logos" USING btree ("_locale");
  CREATE INDEX "pages_blocks_press_strip_locale_idx" ON "pages_blocks_press_strip" USING btree ("_locale");
  CREATE INDEX "pages_blocks_instagram_feed_locale_idx" ON "pages_blocks_instagram_feed" USING btree ("_locale");
  CREATE INDEX "pages_rels_locale_idx" ON "pages_rels" USING btree ("locale");
  CREATE INDEX "_pages_v_blocks_hero_locale_idx" ON "_pages_v_blocks_hero" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_masthead_locale_idx" ON "_pages_v_blocks_masthead" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_story_split_locale_idx" ON "_pages_v_blocks_story_split" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_service_grid_locale_idx" ON "_pages_v_blocks_service_grid" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_service_panels_panels_locale_idx" ON "_pages_v_blocks_service_panels_panels" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_service_panels_locale_idx" ON "_pages_v_blocks_service_panels" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_portfolio_grid_locale_idx" ON "_pages_v_blocks_portfolio_grid" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_portfolio_list_locale_idx" ON "_pages_v_blocks_portfolio_list" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_testimonials_locale_idx" ON "_pages_v_blocks_testimonials" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_photo_row_locale_idx" ON "_pages_v_blocks_photo_row" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_prose_locale_idx" ON "_pages_v_blocks_prose" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_press_strip_logos_locale_idx" ON "_pages_v_blocks_press_strip_logos" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_press_strip_locale_idx" ON "_pages_v_blocks_press_strip" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_instagram_feed_locale_idx" ON "_pages_v_blocks_instagram_feed" USING btree ("_locale");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_rels_locale_idx" ON "_pages_v_rels" USING btree ("locale");
  CREATE INDEX "_projects_v_snapshot_idx" ON "_projects_v" USING btree ("snapshot");
  CREATE INDEX "_projects_v_published_locale_idx" ON "_projects_v" USING btree ("published_locale");
  CREATE INDEX "pages_rels_services_id_idx" ON "pages_rels" USING btree ("services_id","locale");
  CREATE INDEX "pages_rels_projects_id_idx" ON "pages_rels" USING btree ("projects_id","locale");
  CREATE INDEX "pages_rels_testimonials_id_idx" ON "pages_rels" USING btree ("testimonials_id","locale");
  CREATE INDEX "pages_rels_media_id_idx" ON "pages_rels" USING btree ("media_id","locale");
  CREATE INDEX "_pages_v_rels_services_id_idx" ON "_pages_v_rels" USING btree ("services_id","locale");
  CREATE INDEX "_pages_v_rels_projects_id_idx" ON "_pages_v_rels" USING btree ("projects_id","locale");
  CREATE INDEX "_pages_v_rels_testimonials_id_idx" ON "_pages_v_rels" USING btree ("testimonials_id","locale");
  CREATE INDEX "_pages_v_rels_media_id_idx" ON "_pages_v_rels" USING btree ("media_id","locale");
  -- Everything that was a plain column becomes the English value, so a database
  -- seeded before localization keeps its content.
  INSERT INTO "pages_locales" ("title","meta_title","meta_description","meta_image_id","_locale","_parent_id")
    SELECT "title","meta_title","meta_description","meta_image_id",'en',"id" FROM "pages";
  INSERT INTO "_pages_v_locales" ("version_title","version_meta_title","version_meta_description","version_meta_image_id","_locale","_parent_id")
    SELECT "version_title","version_meta_title","version_meta_description","version_meta_image_id",'en',"id" FROM "_pages_v";
  INSERT INTO "projects_locales" ("meta_title","meta_description","meta_image_id","_locale","_parent_id")
    SELECT "meta_title","meta_description","meta_image_id",'en',"id" FROM "projects";
  INSERT INTO "_projects_v_locales" ("version_meta_title","version_meta_description","version_meta_image_id","_locale","_parent_id")
    SELECT "version_meta_title","version_meta_description","version_meta_image_id",'en',"id" FROM "_projects_v";
  INSERT INTO "services_locales" ("title","summary","copy","_locale","_parent_id")
    SELECT "title","summary","copy",'en',"id" FROM "services";
  UPDATE "pages_rels" SET "locale" = 'en';
  UPDATE "_pages_v_rels" SET "locale" = 'en';
  ALTER TABLE "pages_blocks_hero" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_masthead" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_story_split" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_service_grid" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_service_panels_panels" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_service_panels" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_portfolio_grid" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_portfolio_list" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_testimonials" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_photo_row" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_prose" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_press_strip_logos" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_press_strip" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_instagram_feed" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_hero" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_masthead" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_story_split" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_service_grid" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_service_panels_panels" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_service_panels" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_portfolio_grid" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_portfolio_list" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_testimonials" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_photo_row" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_prose" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_press_strip_logos" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_press_strip" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_instagram_feed" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages" DROP COLUMN "title";
  ALTER TABLE "pages" DROP COLUMN "meta_title";
  ALTER TABLE "pages" DROP COLUMN "meta_description";
  ALTER TABLE "pages" DROP COLUMN "meta_image_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_title";
  ALTER TABLE "_pages_v" DROP COLUMN "version_meta_title";
  ALTER TABLE "_pages_v" DROP COLUMN "version_meta_description";
  ALTER TABLE "_pages_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "projects" DROP COLUMN "meta_title";
  ALTER TABLE "projects" DROP COLUMN "meta_description";
  ALTER TABLE "projects" DROP COLUMN "meta_image_id";
  ALTER TABLE "_projects_v" DROP COLUMN "version_meta_title";
  ALTER TABLE "_projects_v" DROP COLUMN "version_meta_description";
  ALTER TABLE "_projects_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "services" DROP COLUMN "title";
  ALTER TABLE "services" DROP COLUMN "summary";
  ALTER TABLE "services" DROP COLUMN "copy";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_contact_details_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_contact_details" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_contact_details_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_contact_details" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_contact_details_items" CASCADE;
  DROP TABLE "pages_blocks_contact_details" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_details_items" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_details" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "projects_locales" CASCADE;
  DROP TABLE "_projects_v_locales" CASCADE;
  DROP TABLE "services_locales" CASCADE;
  DROP INDEX "pages_blocks_hero_locale_idx";
  DROP INDEX "pages_blocks_masthead_locale_idx";
  DROP INDEX "pages_blocks_story_split_locale_idx";
  DROP INDEX "pages_blocks_service_grid_locale_idx";
  DROP INDEX "pages_blocks_service_panels_panels_locale_idx";
  DROP INDEX "pages_blocks_service_panels_locale_idx";
  DROP INDEX "pages_blocks_portfolio_grid_locale_idx";
  DROP INDEX "pages_blocks_portfolio_list_locale_idx";
  DROP INDEX "pages_blocks_testimonials_locale_idx";
  DROP INDEX "pages_blocks_photo_row_locale_idx";
  DROP INDEX "pages_blocks_prose_locale_idx";
  DROP INDEX "pages_blocks_press_strip_logos_locale_idx";
  DROP INDEX "pages_blocks_press_strip_locale_idx";
  DROP INDEX "pages_blocks_instagram_feed_locale_idx";
  DROP INDEX "pages_rels_locale_idx";
  DROP INDEX "_pages_v_blocks_hero_locale_idx";
  DROP INDEX "_pages_v_blocks_masthead_locale_idx";
  DROP INDEX "_pages_v_blocks_story_split_locale_idx";
  DROP INDEX "_pages_v_blocks_service_grid_locale_idx";
  DROP INDEX "_pages_v_blocks_service_panels_panels_locale_idx";
  DROP INDEX "_pages_v_blocks_service_panels_locale_idx";
  DROP INDEX "_pages_v_blocks_portfolio_grid_locale_idx";
  DROP INDEX "_pages_v_blocks_portfolio_list_locale_idx";
  DROP INDEX "_pages_v_blocks_testimonials_locale_idx";
  DROP INDEX "_pages_v_blocks_photo_row_locale_idx";
  DROP INDEX "_pages_v_blocks_prose_locale_idx";
  DROP INDEX "_pages_v_blocks_press_strip_logos_locale_idx";
  DROP INDEX "_pages_v_blocks_press_strip_locale_idx";
  DROP INDEX "_pages_v_blocks_instagram_feed_locale_idx";
  DROP INDEX "_pages_v_snapshot_idx";
  DROP INDEX "_pages_v_published_locale_idx";
  DROP INDEX "_pages_v_rels_locale_idx";
  DROP INDEX "_projects_v_snapshot_idx";
  DROP INDEX "_projects_v_published_locale_idx";
  DROP INDEX "pages_rels_services_id_idx";
  DROP INDEX "pages_rels_projects_id_idx";
  DROP INDEX "pages_rels_testimonials_id_idx";
  DROP INDEX "pages_rels_media_id_idx";
  DROP INDEX "_pages_v_rels_services_id_idx";
  DROP INDEX "_pages_v_rels_projects_id_idx";
  DROP INDEX "_pages_v_rels_testimonials_id_idx";
  DROP INDEX "_pages_v_rels_media_id_idx";
  ALTER TABLE "pages" ADD COLUMN "title" varchar;
  ALTER TABLE "pages" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "pages" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "pages" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_title" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_meta_image_id" integer;
  ALTER TABLE "projects" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "projects" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "projects" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "_projects_v" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_projects_v" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "_projects_v" ADD COLUMN "version_meta_image_id" integer;
  ALTER TABLE "services" ADD COLUMN "title" varchar NOT NULL;
  ALTER TABLE "services" ADD COLUMN "summary" varchar NOT NULL;
  ALTER TABLE "services" ADD COLUMN "copy" jsonb NOT NULL;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages" USING btree ("meta_image_id");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v" USING btree ("version_meta_image_id");
  CREATE INDEX "projects_meta_meta_image_idx" ON "projects" USING btree ("meta_image_id");
  CREATE INDEX "_projects_v_version_meta_version_meta_image_idx" ON "_projects_v" USING btree ("version_meta_image_id");
  CREATE INDEX "pages_rels_services_id_idx" ON "pages_rels" USING btree ("services_id");
  CREATE INDEX "pages_rels_projects_id_idx" ON "pages_rels" USING btree ("projects_id");
  CREATE INDEX "pages_rels_testimonials_id_idx" ON "pages_rels" USING btree ("testimonials_id");
  CREATE INDEX "pages_rels_media_id_idx" ON "pages_rels" USING btree ("media_id");
  CREATE INDEX "_pages_v_rels_services_id_idx" ON "_pages_v_rels" USING btree ("services_id");
  CREATE INDEX "_pages_v_rels_projects_id_idx" ON "_pages_v_rels" USING btree ("projects_id");
  CREATE INDEX "_pages_v_rels_testimonials_id_idx" ON "_pages_v_rels" USING btree ("testimonials_id");
  CREATE INDEX "_pages_v_rels_media_id_idx" ON "_pages_v_rels" USING btree ("media_id");
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "lede";
  ALTER TABLE "pages_blocks_masthead" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_story_split" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_story_split" DROP COLUMN "signature";
  ALTER TABLE "pages_blocks_service_grid" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_service_grid" DROP COLUMN "heading";
  ALTER TABLE "pages_blocks_service_grid" DROP COLUMN "intro";
  ALTER TABLE "pages_blocks_service_panels_panels" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_service_panels" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_portfolio_grid" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_portfolio_list" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_testimonials" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_photo_row" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_prose" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_press_strip_logos" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_press_strip" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_instagram_feed" DROP COLUMN "_locale";
  ALTER TABLE "pages_rels" DROP COLUMN "locale";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "lede";
  ALTER TABLE "_pages_v_blocks_masthead" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_story_split" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_story_split" DROP COLUMN "signature";
  ALTER TABLE "_pages_v_blocks_service_grid" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_service_grid" DROP COLUMN "heading";
  ALTER TABLE "_pages_v_blocks_service_grid" DROP COLUMN "intro";
  ALTER TABLE "_pages_v_blocks_service_panels_panels" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_service_panels" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_portfolio_grid" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_portfolio_list" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_testimonials" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_photo_row" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_prose" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_press_strip_logos" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_press_strip" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_instagram_feed" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v" DROP COLUMN "snapshot";
  ALTER TABLE "_pages_v" DROP COLUMN "published_locale";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "locale";
  ALTER TABLE "_projects_v" DROP COLUMN "snapshot";
  ALTER TABLE "_projects_v" DROP COLUMN "published_locale";
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum__projects_v_published_locale";`)
}
