---
layout:     post
title:      "ES6 的 Proxy 和 Reflect"
subtitle:   "Proxy and Reflect of ES6"
date:       2018-08-04
author:     "Mr.厉害"
header-img: "img/post-bg/2018-08-08-01.jpg"
header-mask: 0.3
catalog:    true
tags:
  - ES6
  - Proxy
  - Reflect
---

### Proxy

Proxy 用于修改某些操作的默认行为，等同于在语言层面做出修改，所以属于一种“元编程”（meta programming），即对编程语言进行编程。

Proxy 可以理解成，在目标对象之间架设一层“拦截”，外界对该对象的访问，都必须先通过这层拦截，因此提供一种机制，可以对外界的访问进行过滤和改写。 Proxy 这个词的原意就是代理，用在这里表示由它来“代理”某些操作，可以译为“代理器”。

```js
let obj = new Proxy({}, {
  get: (target, key, receiver) => {
    console.log(`getting ${key}!`);
    return Reflect.get(target, key, receiver);
  },
  set: (target, key, value, receiver) => {
    console.log(`getting ${key}!`);
    return Reflect.set(target, key, value, receiver);
  }
});
```

上面代码对一个空对象架设一层拦截，重定义了属性的读取（get）和设置（set）行为。这里展示先不解释具体的语法，只看运行结果。

```js
obj.count = 1;
// setting count!
++obj.count
// getting count!
// setting count!
// 2
```
ES6 原生提供 Proxy 构造函数，用来生成 Proxy 实例。

```js
let proxy = new Proxy(target, handler);
```

Proxy 对象的所有用法，都是上面这种形式，不同的只是 handler 参数的写法。其中，nex Proxy() 表示生成一个 Proxy 实例，target 参数表示所要拦截的目标对象，handler 参数也是一个对象，用来控制拦截行为。

```js
let proxy = new Proxy({}, {
  get: (target, property) => {
    return 35;
  }
});

proxy.time // 35
proxy.name // 35
proxy.title // 35
```

### Reflect

1. 将 Object 对象的一些明显属于语言内容的方法（比如 Object.defineProperty），放到 Relect 对象上。现阶段，某些方法同时在 Object 和 Reflect 对象上部署，未来的新方法只部署在 Reflect 对象上。也就是说，从 Reflect 对象上可以拿到语言内部的方法。
2. 修改某些 Object 方法的返回结果，让其变得更合理。比如，Object.defineProperty(obj, name, desc) 在无法定义属性时，会抛出一个错误，而 Reflect.defineProperty(obj, name, desc) 则会返回 false。
3. 让 Object 操作都变成函数行为。某些 Object 操作是命令式，比如 name in obj 和 delete obj[name]，而 Reflect.has(obj, name) 和 Reflect.deleteProperty(obj, name) 让它们编程函数行为。
4. Reflect 对象的方法与 Proxy 对象的方法一一对应，只要是 Proxy 对象的方法，就能在 Reflect 对象上找到对应的方法。这就让 Proxy 对象可以方便地调用对应的 Reflect 方法，完成默认行为，作为修改行为的基础。也就是说，不管 Proxy 怎么修改默认行为，你总可以在 Reflect 上获取默认行为。

```js
Proxy(target, {
  set: (target, name, value, receiver) => {
    let success = Reflect.set(target, name, value, receiver);
    if(success) {
      log('property ' + name + ' on ' + target + ' set to ' + value);
    }
    return success;
  }
})
```
上面代码中，Proxy 方法拦截 target 对象的属性赋值行为。它采用 Reflect.set 方法将值赋值给对象的属性，确保完成原有的行为，然后再部署额外的功能。
