/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  images: {
    domains: ['res.cloudinary.com', 'avatars.githubusercontent.com'],
  },
  experimental: {},
};

module.exports = nextConfig;
