/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config, { dev }) => {
    if (dev) {
      // Use in-memory cache during development on Windows to prevent NTFS file-locking and chunk 404s
      config.cache = {
        type: "memory",
      };
    }
    return config;
  },
};

module.exports = nextConfig;

