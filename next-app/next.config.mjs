import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.game8.co',
        pathname: '/**'
      }
    ]
  },
  outputFileTracingRoot: path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
};

export default nextConfig;
