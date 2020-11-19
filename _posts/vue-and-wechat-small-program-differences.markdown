---
layout:     post
title:      "Vue 和微信小程序的区别、比较"
subtitle:   "Vue and WeChat small program differences"
date:       2018-08-07
author:     "Mr.厉害"
header-img: "img/post-bg/2018-08-11-02.jpg"
header-mask: 0.3
catalog:    true
tags:
  - Vue
  - 微信
  - 小程序
---

写了vue项目和小程序，发现二者有许多相同之处，在此总结一下二者共同点和区别。

### 一、生命周期

#### Vue 生命周期

![Vue生命周期](/img/in-post/vue-and-wechat-small-program-differences/vue-life-cycle.png)

#### 小程序生命周期

![小程序生命周期](/img/in-post/vue-and-wechat-small-program-differences/wechat-small-program-life-cycle.png)

相比之下，小程序的钩子函数要简单得多。

vue 的钩子函数在跳转新页面时，钩子函数都会触发，但是小程序的钩子函数，页面不同的跳转方式，触发的钩子并不一样。

**onLoad：页面加载**

一个页面只会调用一次，可以在 onLoad 中获取打开当前页面所调用的 query 参数。

**onShow：页面显示**

每次打开页面都会调用一次。

**onReady：页面初次渲染完成**

一个页面只会调用一次，代表页面已经准备妥当，可以和视图层进行交互。

对界面的设置如 wx.setNavigationBarTitle 请在 onReady 之后设置。详见生命周期。

**onHide：页面隐藏**

当 navigationTo 或底部 tab 切换时调用。

**onUnload：页面卸载**

当 redirectTo 或 navigationBack 的时候调用。

***数据请求***

在页面加载请求数据时，两者钩子的使用有些类似，vue 一般会在 created 或者 mounted 中请求数据，而在小程序中，会在 onLoad 或者 onShow 中请求数据。

### 二、数据绑定

vue: vue 动态绑定一个变量的值为元素的某个属性的时候，会在变量前加上冒号:，如：

```js
<img :src="imgSrc" />
```

小程序：绑定某个变量的值为元素属性时，会用两个大括号括起来，如果不加括号，会被认为是字符串。如：

```js
<image src="{ {imgSrc} }"></image>
```

### 三、列表渲染

直接贴代码，两者还是有些相似：

vue:

```js
<ul id="example-1">
  <li v-for="item in items">
    { {item.message} }
  </li>

</ul>

let example1 = nex Vue({
  el: '#example-1',
  data: {
    items: [
      { message: 'Foo' },
      { message: 'Bar' }
    ]
  }
})
```

小程序：

```js
Page({
  data: [
    items: [
      { message: 'Foo' },
      { message: 'Bar' }
    ]
  ]
})

<text wx:for="{ {items} }">{ {item} }</text>
```

### 四、显示与隐藏元素

vue 中，使用 v-if 和 v-show 控制元素的显示和隐藏。

小程序中，使用 wx-if 和 hidden 控制元素的显示和隐藏。

### 五、事件处理

vue：使用 v-on:event 绑定事件，或者使用 @event 绑定事件，例如：

```js
<button v-on:click="counter += 1">Add 1</button>

<button v-on:click.stop="counter += 1">Add 1</button> // 阻止事件冒泡
```

小程序中，全用 bindtap(bind+event)，或者 catchtap(catch+event)绑定事件，例如：

```js
<button bindtap="noWork">明天不上班</button>

<button catchtap="noWork">明天不上班</button> // 阻止事件冒泡
```

### 六、数据双向绑定

1. 设置值

在 vue 中， 只需要在表单元素上加上 v-model ，然后再绑定 data 中对应的值，当表单元素内容发生变化时，data 中对应的值也会相应改变，这是 vue 非常 nice 的一点。

```js
<div id="app">
  <input v-model="reason" placeholder="填写理由" class="reason" />
</div>

new Vue({
  el: '#app',
  data: {
    reason: ''
  }
})
```

但是在小程序中，却没有这个功能。那怎么办呢？

当表单内容发生变化时，会触发表单元素上绑定的方法，然后在该方法中，通过 this.setData({ key: value }) 来将表单上的值赋值给 data 中的对应值。

下面是代码，可以感受一下：

```js
<input bindinput="bindReason" placeholder="填写理由" class="reason" value="{ { reason } }" name="reason" />

Page({
  data: {
    reason: ''
  },
  bindReason(e) {
    this.setData({
      reason: e.detail.value
    })
  }
})
```

当页面表单元素很多的时候，更改值就是一件体力活了。和小程序一比较，vue 的 v-model 简直爽的不要不要的。

2. 取值

vue 中，通过 this.reason 取值

小程序中，通过 this.data.reason 取值

### 七、绑定事件传参

在 vue 中，绑定事件传参挺简单，只需要在出发时间的方法中，把需要传递的数据作为形参传入就可以了，例如：

```js
<button @click="say('明天不上班')"></button>

new Vue({
  el: '#app',
  methods: {
    say(arg) {
      console.log(arg);
    }
  }
})
```

