/** @type {import('next').NextConfig} */
const nextConfig = {
  // @react-pdf/renderer usa pdfkit internamente, que carga sus fuentes
  // estándar y métricas (.afm) con require() dinámico. El file tracing
  // de Next.js no detecta esas rutas en tiempo de build, así que en
  // Vercel el bundle serverless de /api/cotizacion no las incluye y
  // falla con "Cannot find module '.../pdfkit/js/standard-fonts/...'".
  // Forzamos su inclusión explícita para esa ruta.
  experimental: {
    outputFileTracingIncludes: {
      "/api/cotizacion": [
        "./node_modules/pdfkit/js/**/*",
        "./node_modules/@react-pdf/**/*",
      ],
    },
  },
};

export default nextConfig;
