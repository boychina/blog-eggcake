---
layout: post
title: "JavsScript 原型"
subtitle: "JavaScript Prototype"
date: 2019-10-24
author: "Mr.厉害"
header-img: "img/post-bg/2018-08-11-05.jpg"
header-mask: 0.3
catalog: true
tags:
  - JavaScript
  - Prototype
---

##### 前言
ES6带来了太多的语法糖，其中箭头函数掩盖了 this 的神妙，而 class 也掩盖了本文要长篇谈论的 原型。

通过本文可以学到：

1. 如何用 ES5 模拟类；
2. 理解 prototype 和 \__proto__；
3. 理解原型链和原型继承；
4. 更深入地了解 JavaScript 这门语言。

##### 引入：普通对象与函数对象

在 JavaScript 中，一直有这么一种说法，万物皆对象。事实上，在 JavaScript 中，对象也是有区别的，我们可以将其划分为 普通对象 和 函数对象。Object 和 Function 便是 JavaScript 自带的两个典型的 函数对象。而函数对象就是一个纯函数，所谓的 函数对象，其实就是使用 JavaScript 在 模拟类。

那么，究竟什么是普通对象，什么又是函数对象呢？请看下方的例子：

首先，我们分别创建了三个 Function 和 Object 的实例：

```js
function fn1() {}
const fn2 = function() {}
const fn3 = new Function('language', 'console.log(language)')

const ob1 = {}
const ob2 = new Object()
const ob3 = new fn1()
```

打印以下结果，可以得到：

```js
console.log(typeof Object); // function
console.log(typeof Function); // function
console.log(typeof ob1); // object
console.log(typeof ob2); // object
console.log(typeof ob3); // object
console.log(typeof fn1); // function
console.log(typeof fn2); // function
console.log(typeof fn3); // function
```

在上述的例子中，ob1、ob2、ob3 为普通对象（均为 Object 的实例），而 fn1、fn2、fn3 均是 Function 的实例，称之为 函数对象。

如何区分呢？其实记住这句话就行了：

* 所有Function的实例都是函数对象，而其他的都是普通对象

说到这里，细心的同学会发表一个疑问，一开始，我们已经提到，Object 和 Function 均是 函数对象，而这里我们又说：所有Function的实例都是函数对象，难道 Function 也是 Function 的实例？

先保留这个疑问。接下来，对这一节的内容做个总结：

![](/img/in-post/2019-10-24-JavaScript-prototype/v2-97bfacdf216ab34c22c8709aa86542d6_r.jpg)

从图中可以看出，对象本身的实现还是要依靠构造函数。那 原型链 到底是用来干嘛的呢？

众所周知，作为一门面向对象（Object Oriented）的语言，必定具有以下特征：

* 对象唯一性
* 抽象性
* 继承性
* 多态性

而原型链最大的目的, 就是为了实现继承。

##### 进阶：prototype 和 __proto__

原型链究竟是如何实现继承的呢？首先，我们要引入介绍两兄弟：prototype 和 \__proto__，这是在 JavaScript 中无处不在的两个变量（如果你经常调试的话），然而，这两个变量并不是在所有的对象上都存在，先看一张表：

对象类型 | prototype | \__proto__
-|-|-
普通对象(NO) | × | √ |
函数对象(FO) | √ | √ |

首先，我们先给出以下结论：

1. 只有 函数对象 具有 prototype 这个属性；
2. prototype 和 \__proto__ 都是 JavaScript 在定义一个函数或对象时自动创建的 预定义属性。

接下来，我们验证上述的两个结论：

```js
function fn() {}
console.log(typeof fn.__proto__); // function
console.log(typeof fn.prototype); // object

const ob = {}
console.log(typeof ob.__proto__); // object
console.log(typeof ob.prototype); // undefined，哇！果然普通对象没有 prototype
```

既然是语言层面的预置属性，那么两者究竟有何区别呢？我们依然从结论出发，给出以下两个结论：

1. prototype 被实例的 \__proto__ 所指向（被动）
2. \__proto__ 指向构造函数的 prototype（主动）

哇，也就是说以下代码成立：

```js
console.log(fn.__proto__ === Function.prototype); // true
console.log(ob.__proto__ === Object.prototype); // true
```

看起来很酷，结论瞬间被证明，感觉是不是很爽，那么问题来了：既然 fn 是一个函数对象，那么 fn.prototype.\__proto__ 到底等于什么？

这是我尝试去解决这个问题的过程：

首先用 typeof 得到 fn.prototype 的类型："object"
哇，既然是 "object"，那 fn.prototype 岂不是 Object 的实例？根据上述的结论，快速地写出验证代码：

