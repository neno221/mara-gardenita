# Vercel deployment

The project is `mara-gardenita` (`prj_AiT1iDympp6UBzlK4YdTfrLlG4LS`) in the
`stephtsest-1773` account. Production is `https://mara-gardenita.vercel.app`; the
Payload admin is `/admin`, and `cms.maragardenita.com` serves the admin at `/`
(`next.config.mjs`).

It uses the existing Neon `mara-gardenita-db` database and the public Blob
`mara-gardenita-media` store (`store_7fcOAukK7tCtAxAh`). Do not create replacement
resources or seed production.

## Deploying

Deploy from a commit that is on GitHub. Production was first deployed with the
Vercel CLI from commits that were never pushed, and this file, the Blob adapter and
the Neon wiring had to be reconstructed from the deployment afterwards.

The build applies pending migrations itself (`lib/migrateOnDeploy.ts`): the first
Payload init of a production build runs them under an advisory lock, before any
page renders. A migration that fails rolls back and fails the build, so the
deployment already serving keeps serving. Nothing has to be run by hand first.

## Environment

Production variables, all already set on the project:

- `DATABASE_URL`: Neon pooled runtime connection. Leave `DATABASE_URI` unset in
  production; it takes precedence, for local development.
- `DATABASE_URL_UNPOOLED`: direct Neon connection, for dump/restore.
- `BLOB_READ_WRITE_TOKEN`: the public store's token. Without it, media falls back
  to local disk.
- `PAYLOAD_SECRET` and `PAYLOAD_PUBLIC_DRAFT_SECRET`: the production secrets.
- `NEXT_PUBLIC_SERVER_URL` and `NEXT_PUBLIC_SITE_URL`: the production origin.
- `PAYLOAD_DB_PUSH=false`. Push is off in production regardless (`payload.config.ts`).

Every variable targets production only, so preview deployments fail at "Collecting
page data" with "missing secret key". That is expected until preview gets its own
database and secrets.

Do not cap the runtime pool at two connections: Payload's REST delete needs more
than one, and with two the request hangs until the function times out.

## Media

Files sit at the store root under their own filenames, and a Media document's `url`
is the blob's public URL (`disablePayloadAccessControl: true`). Adding a prefix or a
random suffix to the adapter would point every existing document at a missing file.
