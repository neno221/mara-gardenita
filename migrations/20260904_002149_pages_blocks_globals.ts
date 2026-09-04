import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_story_split_side" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_pages_blocks_story_split_petals" AS ENUM('tall', 'wide');
  CREATE TYPE "public"."enum_pages_blocks_journal_list_mode" AS ENUM('latest', 'picked');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_story_split_side" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__pages_v_blocks_story_split_petals" AS ENUM('tall', 'wide');
  CREATE TYPE "public"."enum__pages_v_blocks_journal_list_mode" AS ENUM('latest', 'picked');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"cta_label" varchar,
  	"cta_page_id" integer,
  	"cta_external_url" varchar,
  	"collage_left_id" integer,
  	"collage_center_id" integer,
  	"collage_right_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_masthead" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lede" varchar,
  	"cta_label" varchar,
  	"cta_page_id" integer,
  	"cta_external_url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_story_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"copy" varchar,
  	"cta_label" varchar,
  	"cta_page_id" integer,
  	"cta_external_url" varchar,
  	"image_id" integer,
  	"side" "enum_pages_blocks_story_split_side" DEFAULT 'left',
  	"petals" "enum_pages_blocks_story_split_petals" DEFAULT 'tall',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_service_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"cta_label" varchar,
  	"cta_page_id" integer,
  	"cta_external_url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_service_panels_panels" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"service_id" integer,
  	"dropped" boolean,
  	"wide" boolean,
  	"petals" boolean
  );
  
  CREATE TABLE "pages_blocks_service_panels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_portfolio_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"cta_label" varchar,
  	"cta_page_id" integer,
  	"cta_external_url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_portfolio_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"show_all" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_journal_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"mode" "enum_pages_blocks_journal_list_mode" DEFAULT 'latest',
  	"limit" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_photo_row" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"stagger" numeric DEFAULT 200,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_prose" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"ornament" boolean DEFAULT true,
  	"heading" varchar,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_press_strip_logos" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"logo_id" integer,
  	"name" varchar
  );
  
  CREATE TABLE "pages_blocks_press_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar DEFAULT 'Featured in',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_instagram_feed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Instagram',
  	"limit" numeric DEFAULT 6,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" integer,
  	"projects_id" integer,
  	"posts_id" integer,
  	"testimonials_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"cta_label" varchar,
  	"cta_page_id" integer,
  	"cta_external_url" varchar,
  	"collage_left_id" integer,
  	"collage_center_id" integer,
  	"collage_right_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_masthead" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lede" varchar,
  	"cta_label" varchar,
  	"cta_page_id" integer,
  	"cta_external_url" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_story_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"copy" varchar,
  	"cta_label" varchar,
  	"cta_page_id" integer,
  	"cta_external_url" varchar,
  	"image_id" integer,
  	"side" "enum__pages_v_blocks_story_split_side" DEFAULT 'left',
  	"petals" "enum__pages_v_blocks_story_split_petals" DEFAULT 'tall',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_service_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"cta_label" varchar,
  	"cta_page_id" integer,
  	"cta_external_url" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_service_panels_panels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"service_id" integer,
  	"dropped" boolean,
  	"wide" boolean,
  	"petals" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_service_panels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_portfolio_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"cta_label" varchar,
  	"cta_page_id" integer,
  	"cta_external_url" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_portfolio_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"show_all" boolean DEFAULT true,
  	"_uuid" varchar,
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
  
  CREATE TABLE "_pages_v_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_photo_row" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"stagger" numeric DEFAULT 200,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_prose" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"ornament" boolean DEFAULT true,
  	"heading" varchar,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_press_strip_logos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"logo_id" integer,
  	"name" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_press_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar DEFAULT 'Featured in',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_instagram_feed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Instagram',
  	"limit" numeric DEFAULT 6,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" integer,
  	"projects_id" integer,
  	"posts_id" integer,
  	"testimonials_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "projects_blocks_photo_row" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"stagger" numeric DEFAULT 200,
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_projects_v_blocks_photo_row" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"stagger" numeric DEFAULT 200,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "header_nav" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"page_id" integer,
  	"external_url" varchar
  );
  
  CREATE TABLE "header" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"logo_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_social" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "footer_quick_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"page_id" integer,
  	"external_url" varchar
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"instagram_heading" varchar DEFAULT 'Instagram' NOT NULL,
  	"social_heading" varchar DEFAULT 'Social' NOT NULL,
  	"quick_links_heading" varchar DEFAULT 'Quick Links' NOT NULL,
  	"logo_id" integer NOT NULL,
  	"credit_label" varchar,
  	"credit_url" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "projects_blocks_prose" ADD COLUMN "ornament" boolean DEFAULT true;
  ALTER TABLE "projects_blocks_prose" ADD COLUMN "heading" varchar;
  ALTER TABLE "_projects_v_blocks_prose" ADD COLUMN "ornament" boolean DEFAULT true;
  ALTER TABLE "_projects_v_blocks_prose" ADD COLUMN "heading" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_cta_page_id_pages_id_fk" FOREIGN KEY ("cta_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_collage_left_id_media_id_fk" FOREIGN KEY ("collage_left_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_collage_center_id_media_id_fk" FOREIGN KEY ("collage_center_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_collage_right_id_media_id_fk" FOREIGN KEY ("collage_right_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_masthead" ADD CONSTRAINT "pages_blocks_masthead_cta_page_id_pages_id_fk" FOREIGN KEY ("cta_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_masthead" ADD CONSTRAINT "pages_blocks_masthead_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_story_split" ADD CONSTRAINT "pages_blocks_story_split_cta_page_id_pages_id_fk" FOREIGN KEY ("cta_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_story_split" ADD CONSTRAINT "pages_blocks_story_split_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_story_split" ADD CONSTRAINT "pages_blocks_story_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_service_grid" ADD CONSTRAINT "pages_blocks_service_grid_cta_page_id_pages_id_fk" FOREIGN KEY ("cta_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_service_grid" ADD CONSTRAINT "pages_blocks_service_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_service_panels_panels" ADD CONSTRAINT "pages_blocks_service_panels_panels_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_service_panels_panels" ADD CONSTRAINT "pages_blocks_service_panels_panels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_service_panels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_service_panels" ADD CONSTRAINT "pages_blocks_service_panels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_portfolio_grid" ADD CONSTRAINT "pages_blocks_portfolio_grid_cta_page_id_pages_id_fk" FOREIGN KEY ("cta_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_portfolio_grid" ADD CONSTRAINT "pages_blocks_portfolio_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_portfolio_list" ADD CONSTRAINT "pages_blocks_portfolio_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_journal_list" ADD CONSTRAINT "pages_blocks_journal_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials" ADD CONSTRAINT "pages_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_photo_row" ADD CONSTRAINT "pages_blocks_photo_row_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_prose" ADD CONSTRAINT "pages_blocks_prose_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_press_strip_logos" ADD CONSTRAINT "pages_blocks_press_strip_logos_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_press_strip_logos" ADD CONSTRAINT "pages_blocks_press_strip_logos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_press_strip"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_press_strip" ADD CONSTRAINT "pages_blocks_press_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_instagram_feed" ADD CONSTRAINT "pages_blocks_instagram_feed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_cta_page_id_pages_id_fk" FOREIGN KEY ("cta_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_collage_left_id_media_id_fk" FOREIGN KEY ("collage_left_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_collage_center_id_media_id_fk" FOREIGN KEY ("collage_center_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_collage_right_id_media_id_fk" FOREIGN KEY ("collage_right_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_masthead" ADD CONSTRAINT "_pages_v_blocks_masthead_cta_page_id_pages_id_fk" FOREIGN KEY ("cta_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_masthead" ADD CONSTRAINT "_pages_v_blocks_masthead_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_story_split" ADD CONSTRAINT "_pages_v_blocks_story_split_cta_page_id_pages_id_fk" FOREIGN KEY ("cta_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_story_split" ADD CONSTRAINT "_pages_v_blocks_story_split_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_story_split" ADD CONSTRAINT "_pages_v_blocks_story_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_service_grid" ADD CONSTRAINT "_pages_v_blocks_service_grid_cta_page_id_pages_id_fk" FOREIGN KEY ("cta_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_service_grid" ADD CONSTRAINT "_pages_v_blocks_service_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_service_panels_panels" ADD CONSTRAINT "_pages_v_blocks_service_panels_panels_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_service_panels_panels" ADD CONSTRAINT "_pages_v_blocks_service_panels_panels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_service_panels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_service_panels" ADD CONSTRAINT "_pages_v_blocks_service_panels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_portfolio_grid" ADD CONSTRAINT "_pages_v_blocks_portfolio_grid_cta_page_id_pages_id_fk" FOREIGN KEY ("cta_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_portfolio_grid" ADD CONSTRAINT "_pages_v_blocks_portfolio_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_portfolio_list" ADD CONSTRAINT "_pages_v_blocks_portfolio_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_journal_list" ADD CONSTRAINT "_pages_v_blocks_journal_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_photo_row" ADD CONSTRAINT "_pages_v_blocks_photo_row_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_prose" ADD CONSTRAINT "_pages_v_blocks_prose_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_press_strip_logos" ADD CONSTRAINT "_pages_v_blocks_press_strip_logos_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_press_strip_logos" ADD CONSTRAINT "_pages_v_blocks_press_strip_logos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_press_strip"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_press_strip" ADD CONSTRAINT "_pages_v_blocks_press_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_instagram_feed" ADD CONSTRAINT "_pages_v_blocks_instagram_feed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_photo_row" ADD CONSTRAINT "projects_blocks_photo_row_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_photo_row" ADD CONSTRAINT "_projects_v_blocks_photo_row_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav" ADD CONSTRAINT "header_nav_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "header_nav" ADD CONSTRAINT "header_nav_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header" ADD CONSTRAINT "header_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_social" ADD CONSTRAINT "footer_social_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_quick_links" ADD CONSTRAINT "footer_quick_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_quick_links" ADD CONSTRAINT "footer_quick_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer" ADD CONSTRAINT "footer_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_hero_order_idx" ON "pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_cta_cta_page_idx" ON "pages_blocks_hero" USING btree ("cta_page_id");
  CREATE INDEX "pages_blocks_hero_collage_left_idx" ON "pages_blocks_hero" USING btree ("collage_left_id");
  CREATE INDEX "pages_blocks_hero_collage_center_idx" ON "pages_blocks_hero" USING btree ("collage_center_id");
  CREATE INDEX "pages_blocks_hero_collage_right_idx" ON "pages_blocks_hero" USING btree ("collage_right_id");
  CREATE INDEX "pages_blocks_masthead_order_idx" ON "pages_blocks_masthead" USING btree ("_order");
  CREATE INDEX "pages_blocks_masthead_parent_id_idx" ON "pages_blocks_masthead" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_masthead_path_idx" ON "pages_blocks_masthead" USING btree ("_path");
  CREATE INDEX "pages_blocks_masthead_cta_cta_page_idx" ON "pages_blocks_masthead" USING btree ("cta_page_id");
  CREATE INDEX "pages_blocks_story_split_order_idx" ON "pages_blocks_story_split" USING btree ("_order");
  CREATE INDEX "pages_blocks_story_split_parent_id_idx" ON "pages_blocks_story_split" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_story_split_path_idx" ON "pages_blocks_story_split" USING btree ("_path");
  CREATE INDEX "pages_blocks_story_split_cta_cta_page_idx" ON "pages_blocks_story_split" USING btree ("cta_page_id");
  CREATE INDEX "pages_blocks_story_split_image_idx" ON "pages_blocks_story_split" USING btree ("image_id");
  CREATE INDEX "pages_blocks_service_grid_order_idx" ON "pages_blocks_service_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_service_grid_parent_id_idx" ON "pages_blocks_service_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_service_grid_path_idx" ON "pages_blocks_service_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_service_grid_cta_cta_page_idx" ON "pages_blocks_service_grid" USING btree ("cta_page_id");
  CREATE INDEX "pages_blocks_service_panels_panels_order_idx" ON "pages_blocks_service_panels_panels" USING btree ("_order");
  CREATE INDEX "pages_blocks_service_panels_panels_parent_id_idx" ON "pages_blocks_service_panels_panels" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_service_panels_panels_service_idx" ON "pages_blocks_service_panels_panels" USING btree ("service_id");
  CREATE INDEX "pages_blocks_service_panels_order_idx" ON "pages_blocks_service_panels" USING btree ("_order");
  CREATE INDEX "pages_blocks_service_panels_parent_id_idx" ON "pages_blocks_service_panels" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_service_panels_path_idx" ON "pages_blocks_service_panels" USING btree ("_path");
  CREATE INDEX "pages_blocks_portfolio_grid_order_idx" ON "pages_blocks_portfolio_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_portfolio_grid_parent_id_idx" ON "pages_blocks_portfolio_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_portfolio_grid_path_idx" ON "pages_blocks_portfolio_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_portfolio_grid_cta_cta_page_idx" ON "pages_blocks_portfolio_grid" USING btree ("cta_page_id");
  CREATE INDEX "pages_blocks_portfolio_list_order_idx" ON "pages_blocks_portfolio_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_portfolio_list_parent_id_idx" ON "pages_blocks_portfolio_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_portfolio_list_path_idx" ON "pages_blocks_portfolio_list" USING btree ("_path");
  CREATE INDEX "pages_blocks_journal_list_order_idx" ON "pages_blocks_journal_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_journal_list_parent_id_idx" ON "pages_blocks_journal_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_journal_list_path_idx" ON "pages_blocks_journal_list" USING btree ("_path");
  CREATE INDEX "pages_blocks_testimonials_order_idx" ON "pages_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_parent_id_idx" ON "pages_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_path_idx" ON "pages_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "pages_blocks_photo_row_order_idx" ON "pages_blocks_photo_row" USING btree ("_order");
  CREATE INDEX "pages_blocks_photo_row_parent_id_idx" ON "pages_blocks_photo_row" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_photo_row_path_idx" ON "pages_blocks_photo_row" USING btree ("_path");
  CREATE INDEX "pages_blocks_prose_order_idx" ON "pages_blocks_prose" USING btree ("_order");
  CREATE INDEX "pages_blocks_prose_parent_id_idx" ON "pages_blocks_prose" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_prose_path_idx" ON "pages_blocks_prose" USING btree ("_path");
  CREATE INDEX "pages_blocks_press_strip_logos_order_idx" ON "pages_blocks_press_strip_logos" USING btree ("_order");
  CREATE INDEX "pages_blocks_press_strip_logos_parent_id_idx" ON "pages_blocks_press_strip_logos" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_press_strip_logos_logo_idx" ON "pages_blocks_press_strip_logos" USING btree ("logo_id");
  CREATE INDEX "pages_blocks_press_strip_order_idx" ON "pages_blocks_press_strip" USING btree ("_order");
  CREATE INDEX "pages_blocks_press_strip_parent_id_idx" ON "pages_blocks_press_strip" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_press_strip_path_idx" ON "pages_blocks_press_strip" USING btree ("_path");
  CREATE INDEX "pages_blocks_instagram_feed_order_idx" ON "pages_blocks_instagram_feed" USING btree ("_order");
  CREATE INDEX "pages_blocks_instagram_feed_parent_id_idx" ON "pages_blocks_instagram_feed" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_instagram_feed_path_idx" ON "pages_blocks_instagram_feed" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_services_id_idx" ON "pages_rels" USING btree ("services_id");
  CREATE INDEX "pages_rels_projects_id_idx" ON "pages_rels" USING btree ("projects_id");
  CREATE INDEX "pages_rels_posts_id_idx" ON "pages_rels" USING btree ("posts_id");
  CREATE INDEX "pages_rels_testimonials_id_idx" ON "pages_rels" USING btree ("testimonials_id");
  CREATE INDEX "pages_rels_media_id_idx" ON "pages_rels" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_hero_order_idx" ON "_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_parent_id_idx" ON "_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_path_idx" ON "_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_cta_cta_page_idx" ON "_pages_v_blocks_hero" USING btree ("cta_page_id");
  CREATE INDEX "_pages_v_blocks_hero_collage_left_idx" ON "_pages_v_blocks_hero" USING btree ("collage_left_id");
  CREATE INDEX "_pages_v_blocks_hero_collage_center_idx" ON "_pages_v_blocks_hero" USING btree ("collage_center_id");
  CREATE INDEX "_pages_v_blocks_hero_collage_right_idx" ON "_pages_v_blocks_hero" USING btree ("collage_right_id");
  CREATE INDEX "_pages_v_blocks_masthead_order_idx" ON "_pages_v_blocks_masthead" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_masthead_parent_id_idx" ON "_pages_v_blocks_masthead" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_masthead_path_idx" ON "_pages_v_blocks_masthead" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_masthead_cta_cta_page_idx" ON "_pages_v_blocks_masthead" USING btree ("cta_page_id");
  CREATE INDEX "_pages_v_blocks_story_split_order_idx" ON "_pages_v_blocks_story_split" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_story_split_parent_id_idx" ON "_pages_v_blocks_story_split" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_story_split_path_idx" ON "_pages_v_blocks_story_split" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_story_split_cta_cta_page_idx" ON "_pages_v_blocks_story_split" USING btree ("cta_page_id");
  CREATE INDEX "_pages_v_blocks_story_split_image_idx" ON "_pages_v_blocks_story_split" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_service_grid_order_idx" ON "_pages_v_blocks_service_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_service_grid_parent_id_idx" ON "_pages_v_blocks_service_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_service_grid_path_idx" ON "_pages_v_blocks_service_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_service_grid_cta_cta_page_idx" ON "_pages_v_blocks_service_grid" USING btree ("cta_page_id");
  CREATE INDEX "_pages_v_blocks_service_panels_panels_order_idx" ON "_pages_v_blocks_service_panels_panels" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_service_panels_panels_parent_id_idx" ON "_pages_v_blocks_service_panels_panels" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_service_panels_panels_service_idx" ON "_pages_v_blocks_service_panels_panels" USING btree ("service_id");
  CREATE INDEX "_pages_v_blocks_service_panels_order_idx" ON "_pages_v_blocks_service_panels" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_service_panels_parent_id_idx" ON "_pages_v_blocks_service_panels" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_service_panels_path_idx" ON "_pages_v_blocks_service_panels" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_portfolio_grid_order_idx" ON "_pages_v_blocks_portfolio_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_portfolio_grid_parent_id_idx" ON "_pages_v_blocks_portfolio_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_portfolio_grid_path_idx" ON "_pages_v_blocks_portfolio_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_portfolio_grid_cta_cta_page_idx" ON "_pages_v_blocks_portfolio_grid" USING btree ("cta_page_id");
  CREATE INDEX "_pages_v_blocks_portfolio_list_order_idx" ON "_pages_v_blocks_portfolio_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_portfolio_list_parent_id_idx" ON "_pages_v_blocks_portfolio_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_portfolio_list_path_idx" ON "_pages_v_blocks_portfolio_list" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_journal_list_order_idx" ON "_pages_v_blocks_journal_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_journal_list_parent_id_idx" ON "_pages_v_blocks_journal_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_journal_list_path_idx" ON "_pages_v_blocks_journal_list" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_testimonials_order_idx" ON "_pages_v_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_parent_id_idx" ON "_pages_v_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_path_idx" ON "_pages_v_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_photo_row_order_idx" ON "_pages_v_blocks_photo_row" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_photo_row_parent_id_idx" ON "_pages_v_blocks_photo_row" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_photo_row_path_idx" ON "_pages_v_blocks_photo_row" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_prose_order_idx" ON "_pages_v_blocks_prose" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_prose_parent_id_idx" ON "_pages_v_blocks_prose" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_prose_path_idx" ON "_pages_v_blocks_prose" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_press_strip_logos_order_idx" ON "_pages_v_blocks_press_strip_logos" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_press_strip_logos_parent_id_idx" ON "_pages_v_blocks_press_strip_logos" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_press_strip_logos_logo_idx" ON "_pages_v_blocks_press_strip_logos" USING btree ("logo_id");
  CREATE INDEX "_pages_v_blocks_press_strip_order_idx" ON "_pages_v_blocks_press_strip" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_press_strip_parent_id_idx" ON "_pages_v_blocks_press_strip" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_press_strip_path_idx" ON "_pages_v_blocks_press_strip" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_instagram_feed_order_idx" ON "_pages_v_blocks_instagram_feed" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_instagram_feed_parent_id_idx" ON "_pages_v_blocks_instagram_feed" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_instagram_feed_path_idx" ON "_pages_v_blocks_instagram_feed" USING btree ("_path");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_services_id_idx" ON "_pages_v_rels" USING btree ("services_id");
  CREATE INDEX "_pages_v_rels_projects_id_idx" ON "_pages_v_rels" USING btree ("projects_id");
  CREATE INDEX "_pages_v_rels_posts_id_idx" ON "_pages_v_rels" USING btree ("posts_id");
  CREATE INDEX "_pages_v_rels_testimonials_id_idx" ON "_pages_v_rels" USING btree ("testimonials_id");
  CREATE INDEX "_pages_v_rels_media_id_idx" ON "_pages_v_rels" USING btree ("media_id");
  CREATE INDEX "projects_blocks_photo_row_order_idx" ON "projects_blocks_photo_row" USING btree ("_order");
  CREATE INDEX "projects_blocks_photo_row_parent_id_idx" ON "projects_blocks_photo_row" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_photo_row_path_idx" ON "projects_blocks_photo_row" USING btree ("_path");
  CREATE INDEX "projects_rels_order_idx" ON "projects_rels" USING btree ("order");
  CREATE INDEX "projects_rels_parent_idx" ON "projects_rels" USING btree ("parent_id");
  CREATE INDEX "projects_rels_path_idx" ON "projects_rels" USING btree ("path");
  CREATE INDEX "projects_rels_media_id_idx" ON "projects_rels" USING btree ("media_id");
  CREATE INDEX "_projects_v_blocks_photo_row_order_idx" ON "_projects_v_blocks_photo_row" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_photo_row_parent_id_idx" ON "_projects_v_blocks_photo_row" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_photo_row_path_idx" ON "_projects_v_blocks_photo_row" USING btree ("_path");
  CREATE INDEX "_projects_v_rels_order_idx" ON "_projects_v_rels" USING btree ("order");
  CREATE INDEX "_projects_v_rels_parent_idx" ON "_projects_v_rels" USING btree ("parent_id");
  CREATE INDEX "_projects_v_rels_path_idx" ON "_projects_v_rels" USING btree ("path");
  CREATE INDEX "_projects_v_rels_media_id_idx" ON "_projects_v_rels" USING btree ("media_id");
  CREATE INDEX "header_nav_order_idx" ON "header_nav" USING btree ("_order");
  CREATE INDEX "header_nav_parent_id_idx" ON "header_nav" USING btree ("_parent_id");
  CREATE INDEX "header_nav_page_idx" ON "header_nav" USING btree ("page_id");
  CREATE INDEX "header_logo_idx" ON "header" USING btree ("logo_id");
  CREATE INDEX "footer_social_order_idx" ON "footer_social" USING btree ("_order");
  CREATE INDEX "footer_social_parent_id_idx" ON "footer_social" USING btree ("_parent_id");
  CREATE INDEX "footer_quick_links_order_idx" ON "footer_quick_links" USING btree ("_order");
  CREATE INDEX "footer_quick_links_parent_id_idx" ON "footer_quick_links" USING btree ("_parent_id");
  CREATE INDEX "footer_quick_links_page_idx" ON "footer_quick_links" USING btree ("page_id");
  CREATE INDEX "footer_logo_idx" ON "footer" USING btree ("logo_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_masthead" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_story_split" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_service_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_service_panels_panels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_service_panels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_portfolio_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_portfolio_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_journal_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_photo_row" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_prose" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_press_strip_logos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_press_strip" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_instagram_feed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_masthead" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_story_split" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_service_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_service_panels_panels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_service_panels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_portfolio_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_portfolio_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_journal_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_photo_row" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_prose" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_press_strip_logos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_press_strip" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_instagram_feed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_blocks_photo_row" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v_blocks_photo_row" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header_nav" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_social" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_quick_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_hero" CASCADE;
  DROP TABLE "pages_blocks_masthead" CASCADE;
  DROP TABLE "pages_blocks_story_split" CASCADE;
  DROP TABLE "pages_blocks_service_grid" CASCADE;
  DROP TABLE "pages_blocks_service_panels_panels" CASCADE;
  DROP TABLE "pages_blocks_service_panels" CASCADE;
  DROP TABLE "pages_blocks_portfolio_grid" CASCADE;
  DROP TABLE "pages_blocks_portfolio_list" CASCADE;
  DROP TABLE "pages_blocks_journal_list" CASCADE;
  DROP TABLE "pages_blocks_testimonials" CASCADE;
  DROP TABLE "pages_blocks_photo_row" CASCADE;
  DROP TABLE "pages_blocks_prose" CASCADE;
  DROP TABLE "pages_blocks_press_strip_logos" CASCADE;
  DROP TABLE "pages_blocks_press_strip" CASCADE;
  DROP TABLE "pages_blocks_instagram_feed" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_blocks_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_masthead" CASCADE;
  DROP TABLE "_pages_v_blocks_story_split" CASCADE;
  DROP TABLE "_pages_v_blocks_service_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_service_panels_panels" CASCADE;
  DROP TABLE "_pages_v_blocks_service_panels" CASCADE;
  DROP TABLE "_pages_v_blocks_portfolio_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_portfolio_list" CASCADE;
  DROP TABLE "_pages_v_blocks_journal_list" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials" CASCADE;
  DROP TABLE "_pages_v_blocks_photo_row" CASCADE;
  DROP TABLE "_pages_v_blocks_prose" CASCADE;
  DROP TABLE "_pages_v_blocks_press_strip_logos" CASCADE;
  DROP TABLE "_pages_v_blocks_press_strip" CASCADE;
  DROP TABLE "_pages_v_blocks_instagram_feed" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "projects_blocks_photo_row" CASCADE;
  DROP TABLE "projects_rels" CASCADE;
  DROP TABLE "_projects_v_blocks_photo_row" CASCADE;
  DROP TABLE "_projects_v_rels" CASCADE;
  DROP TABLE "header_nav" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "footer_social" CASCADE;
  DROP TABLE "footer_quick_links" CASCADE;
  DROP TABLE "footer" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pages_fk";
  
  DROP INDEX "payload_locked_documents_rels_pages_id_idx";
  ALTER TABLE "projects_blocks_prose" DROP COLUMN "ornament";
  ALTER TABLE "projects_blocks_prose" DROP COLUMN "heading";
  ALTER TABLE "_projects_v_blocks_prose" DROP COLUMN "ornament";
  ALTER TABLE "_projects_v_blocks_prose" DROP COLUMN "heading";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pages_id";
  DROP TYPE "public"."enum_pages_blocks_story_split_side";
  DROP TYPE "public"."enum_pages_blocks_story_split_petals";
  DROP TYPE "public"."enum_pages_blocks_journal_list_mode";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_story_split_side";
  DROP TYPE "public"."enum__pages_v_blocks_story_split_petals";
  DROP TYPE "public"."enum__pages_v_blocks_journal_list_mode";
  DROP TYPE "public"."enum__pages_v_version_status";`)
}
