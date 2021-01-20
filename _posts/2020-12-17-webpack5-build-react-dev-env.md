---
title: "Webpack5搭建React开发环境"
excerpt: "平常业务开发过程中习惯使用脚手架来搭建开发环境，create-react-app、vue-cli等等，各个框架都提供了快速上手的脚手架..."
description: "Webpack5搭建React开发环境"
keyword: "webpack,webpack5,react"
tag: "webpack,react"
date: "2020-12-17T18:00:00.322Z"
coverImage: "/assets/blog/cover/2020-12-17-webpack5-build-react-dev-env.jpg"
author:
  name: 淡烘糕
  picture: "/assets/blog/authors/zhaohuan.jpg"
ogImage:
  url: "/assets/blog/cover/2020-12-17-webpack5-build-react-dev-env.jpg"
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
const HtmlWebpackPlugin = 

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
