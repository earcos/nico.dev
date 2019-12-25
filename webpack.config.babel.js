import path from 'path';
import app from './app.json';

require('dotenv').config();

import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import HtmlInlineSourcePlugin from 'html-webpack-inline-source-plugin';
import HtmlWebpackExcludeAssetsPlugin from 'html-webpack-exclude-assets-plugin';
import FaviconsWebpackPlugin from 'favicons-webpack-plugin';
import LiveReloadPlugin from 'webpack-livereload-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import WebpackPwaManifest from 'webpack-pwa-manifest';
import { GenerateSW } from 'workbox-webpack-plugin';
import RobotstxtPlugin from 'robotstxt-webpack-plugin';
import SitemapPlugin from 'sitemap-webpack-plugin';

module.exports = (env, argv) => {
  const dirDist = path.resolve(__dirname, 'dist');
  const dirSrc = path.resolve(__dirname, 'src');
  const dev = argv.mode !== 'production';

  return {
    entry: [`${dirSrc}/styles/app.scss`, `${dirSrc}/scripts/main.js`],
    output: {
      path: dirDist,
      filename: 'assets/app-[hash].js',
      publicPath: '/',
    },
    devtool: dev ? `cheap-module-eval-source-map` : undefined,
    plugins: [
      new CleanWebpackPlugin({
        cleanStaleWebpackAssets: false,
      }),
      new MiniCssExtractPlugin({
        filename: 'assets/app.css',
      }),
      new CopyWebpackPlugin([
        {
          from: 'src/.htaccess.example',
          to: './.htaccess',
          toType: 'file',
        },
        {
          from: 'src/img',
          to: 'assets/img',
        },
        {
          from: 'src/version.json',
          to: './version.json',
          toType: 'file',
        },
      ]),
      new HtmlWebpackPlugin({
        title: app.title,
        description: app.description,
        template: 'src/index.html',
        filename: './index.html',
        inlineSource: 'app.css',
        excludeAssets: ['app.css'],
        minify: {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          useShortDoctype: true,
        },
      }),
      new HtmlWebpackExcludeAssetsPlugin(),
      new HtmlInlineSourcePlugin(),
      new FaviconsWebpackPlugin({
        logo: './src/img/favicon.png',
        prefix: 'assets/icon/[hash]/',
        emitStats: true,
        statsFilename: 'assets/icon/iconstats-[hash].json',
        persistentCache: true,
        inject: true,
        background: app.colorbkg,
        title: app.title,
        icons: {
          android: true,
          appleIcon: true,
          appleStartup: true,
          coast: false,
          favicons: true,
          firefox: true,
          opengraph: false,
          twitter: true,
          yandex: false,
          windows: false,
        },
      }),
      new LiveReloadPlugin(),
      new MiniCssExtractPlugin({
        filename: 'assets/app.css',
      }),
      new WebpackPwaManifest({
        name: app.title,
        short_name: app.short,
        description: app.description,
        theme_color: app.color,
        background_color: app.colorbkg,
        display: 'standalone',
        crossorigin: 'use-credentials',
        icons: [
          {
            src: path.resolve('./src/img/favicon.png'),
            sizes: [96, 128, 192, 256, 384, 512],
            destination: path.join('assets', 'icon'),
            ios: true,
          },
        ],
      }),
      new GenerateSW({
        importWorkboxFrom: 'local',
        include: [/\.html$/, /\.js$/, /\.css$/],
        importsDirectory: 'wb-assets',
        exclude: [/inline\.css$/],
        runtimeCaching: [
          {
            urlPattern: new RegExp('^https://api.nico.dev/'),
            handler: 'networkFirst',
            options: {
              cacheName: 'api-rest-cache',
            },
          },
          {
            urlPattern: new RegExp(/\.(?:png|gif|jpg|svg|ico|webp)$/),
            handler: 'cacheFirst',
            options: {
              cacheName: 'image-cache',
            },
          },
          {
            urlPattern: new RegExp(/\.html$/),
            handler: 'networkFirst',
            options: {
              cacheName: 'index-cache',
            },
          },
        ],
        navigateFallback: 'index.html',
        skipWaiting: true,
      }),
      new RobotstxtPlugin({
        sitemap: 'https://nico.dev/sitemap.xml',
        host: 'https://nico.dev',
      }),
      new SitemapPlugin('https://nico.dev', app.pages),
    ],
    module: {
      rules: [
        {
          test: /\.svg$/,
          exclude: /node_modules/,
          loader: ['babel-loader', 'raw-loader'],
        },
        {
          test: /\.(js|jsx)$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.(png|jpg|gif)$/,
          loader: 'file-loader',
          options: {
            name: '[name].[ext]?[hash]',
          },
        },
        {
          test: /\.(s*)css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                plugins: () => [require('autoprefixer')],
              },
            },
            {
              loader: 'sass-loader',
            },
          ],
        },
      ],
    },
  };
};
