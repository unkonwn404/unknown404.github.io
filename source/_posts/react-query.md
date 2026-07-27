---
title: react-query状态管理
date: 2023-11-09 15:31:00
categories:
  - 技术学习
tags:
  - React
  - 状态管理
---

起因是在阅读[某 react 项目](https://github.com/alan2207/bulletproof-react)时看到作者提出的项目状态管理的规则，觉得很有意思；对于平常使用 redux 一把梭的人来说，他说的这个技术方案太过陌生，所以想随手记一下。

<!-- more -->

## 状态管理方针

以下是项目作者提出的状态管理的简要概述

### 组件状态

对于只有当前组件才用的状态可以直接用 react 的钩子函数

- useState
- useReducer

### 应用状态

应用状态指在交互时发生值的改变、以控制应用的状态的这种变量，例如弹出弹窗、提示语、夜间模式等。可以使用以下方式管理

- context
- redux
  以及其他看起来功能很类似的库

### 表格状态

填写表单时的数据管理，有专门的解决方案

- React Hook Form
- Formik
- React Final Form

### 服务端数据管理

从服务器请求得到的数据，有时需要存储起来方便后续修改等操作。可以使用以下方案

- react-query
- swr
- apollo client
- urql

本文这次只记录 react-query 的使用方法

## react-query

### 使用场景举例

一般来说，如果一个页面要展示请求内容，需要以下代码来实现

```JavaScript

function App() {
  const [data, updateData] = useState(null);
  const [isError, setError] = useState(false);
  const [isLoading, setLoading] = useState(false);

  useEffect(async () => {
    setError(false);
    setLoading(true);
    try {
      const data = await axios.get('/api/user');
      updateData(data);
    } catch(e) {
      setError(true);
    }
    setLoading(false);
  }, [])

  // 处理data
}
```

可以看到至少需要 3 个 state，存储数据的 data、请求加载态的 isLoading 和请求失败的 isError。如果页面涉及多个请求，这样的 state 设置还要重复好多次。
如果使用 react-query 实现，则代码如下：

```JavaScript

 import { useQuery } from 'react-query'

 function App() {
   const {data, isLoading, isError} = useQuery('userData', () => axios.get('/api/user'));

   if (isLoading) {
     return <div>loading</div>;
   }

   return (
     <ul>
       {data.map(user => <li key={user.id}>{user.name}</li>)}
     </ul>
   )
 }
```

可以看到可以省去中间态的 state 设置，除此之外 react-query 还可以实现这些功能：

- 多个组件请求同一个 query 时只发出一个请求
- 缓存数据失效/更新策略（判断缓存合适失效，失效后自动请求数据）
- 对失效数据垃圾清理

如何实现将在接下来的使用介绍里展开

### 全局配置

根据 react-query v4 的说明文档，可以在 App.tsx 文件做如下配置

```tsx
import { QueryClientProvider, ReactQueryProviderConfig } from 'react-query';

const queryConfig: ReactQueryProviderConfig = {
  /**
   * refetchOnWindowFocus 窗口获得焦点时重新获取数据
   * staleTime 过多久重新获取服务端数据
   * cacheTime 数据缓存时间 默认是 5 * 60 * 1000 5分钟
   */
  queries: {
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000,
    retry: 0
  },
};

ReactDOM.render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: queryConfig })}>
        <App />
    </QueryClientProvider>
    document.getElementById('root')
  );

```

QueryClient 是可以与缓存交互的实例，其他组件如果想要获取这个实例可以用 useQueryClient 函数实现。
QueryClient 实例可配置的参数包括：
{% note info %}
**staleTime** 重新获取数据的时间间隔 默认 0
**cacheTime** 数据缓存时间
**retry** 失败重试次数 默认 3 次
**refetchOnWindowFocus** 窗口重新获得焦点时重新获取数据 默认 false
**refetchOnReconnect** 网络重新链接
**refetchOnMount** 实例重新挂载
**enabled** 如果为“false”的化，“useQuery”不会触发
{% endnote %}

这些参数也可以在钩子函数里配置

react-query 常用的钩子函数有两个：useQuery 和 useMutation，用于应对常见的数据操作

### useQuery（数据查询）

#### 书写规范

```js
import { useQuery } from "react-query";
// v3写法
function App() {
  const info = useQuery("todos", fetchTodoList);
}
// v4+写法
function App() {
  const info = useQuery({ queryKey: ["todos"], queryFn: fetchTodoList });
}
```

#### 入参出参

queryKey 可以都是字符串数组，也可以是 object 元素
queryFn 可以自动接收到 queryKey 的值，通常会返回 promise 值；如果考虑请求出错、返回 rejected 状态的情况的话，queryFn 的内部需要考虑做抛出错误的处理，以 fetch 请求为例：

```js
useQuery({
  queryKey: ["todos", todoId],
  queryFn: async () => {
    const response = await fetch("/todos/" + todoId);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  },
});
```

当 queryKey 的内容发生变动时 queryFn 的内容就会自动执行
useQuery 返回的内容包括：
{% note info %}
**isLoading**：请求是否在加载数据
**isError**：请求是否报错
**isFetching**：是否有一个挂起的请求，适用于无限滚动
**data**：请求返回数据
{% endnote %}

### useMutation（数据增删改）

该函数钩子通常用于有副作用的场景。

#### 书写规范

```js
import { useQuery } from "react-query";
// v3写法
function App() {
  const [mutate] = useMutation((newTodo) => {
    return axios.post("/todos", newTodo);
  });
}
// v4+写法
function App() {
  const mutation = useMutation({
    mutationFn: (newTodo) => {
      return axios.post("/todos", newTodo);
    },
  });
}
```

#### 入参出参

常用的入参包括：
{% note info %}
**mutationFn**：用于处理请求的函数，返回 promise 对象
**onMutate**：请求触发、将要执行前触发的回调函数
**onError**：请求失败时触发的回调函数
**onSuccess**：请求失败时触发的回调函数
**onSettled**：请求完成时触发的回调函数，不管成功与否；执行时机在 onSuccess 和 onError 之后
{% endnote %}
除此以外也可以配置请求操作相关的一些配置，例如重试、重试延迟等
返回的内容主要包括：
{% note info %}
**mutate**：在代码中运行突变的操作，接受的入参包括 mutationFn 的入参和 onSuccess、onError、onSettled
**isPending**：请求是否在加载数据
**isError**：请求是否报错
{% endnote %}
涉及增删改的操作可以使用乐观更新来减少等待加载的时间，让用户体验更好。所谓乐观更新、就是前端默认后端接口请求一定会成功、提前将修改结果展示出来。
以下面这段代码为例：

```js
export const useDeleteDiscussion = ({ config }: UseDeleteDiscussionOptions = {}) => {
  const { addNotification } = useNotificationStore();

  return useMutation({
    onMutate: async (deletedDiscussion) => {
      await queryClient.cancelQueries('discussions');

      const previousDiscussions = queryClient.getQueryData<Discussion[]>('discussions');

      queryClient.setQueryData(
        'discussions',
        previousDiscussions?.filter(
          (discussion) => discussion.id !== deletedDiscussion.discussionId
        )
      );

      return { previousDiscussions };
    },
    onError: (_, __, context: any) => {
      if (context?.previousDiscussions) {
        queryClient.setQueryData('discussions', context.previousDiscussions);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries('discussions');
      addNotification({
        type: 'success',
        title: 'Discussion Deleted',
      });
    },
    ...config,
    mutationFn: ({ discussionId }: { discussionId: string }) => {
        return axios.delete(`/discussions/${discussionId}`);
    }
  });
};
```
这段代码的大致逻辑是：
- 删除请求触发onMutate回调，为了乐观更新首先取消已有的讨论的请求（应该是为了应对配置了更新策略的queryClient）；从缓存中取出已存储的讨论列表、滤除删除的目标讨论、利用setQueryData将结果存入缓存
- 删除请求成功时，用invalidateQueries清除缓存、重新拉取数据
- 删除请求失败时，缓存重新存入上一次缓存即未删除的内容，相当于回退

## 参考资料

（1）[react-query](https://juejin.cn/post/6882669076540456967)
（2）[react-query手把手教程](https://juejin.cn/column/7105422212789714980)
