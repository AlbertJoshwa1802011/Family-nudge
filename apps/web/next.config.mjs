/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@family-nudge/shared"],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
