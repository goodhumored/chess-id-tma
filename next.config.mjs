/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export",
  images: {
    domains: ["picsum.photos", "lh3.googleusercontent.com", "i.pravatar.cc"],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
