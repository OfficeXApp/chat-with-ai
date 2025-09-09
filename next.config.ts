import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  // 🚀 THIS IS THE KEY SETTING FOR STATIC EXPORT
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Ensure trailing slashes for better static hosting compatibility
  trailingSlash: true,
};

export default nextConfig;