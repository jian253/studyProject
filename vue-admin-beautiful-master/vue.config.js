/**
 * @author chuzhixin 1204505056@qq.com （不想保留author可删除）
 * @description cli配置
 */
/*

vue cli4        https://github.com/staven630/vue-cli4-config
vue cli3        https://github.com/staven630/vue-cli4-config/tree/vue-cli3
vue.config.js   https://cli.vuejs.org/zh/config/#runtimecompiler
webpack         https://webpack.js.org/configuration/dev-server/#devservernoinfo-
webpackbar      https://www.npmjs.com/package/webpackbar    （个人理解应该是单页面加载的进度条）
ESLint          https://www.cnblogs.com/super86/p/6994813.html

 */
const path = require('path')
const {//引入部分配置变量
  publicPath,// 公共路径(必须有的)
  assetsDir,// 静态资源存放的文件夹(相对于ouputDir)
  outputDir,// 输出文件目录
  lintOnSave,// eslint-loader 是否在保存的时候检查(果断不用，这玩意儿我都没装)
  transpileDependencies,//配置默认为[], babel-loader 会忽略所有 node_modules 中的文件。如果你想要通过 Babel 显式转译一个依赖，可以在这个选项中列出来。配置需要转译的第三方库
  title, //标题
  abbreviation,//简写
  devPort,//开发环境端口号
  providePlugin,//webpack的内置模块，使用ProvidePlugin加载的模块在使用时将不再需要import和require进行引入，以jquery为例，用ProvidePlugin进行实例初始化后，jquery就会被自动加载并导入对应的node模块中
  build7z,//npm run build时是否自动生成7z压缩包
  donation,//是否显示终端donation打印
} = require('./src/config')
const { webpackBarName, webpackBanner, donationConsole } = require('zx-layouts')

if (donation) donationConsole()
const { version, author } = require('./package.json')
const Webpack = require('webpack')
const WebpackBar = require('webpackbar')
const FileManagerPlugin = require('filemanager-webpack-plugin')
const dayjs = require('dayjs')
const date = dayjs().format('YYYY_M_D')
const time = dayjs().format('YYYY-M-D HH:mm:ss')
const productionGzipExtensions = ['html', 'js', 'css', 'svg']
process.env.VUE_APP_TITLE = title || 'vue-admin-beautiful'
process.env.VUE_APP_AUTHOR = author || 'chuzhixin 1204505056@qq.com'
process.env.VUE_APP_UPDATE_TIME = time
process.env.VUE_APP_VERSION = version

const resolve = (dir) => path.join(__dirname, dir)
const mockServer = () => {
  if (process.env.NODE_ENV === 'development') return require('./mock')
  else return ''
}

