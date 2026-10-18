import type { Metadata } from "next";
import {
  PageView,
  pageMetadataFor,
  pageStaticParams,
  type PageParams,
} from "@/lib/pageRoute";

/** The Greek twin of `app/(frontend)/[[...slug]]`: same documents, `gr` locale. */
export const generateStaticParams = pageStaticParams;

export const generateMetadata = (props: PageParams): Promise<Metadata> =>
  pageMetadataFor(props, "gr");

export default function Page(props: PageParams) {
  return PageView(props, "gr");
}
