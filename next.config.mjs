import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  images: {
    // The template artwork is already exported at its display size; re-encoding
    // it would only soften the photography. Payload generates the alternates and
    // the site builds its own srcSet, so Next's optimiser has nothing to add.
    unoptimized: true,
  },
};

export default withPayload(nextConfig);
