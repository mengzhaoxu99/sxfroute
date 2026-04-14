import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: false,
  pageExtensions: ["ts", "tsx", "js", "jsx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
  async redirects() {
    return [];
  },
  productionBrowserSourceMaps: false,
  compress: true,
  generateBuildId: async () => {
    return Date.now().toString();
  },
  experimental: {
    instrumentationHook: true,
  },
};

export default withNextIntl(nextConfig);
