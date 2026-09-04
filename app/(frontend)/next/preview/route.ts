import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { getClient } from "@/lib/payload";
import { previewPath } from "@/lib/preview";

/**
 * Turns draft mode on for a signed-in editor and sends them to the page.
 *
 * The admin's live-preview iframe loads this, and so does the Preview button.
 * Both hand it a collection, a slug and the secret; the browser's own Payload
 * session cookie comes along for free, which is the part that authorises.
 *
 * **Why both a secret and a session.** The secret is in the admin's markup, so it
 * is not a credential — it only stops the URL being guessable. `payload.auth()`
 * on the incoming cookies is what decides whether this person may see an
 * unpublished document, and it is checked second so a valid secret with no
 * session still gets a 403.
 *
 * The redirect target is rebuilt here from the collection and slug rather than
 * taken from the `path` parameter. A caller-supplied path is an open redirect
 * waiting to happen, and the two produce the same string for every legitimate
 * request anyway.
 */
export async function GET(request: NextRequest): Promise<Response> {
  const params = request.nextUrl.searchParams;
  const collection = params.get("collection");
  const slug = params.get("slug");
  const secret = params.get("secret");

  const expected = process.env.PAYLOAD_PUBLIC_DRAFT_SECRET;
  if (!expected) {
    return new Response(
      "PAYLOAD_PUBLIC_DRAFT_SECRET is not set, so preview is disabled. See .env.example.",
      { status: 500 },
    );
  }
  if (secret !== expected) {
    return new Response("Wrong or missing preview secret.", { status: 401 });
  }
  if (!collection || !slug) {
    return new Response("Both `collection` and `slug` are required.", { status: 400 });
  }

  const client = await getClient();
  const { user } = await client.auth({ headers: request.headers });
  if (!user) {
    return new Response(
      "Preview needs a signed-in editor. The secret makes the URL unguessable; " +
        "it does not authorise anything on its own.",
      { status: 403 },
    );
  }

  let path: string;
  try {
    path = previewPath(collection, slug);
  } catch {
    return new Response(`${collection} has no public URL, so it cannot be previewed.`, {
      status: 400,
    });
  }

  const draft = await draftMode();
  draft.enable();

  redirect(path);
}
