/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@eduvantage/ui-web",
    "@eduvantage/design-tokens",
    "@eduvantage/api-client",
    "@eduvantage/contracts",
  ],
};

export default nextConfig;
