import { draftMode } from "next/headers";

/**
 * Turns draft mode off.
 *
 * Draft mode is a cookie, so without this an editor who previewed one page keeps
 * seeing drafts everywhere until the browser is closed — including on the live
 * site in the same tab. No secret and no session check: switching *back* to what
 * everyone else sees needs no authorisation.
 */
export async function GET(): Promise<Response> {
  const draft = await draftMode();
  draft.disable();
  return new Response("Draft mode is off.", { status: 200 });
}
