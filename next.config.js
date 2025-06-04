/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Required for desktop app
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig
