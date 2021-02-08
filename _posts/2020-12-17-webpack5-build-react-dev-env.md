---
title: "Webpack5搭建React开发环境"
excerpt: "平常业务开发过程中习惯使用脚手架来搭建开发环境，create-react-app、vue-cli等等，各个框架都提供了快速上手的脚手架..."
description: "Webpack5搭建React开发环境"
keyword: "webpack,webpack5,react"
tag: "webpack,react"
date: "2020-12-17 18:00:00"
coverImage: "http://assets.eggcake.cn/cover/2020-12-17-webpack5-build-react-dev-env.jpg"
author:
  name: 淡烘糕
  picture: "/assets/blog/authors/zhaohuan.jpg"
ogImage:
  url: "http://assets.eggcake.cn/cover/2020-12-17-webpack5-build-react-dev-env.jpg"
---

> 平常业务开发过程中习惯使用脚手架来搭建开发环境，create-react-app、vue-cli等等，各个框架都提供了快速上手的脚手架。这样保证了快速开发的效率，不过阻碍了我们熟悉了解webpack、rollup这类构建工具的生态和原理。

## 1 当前主要依赖包版本
```
webpack@5.16.0
webpack-cli@4.4.0
webpack-dev-server@
react@
babel-core@
babel-preset-env@
baele-preset-react@
```

## 2 webpack安装和配置

### 2.1 起步
新建项目目录，初始化npm环境，创建项目代码目录
```shell
mkdir react-project && cd react-project
yarn init -y
mkdir src
```
### 2.2 安装webpack
* webpack: 模块打包库
* webpack-cli: webpack命令行工具
```shell
yarn add webpack webpack-cli -D
```

## 3 Webpack基础配置
在项目根目录下创建一个webpack.config.js

### 3.1 Entry
配置入口文件，webpack会首先从入口文件开始编译代码
```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  entry: {
    app: './src/index.js'
  },
}
```
此时在src目录下创建一个index.js文件
```javascript
// index.js
const a = 123;

console.log(a);
```

### 3.2 Output
定义打包后文件输出位置和文件名。[name]是一个占位符，这里是根据entry中定义的key值，即'app'。
```javascript
// webpack.config.js
module.exports = {
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].bundle.js',
  },
}
```
现在可以使用最小化的配置完成打包了。在package.json中添加如下代码：
```json

"scripts": {
  "build": "webpack"
}
```

运行命令
```shell
yarn build
```

可以在命令行中看到打包运行，并且在项目目录下生成了一个dist文件夹，并且生成一个app.bundle.js文件，说明打包成功。
打开app.bundle.js文件，可以看到内容为：
```javascript
// app.bundle.js
console.log(123);
```

## 4 Plugin
插件让webpack具备可扩展性，可以让webpack运行过程中支持更多的功能。

### 4.1 模板文件
构建一个web应用，需要一个html入口文件，然后html引入对应的js和css文件。并且往往配置打包出来的bundle文件名称为了防止缓存问题是带有hash值的，如果每次手动修改会比较麻烦，所以最好的方法是自动将bundle文件打包到html中。
此时我们用到 html-webpack-plugin 这个插件，这个插件的作用是从模板生成一个html文件。
1. 安装
```shell
yarn add html-webpack-plugin -D
```
2. 创建index.html
在项目根目录下创建一个 public/index.html 文件，内容如下：
   
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= htmlWebpackPlugin.options.title %></title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```
其中title是读取html-webpack-plugin插件的配置，具体配置如下：
```javascript
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  /*...*/
  plugins: [
    new HtmlWebpackPlugin({
      title: '淡烘糕的学习笔记',
      template: path.resolve(__dirname, './public/index.html'),
      filename: 'index.html',
    }),
  ],
};
```
现在再次运行`yarn build`，就可以看到dist目录下面多出了一个index.html文件，并且其中自动插入了标题和js代码引用。
```html
<!doctype html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>淡烘糕的学习笔记</title>
</head>

<body>
  <script src="app.bundle.js"></script>
</body>

</html>
```

### 4.2 打包前清除dist

clean-webpack-plugin 打包前移除、清理打包目录

1. 安装
```shell
yarn  add yarn add clean-webpack-plugin -D
```

2. 配置
```javascript
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  /* ... */
  
  plugins: [
    /* ... */
    new CleanWebpackPlugin(),
  ]
}
```

### 4.3 命令行友好提示插件

1. 安装
```shell
yarn add friendly-errors-webpack-plugin -D
```

2. 配置
```javascript
// webpack.config.js
const friendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
 
module.exports = {
 plugins: [
  new friendlyErrorsWebpackPlugin(),
 ]
}
```

## 5 Loaders

webpack使用 loaders 去解析模块，想要 webpack 如何理解 JavaScript、静态资源（图片、字体、CSS）、转义TypeScrip和Babel，都需要配置响应的loader规则。

在项目中只有一个 HTML 和一些 JavaScript 是不能完成整个项目的，我们需要 webpack 能够帮我们完成更多的事：

* 将最新的 JavaScript 特性编译成浏览器能理解的代码；
* 模块化 CSS，将 SCSS、LESS、CSSNext编译成 CSS；
* 导入图片、字体等静态资源
* 识别自己喜欢的框架代码，如 React

### 5.1 Babel

Babel 是一个 JavaScript 编译器，能将 ES6+ 代码转为 ES5 代发，让我们使用最新的语言特性而不用担心兼容性问题，并且可以通过插件机制根据需求灵活扩展。

1. 安装依赖
```shell
yarn add babel-loader @babel/core @babel/preset-env -D
```
* babel-loader 使用 Babel 和 Webpack 转义文件
* @balel/core 转译 ES2015+ 的代码
* @babel/preset-env Babel环境预设配置

2. 配置
```JavaScript
// webpack.config.js
module.exports = {
 /* ... */
 
 module: {
  rules: [
   // JavaScript
   {
    test: /\.m?js$/,
    exclude: /node_modules/,
    use: {
     loader: 'babel-loader',
     options: {
      presets: ['@babel/preset-env'],
     },
    },
   },
  ],
 },
}
```
在 Babel 执行编译的过程中，会从项目根目录下的配置文件读取配置。在根目录下创建 Babel 的配置文件 .babelrc 

```JSON
{
  "presets": ["@babel/preset-env"]
}
```

### 5.2 图片和字体解析

1. 解析图片的loader配置
```JavaScript
module.exports = {
 /* ... */
 module: {
  rules: [
   // Images
   {
    test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
    type: 'asset/resource',
   },
  ],
 },
}
```

2. 解析字体文件的loader配置
```JS
module.exports = {
 /* ... */
 module: {
  rules: [
   // Fonts and SVGs
   {
    test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
    type: 'asset/inline',
   },
  ],
 },
}
```

### 5.3 样式

我们希望能够在 JavaScript 中导入 CSS，以及将 CSS 注入 DOM，另外还想使用 CSS 的高级特性，比如 cssnext，需要依赖一下库：

* css-loader 解析 CSS 导入
* style-loader 将 CSS 注入DOM
* postcss PostCSS 是一个允许使用 JS 插件转换样式的工具。 这些插件可以检查（lint）你的 CSS，支持 CSS Variables 和 Mixins， 编译尚未被浏览器广泛支持的先进的 CSS 语法，内联图片，以及其它很多优秀的功能。
* postcss-loader 用 PostCSS 处理 CSS
  * postcss-preset-env PostCSS 的默认配置
* postcss-next - PostCSS的插件，可以使用CSS最新的语法

1. 安装
```shell
yarn add css-loader style-loader postcss-loader postcss-preset-env postcss postcss-cssnext -D
```
2. 配置
```JS
// webpack.config.js
 
module.exports = {
 /* ... */
 module: {
  rules: [
   // CSS, PostCSS, and Sass
   {
    test: /\.(scss|css)$/,
    use: ['style-loader', {
      loader: 'css-loader',
      options: {
       importLoaders: 1,
      },
     }, 'postcss-loader'],
   },
  ],
 },
}
```

3. postcss 配置
在项目根目录下新建 postcss.config.js 文件，内容如下：
   
```JS
module.exports = {
  plugins: {
    'postcss-preset-env': {
      browsers: 'last 2 versions',
    },
  },
}
```

## 6 搭建开发环境

现在我们来搭建开发模式的配置：
```JS
// webpack.config.js
 
module.exports = {
 mode: 'development',
 // ...
}
```

### 6.1 使用 source maps
为了在报错的时候更好地追踪报错的代码位置，并且给出错误代码出现的地方提示，我们可以使用 source map，具体配置如下：

```JS
// webpack.config.js
 
