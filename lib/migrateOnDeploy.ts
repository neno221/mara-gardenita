/**
 * Pending migrations, applied by the production deployment itself.
 *
 * The production database is Neon, reachable from Vercel and from whoever holds
 * `DATABASE_URL_UNPOOLED` — but a release should not depend on someone running
 * `npm run migrate` from the right machine before the code that needs it goes
 * live. So the first Payload init of a production build applies what is
 * pending. That init happens while Next collects page data, in one worker,
 * before any page renders: a migration that throws rolls its transaction back
 * and fails the build, and the deployment already serving keeps serving.
 *
 * Every later init — each cold start — finds nothing pending and costs one read.
 *
 * **One at a time.** Next bundles each route on its own, and the routes collecting
 * page data each start Payload, so a build reaches this from two places at once.
 * Unserialised, both found the migration pending; one applied it and the other
 * failed on the tables the first had already dropped — a failed build over a
 * migrated database, the one outcome this exists to rule out. A Postgres advisory
 * lock, held on one connection for the whole check-and-run, makes the second
 * caller wait and then find nothing to do.
 *
 * Payload's own `prodMigrations` would do this, except for one thing: the
 * production database was restored from a local one that had run in push mode,
 * and Payload marks that with a `batch: -1` row. Its migrate step answers such a
 * row with an interactive prompt, which a build has no terminal to show, so the
 * row is removed first. Push is off in production (see `payload.config.ts`), so
 * the marker records nothing that is still true there.
 */
import type { PostgresAdapter } from "@payloadcms/db-postgres";
import type { Migration, Payload } from "payload";
import { migrations } from "../migrations";

/** Any constant both callers agree on; it only names the lock. */
const LOCK = 727_001;

export async function migrateOnDeploy(payload: Payload): Promise<void> {
  if (process.env.VERCEL_ENV !== "production") return;

  // Session-level, so it must be taken and released on the same connection.
  const connection = await (payload.db as unknown as PostgresAdapter).pool.connect();
  try {
    await connection.query("SELECT pg_advisory_lock($1)", [LOCK]);

    await payload.delete({
      collection: "payload-migrations",
      where: { batch: { equals: -1 } },
    });
    // The generated files type their arguments as the Postgres adapter's; the base
    // adapter's `migrate` takes them as `unknown`. Same objects, two declarations.
    await payload.db.migrate({ migrations: migrations as unknown as Migration[] });
  } finally {
    await connection.query("SELECT pg_advisory_unlock($1)", [LOCK]).catch(() => {});
    connection.release();
  }
}
