import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    domains: ["picsum.photos", "lh3.googleusercontent.com", "i.pravatar.cc"],
    unoptimized: true,
  },
};

export default nextConfig;
