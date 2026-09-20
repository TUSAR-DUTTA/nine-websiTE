/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com", "api.dicebear.com", "pbs.twimg.com"],
  },
  eslint: {
    dirs: ["src"],
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Exclude build errors from stopping production deployment
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
