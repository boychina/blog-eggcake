#!/bin/bash
 
# 找到项目目录
cd /usr/local/src/blog-eggcake

# 更新&合并master分支代码
git pull origin master

# 执行打包命令
yarn build

# 重启pm2blog服务
pm2 reload blog3000
