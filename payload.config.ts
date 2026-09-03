import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
  },

  collections: [Users, Media],

  editor: lexicalEditor(),

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
