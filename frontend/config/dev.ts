export default {
  env: {
    NODE_ENV: '"development"'
  },
  defineConstants: {
  },
  mini: {},
  h5: {
    output: {
      filename: 'js/[name].js',
      chunkFilename: 'js/[name].chunk.js',
    },
    miniCssExtractPluginOption: {
      ignoreOrder: true,
      filename: 'css/[name].css',
      chunkFilename: 'css/[name].chunk.css',
    },
  }
}
