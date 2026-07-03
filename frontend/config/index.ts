import path from 'path'
import { defineConfig, UserConfigExport } from '@tarojs/cli'

import devConfig from './dev'
import prodConfig from './prod'

export default defineConfig(async (merge, { command, mode }) => {
  const baseConfig: UserConfigExport = {
    projectName: 'frontend',
    date: '2026-6-29',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: [],
    defineConstants: {
    },
    copy: {
      patterns: [
      ],
      options: {
      }
    },
    framework: 'react',
    compiler: 'webpack5',
    cache: {
      enable: false
    },
    prebundle: {
      enable: false
    },
    fileType: {
      style: 'scss'
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {

          }
        },
        url: {
          enable: true,
          config: {
            limit: 1024
          }
        },
        cssModules: {
          enable: false,
          config: {
            namingPattern: 'module',
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      }
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      router: {
        mode: 'browser'
      },
      // @ts-ignore
      html: {
        template: './public/index.html',
        filename: 'index.html',
        title: '人格图鉴',
        inject: true
      },
      output: {
        filename: 'js/[name].[contenthash:8].js',
        chunkFilename: 'js/[name].[contenthash:8].js'
      },
      // @ts-ignore
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
      },
      devServer: {
        host: '0.0.0.0',
        port: 10086,
        hot: true,
        allowedHosts: 'all',
        client: {
          webSocketURL: 'auto://0.0.0.0:0/ws',
        },
        historyApiFallback: {
          index: '/index.html',
        },
        static: [
          {
            directory: 'dist',
            publicPath: '/',
            serveIndex: false,
          },
          {
            directory: 'node_modules/.taro/h5/remote',
            publicPath: '/',
            serveIndex: false,
          },
        ],
      },
      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: 'css/[name].[contenthash:8].css',
        chunkFilename: 'css/[name].[contenthash:8].css'
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {}
        },
        cssModules: {
          enable: false,
          config: {
            namingPattern: 'module',
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      },
      webpackChain(chain) {
        chain.output.set('hashFunction', 'xxhash64')
        chain.plugin('html')
          .use(require.resolve('html-webpack-plugin'), [{
            template: './public/index.html',
            filename: 'index.html',
            title: '人格图鉴',
            inject: true,
            minify: {
              removeComments: true,
              collapseWhitespace: true
            }
          }])
        chain.devServer.set('proxy', {
          '/api': {
            target: 'http://localhost:8000',
            changeOrigin: true,
            secure: false,
          },
        })
        if (mode === 'development') {
          chain.merge({
            performance: {
              hints: false,
            },
          })
        } else {
          chain.merge({
            performance: {
              hints: 'warning',
              maxAssetSize: 300 * 1024,
              maxEntrypointSize: 512 * 1024,
              assetFilter(assetFilename) {
                if (/\.(jpe?g|png|webp|gif|svg|ico|woff2?|ttf|otf|eot)$/i.test(assetFilename)) {
                  return false
                }
                return true
              },
            },
          })
        }
      }
    }
  }

  if (process.env.NODE_ENV === 'development') {
    return merge({}, baseConfig, devConfig)
  }
  return merge({}, baseConfig, prodConfig)
})
