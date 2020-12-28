#!/bin/bash

# 找到项目目录
cd /usr/local/src/blog-eggcake

# 更新&合并master分支代码
git pull origin master

# 下载node_mudules依赖包
yarn

# 执行打包命令
yarn build

# 重启pm2blog服务
pm2 reload blog3000

# 删除node_modules依赖包
rm -rf ./node_modules
