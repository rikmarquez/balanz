/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["postgres"]
  },
  // Configuración para Railway - Standalone build
  output: 'standalone',
  
  // Optimizaciones para producción
  poweredByHeader: false,
  generateEtags: false,
  
  // Configuración de imagen optimizada
  images: {
    domains: [],
    unoptimized: true
  }
};

export default nextConfig;