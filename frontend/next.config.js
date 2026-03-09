/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['lh3.googleusercontent.com'],
    },
    webpack: (config, { isServer }) => {
        // Don't bundle Node-only `ws` in the client; engine.io-client uses browser WebSocket there.
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                ws: false,
            };
        }
        return config;
    },
};

module.exports = nextConfig;
