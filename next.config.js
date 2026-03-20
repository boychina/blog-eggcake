const path = require('path');

const isExportMode = process.env.NEXT_OUTPUT_MODE === 'export';
const basePath = process.env.NEXT_BASE_PATH || (isExportMode ? '/docs' : '');

module.exports = {
  output: isExportMode ? 'export' : undefined,
  basePath: basePath || undefined,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    };
    return config;
  },
};