在小程序中，不能直接在绑定事件的方法中传入参数，需要将参数作为属性值，绑定到元素的 data- 属性上，然后在方法中，通过 e.currentTarget.dataset.* 的方法获取，从而完成参数的传递，很麻烦有没有...

```js
<view class="tr" bindtap="toApprove" data-id="{ { item.id } }"></view>

Page({
  data: {
    reason: ''
  },
  toApprove(e) {
    let id = e.currentTarget.dataset.id;
  }
})
```

### 八、父子组件通信

#### 1. 子组件的使用

在 vue 中，不需要：

1. 编写子组件
2. 在需要使用的父组件中通过 import 引入
3. 在 vue 的 components 中注册
4. 在模板中使用

```js
// 子组件 bar.vue
<template>
  <div class="search-box">
    <div @click="say" :title="title" class="icon-dismiss"></div>
  </div>
</template>

<script>
export default{
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  methods: {
    say() {
      console.log("明天不上班");
      this.$emit('HelloWorld');
    }
  }
}
</script>

// 父组件
<template>
  <div class="container">
    <bar :title="titel" @helloWorld="helloWorld" ></bar>
  </div>
</template>

<script>
  import Bar from './bar.vue';
  export default {
    data: {
      title: "我是标题"
    },
    methods: {
      helloWorld() {
        console.log('我接收到子组件传递的事件了')
      }
    },
    components: {
      Bar
    }
  }
</script>
```

在小程序中，需要：

1. 编写子组件
2. 在子组件的 json 文件中，将该文件声明为组件

```js
{
  "component": true
}
```

3. 在需要引入的父组件的 json 文件中，在 usingComponents 填写引入组件的组件名以及路路径

```js
"usingComponents": {
  "tab-bar": "../../components/tabBar/tabBar"
}
```

4. 在父组件中，直接引入即可

```js
<tab-bar currentpage="index"></tab-bar>
```

具体代码：

```js
// 子组件
<!--components/tabBar/tabBar.wxml-->
<view class='tabbar-wrapper'>
  <view class='left-bar { { currentpage === "index" ? "active": "" } }' bindtap='jumpToIndex'>
    <text class='iconfont icon-shouye'></text>

    <view>首页</view>

  </view>

  <view class='right-bar { { currentpage === "setting" ? "active": "" } }' bindtap='jumpToSetting'>
    <text class='iconfont icon-shezhi'></text>

    <view>设置</view>

  </view>

</view>
```

#### 2. 父子组件间通信

**在 vue 中**

父组件向子组件传递数据，只需要在子组件通过 v-bind 传入一个值，在子组件中，通过 props 接收，即可完成数据的传递，示例：

```js
// 父组件 foo.vue
<template>
  <div class="container">
    <bar :title="title"></bar> 
  </div>
</template>

<script>
  import Bar from './bar.vue'

  export default {
    data: {
      title: "我是标题"
    },
    components: {
      Bar,
    }
  }
</script>

// 子组件bar.vue
<template>
  <div class="search-box">
    <div :title="title"></div> 
  </div>
</template>

<script>
  export default {
    props: {
      title: {
        type: String,
        default: ''
      }
    }
  }
</script>
```

子组件和父组件通信可以通过 this.$emit 将方法和数据传递给父组件。

**在小程序中**

父组件向子组件通信和vue类似，但是小程序没有通过 v-bind ，而是直接将值赋值给一个变量，如下：

```js
<tab-bar currentpage="index"></tab-bar>
```

此处，"index" 就是向子组件传递的值。

在子组件 properties 中，接收传递的值。

```js
properties: {
  // 弹窗标题
  currentpage: {    // 属性名
    type: String,   // 类型（必填），目前接受的类型包括：String，Number，Boolean，Object， Array，null（表示任意类型）
    value: 'index', // 属性初始值（可选），如果未指定则会根据类型选择一个
  }
}
```

子组件向父组件通讯和 vue 也很类似，代码如下：

```js
// 子组件中
methods: {
  // 传递给父组件
  cancelBut: function(e) {
    let that = this;
    let myEventDetail = { pickerShow: false, type: 'cancel' } // detail 对象，提供给时间监听函数
    this.triggerEvent('myevent', myEventDetail) // myevent 自定义名称事件，父组件中使用
  }
}

// 父组件中
<bar bind:myevent="toggleToast"></bar>

// 获取子组件信息
toggleToast(e) {
  console.log(e.detail);
}
```

#### 3. 如果父组件想调用子组件的方法

vue 会给子组件添加一个 ref 属性，通过 this.$refs.ref 的值便可以获取到该子组件，然后便可以调用子组件中的任意方法，例如：

```js
// 子组件
<bar ref="bar"></bar>

// 父组件
this.$ref.bar.子组件的方法
```

小程序是给子组件添加 id 或者 class ，然后通过 this.selectComponent 找到子组件，然后再调用子组件的方法，示例：

```js
// 子组件
<bar id="bar"></bar>

// 父组件
this.selectComponent('#id').syaHello()
````

小程序和 vue 在这点上太相似了，有木有...

> 注：双花括号{}会存在解析不出来的问题，所以涉及到的地方都是中间加了空格的。
