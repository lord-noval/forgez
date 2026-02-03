import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n-config.ts');

const nextConfig: NextConfig = {
  // Required for Cloudflare Pages
  experimental: {
    // Enable edge runtime for all pages
  },
  // Disable image optimization (not supported on Cloudflare)
  images: {
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);
