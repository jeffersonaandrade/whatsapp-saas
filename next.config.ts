import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Se o frontend estiver em outro projeto (porta 3000) e precisar fazer proxy
  // para este backend Next.js (porta 3001), configure no next.config.ts do frontend:
  //
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://localhost:3001/api/:path*', // Backend Next.js (motor)
  //     },
  //   ];
  // }
  //
  // Este arquivo (backend) não precisa de proxy - chama Evolution API diretamente
};

export default nextConfig;
