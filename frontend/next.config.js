/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/api-backend/:path*', destination: 'http://localhost:4000/api/:path*' },
      { source: '/uploads/:path*', destination: 'http://localhost:4000/uploads/:path*' },
    ];
  },
};
module.exports = nextConfig;
