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
  }
};

// Log environment variables when the config is loaded
if (process.env.NODE_ENV !== 'production') {
  console.log('Environment Variables:');
  console.log('PUBLIC_API_KEY:', process.env.PUBLIC_API_KEY);
  console.log('COINGECKO_API_KEY:', process.env.COINGECKO_API_KEY);
  console.log('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  console.log('CLERK_SECRET_KEY:', process.env.CLERK_SECRET_KEY);
  console.log('CLERK_WEBHOOK_SECRET:', process.env.CLERK_WEBHOOK_SECRET);
}

module.exports = nextConfig; 