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
  },
  
  // Headers para assets estáticos
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
          }
        ]
      }
    ]
  }
};

export default nextConfig;