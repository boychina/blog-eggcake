---
title: "React-grid-layout 一个支持拖拽的栅格布局库"
excerpt: "React-grid-layout 一个可以支持拖拽、改变大小的栅格布局库，完美支持React"
description: "React-grid-layout 一个可以支持拖拽、改变大小的栅格布局库，完美支持React"
keyword: "ReactGridLayout,react,栅格,拖拽"
tag: "react"
date: "2020-09-27 12:00:00"
coverImage: "/assets/blog/cover/2020-09-27-react-grid-layout.gif"
author:
  name: 蛋烘糕
  picture: "/assets/blog/authors/zhaohuan.jpg"
ogImage:
  url: "/assets/blog/cover/2020-09-27-react-grid-layout.gif"
---

## 演示版

1. [Showcase](https://strml.github.io/react-grid-layout/examples/0-showcase.html)
1. [Basic](https://strml.github.io/react-grid-layout/examples/1-basic.html)
1. [No Dragging/Resizing (Layout Only)](https://strml.github.io/react-grid-layout/examples/2-no-dragging.html)
1. [Messy Layout Autocorrect](https://strml.github.io/react-grid-layout/examples/3-messy.html)
1. [Layout Defined on Children](https://strml.github.io/react-grid-layout/examples/4-grid-property.html)
1. [Static Elements](https://strml.github.io/react-grid-layout/examples/5-static-elements.html)
1. [Adding/Removing Elements](https://strml.github.io/react-grid-layout/examples/6-dynamic-add-remove.html)
1. [Saving Layout to LocalStorage](https://strml.github.io/react-grid-layout/examples/7-localstorage.html)
1. [Saving a Responsive Layout to LocalStorage](https://strml.github.io/react-grid-layout/examples/8-localstorage-responsive.html)
1. [Minimum and Maximum Width/Height](https://strml.github.io/react-grid-layout/examples/9-min-max-wh.html)
1. [Dynamic Minimum and Maximum Width/Height](https://strml.github.io/react-grid-layout/examples/10-dynamic-min-max-wh.html)
1. [No Vertical Compacting (Free Movement)](https://strml.github.io/react-grid-layout/examples/11-no-vertical-compact.html)
1. [Prevent Collision](https://strml.github.io/react-grid-layout/examples/12-prevent-collision.html)
1. [Error Case](https://strml.github.io/react-grid-layout/examples/13-error-case.html)
1. [Toolbox](https://strml.github.io/react-grid-layout/examples/14-toolbox.html)
1. [Drag From Outside](https://strml.github.io/react-grid-layout/examples/15-drag-from-outside.html)
1. [Bounded Layout](https://strml.github.io/react-grid-layout/examples/16-bounded.html)
1. [Resizable Handles](https://strml.github.io/react-grid-layout/examples/17-resizable-handles.html)

## 特征

- 100％React-没有 jQuery
- 与服务器渲染的应用程序兼容
- 可拖动的小部件
- 可调整大小的小部件
- 静态小部件
- 可配置包装：水平，垂直或不固定
- 边界检查以进行拖动和调整大小
- 可以在不重建网格的情况下添加或删除小部件
- 布局可以序列化和还原
- 响应断点
- 每个响应断点单独的布局
- 使用 CSS 变换放置的网格项目

## 安装

使用[npm](https://www.npmjs.com/)安装 React-Grid-Layout[软件包](https://www.npmjs.org/package/react-grid-layout)：

```shell
npm install react-grid-layout
```

在您的应用程序中添加以下样式表：

```javascript
/node_modules/acert -
  grid -
  layout / css / styles.css / node_modules / react -
  resizable / css / styles.css;
```

## 使用

像使用任何其他组件一样使用 ReactGridLayout。下面的示例将生成一个包含以下三个项目的网格：：

- 用户将无法拖动或调整项目的大小`a`
- 项将限制为 2 个网格块的最小宽度和 4 个网格块的最大宽度`b`
- 用户将能够自由拖动和调整项目的大小`c`

```javascript
import GridLayout from "react-grid-layout";

class MyFirstGrid extends React.Component {
  render() {
    // layout is an array of objects, see the demo for more complete usage
    const layout = [
      { i: "a", x: 0, y: 0, w: 1, h: 2, static: true },
      { i: "b", x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 },
      { i: "c", x: 4, y: 0, w: 1, h: 2 },
    ];
    return (
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={30}
        width={1200}
      >
        <div key="a">a</div>
        <div key="b">b</div>
        <div key="c">c</div>
      </GridLayout>
    );
  }
}
```

您还可以选择直接在子项上设置布局属性：

```javascript
import GridLayout from "react-grid-layout";

class MyFirstGrid extends React.Component {
  render() {
    return (
      <GridLayout className="layout" cols={12} rowHeight={30} width={1200}>
        <div key="a" data-grid={{ x: 0, y: 0, w: 1, h: 2, static: true }}>
          a
        </div>
        <div key="b" data-grid={{ x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 }}>
          b
        </div>
        <div key="c" data-grid={{ x: 4, y: 0, w: 1, h: 2 }}>
          c
        </div>
      </GridLayout>
    );
  }
}
```

### 在没有 Browserify / Webpack 的情况下使用

在一个模块可用`<script>`标签包含[在这里](https://github.com/STRML/react-grid-layout/blob/master/dist/react-grid-layout.min.js)。它使用 UMD 填充程序并排除`React`，因此必须通过 RequireJS 或在`<script>`中使用`React`、`window.React`。

### 响应式用法

要使 RGL 响应，请使用`<ResponsiveReactGridLayout>`元素：

```javascript
import { Responsive as ResponsiveGridLayout } from "react-grid-layout";

class MyResponsiveGrid extends React.Component {
  render() {
    // {lg: layout1, md: layout2, ...}
    const layouts = getLayoutsFromSomewhere();
    return (
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      >
        <div key="1">1</div>
        <div key="2">2</div>
        <div key="3">3</div>
      </ResponsiveGridLayout>
    );
  }
}
```

在响应模式下，您应该通过`layouts`属性提供至少一个断点。
使用时`layouts`，最好提供尽可能多的断点，尤其是最大的断点。如果提供了最大的值，RGL 将尝试对其余的值进行插值。
您还需要提供`width`，`<ResponsiveReactGridLayout>`建议您`WidthProvider`按照以下说明使用 HOC 。
可以通过`data-grid`属性在各个项目上提供默认映射，以便在布局插值中将它们考虑在内。

### 提供网格宽度

双方`<ResponsiveReactGridLayout>`并`<ReactGridLayout>`采取`width`来计算拖动事件位置。在简单的情况下，HOC`WidthProvider`可用于在初始化和窗口调整大小事件时自动确定宽度。
` <ResponsiveReactGridLayout>``<ReactGridLayout>``width``WidthProvider `;

```javascript
import { Responsive, WidthProvider } from "react-grid-layout";

const ResponsiveGridLayout = WidthProvider(Responsive);

class MyResponsiveGrid extends React.Component {
  render() {
    // {lg: layout1, md: layout2, ...}
    var layouts = getLayoutsFromSomewhere();
    return (
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      >
        <div key="1">1</div>
        <div key="2">2</div>
        <div key="3">3</div>
      </ResponsiveGridLayout>
    );
  }
}
```

`WidthProvider`如果需要更复杂的逻辑，这使您可以轻松地替换为自己的提供方 HOC。
`WidthProvider`接受一个属性：`measureBeforeMount`。如果为`true`，`WidthProvider`将在安装儿童之前测量容器的宽度。如果您想完全消除应用程序/组件安装上的任何调整大小的动画，请使用此选项。
有更复杂的布局吗？`WidthProvider` [非常简单](https://github.com/STRML/react-grid-layout/blob/master/lib/components/WidthProvider.jsx)，仅侦听窗口`'resize'`事件。如果您需要更多功能和灵活性，请尝试使用 [SizeMe React HOC](https://github.com/ctrlplusb/react-sizeme)作为 WidthProvider 的替代方法。

### 网格布局属性

RGL 支持以下属性（请参阅源代码中的最后一个字）：

```javascript
//
// Basic props
//

// This allows setting the initial width on the server side.
// This is required unless using the HOC <WidthProvider> or similar
// 这允许在服务器端设置初始宽度。
// 这是必需的，除非使用HOC <WidthProvider>或类似的
width: number,

// If true, the container height swells and contracts to fit contents
// 如果为真，容器高度膨胀和收缩，以适应内容
autoSize: ?boolean = true,

// Number of columns in this layout.
// 此布局中的列数。
cols: ?number = 12,

// A CSS selector for tags that will not be draggable.
// For example: draggableCancel:'.MyNonDraggableAreaClassName'
// If you forget the leading . it will not work.
// 不可拖动标签的CSS选择器。
// 例如：draggableCancel：'.MyNonDraggableAreaClassName'
// 如果忘记了leading。这个属性不起作用。
draggableCancel: ?string = '',

// A CSS selector for tags that will act as the draggable handle.
// For example: draggableHandle:'.MyDragHandleClassName'
// If you forget the leading . it will not work.
// 标记的CSS选择器，将用作可拖动句柄。
// 例如：draggableHandle：'.MyDragHandleClassName'
// 如果忘记了leading。这个属性不起作用。
draggableHandle: ?string = '',

// If true, the layout will compact vertically
//如果为true，则布局将沿垂直方向
verticalCompact: ?boolean = true,

// Compaction type.
// 压缩类型
compactType: ?('vertical' | 'horizontal') = 'vertical';

// Layout is an array of object with the format:
// {x: number, y: number, w: number, h: number}
// The index into the layout must match the key used on each item component.
// If you choose to use custom keys, you can specify that key in the layout
// array objects like so:
// {i: string, x: number, y: number, w: number, h: number}
// 布局是一个对象数组，其格式为：
// {x：数字，y：数字，w：数字，h：数字}
// 布局索引必须与每个项目组件上使用的键匹配。
// 如果选择使用自定义键，则可以在布局
// 数组对象中指定该键，例如：// {i：字符串，x：数字，y：数字，w：数字，h：数字}
// 如果未提供，则在子级上使用数据网格属性
layout: ?array = null, // If not provided, use data-grid props on children

// Margin between items [x, y] in px.
// 像素中[x，y]之间的边距。
margin: ?[number, number] = [10, 10],

// Padding inside the container [x, y] in px
containerPadding: ?[number, number] = margin,

// Rows have a static height, but you can change this based on breakpoints
// if you like.
// 行具有静态高度，但您可以根据需要更改断点
rowHeight: ?number = 150,

// Configuration of a dropping element. Dropping element is a "virtual" element
// which appears when you drag over some element from outside.
// It can be changed by passing specific parameters:
//  i - id of an element
//  w - width of an element
//  h - height of an element
// 放置元素的配置。放置元素是一个“虚拟”元素，当您从外部拖动某个元素时出现。
// 可以通过传递特定的参数来更改它：
droppingItem?: { i: string, w: number, h: number }

//
// Flags
//
isDraggable: ?boolean = true,
isResizable: ?boolean = true,
isBounded: ?boolean = false,
// Uses CSS3 translate() instead of position top/left.
// This makes about 6x faster paint performance
// 使用CSS3 translate（）代替位置top / left。
// 可以使绘画性能提高大约6倍
useCSSTransforms: ?boolean = true,
// If parent DOM node of ResponsiveReactGridLayout or ReactGridLayout has "transform: scale(n)" css property,
// we should set scale coefficient to avoid render artefacts while dragging.
// 如果ResponsiveReactGridLayout或ReactGridLayout的父DOM节点具有“ transform：scale（n）” css属性，
// 我们应该设置比例系数以避免拖动时的渲染假象。
transformScale: ?number = 1,

// If true, grid items won't change position when being
// dragged over.
// 如果为true，则将网格项拖动到覆盖其他网格时不会改变位置
preventCollision: ?boolean = false;

// If true, droppable elements (with `draggable={true}` attribute)
// can be dropped on the grid. It triggers "onDrop" callback
// with position and event object as parameters.
// It can be useful for dropping an element in a specific position
//
// NOTE: In case of using Firefox you should add
// `onDragStart={e => e.dataTransfer.setData('text/plain', '')}` attribute
// along with `draggable={true}` otherwise this feature will work incorrect.
// onDragStart attribute is required for Firefox for a dragging initialization
// @see https://bugzilla.mozilla.org/show_bug.cgi?id=568313
//如果为true，则可放置元素（具有`draggable = {true}`属性）可以放在网格上。它使用位置和事件对象作为参数触发 “ onDrop”回调。对于将元素放在特定位置很有用
//
//注意：如果使用Firefox，则应添加
// onDragStart = {e => e.dataTransfer.setData（'text / plain'，' '）}`属性
// 和`draggable = {true}`一起使用，否则此功能将无法正常使用。
// Firefox需要onDragStart属性来进行拖动初始化
// @see https://bugzilla.mozilla.org/show_bug.cgi?id=568313
isDroppable: ?boolean = false
// Defines which resize handles should be rendered
// Allows for any combination of:
// 's' - South handle (bottom-center)
// 'w' - West handle (left-center)
// 'e' - East handle (right-center)
// 'n' - North handle (top-center)
// 'sw' - Southwest handle (bottom-left)
// 'nw' - Northwest handle (top-left)
// 'se' - Southeast handle (bottom-right)
// 'ne' - Northeast handle (top-right)
// 定义应呈现的调整大小手柄，允许以下任意组合：
resizeHandles: ?Array<'s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'> = ['se']
// Custom component for resize handles
// 用于调整大小的自定义组件处理
resizeHandle?: ReactElement<any> | ((resizeHandleAxis: ResizeHandleAxis) => ReactElement<any>)

//
// Callbacks
//

// Callback so you can save the layout.
// Calls back with (currentLayout) after every drag or resize stop.
// 保存布局的回调。
// 每次停止拖动或调整大小后，使用（currentLayout）进行回调。
onLayoutChange: (layout: Layout) => void,

//
// All callbacks below have signature (layout, oldItem, newItem, placeholder, e, element).
// 'start' and 'stop' callbacks pass `undefined` for 'placeholder'.
//
// 下面的所有回调都具有签名（layout，oldItem，newItem，placeholder，e，element）。
// “开始”和“停止”回调传递“占位符”的“未定义”。
type ItemCallback = (layout: Layout, oldItem: LayoutItem, newItem: LayoutItem,
                     placeholder: LayoutItem, e: MouseEvent, element: HTMLElement) => void;

// Calls when drag starts.
// 拖动开始时调用
onDragStart: ItemCallback,
// Calls on each drag movement.
// 每次拖动动作都调用。
onDrag: ItemCallback,
// Calls when drag is complete.
// 拖动完成后调用。
onDragStop: ItemCallback,
// Calls when resize starts.
// 发生尺寸调整移动时调用。
onResizeStart: ItemCallback,
// Calls when resize movement happens.
// 发生尺寸调整移动时调用。
onResize: ItemCallback,
// Calls when resize is complete.
// 调整大小后调用。
onResizeStop: ItemCallback,
// Calls when an element has been dropped into the grid from outside.
// 当元素从外部放入网格时调用。
onDrop: (layout: Layout, item: ?LayoutItem, e: Event) => void

// Ref for getting a reference for the grid's wrapping div.
// You can use this instead of a regular ref and the deprecated `ReactDOM.findDOMNode()`` function.
// Ref，以获得有关网格包装div的参考。
// 您可以使用它代替常规引用和不推荐使用的`ReactDOM.findDOMNode（）``函数。
innerRef: ?React.Ref<"div">
```

### 响应式网格布局属性

可以使用响应式网格布局。它支持上述所有属性，除了`layout`。新的属性和更改是：

```javascript
// {name: pxVal}, e.g. {lg: 1200, md: 996, sm: 768, xs: 480}
// Breakpoint names are arbitrary but must match in the cols and layouts objects.
// {name：pxVal}，例如{lg：1200，md：996，sm：768，xs：480}
// 断点名称是任意的，但必须在cols和layouts对象中匹配。
breakpoints: ?Object = {lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0},

// # of cols. This is a breakpoint -> cols map, e.g. {lg: 12, md: 10, ...}
// 列数。这是一个断点- >的cols映射，例如{LG：12，MD：10，...}
cols: ?Object = {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2},


// margin (in pixels). Can be specified either as horizontal and vertical margin, e.g. `[10, 10]` or as a breakpoint -> margin map, e.g. `{lg: [10, 10], md: [10, 10], ...}.
// 边距（以像素为单位）。可以指定为水平和垂直边距，例如`[10，10]`或断点->边距图，例如`{lg：[10，10]，md：[10，10]，...} 。
margin: [number, number] | {[breakpoint: $Keys<breakpoints>]: [number, number]}


// containerPadding (in pixels). Can be specified either as horizontal and vertical padding, e.g. `[10, 10]` or as a breakpoint -> containerPadding map, e.g. `{lg: [10, 10], md: [10, 10], ...}.
// containerPadding（以像素为单位）。可以指定为水平和垂直填充，例如`[10，10]`，也可以指定为断点-> containerPadding映射，例如`{lg：[10，10]，md：[10，10]，...} 。
containerPadding: [number, number] | {[breakpoint: $Keys<breakpoints>]: [number, number]}


// layouts is an object mapping breakpoints to layouts.
// e.g. {lg: Layout, md: Layout, ...}
// layouts是将断点映射到布局的对象。
// 例如{lg：布局，md：布局，...}
layouts: {[key: $Keys<breakpoints>]: Layout}

//
// Callbacks
//

// Calls back with breakpoint and new # cols
//使用断点和新的＃cols
onBreakpointChange: (newBreakpoint: string, newCols: number) => void,

// Callback so you can save the layout.
// AllLayouts are keyed by breakpoint.
// 回调，以便您保存布局。
// AllLayouts由断点锁定。
onLayoutChange: (currentLayout: Layout, allLayouts: {[key: $Keys<breakpoints>]: Layout}) => void,

// Callback when the width changes, so you can modify the layout as needed.
// 宽度变化时回调，因此您可以根据需要修改布局。
onWidthChange: (containerWidth: number, margin: [number, number], cols: number, containerPadding: [number, number]) => void;
```

### 网格项目属性

RGL 在网格项目或布局项目上支持以下属性。初始化网格时，构建一个布局数组（如上述第一个示例中所示），或将此对象作为`data-grid`属性附加到每个子元素中（如第二个示例中所示）。
请注意，如果提供的网格项目不完整（缺少之一`x, y, w, or h`），则会引发错误，因此您可以更正布局。
如果没有为网格项目提供属性，则将生成一个宽度和高度为的属性`1`。
您可以为每个尺寸设置最小值和最大值。这是为了调整大小；如果禁用了调整大小，那么它当然不会起作用。如果最小和最大重叠不正确，或者初始尺寸超出范围，则会引发错误。
`<GridItem>`直接定义的任何属性都将优先于全局设置的选项。例如，如果布局具有属性`isDraggable: false`，但是网格项目具有 prop `isDraggable: true`，则即使标记了项目，该项目也可以拖动`static: true`。

```javascript
{

  // A string corresponding to the component key
  // 对应于组件键
  i: string,

  // These are all in grid units, not pixels
  // 这些全部以网格为单位，而不是像素
  x: number,
  y: number,
  w: number,
  h: number,
  minW: ?number = 0,
  maxW: ?number = Infinity,
  minH: ?number = 0,
  maxH: ?number = Infinity,

  // If true, equal to `isDraggable: false, isResizable: false`.
  // 如果为true，则等于`isDraggable：false，isResizable：false`。
  static: ?boolean = false,
  // If false, will not be draggable. Overrides `static`.
  // 如果为false，将不可拖动。覆盖“静态”。
  isDraggable: ?boolean = true,
  // If false, will not be resizable. Overrides `static`.
  // 如果为false，将无法调整大小。覆盖“静态”。
  isResizable: ?boolean = true,
  // By default, a handle is only shown on the bottom-right (southeast) corner.
  // Note that resizing from the top or left is generally not intuitive.
  // 默认情况下，手柄仅显示在右下角（东南）。
  // 请注意，从顶部或左侧调整大小通常不直观。
  resizeHandles?: ?Array<'s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'> = ['se']
  // If true and draggable, item will be moved only within grid.
  // 如果为true和可拖动，则仅在网格内移动项目。
  isBounded: ?boolean = false
}
```

###

### 性能

`<ReactGridLayout>`具有[优化的`shouldComponentUpdate`实现](https://github.com/STRML/react-grid-layout/blob/master/lib/ReactGridLayout.jsx)，但是它依赖于用户保存`children`数组：

```javascript
// lib/ReactGridLayout.jsx
// ...
shouldComponentUpdate(nextProps: Props, nextState: State) {
  return (
    // NOTE: this is almost always unequal. Therefore the only way to get better performance
    // from SCU is if the user intentionally memoizes children. If they do, and they can
    // handle changes properly, performance will increase.
    // 注意：这几乎总是不平等的。因此从SCU获得更好的性能的唯一方法是
    // 如果用户故意记住children，如果他们这样做，并且他们可以正确地处理更改，则性能将会提高。
    this.props.children !== nextProps.children ||
    !fastRGLPropsEqual(this.props, nextProps, isEqual) ||
    !isEqual(this.state.activeDrag, nextState.activeDrag)
  );
}
// ...
```

如果在子组件中使用 memoize，则可以利用它，获得更好的执行效果。例如：

```javascript
function MyGrid(props) {
  const children = React.useMemo(() => {
    return new Array(props.count).fill(undefined).map((val, idx) => {
      return <div key={idx} data-grid={{ x: idx, y: 1, w: 1, h: 1 }} />;
    });
  }, [props.count]);
  return <ReactGridLayout cols={12}>{children}</ReactGridLayout>;
}
```
