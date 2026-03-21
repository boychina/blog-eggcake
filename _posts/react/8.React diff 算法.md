---
title: "React diff 算法"
excerpt: "diff 算法一直是 React 系统最核心的部分，并且由于演化自传统 diff，使得比较方式从 O(n^3)降级到 O(n)，然后又改成了链表方式，可谓是变化万千。"
description: "React diff 算法"
keyword: "react,diff"
tag: "react"
date: "2021-01-31 19:00:00"
coverImage: "/assets/blog/cover/2021-01-31-react-diff.png"
author:
  name: 蛋烘糕
  picture: "/assets/blog/authors/zhaohuan.jpg"
ogImage:
  url: "/assets/blog/cover/2021-01-31-react-diff.png"
---

# 前言

diff 算法一直是 React 系统最核心的部分，并且由于演化自传统 diff，使得比较方式从 O(n^3)降级到 O(n)，然后又改成了链表方式，可谓是变化万千。

# 传统 Diff 算法

传统 diff 算法需要循环比较两棵树，所有节点的循环，那么单纯比较次数就是 O(n^2)，n\*n

```
P                         L
          A                     A
         / \                   / \
        /   \                 /   \
       B     D     ====>     D     B
      /                             \
     C                               C
```

刷刷刷，每次都需要循环遍历，于是有以下的查找过程：

```
PA->LA
PA->LB
PA->LC
PA->LD
PB->LA
...
```

除了查找过程消耗了 O(n^2)之外，找到差异后还要计算最小转换方式，最终结果为 O(n^3)。
所以，传统的 diff 算法的时间复杂度为 O(n^3)。
如果 React 运用这种算法，那么节点过多，将会有大量的开销，虽然 CPU 的秒速达到 30 亿次计算，但依旧是非常耗费性能的。
有没有什么方式可以降低时间复杂度呢？
于是，React15 对传统的 diff 做了一些限制，使得时间复杂度变为了 O(n)。

# React 15 的 Diff 算法

《深入 React 技术栈》这本书，给出了三种 Diff 策略分析，文字描述太过抽象，直接表述如下：
Tree diff、Component diff、Element diff

## Tree diff

什么是 Tree diff？先上图：

![reactdiff1-300x167.png](/assets/blog/context/2021-01-31-react-diff/reactdiff1-300x167.png)

首先，进行同级比较，并非循环比较。这样比较次数就降为一层一次，时间复杂度直接降为 O(n)
如果同级相同位置节点不一样，则直接删除替换，简单粗暴。
而对于节点移动，同样道理，也是简单粗暴的删除重建。如下图所示（图中第四步应该是删除左侧的整棵 A 树）：

![treediff2-300x145.png](/assets/blog/context/2021-01-31-react-diff/treediff2-300x145.png)

## Component diff

不多说，先上图：

![comdiff1-300x124.png](/assets/blog/context/2021-01-31-react-diff/comdiff1-300x124.png)

其实 component diff 相当于是子树的 diff，基本方案和 tree diff 是一致的，如果如上图 D 变为 G，那么直接删除 D 这一整棵树，然后重新渲染 G 树。
依旧是简单粗暴。

## Element diff

对于同一节点的元素，diff 算法提供了三种操作：插入、移动、删除。还是先上图：

![elediff-300x152.png](/assets/blog/context/2021-01-31-react-diff/elediff-300x152.png)

此时的操作，是 B、D 不做任何操作，AC 移动到相应位置【前提是都有相同的 key】
如果，此时的 key 不相同，全都发生了变化，那么节点全都是要删除重新构建，将会消耗大量性能。

# React 16 的 Diff 算法

React16 相比 React15 的 Diff 算法发生了很大的变化，其中最主要就是引入了 Fiber 循环任务调度算法。

## Fiber

Fiber 是什么？干了什么？
Fiber 在 diff 阶段，做了如下的操作：

1. 可以随时将 diff 操作进行任务拆分；
1. diff 阶段的每个任务可以随时执行或者中止；
1. diff 阶段任务调度优先级控制。

所以，Fiber 相当于是，在 15 的 diff 算法阶段，做了优先级的任务调度控制。所以，Fiber 是根据一个 fiber 节点（VDOM 节点）来拆分，以 fiber node 为一个任务单元，一个组件实例都是一个任务单元。任务循环中，每处理完一个 fiber node，可以中断/挂起/恢复。

它又是如何能够进行这样的异步操作的呢？这就不得不说一个方法：requestIdleCallback

浏览器提供的 requestIdleCallback API 中的 Cooperative Scheduling 可以让浏览器在空闲时间执行回调（开发者传入的方法），在回调参数中可以获取到当前帧（16ms）剩余的时间。利用这个信息可以合理的安排当前帧需要做的事情，如果时间足够，那继续做下一个任务，如果时间不够就歇一歇，调用 requestIdleCallback 来获知主线程不忙的时候，再继续做任务。

Fiber Node 是什么？

链表！

将要处理的节点，存在链表结构，那么就能够做到节点复用。【这大概是 Fiber 的核心吧】
大体上的 Diff 引入了 Fiber 之后，我们就增加了更多的链表复用功能，通过这一点，我们可以使得 React Diff 的性能得到提升。

# 总结

其实，这篇文章着重讲的还是 React15 的 diff，React 16 的 diff 并未详细探讨，后期会逐步深入探讨 React 16 的 Diff 策略。不过 React 16Diff 策略的核心 Fiber 是不可错过的点。

# 参考资料

> 《深入 React 技术栈》
> [https://segmentfault.com/a/1190000016723305](https://segmentfault.com/a/1190000016723305)  
> [https://www.jianshu.com/p/3ba0822018cf](https://www.jianshu.com/p/3ba0822018cf)  
> [https://www.jianshu.com/p/21a445066d51?from=timeline](https://www.jianshu.com/p/21a445066d51?from=timeline)  
> [https://www.zhihu.com/question/66851503/answer/246766239](https://www.zhihu.com/question/66851503/answer/246766239)  
> [https://blog.csdn.net/P6P7qsW6ua47A2Sb/article/details/82322033](https://blog.csdn.net/P6P7qsW6ua47A2Sb/article/details/82322033)  
> [https://blog.csdn.net/VhWfR2u02Q/article/details/100011830](https://blog.csdn.net/VhWfR2u02Q/article/details/100011830)
