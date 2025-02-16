const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@tanstack/react-query': require.resolve('@tanstack/react-query'),
};

module.exports = config; 