/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    domains: [
      'placehold.co',
      'd383kuiij66lee.cloudfront.net'
    ],
  },
};

module.exports = nextConfig;
