const path = require('path');

module.exports = {
  output: process.env.NEXT_OUTPUT_MODE === 'export' ? 'export' : undefined,
  turbopack: {
    resolveAlias: {
      '@': path.resolve(__dirname),
    },
  },
};
