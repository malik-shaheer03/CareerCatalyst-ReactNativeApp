const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add path mapping support
config.resolver.alias = {
  '@': path.resolve(__dirname, '.'),
  '@/lib': path.resolve(__dirname, 'lib'),
  '@/components': path.resolve(__dirname, 'components'),
};

module.exports = config;
