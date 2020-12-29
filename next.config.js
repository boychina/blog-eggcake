const path = require('path');

module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    };
    config.node = {
      fs: 'empty',
    }
    return config;
  },
};
