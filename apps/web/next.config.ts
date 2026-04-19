import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  ...(process.env.STATIC_EXPORT === 'true' && {
    output: 'export',
    basePath: process.env.BASE_PATH || '',
    assetPrefix: process.env.ASSET_PREFIX || '',
    images: { unoptimized: true },
  }),
};

export default nextConfig;
