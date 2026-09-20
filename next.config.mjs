/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com", "api.dicebear.com", "pbs.twimg.com"],
  },
  eslint: {
    dirs: ["src"],
  },
};

export default nextConfig;
