import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  redirects() {
    return [
      // Smart Patrol pindah ke dalam hub Monitoring. Hanya path persis ini:
      // aplikasi statisnya tetap di /smart-patrol/index.html (public/).
      {
        source: "/smart-patrol",
        destination: "/monitoring/smart-patrol",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
