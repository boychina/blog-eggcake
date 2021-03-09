---
title: "JavaScript this 对象查找"
excerpt: "this 的查找是很多人迷茫的一点，也似乎有很多人抱有 this 不稳定这样的看法，实在令人无语。"
description: "JavaScript this 对象查找"
keyword: "JavaScript,this,对象"
tag: "JavaScript"
date: "2019-09-22 12:00:00"
coverImage: "http://assets.eggcake.cn/cover/2019-09-22-javascript-this-pointer.jpg"
author:
  name: 蛋烘糕
  picture: "/assets/blog/authors/zhaohuan.jpg"
ogImage:
  url: "http://assets.eggcake.cn/cover/2019-09-22-javascript-this-pointer.jpg"
---

this 的查找是很多人迷茫的一点，也似乎有很多人抱有 this 不稳定这样的看法，实在令人无语。this 的查找可以说是 3 种对象查找中最为简单的，因为其实 this 对象的确定根本没有一个“查找”的过程。首先，this 对象只会在一个函数中需要确定，如果是在全局域下，this 永远为 Global 对象，在浏览器中通常就是 window 对象。

而在 javascript 中，函数的调用一共有 4 种方式：

#### 1、Function Invocation Pattern

诸如`foo()`的调用形式被称为 Function Invocation Pattern，是函数最直接的使用形式，注意这里的 foo 是作为单独的变量出现，而不是属性。在这种模式下，foo 函数体中的 this 永远为 Global 对象，在浏览器中就是 window 对象。

#### 2、Method Invocation Pattern

诸如`foo.bar()`的调用形式被称为 Method Invocation Pattern，注意其特点是被调用的函数作为一个对象的属性出现，必然会有“.”或者“[]”这样的关键符号。在这种模式下，bar 函数体中的 this 永远为“.”或“[”前的那个对象，如上例中就一定是 foo 对象。

#### 3、Constructor Pattern

`new foo()`这种形式的调用被称为 Constructor Pattern，其关键字`new`就很能说明问题，非常容易识别。在这种模式下，foo 函数内部的 this 永远是 new foo()返回的对象。

#### 4、Apply Pattern

`foo.call(thisObject)`和`foo.apply(thisObject)`的形式被称为 Apply Pattern，使用了内置的`call`和`apply`函数。在这种模式下，`call`和`apply`的第一个参数就是 foo 函数体内的 this，如果 thisObject 是`null`或`undefined`，那么会变成 Global 对象。

应用以上 4 种方式，确定一个函数是使用什么样的 Pattern 进行调用的，就能很容易确定 this 是什么。另外，this 是永远不会延作用域链或原型链出现一个“查找”的过程的，只会在函数调用时就完全确认。

##### 注意：

###### (1) this 永远不会沿用作用域链或原型链出现一个查找过程，在函数调用时就完全确认

```js
class Foo {
  print = () => {
    console.log(this.x);
  };

  constructor() {
    this.x = 1;
  }
}

let foo = new Foo();
foo.print.call({ x: 2 }); // 1
```

这里可以看到 print 函数调用是 Method Invocation Pattern，所以先确定了 this 的指向为 foo 中的 this，再调用 call 并没有修改掉覆盖 this。

###### (2) 箭头函数是唯一一个 this 不由调用决定的场景

箭头函数在设计中使用的是 Lexical this，即这个函数被创建时的 this 就是函数内部的 this。

需要注意的是，这个函数创建时并不是一个读代码的人肉眼能看到这个函数的时候，很多人有这样的误解，比如这样的代码：

```js
function printThis() {
  let print = () => console.log(this);

  print();
}

printThis.call([1]); // [1]
printThis.call([2]); // [2]
```

有些人会理解都一样，输出的是 Window，因为看到 print 函数的时候是顶级作用域。但其实 print 函数是在 printThis 被调用的时候才会被创建的，而 printThis 的 this 由外部的 call 决定着，所以输出自然是[1]和[2]。
