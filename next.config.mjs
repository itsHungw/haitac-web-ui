import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const API_ORIGIN = process.env.API_ORIGIN || 'https://htthapi.aqueduct.me';

const nextConfig = {
  // Rewrites are REQUIRED for session cookies (htth_token):
  // Cookie is Secure + SameSite=Lax and host-only for the API domain.
  // Proxying via Next.js makes the browser consider requests same-origin.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_ORIGIN}/api/:path*`,
      },
    ];
  },

  // Backward compatibility redirects for legacy Vietnamese routes
  async redirects() {
    return [
      {
        source: '/dang-nhap',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/dang-ky',
        destination: '/register',
        permanent: true,
      },
    ];
  },

  webpack(config) {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
};

export default nextConfig;
