---
title: "React性能优化3大技巧"
excerpt: "在业务迭代过程中，React 性能优化是我们不得不考虑的问题，虽然项目在启动之初，我们一般不会考虑项目的复杂度，而且因为产品的用户体量和技术场景也不复杂，并不需要考虑性能优化，但是随着业务场景的复杂化，性能优化就变得格外重要了。​"
description: "React性能优化3大技巧"
keyword: "react"
tag: "react"
date: "2021-09-23 11:56:00"
coverImage: "/assets/blog/cover/2021-09-23-React性能优化3大技巧.png"
author:
  name: 蛋烘糕
  picture: "/assets/blog/authors/zhaohuan.jpg"
ogImage:
  url: "/assets/blog/cover/2021-09-23-React性能优化3大技巧.png"
---

在业务迭代过程中，React 性能优化是我们不得不考虑的问题，虽然项目在启动之初，我们一般不会考虑项目的复杂度，而且因为产品的用户体量和技术场景也不复杂，并不需要考虑性能优化，但是随着业务场景的复杂化，性能优化就变得格外重要了。

我们从 React 源码入手，以有具体业务为例，运用 3 大优化技巧对系统进行“外科手术式”的优化，同时深入刨析 React Profiler，利用这款性能优化利器，帮我们定位性能瓶颈。

