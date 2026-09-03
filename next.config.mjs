/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  images: {
    // The template artwork is already exported at its display size; re-encoding
    // it would only soften the photography.
    unoptimized: true,
  },
};

export default nextConfig;
