import type { Metadata } from "next";
import {
  PageView,
  pageMetadataFor,
  pageStaticParams,
  type PageParams,
} from "@/lib/pageRoute";

/**
 * Every English page on the site, except the project detail route. The Greek
 * twin is `app/(greek)/gr/[[...slug]]`.
 *
 * One file serves every Pages document: a page is a row and a list of blocks,
 * so building another is an edit in the admin rather than a route and a deploy.
 * The optional catch-all lets `/` come through too — `home` is the only slug
 * whose path is not its own, and `pathFor` in `lib/links.ts` knows it.
 *
 * Statically generated, and revalidated by the `afterChange` hooks in
 * `hooks/revalidate.ts`.
 */
export const generateStaticParams = pageStaticParams;

export const generateMetadata = (props: PageParams): Promise<Metadata> =>
  pageMetadataFor(props, "en");

export default function Page(props: PageParams) {
  return PageView(props, "en");
}
