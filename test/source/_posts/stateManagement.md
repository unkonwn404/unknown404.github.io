---
title: React状态管理最新小结
date: 2025-04-30 11:02:19
categories:
  - 技术学习
tags:
  - React
  - 状态管理
---

最近突然要从头搭一个 React 项目，构建自己项目的状态管理。对于平常用 umi+dva 一把梭的来说还真不太确定怎么搭会比较好。再加上随着时间变化，当初的新工具也成了老东西不再迭代，像 dva 就痛失了官方网站域名（hhh）。再加上调整一些 mobx 相关的开源项目踩了坑，所以还是决定要来梳理一番。

## mobx + mobx state tree

mobx 是一个非常典型的响应式状态管理工具，即数据可变。它存在着几个比较关键的概念：

- observable，包裹普通的 JavaScript 数据结构，将其转换为响应式数据，任何依赖它的地方都会在数据变化时自动更新
- action，用来修改状态的函数；如果涉及到异步动作，需要 then 内部的回调函数用 runInAction 或者 action.bound 包裹，或者直接用 flow 语法
- reaction，追踪 observable 并在监听数据变化时触发效果函数；when 和 autorun 类似

以下是 mobx 给出的示例。如果要获取和设置基本的状态值，可以将 store 作为 props 传入组件、利用 mobx-react 进行 store 连接

```js
import { observable, computed, action } from "mobx";

import TodoModel from "./TodoModel";

export default class TodoListModel {
  @observable todos = [];

  @computed
  get unfinishedTodoCount() {
    return this.todos.filter((todo) => !todo.finished).length;
  }

  @action
  addTodo(title) {
    this.todos.push(new TodoModel(title));
  }
}
```

它的特点是：

- 事件触发 action 的执行，通过 action 来修改 state
- state 更新后，computed Values 自动会根据依赖重新计算属性值
- state 更新后会触发 reactions，来响应这次状态变化的一些操作

mobx 虽然上手简单，但风格自由，如果没有统一团队的代码风格，可能会在 store 中看到各种各样的代码。因此也常用 mobx state tree 结合进行规范约束。

```js
import { types } from "mobx-state-tree";

const CounterModel = types
  .model("Counter", {
    count: types.number,
  })
  .actions((self) => ({
    increment() {
      self.count += 1;
    },
  }));

const counter = CounterModel.create({ count: 0 });
```

mobx state tree 特点：

- 必须定义模型结构
- 状态只能通过 actions 修改
- 支持 .snapshot()、.applySnapshot()、中间件拦截等高级特性

**注意点**：组件中使用的 mobx 变量是 observable 对象，直接传入 antd 组件是有可能出现错误的，需要用 toJS 转为 js 结构数据。

## Zustand

一个轻量级的状态管理库，不需要像 Redux 那样定义复杂的 Action、Reducer、Store 组合等模板代码，但仍具有单向数据流的特点。主要特点有：

- 极简 API：仅需掌握 create、set、get 三个核心方法：create 函数创建 store；set 函数用于修改状态；get 函数用于获取 store 内部的状态
- 灵活扩展：支持中间件生态

```js
// store定义
export const usePageStore = create((set) => ({
  state: {
    isLoading: false,
  },
  fetchData: async () => {
    set((state) => ({ state: { ...state.state, isLoading: true } }));
    try {
      const { data } = await getData({
        request_id: "12335",
        input: "qwdqwd",
      });
      set((state) => ({
        state: { ...state.state, isLoading: false, ...data },
      }));
    } catch (error) {
      set((state) => ({ state: { ...state.state, isLoading: false } }));
    }
  },
}));
// 组件使用
const { state, fetchData } = usePageStore();
```

## Redux

具有以下特点：

- 单一数据源。 redux 的 store 只有一个，所有的状态都放在 store 中，所有的 state 共同组成了一个树形结构。
- 不可变数据。state 是不可变的， 在 redux 中修改 state 的方式是 dispatch 一个 action，根据 action 的 payload 返回一个新的 state。
- 纯函数修改。 redux 通过 reducer 函数来修改状态，它接受前一次的 state 和 action，返回新的 state，只要传入相同的 state 和 action，一定会返回相同的结果。

### 异步数据处理

redux 没有规定如何处理异步数据流，通常是使用类似 redux-thunk、redux-saga 这些中间件来支持处理异步。以 redux-saga 为例，该中间件更适合中大型项目。redux-saga 提供了一些功能函数例如：put 用于触发 action；takeEvery 用于处理异步响应的规则，该函数表示每次触发 INCREMENT_ASYNC 动作时都执行 incrementAsync 函数；与之相对的 takeLatest 则是在短时间多次触发动作时，执行最后一次的触发