```js
console.log(fn.prototype.__proto__ === Object.prototype) // true
```

接下来，如果要你快速地写出，在创建一个函数时，JavaScript对该函数原型的初始化代码，你是不是也能快速地写出：

```js
// 实际代码
function fn1() {}

// Javascript 自动执行
fn1.prototype = {
  constructor: fn1,
  __proto__: Object.prototype
}
fn1.__proto__ = Function.prototype
```

到这里，你是否有一丝恍然大悟的感觉？此外，因为普通对象就是通过 函数对象 实例化（new）得到的，而一个实例不可能再次进行实例化，也就不会让另一个对象的 __proto__ 指向它的 prototype， 因此本节一开始提到的 普通对象没有 prototype 属性 的这个结论似乎非常好理解了。从上述的分析，我们还可以看出，fn1.protptype 就是一个普通对象，它也不存在 protptype 属性。

再回顾一下上一节，我们还遗留一个疑问：

* 难道 Function 也是 Function 的实例？

是时候去掉应该让它成立了。那么此刻，just show me your code！

##### 重点：原型链

上一节我们详解了 prototype 和 __proto__，实际上，这两兄弟主要就是为了构造原型链而存在的。

先上一段代码：

```js
const Person = function(name, age) {
    this.name = name
    this.age = age
} /* 1 */

Person.prototype.getName = function() {
    return this.name
} /* 2 */

Person.prototype.getAge = function() {
    return this.age
} /* 3 */

const chl = new Person('chl', 24); /* 4 */

console.log(chl) /* 5 */
console.log(chl.getName(), chl.getAge()) /* 6 */
```

解释一下执行细节：

1. 执行 1，创建了一个构造函数 Person，要注意，前面已经提到，此时 Person.prototype 已经被自动创建，它包含 constructor 和 __proto__这两个属性；
2. 执行2，给对象 Person.prototype 增加了一个方法 getName()；
3. 执行3，给对象 Person.prototype 增加了一个方法 getAge()；
4. 执行4, 由构造函数 Person 创建了一个实例 ulivz，值得注意的是，一个构造函数在实例化时，一定会自动执行该构造函数。
5. 在浏览器得到 5 的输出，即 chl 应该是：

```js
{
     name: 'chl',
     age: 24
     __proto__: Object // 实际上就是 `Person.prototype`
}
```

结合上一节的经验，以下等式成立：

```js
console.log(chl.__proto__ == Person.prototype)  // true
```

6. 执行6的时候，由于在 chl 中找不到 getName() 和 getAge() 这两个方法，就会继续朝着原型链向上查找，也就是通过 \__proto__ 向上查找，于是，很快在 ulviz.\__proto__ 中，即 Person.prototype 中找到了这两个方法，于是停止查找并执行得到结果。

> 这便是 JavaScript 的原型继承。准确的说，JavaScript 的原型继承是通过 \__proto__ 并借助 prototype 来实现的。

于是，我们可以作如下总结：

1. 函数对象的 \__proto__ 指向 Function.prototype；（复习）
2. instance.\__proto__ 指向函数对象的 prototype ；（复习）
3. 普通对象的 \__proto__ 指向 Object.prototype；（复习）
4. 普通对象没有 prototype 属性；（复习）
5. 在访问一个对象的某个属性/方法时，若在当前对象上找不到，则会尝试访问 ob.\__proto__, 也就是访问该对象的构造函数的原型 obCtr.prototype，若仍找不到，会继续查找 obCtr.prototype.\__proto__，像依次查找下去。若在某一刻，找到了该属性，则会立刻返回值并停止对原型链的搜索，若找不到，则返回 undefined。

为了检验你对上述的理解，请分析下述两个问题：

> 1. 以下代码的输出结果是？

```js
console.log(chl.__proto__ === Function.prototype)
```
答案： false

> 2. Person.\__proto__ 和 Person.prototype.\__proto__ 分别指向何处？

答案：
Person.\__proto__ 指向它的构造函数Function的的原型： Function.prototype

```js
console.log(Person.__proto__ === Function.prototype)  // true
```

Person.prototype.\__proto__ Function.prototype 是一个普通对象，所以它的__proto__ 是Object.prototype

```js
console.log(Person.prototype.__proto__ === Object.prototype)  // true
```

为了验证 Person.\__proto__ 所在的原型链中没有 Object，以及 Person.prototype.\__proto__ 所在的原型链中没有 Function, 结合以下语句验证：

```js
console.log(Person.__proto__ === Object.prototype) // false
console.log(Person.prototype.__proto__ == Function.prototype) // false
```

