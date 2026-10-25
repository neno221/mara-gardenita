import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import sharp from "sharp";

import { generateDescription, generateImage, generateTitle } from "./lib/seo";
import { migrateOnDeploy } from "./lib/migrateOnDeploy";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Pages } from "./collections/Pages";
import { Projects } from "./collections/Projects";
import { Services } from "./collections/Services";
import { Testimonials } from "./collections/Testimonials";
import { Instagram } from "./collections/Instagram";
import { Header } from "./globals/Header";
import { Footer } from "./globals/Footer";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// `vercel env pull` writes sensitive variables as "[SENSITIVE]" rather than their
// values. Treat that placeholder as unset, so local maintenance against a pulled
// file falls back to local disk instead of handing the adapter a dead token.
const envValue = (name: string) => {
  const value = process.env[name];
  return value && !value.includes("[SENSITIVE]") ? value : undefined;
};
const blobToken = envValue("BLOB_READ_WRITE_TOKEN");

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
  },

  // Pages is listed first because it is the one collection an editor opens to
  // change what the site *is*; the other five hold what it is made of.
  collections: [Pages, Users, Media, Projects, Services, Testimonials, Instagram],

  // Both rendered by `SiteShell` on every page, which is why they are globals
  // rather than a document someone could delete.
  globals: [Header, Footer],

  editor: lexicalEditor(),

  plugins: [
    /**
     * Media in the public `mara-gardenita-media` Blob store on Vercel, on local disk
     * everywhere else — with no token the plugin steps aside.
     *
     * `disablePayloadAccessControl` makes a document's `url` the blob's own public
     * address rather than `/api/media/file/<name>`, so a photograph is served by
     * the Blob CDN instead of a function invocation. Files sit at the store's root
     * under their own filenames, which is where the media was transferred to; a
     * prefix or a random suffix here would point every existing document at a
     * file that does not exist.
     */
    vercelBlobStorage({
      enabled: Boolean(blobToken),
      token: blobToken,
      collections: { media: { disablePayloadAccessControl: true } },
    }),

    /**
     * SEO on the two collections that have a URL (spec §8).
     *
     * It replaces the hand-rolled `meta` group phase 4 put on Pages, and the swap
     * costs nothing in the database: the plugin names its fields `meta.title` and
     * `meta.description`, which Postgres already holds as `meta_title` and
     * `meta_description`. The seeded titles carry straight over — which matters,
     * because `document.title` is in the fingerprint.
     *
     * `noIndex` is appended rather than being a field of its own. It belongs
     * beside the description an editor is already looking at, not in a sidebar
     * three scrolls away, and the spec asks for it per document.
     */
    seoPlugin({
      collections: ["pages", "projects"],
      uploadsCollection: "media",
      generateTitle,
      generateDescription,
      generateImage,
      fields: ({ defaultFields }) => [
        ...defaultFields,
        {
          name: "noIndex",
          type: "checkbox",
          label: "Hide from search engines",
          admin: {
            description:
              "Emits robots noindex and drops the document from the sitemap. For a page " +
              "that is published because someone needs the link, not because it is finished.",
          },
        },
      ],
    }),
  ],

  db: postgresAdapter({
    // `DATABASE_URI` locally; the Neon integration on Vercel provides the pooled
    // `DATABASE_URL`. The pool keeps pg's default size: capped at two, Payload's
    // REST delete waits on a connection it never gets and runs into the function
    // timeout.
    pool: { connectionString: envValue("DATABASE_URI") || envValue("DATABASE_URL") || "" },

    // Push reconciles the schema straight from the config, which is fast in dev but
    // silently mutates the database — and decision C makes that database the only
    // copy of every edit anyone makes. So migrations stay the source of truth: the
    // migrate:* npm scripts set PAYLOAD_DB_PUSH=false to take push out of the loop
    // while a migration is being generated or applied.
    // Never in production, whatever the environment says: there the schema moves
    // only by migration (`lib/migrateOnDeploy.ts`).
    push:
      process.env.NODE_ENV !== "production" &&
      (process.env.PAYLOAD_DB_PUSH
        ? process.env.PAYLOAD_DB_PUSH === "true"
        : process.env.NODE_ENV === "development"),

    migrationDir: path.resolve(dirname, "migrations"),
  }),

  secret: process.env.PAYLOAD_SECRET || "",

  onInit: migrateOnDeploy,

  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },

  sharp,
});