module.exports = {
  publicPath,// 公共路径(必须有的) / 默认'/'，部署应用包时的基本 URL
  assetsDir,// 静态资源存放的文件夹(相对于ouputDir)
  outputDir,// 输出文件目录
  lintOnSave,// eslint-loader 是否在保存的时候检查(果断不用，这玩意儿我都没装)
  transpileDependencies,// 进行编译的依赖
  devServer: {//端口环境配置
    proxy: {//代理地址
      '/api': {
        target: 'http:192.168.3.82:9001',
        ws: true,
        changeOrigin: true
      }
    },
    hot: true,//单纯设置hot为true的时候，如果编译报错，会抛出错误，你重新改成正确的，这个时候又会触发重新编译，整个浏览器会重新刷新！
    hotOnly: true,//在设置了hot:true，再将这个也设置为true的话，如果编译报错，你再改成正确的，重新编译，浏览器不会刷新！ （ 热更新）
    port: devPort,//端口
    open: true,// 是否打开浏览器
    noInfo: false,//告诉开发服务器禁止显示诸如Webpack捆绑包信息之类的消息。错误和警告仍将显示。
    host: "localhost",//ip地址
    https: false,//是否https
    overlay: {// 让浏览器 overlay 同时显示警告和错误
      warnings: true,
      errors: true,
    },
    after: mockServer(),
  },
  configureWebpack() {//绝对路径 和引入插件模块的配置
    return {
      resolve: {//配置绝对路径
        alias: {
          '@': resolve('src'),
        },
      },
      plugins: [
        new Webpack.ProvidePlugin(providePlugin),//使用ProvidePlugin加载的模块  类似jQuery 配置引入
        new WebpackBar({//需要npm安装的单页面路由进度条(支持多条进度条)
          name: webpackBarName,
        }),
      ],
    }
  },
  chainWebpack(config) {//这个库提供了一个 webpack 原始配置的上层抽象，使其可以定义具名的 loader 规则和具名插件，并有机会在后期进入这些规则并对它们的选项进行修改。
    config.plugins.delete('preload')
    config.plugins.delete('prefetch')
    config.module
      .rule('svg')
      .exclude.add(resolve('src/remixIcon'))
      .add(resolve('src/colorfulIcon'))
      .end()

    config.module
      .rule('remixIcon')
      .test(/\.svg$/)
      .include.add(resolve('src/remixIcon'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({ symbolId: 'remix-icon-[name]' })
      .end()

    config.module
      .rule('colorfulIcon')
      .test(/\.svg$/)
      .include.add(resolve('src/colorfulIcon'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({ symbolId: 'colorful-icon-[name]' })
      .end()

    /*  config.when(process.env.NODE_ENV === "development", (config) => {
      config.devtool("source-map");
    }); */
    config.when(process.env.NODE_ENV !== 'development', (config) => {// 为开发环境修改配置...
      config.performance.set('hints', false)
      config.devtool('none')
      config.optimization.splitChunks({
        chunks: 'all',
        cacheGroups: {
          libs: {
            name: 'chunk-libs',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial',
          },
          elementUI: {
            name: 'chunk-elementUI',
            priority: 20,
            test: /[\\/]node_modules[\\/]_?element-ui(.*)/,
          },
          fortawesome: {
            name: 'chunk-fortawesome',
            priority: 20,
            test: /[\\/]node_modules[\\/]_?@fortawesome(.*)/,
          },
        },
      })
      config
        .plugin('banner')
        .use(Webpack.BannerPlugin, [`${webpackBanner}${time}`])
        .end()
      config.module
        .rule('images')
        .use('image-webpack-loader')
        .loader('image-webpack-loader')
        .options({
          bypassOnDebug: true,
        })
        .end()
    })

    if (build7z) {
      config.when(process.env.NODE_ENV === 'production',  (config) => { // 为生产环境修改配置...  npm run build时是否自动生成7z压缩包
        config
          .plugin('fileManager')
          .use(FileManagerPlugin, [
            {
              onEnd: {
                delete: [`./${outputDir}/video`, `./${outputDir}/data`],
                archive: [
                  {
                    source: `./${outputDir}`,
                    destination: `./${outputDir}/${abbreviation}_${outputDir}_${date}.7z`,
                  },
                ],
              },
            },
          ])
          .end()
      })
    }
  },
  runtimeCompiler: true,// 是否使用包含运行时编译器的 Vue 构建版本
  productionSourceMap: false,// 是否为生产环境构建生成 source map
  css: {
    //extract: true,// 是否使用css分离插件 ExtractTextPlugin
    requireModuleExtension: true,// 启用 CSS modules for all css / pre-processor files.
    sourceMap: true,// 开启 CSS source maps
    loaderOptions: {// css预设器配置
      scss: {
        /*sass-loader 8.0语法pai'zhi */
        //prependData: '@import "~@/styles/variables.scss";',

        /*sass-loader 9.0写法，感谢github用户 shaonialife*/
        additionalData(content, loaderContext) {
          const { resourcePath, rootContext } = loaderContext
          const relativePath = path.relative(rootContext, resourcePath)
          if (
            relativePath.replace(/\\/g, '/') !== 'src/styles/variables.scss'
          ) {
            return '@import "~@/styles/variables.scss";' + content
          }
          return content
        },
      },
    },
  },
}
