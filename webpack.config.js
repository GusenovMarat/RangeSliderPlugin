const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const fs = require('fs');

const isDev = process.env.NODE_ENV === "development"
const isProd = !isDev

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

if (mode = isProd) {
  mode = "production"
} else if (mode = isDev) {
  mode = "development"
}
console.log(mode + " mode")

let entryName = {};

function entryPoints(page) {
  entryName[page] = `./pages/${page}`;
}

const PATHS = {
  src: path.join(__dirname, "./src"),
  dist: path.join(__dirname, "./dist"),
  assets: 'assets/'
}

const PAGES_DIR = `${PATHS.src}/pages/.`
const PAGES = fs
  .readdirSync(PAGES_DIR);

const plugins = () => {
  const base = [
    new CopyPlugin({
      patterns: [
        {
          from: `${PATHS.src}/${PATHS.assets}img`,
          to: `${PATHS.dist}/${PATHS.assets}img`,
        },
        {
          from: `${PATHS.src}/${PATHS.assets}fonts`,
          to: `${PATHS.dist}/${PATHS.assets}fonts`,
        },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: filename("css"),
    }),
    ...PAGES.map((page) => {
      entryPoints(page);
      return new HTMLWebpackPlugin({
        template: `./pages/${page}/${page}.pug`,
        filename: `./${page}.html`,
        chunks: [`${page}`],
      });
    }),
  ];
  return base;
};

module.exports = {
  context: PATHS.src,
  mode: mode,
  entry: entryName,
  output: {
    filename: filename("js"),
    path: PATHS.dist,
    assetModuleFilename: "assets/[hash][ext][query]",
		clean: true,
  },
	performance: {
		maxEntrypointSize: 512000,
		maxAssetSize: 512000
	},
	devtool: isDev ? 'inline-source-map' : false,
  devServer: isDev ? {
		port: 5000,
		open: true
  } : undefined,
  optimization: {
    splitChunks: {
      chunks: "all"
    },
  },
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@fonts': path.resolve(__dirname, 'src/assets/fonts'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: plugins(),
  module: {
    rules:
      [
        {
          test: /\.html$/i,
          loader: "html-loader",
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            (isDev) ? "style-loader" : MiniCssExtractPlugin.loader,
            "css-loader",
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: [
                    [
                      "postcss-preset-env",
                      {
                        // Options
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
          test: /\.(png|svg|jpg|jpeg|gif)$/,
          type: "asset/resource",
        },
        {
          test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/i,
          type: 'asset/resource',
        },
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
              plugins: ['@babel/plugin-proposal-class-properties'],
            },
          },
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
}