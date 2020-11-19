---
layout:     post
title:      "React 新的生命周期钩子"
subtitle:   "React new life cycle hook"
date:       2018-08-15
author:     "Mr.厉害"
header-img: "img/post-bg/2018-08-11-04.jpg"
header-mask: 0.3
catalog:    true
tags:
  - React
  - 生命周期
---

在 React 16.3 中，Facebook 的工程师们给 React 带了来一系列的新特性，如 suspense 和 time slicing 等，这些都为 React 接下来即将到来的异步渲染机制做准备，有兴趣的可以看[Sophie Alpert 在 JSConf Iceland 2018 的演讲](https://link.juejin.im/?target=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3Dv6iR3Zk4oDY)。

像 time slicing 等 React 内部优化特性，在 API 层面不会有太大变化，而 API 层面最大的变化应该在生命周期钩子。

React 的生命周期 API 一直以来十分稳定，但是当 React 团队在引入异步渲染机制的时候，发现之前的生命周期在使用时会产生一些问题，所以才会改动生命周期 API，感兴趣可以看[这篇博客](https://link.juejin.im/?target=https%3A%2F%2Freactjs.org%2Fblog%2F2018%2F03%2F27%2Fupdate-on-async-rendering.html%23initializing-state)。

在 React 16.3 中，为下面三个生命周期钩子加上了 UNSAFE 标记：

* UNSAFE_componentWillMount
* UNSAFE_componentWillReceiveProps
* UNSAFE_componentWillUpdate

新增下面两个生命周期方法

* static getDerivedStateFromProps // 从道具中获得派生状态
* getSnapshotBeforeUpdate         // 获取快照更新之前

在目前 16.X（X > 3）的 React 中，使用 componentWillMount, componentWillReceiveProps, componentWillUpdate 这三个方法会收到警告。**React 团队计划在 17.0 中彻底废弃掉这几个API**。

### 新的生命周期钩子：static getDerivedStateFromProps

```jsx
class Example extends React.Component {
  static getDerivedStateFromProps(props, state){
    // ...
  }
}
```

React 在实例化组件之后以及重新渲染组件之前，将调用新的 static getDerivedStateFromProps 生命周期方法。该方法类似于 componentWillReceiveProps，可以用来控制 props 更新 state 的过程。**它返回一个对象表示新的 state。如果不需要更新组件，返回 null 即可**。

geDerivedStateFromProps 与 componentDidUpdate 一起将会替换掉所有的 componentWillReceiveProps。

### 新的生命周期钩子：getSnapshotBeforeUpadte

```jsx
class Example extends React.Component {
  getSnapshotBeforeUpate(prevProps, prevState) {
    // ...
  }
}
```

getSnapshotBeforeUpdate 方法 **在 React 对视图做出实际改动（如 DOM 更新）发生前被调用，返回值将作为 ComponentDidUpdate 的第三个参数**。

getSnapshotBeforeUpdate 配合 componentDidUpdate 可以取代 componentWillUpdate。

### 为何移除 componentWillMount

因为在 React 未来的版本中，异步渲染机制可能会导致单个组件实例可以多次调用该方法。很多开发者目前会将时间绑定、异步请求等写在 componentWillMount 中，一旦异步渲染 componentWillMount 被多次调用，将导致：

* 进行重复的时间监听，无法正常取消重复的 Listener ，更有可能 **导致内存泄漏**
* 发出重复的异步网络请求， **导致 IO 资源被浪费**
* 在服务端渲染时，componentWillMount 会被调用，但是会因忽略异步获取的数据而浪费 IO 资源

现在，React 推荐将原本在 componentWillMount 中的网络请求移到 componentDidMount 中。至于这样会不会导致请求被延迟发出影响用户体验，React 团队是这么解释的：

> There is a common misconception that fetching in componentWillMount lets you avoid the first empty rendering state. In practice this was never true because React has always executed render immediately after componentWillMount. If the data is not available by the time componentWillMount fires, the first render will still show a loading state regardless of where you initiate the fetch. This is why moving the fetch to componentDidMount has no perceptible effect in the vast majority of cases.

> 有一种常见的误解，认为在componentWillMount中请求可以避免第一个空呈现状态。在实践中，这从来都不是正确的，因为在组件挂起之后，React 总是立即执行。如果数据在组件挂起的时候没有可用，那么第一个渲染将仍然显示加载状态，而不管您发起请求的位置。这就是为什么在绝大多数情况下移动fetch到componentDidMount并没有明显的效果。

componentWillMount、render 和 componentDidMount 方法虽然存在调用先后顺序，但在大多数情况下，几乎都是在很短的时间内先后执行完毕，几乎不会对用户体验产生影响。

### 为什么移除 comonentWillUpdate

大多数开发者使用 componentWillUpdate 的场景是配合 componentDidUpdate，分别获取 render 前后的视图状态，进行必要的处理。但随着 React 新的 suspense、time slicing、异步渲染等机制的到来，render 过程可以可以被分割成多次完成，还可以被暂停甚至回溯，这 **导致 componentWillUpdate 和 componentDidUpdate 执行前后可能会间隔很长时间**，足够使用户进行交互操作更改当前组件的状态，这样可能会导致难以追踪的 BUG。

React 新增的 getSnapshotBeforeUpdate 方法就是为了解决上述问题，因为 getSnapshotBeforeUpdate 方法是在 componentWillUpadate 后（如果存在的话），在 React 真正更改 DOM 前调用的，它获取到组件状态信息更可靠。

除此之外，getSnapshotBeforeUpdate 还有一个十分明显的好处：它调用的结果会作为第三个参数传入 componentDidUpdate，避免了 componentWillUpdate 和 componentDidUpdate 配合使用时将组件临时的状态数据存在组件实例上浪费内存，getSnapshotBeforeUpdate 返回的数据在 componentDidUpdate 中用完即被销毁，效率更高。

### 总结

React 进来 API 变化十分大，React 团队很长时间以来一直在实现异步渲染机制，目前的特性只是为异步渲染做准备，预计 React 在 17 版本发布时，性能会取的巨大的提升，期待中。。。

PS：从 Sophie Alpert 验证的两个 DEMO 上看，异步渲染的高效确实十分惊艳，有兴趣的可以看文章开头的演讲。
