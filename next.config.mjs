/** @type {import('next').NextConfig} */
const nextConfig = {
  // Necessário para o build dentro do container Docker
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
