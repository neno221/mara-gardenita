import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { seoPlugin } from "@payloadcms/plugin-seo";
import sharp from "sharp";

import { generateDescription, generateImage, generateTitle } from "./lib/seo";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Pages } from "./collections/Pages";
import { Projects } from "./collections/Projects";
import { Posts } from "./collections/Posts";
import { Services } from "./collections/Services";
import { Testimonials } from "./collections/Testimonials";
import { Instagram } from "./collections/Instagram";
import { Header } from "./globals/Header";
import { Footer } from "./globals/Footer";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
  },

  // Pages is listed first because it is the one collection an editor opens to
  // change what the site *is*; the other six hold what it is made of.
  collections: [Pages, Users, Media, Projects, Posts, Services, Testimonials, Instagram],

  // Both rendered by `SiteShell` on every page, which is why they are globals
  // rather than a document someone could delete.
  globals: [Header, Footer],

  // English is the default and the fallback: a field with no Greek yet shows its
  // English text rather than an empty string. English lives at the root, Greek
  // under `/gr` (lib/i18n.ts).
  localization: {
    locales: [
      { label: "English", code: "en" },
      { label: "Ελληνικά", code: "gr" },
    ],
    defaultLocale: "en",
    fallback: true,
  },

  editor: lexicalEditor(),

  plugins: [
    /**
     * SEO on the three collections that have a URL (spec §8).
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
      collections: ["pages", "projects", "posts"],
      uploadsCollection: "media",
      generateTitle,
      generateDescription,
      generateImage,
      fields: ({ defaultFields }) => [
        // Title, description and image are per language; `noIndex` below is not.
        ...defaultFields.map((field) =>
          "name" in field && ["title", "description"].includes(field.name as string)
            ? { ...field, localized: true }
            : field,
        ),
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
    pool: { connectionString: process.env.DATABASE_URI || "" },

    // Push reconciles the schema straight from the config, which is fast in dev but
    // silently mutates the database — and decision C makes that database the only
    // copy of every edit anyone makes. So migrations stay the source of truth: the
    // migrate:* npm scripts set PAYLOAD_DB_PUSH=false to take push out of the loop
    // while a migration is being generated or applied.
    push: process.env.PAYLOAD_DB_PUSH
      ? process.env.PAYLOAD_DB_PUSH === "true"
      : process.env.NODE_ENV === "development",

    migrationDir: path.resolve(dirname, "migrations"),
  }),

  secret: process.env.PAYLOAD_SECRET || "",

  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },

  sharp,
});
