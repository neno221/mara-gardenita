# The deploy gap

[Decision C](./payload-plan.md#c-where-does-this-deploy--answered) put this site on local
Docker and nothing else: no hosted Postgres, no storage adapter, no CI. Phase 6 is where a
production phase would have gone, so this file records what that phase would have contained.
It is a list of deferred work, not a runbook — nothing here has been built or tested.

| | |
|---|---|
| **Runs today** | `docker compose up -d` · `npm run dev` · media on local disk · migrations applied by hand |
| **Only copy of the data** | the `mara_gardenita_pgdata` Docker volume, plus `public/media` |
| **Backup** | `npm run db:dump` — manual, local, and restored end to end once, in phase 6 |

## The four things a deploy needs

**1. A storage adapter.** `collections/Media.ts` writes uploads to `public/media` via
`staticDir`. That directory is gitignored and lives on one machine, so it does not survive a
container rebuild, let alone a second instance. `@payloadcms/storage-s3` (or the Vercel Blob
/ Azure / GCS equivalent) replaces the local directory with a bucket.

This is the cheapest of the four, because the site does not read file paths. `lib/media.ts`
builds every `<img>` from the Media document's own `url`, and `url` is exactly the field an
adapter rewrites — so the adapter is a config change and the rendering layer does not move.
The `imageSizes` table stays as it is: the three widths are what reproduce the published
`srcSet`, and regenerating them at different widths would break the fingerprint.

**2. Hosted Postgres.** `payload.config.ts` already reads `DATABASE_URI` from the
environment, so this is a connection string and a `sslmode` away. What changes is not the
config but the operational assumption behind it — see *Backups*, below.

**3. `payload migrate` in the release.** `push` is on in development and off everywhere else
(`PAYLOAD_DB_PUSH`), so a deployed instance would start against whatever schema the database
already has. `npm run migrate` has to run before the new code serves traffic, as a release
step rather than at boot: two instances starting at once would otherwise race for the same
migration.

The four migrations in `migrations/` are the full history from an empty database, so a fresh
environment is `migrate` from zero rather than a schema dump. Every schema edit still needs
`npm run migrate:create` — and with no CI to catch a missing one, that stays a habit rather
than a gate.

**4. Real secrets, per environment.** `PAYLOAD_SECRET` signs the auth cookies, so changing it
logs everyone out and it must not be shared with a local `.env`. `NEXT_PUBLIC_SERVER_URL`
and `NEXT_PUBLIC_SITE_URL` are baked into the client bundle at build time — a wrong value
there sends preview and revalidation to the wrong origin. `PAYLOAD_PUBLIC_DRAFT_SECRET`
guards the draft preview route and is the one an editor's link carries.

## What does not change

Worth stating, because it is the part that was designed for:

- **The rendering layer.** `lib/media.ts` is pure and takes a Media document, not a path.
- **The gate.** `npm run fingerprint` runs against `next dev` on any host, so a staging
  deploy can be checked with `--url`.
- **`next.config.mjs`.** `images.unoptimized` stays true — the site builds its own `srcSet`
  from Payload's derivatives, so Next's optimiser has nothing to add and would only re-encode.

## Three things to get wrong

**The fingerprint cannot run against a production build.** It normalises CSS-module hashes
by name (`Section_section__rXxcK` → `Section_section`), and a production build renames them
to opaque strings the normaliser cannot see through. Gate a staging *dev* server, or the
gate silently compares nothing.

**Media reads are open on purpose.** `collections/Media.ts` sets `read: anyone` because
`url` resolves to `/api/media/file/<name>`, an access-controlled Payload route rather than a
static file. On Payload's default it answers 403 and every photograph on the public site
disappears. A storage adapter serving from a bucket changes who enforces this; check it
rather than assuming it carries over.

**Backups stop being optional bookkeeping and become someone's job.** `scripts/db-dump.ps1`
is a PowerShell script run by hand on one machine, and it dumps the media directory
alongside the database because the two restore out of sync otherwise. A hosted database
usually brings its own snapshots; a bucket usually does not. The phase-6 drill is the
standard to hold a hosted setup to — restore into an empty database, then diff row counts,
per-table content checksums and sequence values against the source, and run the fingerprint
against the result.
