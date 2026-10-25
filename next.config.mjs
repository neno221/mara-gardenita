import { withPayload } from "@payloadcms/next/withPayload";

/**
 * The editor-facing host. It is the same deployment as the public site — one Vercel
 * project answering on both hostnames — so a publish revalidates the pages the public
 * host serves, and the draft preview (a relative `/next/preview` URL) stays same-origin
 * with the admin session. Only the front door differs: `/` here is the admin.
 */
const CMS_HOST = "cms.maragardenita.com";
const onCmsHost = [{ type: "host", value: CMS_HOST }];

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  images: {
    // The template artwork is already exported at its display size; re-encoding
    // it would only soften the photography. Payload generates the alternates and
    // the site builds its own srcSet, so Next's optimiser has nothing to add.
    unoptimized: true,
  },

  async rewrites() {
    return {
      beforeFiles: [{ source: "/", has: onCmsHost, destination: "/admin" }],
    };
  },

  async headers() {
    return [
      {
        // The public pages are reachable on this host too (preview needs them), so keep
        // the whole host out of search results rather than competing with the real site.
        source: "/:path*",
        has: onCmsHost,
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default withPayload(nextConfig);