##### 终极：原型链图

上一节，我们实际上还遗留了一个疑问：

* 原型链如果一个搜索下去，如果找不到，那何时停止呢？也就是说，原型链的尽头是哪里？

我们可以快速地利用以下代码验证：

```js
function Person() {}
const chl = new Person()
console.log(chl.name)
```
很显然，上述输出 undefined。下面简述查找过程：

```js
chl                // 是一个对象，可以继续 
chl['name']           // 不存在，继续查找 
chl.__proto__            // 是一个对象，可以继续
chl.__proto__['name']        // 不存在，继续查找
chl.__proto__.__proto__          // 是一个对象，可以继续
chl.__proto__.__proto__['name']     // 不存在, 继续查找
chl.__proto__.__proto__.__proto__       // null !!!! 停止查找，返回 undefined
```
> 哇，原来路的尽头是一场空

最后，再回过头来看看上一节的那演示代码：

```js
const Person = function(name, age) {
    this.name = name
    this.age = age
} /* 1 */

Person.prototype.getName = function() {
    return this.name
} /* 2 */

Person.prototype.getAge = function() {
    return this.age
} /* 3 */

const chl = new Person('chl', 24); /* 4 */

console.log(chl) /* 5 */
console.log(chl.getName(), chl.getAge()) /* 6 */
```

我们来画一个原型链图，或者说，将其整个原型链图画出来？请看下图：

![](/img/in-post/2019-10-24-JavaScript-prototype/v2-95c1267691d904d50a0ef009f8f887ae_r.jpg)

画完这张图，基本上所有之前的疑问都可以解答了。

与其说万物皆对象, 万物皆空似乎更形象。

##### 调料：constructor

前面已经有所提及，只有原型对象才具有 constructor 这个属性，constructor用来指向引用它的函数对象。

```js
Person.prototype.constructor === Person //true
console.log(Person.prototype.constructor.prototype.constructor === Person) //true
```
这是一种循环引用。当然你也可以在上一节的原型链图中画上去，这里就不赘述了。

##### 补充： JavaScript中的6大内置（函数）对象的原型继承

通过前文的论述，结合相应的代码验证，整理出以下原型链图：

![](/img/in-post/2019-10-24-JavaScript-prototype/v2-c4d424b90439092aacca97a634305bdd_r.jpg)

由此可见，我们更加强化了这两个观点：

1. 任何内置函数对象（类）本身的 \__proto__ 都指向 Function 的原型对象；
2. 除了 Oject 的原型对象的 \__proto__ 指向 null，其他所有内置函数对象的原型对象的 \__proto__ 都指向 object。

为了减少读者敲代码的时间，特给出验证代码，希望能够促进你的理解。

> Array:

```js
var arr = new Array;
    console.log(arr.__proto__)
    console.log(arr.__proto__ == Array.prototype)   // true 
    console.log(Array.prototype.__proto__== Object.prototype)  // true 
    console.log(Object.prototype.__proto__== null)  // true
```

> RegExp:

```js
var reg = new RegExp;
    console.log(reg.__proto__)
    console.log(reg.__proto__ == RegExp.prototype)  // true 
    console.log(RegExp.prototype.__proto__== Object.prototype)  // true
```

> Date:

```js
var date = new Date;
    console.log(date.__proto__)
    console.log(date.__proto__ == Date.prototype)  // true 
    console.log(Date.prototype.__proto__== Object.prototype)  // true
```

> Boolean:

```js
var boo = new Boolean;
    console.log(boo.__proto__)
    console.log(boo.__proto__ == Boolean.prototype) // true 
    console.log(Boolean.prototype.__proto__== Object.prototype) // true
```

> Number:

```js
var num = new Number;
    console.log(num.__proto__)
    console.log(num.__proto__ == Number.prototype)  // true 
    console.log(Number.prototype.__proto__== Object.prototype)  // true
```

> String:

```js
var str = new String;
    console.log(str.__proto__)
    console.log(str.__proto__ == String.prototype)  // true 
    console.log(String.prototype.__proto__== Object.prototype)  // true
```

##### 总结

来几句短总结：

1. 若 A 通过new创建了B,则 B.\__proto__ = A.prototype；
2. __proto__是原型链查找的起点；
3. 执行B.a，若在B中找不到a，则会在B.__proto__中，也就是A.prototype中查找，若A.prototype中仍然没有，则会继续向上查找，最终，一定会找到Object.prototype,倘若还找不到，因为Object.prototype.__proto__指向null，因此会返回undefined；
4. 为什么万物皆空，还是那句话，原型链的顶端，一定有Object.prototype.\__proto__ ——> null。
