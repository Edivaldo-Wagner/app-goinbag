const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);
  const {
    resolver: {sourceExts, assetExts},
  } = defaultConfig;

  const config = {
    transformer: {
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
    },
    resolver: {
      assetExts: assetExts.filter(ext => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg', 'mjs'],
      // Evita que o Metro fique escaneando pastas de build do Android e subpastas do node_modules
      blockList: [
        /node_modules\/.*\/node_modules/,
        /.*\/android\/.*/,
        /.*\/ios\/.*/,
        /.*\/build\/.*/,
      ],
    },
    watcher: {
      // Desativa a verificação estrita de saúde do watcher no Windows para não dar timeout
      healthCheck: {
        enabled: false,
      },
      watchman: {
        deferStates: [],
      },
    },
  };

  return mergeConfig(defaultConfig, config);
})();