![1665303348561-7e0a9df9-acfb-4376-9e50-db19737ba756.png](https://assets.eggcake.cn/context/2021-09-23-React%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%963%E5%A4%A7%E6%8A%80%E5%B7%A7/1665303348561-7e0a9df9-acfb-4376-9e50-db19737ba756.png)<br />页面加载流程

- 假设用户首次打开页面（无缓存），这个时候页面是完全空白的；
- HTML 和引用的 CSS 加载完毕，浏览器进行首次渲染；
- React、ReactDom、业务代码加载完毕，应用第一次渲染（或者说首次内容渲染）；
- 应用代码开始执行，拉取数据、进行动态 import、响应事件……完毕后页面进入可交互状态；
- Lazy Load 的图片等多媒体内容开始逐渐加载完毕；
- 直到页面的其他资源（如错误上报组件、打点上报组件等）加载完毕，整个页面加载完成。

接下来，我们主要来针对 React 剖析它渲染性能优化的三个方向（这三个方向也适用于其他软件开发领域）。

- 减少计算的量：在 React 中，就是减少渲染的节点，或通过索引减少渲染复杂度。
- 利用缓存：在 React 中，就是避免重新渲染（利用 memo 方式来避免组件重新渲染）。
- 精确重新计算的范围：在 React 中，就是绑定组件和状态关系，精确判断更新的“时机”和“范围”，只重新渲染变更的组件（减少渲染范围）。

如何做到这三点呢？**我们从 React 本身的特性入手分析。**

<a name="wU2DA"></a>
### React 的工作流
React 是声明式 UI 库，负责把 State 转换成页面结构后（虚拟 DOM 结构），再转换成真实 DOM 结构，交给浏览器渲染。State 发生改变时，React 会先进行 Reconciliation，结束后立刻进入 Commit 阶段，Commit结束后，新 State 对应的页面才被展示出来。

![1665303348561-7e0a9df9-acfb-4376-9e50-db19737ba756.png](https://assets.eggcake.cn/context/2021-09-23-React%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%963%E5%A4%A7%E6%8A%80%E5%B7%A7/1665303348561-7e0a9df9-acfb-4376-9e50-db19737ba756.png)

其中，React 的 Reconciliation 需要做两件事：

- 计算出目标 State 对应的虚拟 DOM 结构；
- 寻找“将虚拟 DOM 结构修改为目标虚拟 DOM 结构”的最优方案。

React 按照深度优先遍历虚拟 DOM 树的方式，在一个虚拟 DOM 上完成 Render 和 Diff 的计算后，再计算下一个虚拟 DOM，Diff 算法会记录虚拟 DOM 的更新方式（如：Update、Mount、Unmount），为 Commit 做准备。

而 React 的 Commit 也需要做两件事：

- 将 Reconciliation 结果应用到 DOM 中；
- 调用暴露的 Hooks 如：componentDidUpdate、useLayoutEffect 等。

了解完 React 的工作流之后，我们就针对三个优化方向精准分析。

<a name="uX8Qs"></a>
### 如何减少计算的量
关于 Reconciliation、Commit 两个阶段的优化办法，我遵循减少计算量（列表项使用 key 属性)的方式，React 内部的 Fiber 结构和并发模式也是在减少该过程的耗时阻塞。

对于 Commit 在执行Hooks 时，开发者应保证 Hooks 中的代码尽量轻量、避免耗时阻塞，同时应避免在 CDM、CDU 周期中更新组件。

假如你没有在列表中添加 key 属性，控制台会展示一片大红（系统会时刻提醒你记得加 Key）

![1665303348561-7e0a9df9-acfb-4376-9e50-db19737ba756.png](https://assets.eggcake.cn/context/2021-09-23-React%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%963%E5%A4%A7%E6%8A%80%E5%B7%A7/1665303348561-7e0a9df9-acfb-4376-9e50-db19737ba756.png)

<a name="FSoH8"></a>
### 优化 Render 过程
Render 过程即 Reconciliation 中计算出目标 State 对应的虚拟 DOM 结构。触发 React 组件的 Render 过程目前有三种方式：forceUpdate、State 更新、父组件 Render 触发子组件 Render 过程。

<a name="xmvXV"></a>
#### 优化技巧一：PureComponent、React.memo

在 React 工作流中，如果只有父组件发生状态更新，即使父组件传给子组件的所有 Props 都没有修改，也会引起子组件的 Render 过程。

从 React 的声明式设计理念来看，如果子组件的 Props 和 State 都没有改变，那么其生成的 DOM 结构和副作用也不应该发生改变，当子组件符合声明式设计理念时，就可以忽略子组件本次的 Render 过程。

PureComponent 和 React.memo应对了这种场景：

- PureComponent 是对类组件的 Props 和 State 进行浅比较；
- React.memo 是对函数组件的 Props 进行浅比较。

<a name="Pac5h"></a>
#### 优化技巧二：useMemo、useCallback 实现稳定的 Props 值

如果传给子组件的派生状态或函数，每次都是新的引用，那么 PureComponent 和 React.memo 优化就会失效，所以需要用 useMemo 和 useCallback 来生成稳定值，并结合 PureComponent 或 React.memo 避免子组件重新 Render。

<a name="M6TAg"></a>
#### 优化技巧三：useMemo 减少组件 Render 过程耗时

useMemo 是一种缓存机制提速，当它的依赖未发生改变时，就不会触发重新计算，一般用在“计算派生状态的代码”非常耗时的场景中（比如遍历大列表做统计信息）。

```jsx
// 大列表渲染
const renderTable = useMemo(() => {
  return (
    <Table<TS.OrderPollData>
      bordered
      scroll={{ x: 'max-content', y: 620 }}
      rowClassName={styles.tableLine}
      columns={tableColumns}
    	dataSource={dataSource}
    	loading={loading}
    	pagination={false}
  	/>
  );
}, [loading, datasource, pageConfig, tablecolumns])
```
显然，useMemo的作用是缓存昂贵的计算(避免在每次渲染时都进行高开销的计算)，在业务中使用它去控制变量来更新表格。

<a name="yvRVR"></a>
#### 优化技巧四：shouldComponentUpdate

在类组件中，例如要往数组中添加一项数据时，当时的代码很可能是 state.push(item)，而不是 const newState = [...state, item]。
```jsx
shouldComponentUpdate = (nextProps:PromiseRenderProps<T, K>, nextState: PromiseRenderState) => {
  const { component } = this.state;
  if (!isEqual(nextProps, this.props)) {
    this.setRenderComponent(nextProps);
  }
  if (nextState.component !== component) return true;
  return false;
}
```

在此背景下，当时的开发者经常使用 shouldComponentUpdate 来深比较 Props，只在 Props 有修改才执行组件的 Render 过程，如今由于数据不可变性和函数组件的流行，这样的优化场景已经很少再出现了。

为了贴合 shouldComponentUpdate 的思想：给子组件传 Props 时一定只传其需要的，而并非一股脑全部传入。

```jsx
const AbleHiddenFiltersprops = useMemo(() => 
	return {
		hideFilters,
		gradeInfo,
    subjectInfo,
    ......
		setHideFilters,
		findOrderValue
  }
}, [gradeInfo, subjectInfo, hideFilters, studentId, findorderValue]);

const CommonFiltersProps = useMemo(() => {
	return {
		user,
    userId,
    orgInfo,
    pickerValue,
    ......
    studentId,
    userDisabled,
    userData,
    organizationData,
  }
}, [userId, orgInfo, pickerValue, studentId, isShowOrg, cUserFilteRef, initialOwnerListRef?.current]);
```
传入子组件的参数一定保证其在自组件中被使用到。

<a name="i5nrj"></a>
### 批量更新，减少 Render 次数
在 React 管理的事件回调和生命周期中，setState 是异步的，其他时候 setState 是同步的。这个问题根本原因就是 React 在自己管理的事件回调和生命周期中，对于 setState 是批量更新的，而在其他时候是立即更新的。

批量更新 setState 时，**多次执行 setState 只会触发一次 Render 过程**。相反在立即更新 setState 时，每次 setState 都会触发一次 Render 过程，就存在性能影响。

假设有如下组件代码，该组件在 getData() 的 API 请求结果返回后，分别更新了两个 State 。

```jsx
function NormalComponent() {
	const [list, setList] = useState(null);
	const [info, setInfo] = useState(null);

  useEffect(() => {
    ;(async () => {
			const data = await getData();
			setList(data.list);
      setInfo (data.info);
    )();
	}, []);

	return (
    <div>
			非批量更新组件时 Render 次数:
      {renderOnce('normal')}
    </div>
	)
}
```
该组件会在 setList(data.list) 后，触发组件的 Render 过程，然后在 setInfo(data.info) 后再次触发 Render 过程，造成性能损失，**那我们该如何解决呢？**

- 将多个 State 合并为单个 State，比如 useState({ list: null, info: null }) 替代 list 和 info 两个 State。
- 使用 React 官方提供的 unstable_batchedUpdates 方法，将多次 setState 封装到 unstable_batchedUpdates 回调中。

修改后代码如下：

```jsx
function BatchedComponent(){
	const [list, setList] = useState(null);
	const [info, setInfo] = useState(null);

	useEffect(() => {
		;(async () => {
      const data= await getData();
			unstable_batchedUpdates(() => {
        setList(data.list);
				setInfo(data.info);
      });
    })()
  }, [])

	return (
    <div>
      批量更新组件时 Render 次数：
      {renderOnce('batched')}
    </div>
  )
}
```
<a name="dbUs8"></a>
### 精细化渲染阶段
<a name="urvIk"></a>
#### 按优先级更新，及时响应用户
如果页面弹出一个 Modal，当用户点击 Modal 中的确定按钮后，代码将执行两个操作：

- 关闭 Modal；
- 页面处理 Modal 传回的数据并展示给用户。

当操作 2 需要执行 500ms 时，用户会明显感觉到从点击按钮到 Modal 被关闭之间的延迟。下图为一般的实现方式，将 slowHandle 函数作为用户点击按钮的回调函数。

```jsx
// 非延迟执行
const slowHandle = () => {
  setShowInput(false)
  setNumbers ([...numbers, +inputValue].sort((a, b) => a - b) ));
}
```

slowHandle() 执行过程耗时长，用户点击按钮后会明显感觉到页面卡顿。

如果让页面优先隐藏输入框，用户就能立刻感知到页面更新，不会有卡顿感。**而实现优先级更新的要点是：将耗时任务移动到下一个宏任务中执行，优先响应用户行为。**

比如在示例中，将 setNumbers 移动到 setTimeout 的回调中，用户点击按钮后能立刻看到输入框被隐藏，不会感知到页面卡顿。项目中优化后的代码如下：

```jsx
// 延迟执行
const fastHandle = () => {
	// 优先响应用户行为
	setShowInput(false);
	// 将耗时任务移动到下一个宏任务执行
	setTimeout(() => {
		setNumbers([...numbers, +inputValue].sort((a, b) => a - b));
  })
}
```
<a name="xXjN4"></a>
#### 发布者订阅者跳过中间组件 Render 过程
React 推荐将公共数据放在所有“需要该状态的组件”的公共组件上，但是将状态放在公共组件上后，该状态就需要层层向下传递，直到传递给使用该状态的组件为止。

![1665303348561-7e0a9df9-acfb-4376-9e50-db19737ba756.png](https://assets.eggcake.cn/context/2021-09-23-React%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%963%E5%A4%A7%E6%8A%80%E5%B7%A7/1665303348561-7e0a9df9-acfb-4376-9e50-db19737ba756.png)

传统 Redux 数据流

可以看到，每次状态的更新都会涉及中间组件的 Render 过程，但中间组件并不关心该状态，它的 Render 过程只负责将该状态再传给子组件。在这种场景下，**可以将状态用“发布者、订阅者模式”维护，只有关心该状态的组件才去订阅该状态，不再需要中间组件传递该状态**。

当状态更新时，发布者发布数据更新消息，只有订阅者组件才会触发 Render 过程，中间组件不再执行 Render 过程。

只要是发布者订阅者模式的库，都可以使用 useContext 进行该优化。比如 redux、use-global-state、React.createContext 等。

业务代码中的使用如下：

![1665303348561-7e0a9df9-acfb-4376-9e50-db19737ba756.png](https://assets.eggcake.cn/context/2021-09-23-React%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%963%E5%A4%A7%E6%8A%80%E5%B7%A7/1665303348561-7e0a9df9-acfb-4376-9e50-db19737ba756.png)

从图中可看出，优化后只有使用了公共状态的组件 renderTable 才会发生更新，可以大大减少父组件和其他 renderSon 组件的 Render 次数(减少叶子节点的重渲染)。

<a name="uk68B"></a>
#### useMemo 返回虚拟 DOM 可跳过该组件 Render 过程
利用 useMemo 可以缓存计算结果的特点，如果 useMemo 返回的是组件的虚拟 DOM，那么将在 useMemo 依赖不变时，跳过组件的 Render 阶段。该方式与 React.memo 类似，但与 React.memo 相比有以下优势。

- 更方便：React.memo 需要对组件进行一次包装，生成新的组件，而 useMemo 只需在存在性能瓶颈的地方使用，不用修改组件。
- 更灵活：useMemo 不用考虑组件的所有 Props，而只需考虑当前场景中用到的值，也可使用 useDeepCompareMemo 对用到的值进行深比较。

该例子中，父组件状态更新后，不使用 useMemo 的子组件会执行 Render 过程，而使用 useMemo 的子组件会按需执行更新。

业务代码中的使用方法如下：

![1665303348561-7e0a9df9-acfb-4376-9e50-db19737ba756.png](https://assets.eggcake.cn/context/2021-09-23-React%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%963%E5%A4%A7%E6%8A%80%E5%B7%A7/1665303348561-7e0a9df9-acfb-4376-9e50-db19737ba756.png)

<a name="exACa"></a>
### 精确判断更新的“时机”和“范围”
<a name="xWbRv"></a>
#### debounce、throttle 优化频繁触发的回调
在搜索组件中，当 input 中内容修改时就触发搜索回调，当组件能很快处理搜索结果时，用户不会感觉到输入延迟。但实际场景中，中后台应用的列表页非常复杂，组件对搜索结果的 Render 会造成页面卡顿，明显影响到用户的输入体验。

在搜索场景中一般使用 useDebounce+ useEffect 的方式获取数据。

```jsx
/**
 * 使用ref存储setTimeout 返回的值，避免普通防抖函数在函数组件中使用时依赖变化导致setTimeout唯一标识符丟失
 * @param fun 防抖目标函数
 * @param delay 防抖时间
*/
export function useDebounce<T extends unknown[]>(fun:(...args: T) => unknown, delay: number = 300) {
  const ref = useRef<any>();
  return function callback(...args: T) {
    // ats-ignore
    const that = this;
    clearTimeout(ref.current);
    ref.current = setTimeout(() - fun.apply<any,T, unknown>(that, args), delay);
  };
}

/**
 * 节流 delay 内时间内只能触发1次回调
 * @param fun 函数
 * @param delay 间隔时间
 */
export function useThrottle<T extends unknown[], R = any>(fun:(...args: T) => R, delay: number = 700) {
	const ref = useRef<number>(0);
  return function callback(...args: T): R | undefined {
    const date = Date.now();
    if (ref.current + delay > date) return;
    ref.current = date;
    // @ts-ignore
    const that = this;
    return fun.apply<any, T, R>(that, args);
  }
}


export default function App() {
	const [text, setText] = useState('Hello');
  const [debouncedValue] = useDebounce(text, 300);
	useEffect(() => {
  	//根据 debouncedvalue 进行搜索
  },[debouncedvalue]);
};

```

在搜索场景中：

- 只需响应用户最后一次输入，无需响应用户的中间输入值，debounce 更适合；
- throttle 更适合需要实时响应用户的场景，如通过拖拽调整尺寸或通过拖拽进行放大缩小（如window 的 resize 事件）。

<a name="fueVH"></a>
#### 懒加载与懒渲染
在 SPA 中，懒加载优化一般用于从一个路由跳转到另一个路由；还可用于用户操作后才展示的复杂组件，比如点击按钮后展示的弹窗模块（大数据量弹窗）。在这些场景下，结合 Code Split 收益较高。

懒加载的实现是通过 Webpack 的动态导入和 React.lazy 方法。实现懒加载优化时，不仅要考虑加载态，还需要对加载失败进行容错处理：

![1665303348561-7e0a9df9-acfb-4376-9e50-db19737ba756.png](https://assets.eggcake.cn/context/2021-09-23-React%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%963%E5%A4%A7%E6%8A%80%E5%B7%A7/1665303348561-7e0a9df9-acfb-4376-9e50-db19737ba756.png)

而懒渲染指：当组件进入或即将进入可视区域时才渲染组件。常见的组件 Modal/Drawer 等，当 visible 属性为 true 时才渲染组件内容，也可以认为是懒渲染的一种实现。懒渲染的使用场景有：

- 页面中出现多次的组件，且组件渲染费时、或者组件中含有接口请求。如果渲染多个带有请求的组件，由于浏览器限制了同域名下并发请求的数量，就可能会阻塞可见区域内的其他组件中的请求，导致可见区域的内容被延迟展示。
- 需用户操作后才展示的组件（这点和懒加载一样，但懒渲染不用动态加载模块，不用考虑加载态和加载失败的兜底处理，实现上更简单）。

在懒渲染的实现中，判断组件是否出现在可视区域内，借助 react-visibility-observer 依赖：

```jsx
import VisibilityObserver, { useVisibilityObserver } from 'react-visibility-observer';

const VisibilityObserverChildren = ({ callback, children })=> {
	const { isVisible } = useVisibilityObserver();
  useEffect(
    () => {
      callback(isVisible)
    },
    [callback, isVisiblel]
  );
	return <>{children}</>
}

export const LazyRender = () => {
	const [isRendered, setIsRendered] = useState(false);
  
  if (!isRendered) {
    return(
			<VisibilityObserver rootMargin={'Opx Opx Opx Opx'}>
				<VisibilityObserverChildren
          callback={isVisible => {
            if (isVisible) {
              setIsRendered(true);
            }
          }}
				>
					<span />
        </VisibilityObserverChildren>
      </VisibilityObserver>
		)
  }
}

export default LazyRender;

```

<a name="xrqiR"></a>
#### 虚拟列表
虚拟列表是懒渲染的一种特殊场景，虚拟列表的组件有 react-window和 react-virtualized。、

其中，react-window 是 react-virtualized 的轻量版本，其 API 和文档更加友好，我建议你用 react-window，只需要计算每项的高度即可（如果每项的高度是变化的，可给 itemSize 参数传一个函数）：

```jsx
import { FixedSizeList as List } from 'react-window';
const Row = ({ index,  style }) = <div stvle={style}>Row {index}</div>;

const Example =() => (
  <List
    height={150}
    itemcount={1000}
    itemsize={35} //每项的高度为 35
    width={300}
	>
    {Row}
  </List>
)

```

所以在开发过程中，遇到接口返回的是所有数据时，需提前预防这类会有展示的性能瓶颈的需求时，**推荐使用虚拟列表优化**。

<a name="ehjVN"></a>
#### 避免在 didMount、didUpdate 中更新组件 State
这个技巧不仅仅适用于 didMount、didUpdate，还包括 willUnmount、useLayoutEffect 和特殊场景下的 useEffect（当父组件的 cDU/cDM 触发时，子组件的 useEffect 会同步调用），我简化一下，把它们叫作“提交阶段钩子”。

**React 工作流 Commit 阶段的第二步就是执行提交阶段钩子**，它们的执行会阻塞浏览器更新页面。如果在提交阶段钩子函数中更新组件 State，会再次触发组件的更新流程，造成两倍耗时。一般在提交阶段的钩子中更新组件状态的场景有：

- 计算并更新组件的派生状态（Derived State）。在该场景中，类组件应使用 getDerivedStateFromProps 钩子方法代替，函数组件应使用函数调用时执行 setState 的方式代替。使用上面两种方式后，React 会将新状态和派生状态在一次更新内完成。
- 根据 DOM 信息，修改组件状态。在该场景中，除非想办法不依赖 DOM 信息，否则两次更新过程是少不了的，就只能用其他优化技巧了。

use-swr 的源码就使用了该优化技巧：当某个接口存在缓存数据时，use-swr 会先使用该接口的缓存数据，并在 requestIdleCallback 时再重新发起请求，获取最新数据。

我模拟一个 swr：

```jsx
function CompWithUseFetch() {
	const [search, setSearch] = useState("");
  //如果 search 改变就重新发起请求
	const { data } = useFetch(async () => {
    return window.fetch(`/api/data?search=${search}`)
	}, [search]);

  return (
    <div>
    	<div>
				<input onChange={e => setSearch(e.target.value)} />
    	</div>
  		{data || "-"}
  	</div>
	)
}

```

- 它的第二个参数 deps，是为了在请求带有参数时，如果参数改变了就重新发起请求。
- 暴露给调用方的 fetch 函数，可以应对主动刷新的场景，比如页面上的刷新按钮。

如果 use-swr 不做该优化的话，就会在 useLayoutEffect 中触发重新验证并设置 isValidating 状态为 true，引起组件的更新流程，造成性能损失。

<a name="t8lZe"></a>
### React Profiler 使用心得
React Profiler 是 React 官方提供的性能审查工具，我只讲一下自己的使用心得。

Note：react-dom 16.5+ 在 DEV 模式下才支持 Profiling，同时生产环境下也可以通过一个 profiling bundle react-dom/profiling 来支持，你可以在 [https://gist.github.com/bvaughn/25e6233aeb1b4f0cdb8d8366e54a3977](https://gist.github.com/bvaughn/25e6233aeb1b4f0cdb8d8366e54a3977)上查看如何使用这个 bundle。

“Profiler” 的面板在刚开始的时候是空的，你可以点击 record 按钮来启动 profile：

![1665303631898-476b72a9-ec5c-4b74-8660-c2292966e52a.png](https://assets.eggcake.cn/context/2021-09-23-React%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%963%E5%A4%A7%E6%8A%80%E5%B7%A7/1665303631898-476b72a9-ec5c-4b74-8660-c2292966e52a.png)

<a name="Zwf4S"></a>
#### Profiler 只记录了 Render 过程耗时
不要通过 Profiler 定位非 Render 过程的性能瓶颈问题，通过 React Profiler，开发者可以查看组件 Render 过程耗时，但无法知晓提交阶段的耗时。尽管 Profiler 面板中有 Committed at 字段，但这个字段是相对于录制开始时间，根本没有意义。

通过在 React v16 版本上进行实验，同时开启 Chrome 的 Performance 和 React Profiler 统计。

如下图，在 Performance 面板中，Reconciliation和Commit阶段耗时分别为 642ms 和 300ms，而 Profiler 面板中只显示了 642ms：

![1665303747285-c21ecea0-122f-487d-81d7-355586596a38.png](https://assets.eggcake.cn/context/2021-09-23-React%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%963%E5%A4%A7%E6%8A%80%E5%B7%A7/1665303747285-c21ecea0-122f-487d-81d7-355586596a38.png)

<a name="loc6F"></a>
#### 开启“记录组件更新原因”
点击面板上的齿轮，然后勾选“Record why each component rendered while profiling.”，如下图：

![1665303817625-29010e7b-3bd0-40e7-bd7a-2ffd33a7699d.png](https://assets.eggcake.cn/context/2021-09-23-React%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%963%E5%A4%A7%E6%8A%80%E5%B7%A7/1665303817625-29010e7b-3bd0-40e7-bd7a-2ffd33a7699d.png)

然后点击面板中的虚拟 DOM 节点，右侧便会展示该组件重新 Render 的原因。

<a name="SYpWs"></a>
#### 定位产生本次 Render 过程原因
由于 React 的批量更新（Batch Update）机制，产生一次 Render 过程可能涉及到很多个组件的状态更新，**那么如何定位是哪些组件状态更新导致的呢**？

![1665303888640-8dd49ec8-2a5b-4aa5-892e-7d5c77a79e17.png](https://assets.eggcake.cn/context/2021-09-23-React%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%963%E5%A4%A7%E6%8A%80%E5%B7%A7/1665303888640-8dd49ec8-2a5b-4aa5-892e-7d5c77a79e17.png)

在 Profiler 面板左侧的虚拟 DOM 树结构中，从上到下审查每个发生了渲染的（不会灰色的）组件。如果组件是由于 State 或 Hook 改变触发了 Render 过程，那它就是我们要找的组件，如下图：

![1665304010851-19e98c9f-7d79-406e-b100-d08fe7ed03b2.png](https://assets.eggcake.cn/context/2021-09-23-React%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%963%E5%A4%A7%E6%8A%80%E5%B7%A7/1665304010851-19e98c9f-7d79-406e-b100-d08fe7ed03b2.png)

小结<br />这一讲，我从三个方向深度剖析了 React 的性能优化，由浅及深地从业务角度入手，用例证深刻解读了在各种业务场景下，应该使用何种优化手段，核心主要概括成以下几点：

- 了解 React 的工作流，熟悉其中各阶段的职责；
- 通过减少计算量来优化 Render 的过程；
- 通过几种技巧来精细化渲染阶段的加载速度；
- 通过控制更新的时机与范围来最大化优化效果；
- 学习 React Profiler 的使用。

总的来说，性能优化没有银弹，作为技术人，需要内修于心（熟知底层原理），同时把对性能优化当作习惯，植入日常思考中去。
