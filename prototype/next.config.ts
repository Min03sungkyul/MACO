import type { NextConfig } from 'next';
import { networkInterfaces } from 'node:os';

// Lets a phone on the same Wi-Fi load the dev server (npm run dev -- -H 0.0.0.0).
const lanHosts = Object.values(networkInterfaces())
  .flat()
  .filter((n) => n && n.family === 'IPv4' && !n.internal)
  .map((n) => n!.address);

const nextConfig: NextConfig = {
  allowedDevOrigins: lanHosts,
  // hide the Next.js dev badge so the screen looks like the real app
  devIndicators: false,
};

export default nextConfig;
