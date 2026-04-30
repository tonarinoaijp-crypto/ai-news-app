import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Vercel Pro/Hobby: 収集APIのタイムアウトを60秒に延長
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
