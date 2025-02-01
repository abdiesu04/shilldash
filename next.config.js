/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['*'],
    unoptimized: true,
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '*',
      },
      {
        protocol: 'https',
        hostname: '*',
      },
    ],
  },
}

module.exports = nextConfig 