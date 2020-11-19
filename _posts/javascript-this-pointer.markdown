---
layout: post
title: "JavaScript this 对象查找"
subtitle: "JavaScript this pointer"
date: 2019-09-22
author: "Mr.厉害"
header-img: "img/post-bg/2018-08-11-05.jpg"
header-mask: 0.3
catalog: true
tags:
  - JavaScript
  - this
---

this的查找是很多人迷茫的一点，也似乎有很多人抱有this不稳定这样的看法，实在令人无语。this的查找可以说是3种对象查找中最为简单的，因为其实this对象的确定根本没有一个“查找”的过程。首先，this对象只会在一个函数中需要确定，如果是在全局域下，this永远为Global对象，在浏览器中通常就是window对象。

而在javascript中，函数的调用一共有4种方式：

#### 1、Function Invocation Pattern

诸如`foo()`的调用形式被称为Function Invocation Pattern，是函数最直接的使用形式，注意这里的foo是作为单独的变量出现，而不是属性。在这种模式下，foo函数体中的this永远为Global对象，在浏览器中就是window对象。

#### 2、Method Invocation Pattern

诸如`foo.bar()`的调用形式被称为Method Invocation Pattern，注意其特点是被调用的函数作为一个对象的属性出现，必然会有“.”或者“[]”这样的关键符号。在这种模式下，bar函数体中的this永远为“.”或“[”前的那个对象，如上例中就一定是foo对象。

#### 3、Constructor Pattern

`new foo()`这种形式的调用被称为Constructor Pattern，其关键字`new`就很能说明问题，非常容易识别。在这种模式下，foo函数内部的this永远是new foo()返回的对象。

#### 4、Apply Pattern

`foo.call(thisObject)`和`foo.apply(thisObject)`的形式被称为Apply Pattern，使用了内置的`call`和`apply`函数。在这种模式下，`call`和`apply`的第一个参数就是foo函数体内的this，如果thisObject是`null`或`undefined`，那么会变成Global对象。

应用以上4种方式，确定一个函数是使用什么样的Pattern进行调用的，就能很容易确定this是什么。另外，this是永远不会延作用域链或原型链出现一个“查找”的过程的，只会在函数调用时就完全确认。

##### 注意：

###### (1) this永远不会沿用作用域链或原型链出现一个查找过程，在函数调用时就完全确认
```js
class Foo {
  print = () => {
    console.log(this.x);
  }

  constructor() {
    this.x = 1;
  }
}

let foo = new Foo();
foo.print.call({x: 2}); // 1
```
这里可以看到print函数调用是Method Invocation Pattern，所以先确定了this的指向为foo中的this，再调用call并没有修改掉覆盖this。

###### (2) 箭头函数是唯一一个this不由调用决定的场景

箭头函数在设计中使用的是Lexical this，即这个函数被创建时的this就是函数内部的this。

需要注意的是，这个函数创建时并不是一个读代码的人肉眼能看到这个函数的时候，很多人有这样的误解，比如这样的代码：

```js
function printThis() {
  let print = () => console.log(this);
  
  print();
}

printThis.call([1]); // [1]
printThis.call([2]); // [2]
```

有些人会理解都一样，输出的是Window，因为看到print函数的时候是顶级作用域。但其实print函数是在printThis被调用的时候才会被创建的，而printThis的this由外部的call决定着，所以输出自然是[1]和[2]。