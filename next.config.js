/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  basePath: "/monday-deals-starter",
  assetPrefix: "/monday-deals-starter/",
  experimental: {
    typedRoutes: true,
  },
};

module.exports = nextConfig;
