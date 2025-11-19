const path = require("path");
const webpack = require("webpack");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const fs = require('fs');

const isDev = process.env.NODE_ENV === "development";
const isProd = !isDev;

const filename = (ext, folder = '') => isDev 
  ? `${folder}[name].${ext}` 
  : `${folder}[name].[contenthash:5].${ext}`;

const PATHS = {
  src: path.join(__dirname, "./src"),
  dist: path.join(__dirname, "./dist"),
};

const PAGES_DIR = `${PATHS.src}/pages`;
const PAGES = fs.existsSync(PAGES_DIR) 
  ? fs.readdirSync(PAGES_DIR).filter(page => {
      const pagePath = path.join(PAGES_DIR, page);
      return fs.statSync(pagePath).isDirectory();
    })
  : [];

const entryPoints = {};
if (PAGES.length > 0) {
  PAGES.forEach(page => {
    entryPoints[page] = `./pages/${page}/${page}.ts`;
  });
} else {
  entryPoints.index = {
    dependOn: 'slider',
    import: './demo/index.ts',
  };
  entryPoints.slider = './slider/slider.ts';
}

const plugins = () => {
  const base = [
    new CleanWebpackPlugin(),
    
    new CopyPlugin({
      patterns: [
        {
          from: `${PATHS.src}/demo/img`,
          to: `${PATHS.dist}/img`,
        },
        {
          from: `${PATHS.src}/demo/fonts`,
          to: `${PATHS.dist}/fonts`,
        },
      ],
      options: {
        concurrency: 100,
      },
    }),

    new MiniCssExtractPlugin({
      filename: filename("css", "css/"),
    }),
  ];

  if (PAGES.length > 0) {
    PAGES.forEach(page => {
      base.push(new HTMLWebpackPlugin({
        template: `./pages/${page}/${page}.pug`,
        filename: `./${page}.html`,
        chunks: [`${page}`],
      }));
    });
  } else {
    base.push(new HTMLWebpackPlugin({
      template: `./demo/index.pug`,
      filename: `index.html`,
    }));
  }

  if (isDev) {
    base.push(
      new webpack.HotModuleReplacementPlugin(),
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'windows.jQuery': 'jquery',
      })
    );
  }

  return base;
};

const minimizer = () => {
  if (isProd) {
    return [new TerserPlugin(), new CssMinimizerPlugin()];
  }
  return [];
};

module.exports = {
  stats: {
    errorDetails: true,
    children: true,
  },

  context: PATHS.src,
  mode: isProd ? "production" : "development",
  target: isDev ? 'web' : 'browserslist',
  
  entry: entryPoints,

  output: {
    filename: filename("js", "js/"),
    path: PATHS.dist,
    publicPath: "",
    assetModuleFilename: "assets/[hash][ext][query]",
    clean: true,
  },

  performance: {
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },

  devtool: isDev ? 'inline-source-map' : false,
  
  devServer: {
    static: {
      directory: PATHS.dist,
    },
    port: isDev ? 5000 : 8008,
    hot: true,
    open: true
  },

  optimization: {
    minimize: isProd,
    minimizer: minimizer(),
    splitChunks: {
      chunks: "all"
    },
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@fonts': path.resolve(__dirname, 'src/assets/fonts'),
      '@': path.resolve(__dirname, 'src'),
    },
  },

  plugins: plugins(),

  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          isDev ? "style-loader" : {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: "../",
            },
          },
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  [
                    "postcss-preset-env",
                    {
                      
                    },
                  ],
                ],
              },
            },
          },
          "sass-loader",
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
        generator: {
          filename: 'img/[name][contenthash][ext]'
        }
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][contenthash:5][ext]'
        }
      },
      {
        test: /\.(js|jsx|tsx|ts)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              "@babel/preset-env",
              "@babel/preset-typescript",
              "@babel/preset-react"
            ],
            plugins: [
              '@babel/plugin-transform-class-properties'
            ],
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.pug$/,
        use: [
          {
            loader: 'pug-loader',
            options: {
              pretty: true,
              self: true,
              doctype: 'html',
              compileDebug: true,
            }
          }
        ]
      }
    ],
  },
};