module.exports = {
 devtool: 'inline-source-map'
 // ...
}
```

### 6.2 热模块替换 HMR（Hot Module Replacement）
当我们代码改动的时候，我们希望能够重新编译，webpack 提供了三种不同的方式实现：
* 监听模式
* webpack-dev-server
* webpack-dev-middleware

大多数情况下，使用的是webpack-dev-server，当前我们也是用这个工具。顺带介绍一下其他两种方式。

#### 6.2.1 监听模式
```JS
// package.json
{
 "watch": "webpack --watch"
}
```

执行以下命令
```shell
yarn run watch
```

现在当我们保存代码的时候会自动编译代码，刷新浏览器后即可看到效果；但是我们想要自动刷新浏览器怎么办，这时候就需要用到 webpack-dev-server。

#### 6.2.2 webpack-dev-server

它为我们提供了一个服务器和 live reloading 的能力。

```shell
yarn add webpack-dev-server -D
```

然后配置如下：

```JS
// webpack.config.js
module.exports = {
 // ...
 devServer: {
  historyApiFallback: true,
  contentBase: path.join(__dirname, './dist'),
  open: false,
  hot: true,
  quiet: true,
  port: 8080,
 },
}
```
```json
// package.json
{
 "scripts": {
  "start": "webpack serve"
 }
}
```
我们再8080端口监听了一个服务，监听的目录是dist，并且支持热重载，现在打开 http://localhost:8080，可以看到我们的页面，然后改动代码，浏览器会自动刷新到最新的效果。

#### 6.2.3 webpack-dev-middleware

这是一个 webpack 的中间件，可以让 webpack 把文件交给一个服务器处理，比如我们可以使用 nodejs 的服务器 express，这个了我们更多对于运行的服务器的控制权。

1. 安装express和webpack-dev-middleware
```shell
yarn add express webpack-dev-middleware -D
```
更改配置 
```JS
module.exports = {
 //...
 output: {
  //...
  publicPath: '/'
 }
}
```
publicPath 可以定义 express 监听服务的路径，接下来就创建我们的 express 服务器

新建一个 server.js

```JS
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
 
const app = express();
const config = require('./webpack.config.js');
const compiler = webpack(config);
 
// Tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
app.use(
 webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
 })
);
 
// Serve the files on port 3000.
app.listen(3000, function () {
 console.log('Example app listening on port 3000!\n');
});
```

监听端口为3000，执行以下命令启动服务
```shell
node server.js
```
方便起见，可以将该命令加入package.json
```json
{
  //...
  "scripts": {
    "server": "node server.js"
  }
}
```

## 7 使用TypeScript

现在前端不会使用 TypeScript 貌似已经没有竞争力了。🤦‍

安装依赖
```shell
yarn add typescript ts-loader -D
```
在根目录下创建typescript的配置文件 tsconfig.json，具体配置如下:

```json
{
 "compilerOptions": {
  "outDir": "./dist/",
  // "rootDir": "./src",
  "sourceMap": true, // 开启sourcemap
  "module": "commonjs",
  "target": "es5",
  "jsx": "react",
  "esModuleInterop": true,
  "allowJs": true,
  "strict": true
 }
}
```
添加对应代码解析loader

```JS
// webpack.config.js
module.exports = {
 //...
 module: {
  rules: [
    {
    test: /\.tsx?$/,
    use: 'ts-loader',
    exclude: /node_modules/,
   },
  ]
 }
}
```

## 8 配置 React

在上面配置typescript配置中中，已经开启了支持react，现在只需安装react的依赖即可

```shell
yarn add react react-dom @types/react @types/react-dom
```

将入口 index.js 文件名称改为 index.tsx，内容如下：

```JS
import React from 'react';
import ReactDOM from 'react-dom';
 
import './index.css';
 
const App = () => {
 return <div>hello world2</div>;
};
 
ReactDOM.render(<App />, document.getElementById('root'));
```

## 9 代码规范

一个中大型项目肯定涉及到团队协作，规范的代码能够大幅提高团队合作的效率。我们需要在一开始搭建项目的时候就需要对于代码规范进行约定，这里我们需要用到两个工具。

### 9.1 Prettier

Prettier 是一个诞生于2016年就迅速流行起来的专注于代码格式化的工具。

Prettier只关注格式化，并不具有lint检查语法等能力。它通过解析代码并匹配自己的一套规则，来强制执行一致的代码展示格式。

它在美化代码方面有很大的优势，配合ESLint可以对ESLint格式化基础上做一个很好的补充。

1. 使用 
   以VSCode为例，安装Prettier插件即可使用，如果想自定义配置，可以cmd+,快捷键进入vscode配置，搜索Prettier找到对应的配置项进行配置。
   
### 9.2 ESlint

ELint 是一个在 JavaScript 代码中通过规则模式匹配作代码识别和报告的插件化的检测工具，它的目的是保证代码规范的一致性和及时发现代码问题、提前避免错误发生。

ESLint 的关注点是代码质量，检查代码风格并且会提示不符合风格规范的代码。除此之外 ESLint 也具有一部分代码格式化的功能。

安装依赖，方便起见，直接使用已有的ESlint配置，这里使用的是fabric

```shell
yarn add @umijs/fabric -D
```
在项目根目录下创建 .eslintrc.js，配置如下

```js
module.exports = {
 extends: [require.resolve('@umijs/fabric/dist/eslint')],
 globals: {},
 plugins: ['react-hooks'],
 rules: {
  'no-restricted-syntax': 0,
  'no-param-reassign': 0,
  'no-unused-expressions': 0,
 },
};
```

重新启动编辑器，即可看到 ESLint 已经可以检查代码的准确性了。

## 10 总结

到目前为止，我们已经搭建了一个简单的 react 脚手架，并且支持 TypeScript、CSSnext、HMR 等特性，对于一个小项目已经足够用了。后期对于用到的其他内容可以自己扩展上去。
