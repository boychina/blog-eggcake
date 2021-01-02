---
title: "React 17来了"
excerpt: "React-grid-layout 一个可以支持拖拽、改变大小的栅格布局库，完美支持React"
date: "2020-10-06T12:00:00.322Z"
coverImage: "/assets/blog/cover/2020-10-06-react17-coming.jpg"
author:
  name: 淡烘糕
  picture: "/assets/blog/authors/zhaohuan.jpg"
ogImage:
  url: "/assets/blog/cover/2020-10-06-react17-coming.jpg"
---

> React 17正式版已经发布，17版本不像16版本中有诸多内容更新。官方对17版本的描述也是没有新特性，主要定位为一版技术改造，为下一个大版本的更新减轻负担。

## 1. 无新特性
React 17 的版本是非比寻常的，因为它没有添加任何面向开发人员的新功能。而主要侧重于升级简化 React 本身。
因此 v17 只是一个铺垫，并不想发布重大的新特性，而是为了 v18、v19……等后续版本能够更平滑、更快速地升上来。但其中有些改造不得不打破向后兼容，于是提出了 v17 这个大版本变更，顺便搭车卸掉两年多积攒的一些历史包袱。
## 2. 渐进式升级
v17 版本可以使得由一个React版本管理的代码树嵌入到另一个React版本管理的代码树中，这是该版本提供的渐进升级的能力。
在以往的版本中，React一直遵循“all-or-nothing”的升级策略。开发者可以继续使用旧版本，也可以将整个应用升级到新版本，没有介于两者之间的情况。这种情况往往会导致两个主要问题：

1. 想要让业务代码自动化升级过渡，React团队需要无限期支持过时的API；
1. 如果react有不兼容版本更新，业务开发者需要在继续使用旧版本和更新React之间做取舍，因为往往这种面临较大的风险。

