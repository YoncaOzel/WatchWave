const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'axios' || moduleName.startsWith('axios/')) {
    const axiosBrowserPath = path.resolve(
      __dirname,
      'node_modules/axios/dist/browser/axios.cjs'
    );
    return {
      filePath: axiosBrowserPath,
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
