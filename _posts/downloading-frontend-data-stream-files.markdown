---
layout: post
title: "前端数据流文件下载三种方式"
subtitle: "Three ways of downloading front-end data stream files"
date: 2018-12-12
author: "Mr.厉害"
header-img: "img/post-bg/2018-08-11-05.jpg"
header-mask: 0.3
catalog: true
tags:
  - Download
  - DataStream
---

#### 1、直接使用get请求方式进行下载：

```js
window.open(`${url}?${qs.stringify(param)}`, '_blank');
```

#### 2、使用form 表单post请求进行下载：

```js
const postDownloadFile = (action, param) => {
    const form = document.createElement('form');
    form.action = action;
    form.method = 'post';
    form.target = 'blank';
    Object.keys(param).forEach((item) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = item;
        input.value = param[item];
        form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}

postDownloadFile(url, param);
```

#### 3、axios（ajax）前端根据返回数据流生成文件下载：

```js
axios.post(url, param, {
  responseType: 'blob'
}).then((res) => {
  console.log('res', res);
  const blob = res.data;
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  reader.onload = (e) => {
    const a = document.createElement('a');
    a.download = `文件名称.zip`;
    // 后端设置的文件名称在res.headers的 "content-disposition": "form-data; name=\"attachment\"; filename=\"odps_ddl_20181211191944.zip\"",
    a.href = e.target.result;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
}).catch((err) => {
  console.log(err.message);
});
```