因此，React17 提供了一个新的选项——渐进式升级，允许同一个项目中多个React版本并存。这将意味着当React 18或未来版本问世时，业务开发人员将有更多的选择。对于大型前端应用将十分友好，比如弹窗组件、部分路由下的页面可以可以一块块地平滑过渡到新版本。（[官方Demo](https://github.com/reactjs/react-gradual-upgrade-demo/)）
> PS：（按需）加载多个版本的React同样存在着性能开销，打包产物过大等问题，同样需要取舍。

### 2.1 多版本并存与为前端架构
多版本并存、新旧混用的支持让**微前端架构**所期望的渐进式重构成为了可能。与React支持多版本并存、渐进地完成版本升级相比，微前端更在意允许不同技术栈并存，平滑地过渡到升级后的架构，比如对于在一个JQuery项目中逐步升级支持React等场景。


## 3. 7个Breaking Change
### 3.1 事件委托不再挂到 documen 上
之前多版本并存的主要为题在于React事件系统默认的委托机制，出于性能考虑，React只会给`document`上挂载事件监听，DOM事件触发后冒泡到`document`，React找到对应的组件，造一个React事件（SyntheticEvent）出来，并按组件树模拟一遍事件冒泡（此时原生DOM事件已经冒出`document`了）:


因此，v17 之前不同版本的React组件嵌套使用时，e.stopPropagation()无法正常工作：如果嵌套树结构中阻止了事件冒泡，但外部树依然能接收到它。这会使不同版本 React 嵌套变得困难重重。这种担忧并不是没有根据的 —— 例如，四年前 Atom 编辑器就遇到了[相同的问题](https://github.com/facebook/react/pull/8117)。
在 React 17 中，React 将不再向 document 附加事件处理器。而会将事件处理器附加到渲染 React 树的根 DOM 容器中：
```javascript
const rootNode = document.getElementById('root');
// render
ReactDOM.render(<App />, rootNode);
// Portals
ReactDOM.createPortal(<App />, rootNode);
// React16 事件委托（挂在document上）
document.addEventListener();
// React17 事件委托（挂在 root DOM 上）
rootNode.addEventListener();
```
在React16或更早版本中，React会对大多数事件执行`document.addEventListener()`。React17将会在底层调用 `rootNode.addEventListener()`。
![image.png](/assets/blog/context/2020-10-06-react17-coming/1609317612195-a56f16b0-552e-4d41-879e-e881273b9df7.png)
由于此更改，现在可以更加安全地进行新旧版本React树的嵌套。请注意，要使其正常工作，两个版本都必须是17或更高版本。所以，从某种意义上将，React17是一个“垫脚石”版本，是逐步升级成为可能。
并且，此更改还是得将React嵌入使用其他技术构建的应用程序更加容易。例如，如果应用程序的“外壳”是用JQuery编写的，但其中交心的代码是用React编写的，则React代码中的`e.stopPropagation()`会阻止它影响JQuery的代码——这符合预期。换个角度说，如果你不再喜欢React并想重写应用程序（比如，用JQuery），则可以从外壳开始讲React转换为JQuery，而不会破坏事件冒泡。


### 3.2 更加靠近浏览器原生事件
此外，React事件系统还做了一些小的改动，使之更加切近浏览器原生事件：

1. `onScroll` 不再冒泡；
1. `onFocus/onBlur`直接采用原生`focusin/focusout`事件；
1. 捕获阶段的事件监听直接采用原生 DOM 事件监听机制。



> PS：`onFocus/onBlur`的下层实现方案切换并不英系那个冒泡，也就是说，React的 `onFocus` 仍然会冒泡（并且不打算改，任务这个特性很有用）。

### 3.3 DOM事件复用池被废弃
之前出于性能考虑，为了复用SyntheticEvent，维护了一个事件池，导致React事件只在传播过程中可用，之后会立即被回收释放，例如：
```javascript
<button onClick={(e) => {
    console.log(e.target.nodeName);
    // 输出 BUTTON
    // e.persist();
    setTimeout(() => {
      // 报错 Uncaught TypeError: Cannot read property 'nodeName' of null
      console.log(e.target.nodeName);
    });
  }}>
  Click Me!
</button>
```
传播过程之外的事件对象上的所有状态会被置为 null，除非手动 `e.persist()`（或者直接做值缓存）。React17去掉了了事件复用机制，因为在现代浏览器下这种性能优化没有意义，反而给开发者带来了困扰。
### 3.4 Effect Hook 清理操作改为异步执行
useEffect本身是异步执行的，但其清理工作却是同步执行的（就像Class组件的`componentWillUnmount`同步执行一样），可能会拖慢Tab切换之类的场景，因此React17将清理工作改为异步执行：
```javascript
useEffect(() => {
  // This is the effect itself.
  return () => {
    // 以前同步执行，React 17之后改为异步执行
    // This is its cleanup.
  };
});
```
同时还纠正了清理函数的执行顺序，按组件树上的顺序来执行（之前并不严格保证顺序）。
> PS：对于某些需要同步清理的特殊场景，可以使用 LayoutEffect Hook

### 3.5 render返回undefined报错
React 组件中 render 返回 undefined 会报错：
```javascript
function Button() {
  return; // Error: Nothing was returned from render
}
```
初衷是为了把忘记写 return 的常见错误提示出来：
```javascript
function Button() {
  // We forgot to write return, so this component returns undefined.
  // React surfaces this as an error instead of ignoring it.
  <button />;
}
```
在后来的迭代中却没有对 forwardRef、memo 加对应的检查，在React17 补上了。之后无论是类组件、函数式组件，还是 forwardRef、memo 等期望返回React组件的地方都会检查 undefined。
> PS：空组件可以返回 null，不会引发报错。

### 3.6 报错信息透传组件“调用栈”
React16 起，遇到 Error 能够透出组件的“调用栈”，辅助定位问题，但比起 JavaScript 的错误栈还有不小的差距，体现在：

1. 缺少源码位置（文件名、行列号等），Console 里无法点击跳闸是你到出错的地方；
1. 无法在生产环境中使用（displayName 被压缩坏了）。

React17 采用了一种新的组件栈生成机制，能够达到媲美 JavaScript 原生错误栈的效果（跳转到源码），并且同样适用于生产环境，大致思路是在 Error 发生时重建组件栈，在每个组件内部引发一个临时错误（对每个组件类型做一次），再从 `error.stack` 提取出关键信息构造组件栈：
```javascript
var prefix;
// 构造div等内置组件的“调用栈”
function describeBuiltInComponentFrame(name, source, ownerFn) {
  if (prefix === undefined) {
    // Extract the VM specific prefix used by each line.
    try {
      throw Error();
    } catch (x) {
      var match = x.stack.trim().match(/\n( *(at )?)/);
      prefix = match && match[1] || '';
    }
  } // We use the prefix to ensure our stacks line up with native stack frames.

  return '\n' + prefix + name;
}
// 以及 describeNativeComponentFrame 用来构造 Class、函数式组件的“调用栈”
```
因为组件栈是直接从 JavaScript 原生错误栈生成的，所以能够点击跳回源码、在生产环境也能按 sourcemap 还原回来。
> PS：
> 1. 重建组件栈的过程中会重新执行 render，以及Class组件的构造函数，这部分属于 Breaking Change；
> 1. 关于重建组件栈的更多信息见 见[Build Component Stacks from Native Stack Frames](https://github.com/facebook/react/pull/18561)、以及[react/packages/shared/ReactComponentStackFrame.js](https://github.com/sebmarkbage/react/blob/fbb0189fc795f9213187604da55780f32471b0df/packages/shared/ReactComponentStackFrame.js)。

### 3.7 删除部分暴露出来的私有 API
React17 删除了一些私有的API，大多是当初暴露给 React Native for Web 使用的，目前 React Native for Web 新版本已经不再依赖这些API了。
另外，修改事件系统时还顺手删除了 `ReactTestUtils.SimulateNative`工具方法，因为其行为与语义不符，建议换用 [React Testing Library](https://testing-library.com/docs/dom-testing-library/api-events)。
## 4. 总结
总之，React17 是一个铺垫，这个版本的核心目标是让 React 能够渐进地升级，因此最大的变化是允许多版本混用，为将来新特性的平稳落地做好准备。


#### 参考资料

1. [React v17.0 Release Candidate: No New Features](https://reactjs.org/blog/2020/08/10/react-v17-rc.html)
1. [React 17](http://www.ayqy.net/blog/react-17/#articleHeader5)
