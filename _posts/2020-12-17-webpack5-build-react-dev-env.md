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

## 1. 当前主要依赖包版本
```
webpack@
webpack-cli@
webpack-dev-server@
react@
babel-core@
babel-preset-env@
baele-preset-react@
```

## 2. webpack安装和配置

### 2.1 起步
新建项目目录，初始化npm环境
```shell
mkdir react-project && cd react-project
yarn init -y
```
### 2.2 安装webpack
* webpack: 模块打包库
* webpack-cli: webpack命令行工具
```shell
yarn add webpack webpack-cli -D
```

## 3. Webpack基础配置
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

