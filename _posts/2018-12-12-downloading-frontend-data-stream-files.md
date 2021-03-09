---
title: "前端数据流文件下载三种方式"
excerpt: "直接使用 get 请求方式进行下载,使用 form 表单 post 请求进行下载,axios（ajax）前端根据返回数据流生成文件下载"
description: "直接使用 get 请求方式进行下载,使用 form 表单 post 请求进行下载,axios（ajax）前端根据返回数据流生成文件下载"
keyword: "前端,数据流,下载,文件下载"
tag: "前端"
date: "2018-12-12 12:00:00"
coverImage: "http://assets.eggcake.cn/cover/2018-12-12-downloading-frontend-data-stream-files.jpg"
author:
  name: 蛋烘糕
  picture: "/assets/blog/authors/zhaohuan.jpg"
ogImage:
  url: "http://assets.eggcake.cn/cover/2018-12-12-downloading-frontend-data-stream-files.jpg"
---

#### 1、直接使用 get 请求方式进行下载：

```js
window.open(`${url}?${qs.stringify(param)}`, "_blank");
```

#### 2、使用 form 表单 post 请求进行下载：

```js
const postDownloadFile = (action, param) => {
  const form = document.createElement("form");
  form.action = action;
  form.method = "post";
  form.target = "blank";
  Object.keys(param).forEach((item) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = item;
    input.value = param[item];
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

postDownloadFile(url, param);
```

#### 3、axios（ajax）前端根据返回数据流生成文件下载：

```js
axios
  .post(url, param, {
    responseType: "blob",
  })
  .then((res) => {
    console.log("res", res);
    const blob = res.data;
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = (e) => {
      const a = document.createElement("a");
      a.download = `文件名称.zip`;
      // 后端设置的文件名称在res.headers的 "content-disposition": "form-data; name=\"attachment\"; filename=\"odps_ddl_20181211191944.zip\"",
      a.href = e.target.result;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
  })
  .catch((err) => {
    console.log(err.message);
  });
```
