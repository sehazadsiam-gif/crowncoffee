/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Cloudflare R2 public bucket (production uploads)
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      // Legacy Vercel Blob URLs (existing menu images uploaded before migration)
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
