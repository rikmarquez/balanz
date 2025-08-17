/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["postgres"]
  },
  // Configuración para Railway - Build estándar (más compatible)
  // output: 'standalone', // Deshabilitado temporalmente
  
  // Configuración de assets para Railway
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : undefined,
  trailingSlash: false,
  
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
            value: "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.accounts.dev https://*.clerk.dev; worker-src 'self' blob:; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.dev;"
          }
        ]
      }
    ]
  }
};

export default nextConfig;