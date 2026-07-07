import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  // react-leaflet's MapContainer isn't safe against Strict Mode's dev-only
  // double-invoked mount/unmount cycle: it throws "Map container is being
  // reused by another instance" on Fast Refresh. Dev-only setting; no effect
  // on production builds.
  reactStrictMode: false,
};

export default withNextIntl(nextConfig);