```js
// store/couter/saga.js
import { put, takeEvery, delay } from "redux-saga/effects";
import { INCREMENT_ASYNC } from "./types";
import { increment } from "./action";

function* incrementAsync() {
  yield delay(1000); // 延迟1秒
  yield put(increment());
}

export function* counterSaga() {
  yield takeEvery(INCREMENT_ASYNC, incrementAsync);
}
// store/index.js
import { createStore, combineReducers, applyMiddleware } from "redux";
import createSagaMiddleware from "redux-saga";
import { counterReducer } from "./counter/reducer.ts";
import { counterSaga } from "./counter/saga.ts";
// 创建 root reducer
const rootReducer = combineReducers({
  counter: counterReducer,
});
// 创建 store
const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));

// 运行 saga
sagaMiddleware.run(counterSaga);
```

### Redux Toolkit

Redux 存在非常多的模版语法，使用起来十分不方便。Redux Toolkit（简称 RTK）是 Redux 官方推荐的现代 Redux 开发方式，它简化了 Redux 的使用，避免样板代码（boilerplate），并内置了如异步处理、不可变状态等常见工具。

```js
// store/counter/counterSlice.js
import { createSlice,createAsyncThunk } from '@reduxjs/toolkit';
export const incrementAsync = createAsyncThunk('counter/fetchCount',async (amount: number) => {
  const response = await fetchCount(amount);
  return response.data;
});


const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: state => { state.value += 1 },
    decrement: state => { state.value -= 1 },
    addByAmount: (state, action) => {
      state.value += action.payload
    },
    extraReducers: builder => {
    builder
      .addCase(incrementAsync.pending, state => { state.status = 'loading' })
      .addCase(incrementAsync.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.value = action.payload
      })
      .addCase(incrementAsync.rejected, state => { state.status = 'failed' });
  }
  }
});

export const { increment, decrement, addByAmount } = counterSlice.actions;
export default counterSlice.reducer;

// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../counter/counterSlice';

const store = configureStore({
  reducer: {
    counter: counterReducer,
  }
});

export default store;
```

如上代码所示 RTK 使用 createSlice 创建 slice 并导出 reducer，并挂载到 configureStore() 的 reducer 对象上。最后将创建的 store 通过 provider 在入口文件中加载到全局即可。异步请求需要利用函数 createAsyncThunk，定义一个异步的 thunk action，该 action 可以处理异步逻辑并在请求开始、成功或失败时分发相应的 action。方法触发的时候会有三种状态：pending（进行中）、fulfilled（成功）、rejected（失败）。写好的 thunk action 可以通过 extraReducers 挂载在 slice。
在组件内部如果需要查看 store 的值、调用 store 的方法，可以用 react-redux 的 useSelector, useDispatch

```jsx
function App() {
  const count = useSelector((state: RootState) => state.counter.value);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    dispatch({ type: "getData" });
  }, []);
  return (
    <>
      <button onClick={() => dispatch({ type: "INCREMENT_ASYNC" })}>
        count is {count}
      </button>
    </>
  );
}
```

## 总结

| 特性        | Redux                                    | MobX                     | Zustand                             |
| ----------- | ---------------------------------------- | ------------------------ | ----------------------------------- |
| 响应式机制  | 手动更新、不可变数据                     | 自动追踪、响应式         | hooks + 代理自动响应                |
| 代码复杂度  | 高（需 action、reducer）                 | 中（较灵活）             | 低（直接修改状态）                  |
| 学习曲线    | 较陡峭                                   | 较缓和                   | 极低                                |
| 性能优化    | 需手动配置（如 memo、selector）          | 自动响应依赖             | 自动依赖追踪，轻量渲染              |
| 状态结构    | 单一 store，全局                         | 多 store，可嵌套         | 支持多 store，按需组合              |
| 中间件/插件 | 强大生态，Redux DevTools、Saga、Thunk 等 | 较少但够用               | 支持 DevTools，支持中间件扩展       |
| 使用场景    | 大型项目、多人协作、可预测状态流         | 复杂业务逻辑、响应式建模 | 中小项目、快速开发、现代 React 项目 |
| 主流程度    | **历史最广泛使用**                       | 一线企业较多采用         | **近年来非常流行，逐渐普及**        |

## 参考文献

（1）[React 状态管理？看这一篇就够了](https://juejin.cn/post/7138789672095842335)
