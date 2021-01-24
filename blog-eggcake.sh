#!/bin/bash

# 找到项目目录
cd /usr/local/src/blog-eggcake

# 更新&合并master分支代码
git pull origin master

# 更新node_mudules依赖包
cnpm install

# 执行打包命令
cnpm run build

# 生成site.txt
cnpm run site

# 重启pm2blog服务
pm2 reload blog3000

# 导出静态资源
cnpm run export

# 切到boychina.github.io目录
cd /usr/local/src/boychina.github.io

# 删除docs目录
rm -rf ./docs

# 复制blog-eggcake导出的docs文件到boychina.github.io目录下
cp /usr/local/src/blog-eggcake/docs /usr/local/src/boychina.github.io/docs

# 提交docs到gh-pages分支
git add .
git commit -m "feat: modified docs"
git push origin gh-pages
