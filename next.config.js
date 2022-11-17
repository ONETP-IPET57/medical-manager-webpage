/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  rewrites: () => {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'https://hospitalbackend.pythonanywhere.com/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
