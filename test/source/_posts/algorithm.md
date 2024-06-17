---
title: 算法与数据结构
date: 2023-03-02 17:38:44
categories:
  - 前端基础
tags:
  - 算法
---

## 数据结构

### 字符串

#### 字符串相加（大数相加）

解题思路：按数学加法的思路，需维护进位符 flag，从个位开始，每次将两个字符串的个位和 flag 相加如果结果有进位则将进位符 flag 设为 1，没有则置 0，进入下一位的运算。如此循环，直到遍历完所有位数

```js
/**
 * @param {string} num1
 * @param {string} num2
 * @return {string}
 */
var addStrings = function (num1, num2) {
  let flag = 0,
    numArr1 = num1.split("").map(Number),
    numArr2 = num2.split("").map(Number),
    res = [];
  for (
    let i = numArr1.length - 1, j = numArr2.length - 1;
    i >= 0 || j >= 0 || flag;
    i--, j--
  ) {
    let count1 = i < 0 ? 0 : numArr1[i];
    let count2 = j < 0 ? 0 : numArr2[j];
    let tmp = (count1 + count2 + flag) % 10;
    flag = Math.floor((count1 + count2 + flag) / 10);
    res.push(tmp);
  }
  return res.reverse().join("");
};
```

#### 最长字符串

解题思路： 使用一个数组来维护滑动窗口
遍历字符串，判断字符是否在滑动窗口数组里

- 不在则 push 进数组
- 在则删除滑动窗口数组里相同字符及相同字符前的字符，然后将当前字符 push 进数组
- 然后将 max 更新为当前最长子串的长度

```JavaScript
var lengthOfLongestSubstring = function(s) {
    let arr = [], max = 0
    for(let i = 0; i < s.length; i++) {
        let index = arr.indexOf(s[i])
        if(index !== -1) {
            arr.splice(0, index+1);
        }
        arr.push(s.charAt(i))
        max = Math.max(arr.length, max)
    }
    return max
};
```

### 数组

#### 数组去重

1. indexOf

```JavaScript
const unique = arr => arr.filter((e,i) => arr.indexOf(e) === i);
```

2. Set

```JavaScript
const unique = arr => [...new Set(arr)];
```

#### 数组扁平化

1. 递归

```JavaScript
function flat(arr) {
    const result = []
    arr.forEach((item) => {
        if (Array.isArray(item)) {
            result.push(...flat(item))
        } else {
            result.push(item)
        }
    })
    return result
}
const arr = flat(arr)
```

2. 现成 API

```JavaScript
// 第一种方案：用现成flat
const arr1 = arr.flat(Infinity)

// 第二种方案：利用join展平
const arr2 = arr.join().split(',').map(Number)

// 第三种方案：利用toString直接展平
const arr3 = arr.toString().split(',').map(Number)
```

#### 两数之和、三数之和

##### 两数之和

情景：给定一个整数数组 nums 和一个目标值 target，请在该数组中找出和为目标值的那两个整数，并返回他们的数组下标。
思路：使用一个 map 将遍历过的数字存起来，值作为 key，下标作为值。

对于每一次遍历：

取 map 中查找是否有 key 为`target-nums[i]`的值
如果取到了，则条件成立，返回。
如果没有取到，将当前值作为 key，下标作为值存入 map

```JavaScript
function twoSum(arr,target){
    var res=[],map={}
    for(let i=0;i<arr.length;i++){
        if(map[target-arr[i]]!=undefined){
            res= [i,map[target-arr[i]]]
        }else{
            map[arr[i]]=i
        }
    }
    return res
}
```

##### 三数之和

情景：给定一个整数数组 nums 和一个目标值 target，请在该数组中找出和为目标值的那 3 个整数，并返回他们的数组。
思路：需要考虑结果去重。思路与两数之和有类似的地方，遍历数组时选定基准值`arr[i]`，在数组最左和最右设立指针，判断左指针+基准值+右指针的和是否等于目标值，如果不是需移动指针来靠近

### 二叉树

特点：每个节点最多有两个子树的树结构，通常子树被称作“左子树”和“右子树”。
数据结构：

```JavaScript
function TreeNode(x){
    this.val = x;
    this.left = null;
    this.right = null;
}
```

#### 完全二叉树

特点：

- 所有叶子节点都出现在 k 或者 k-1 层，而且从 1 到 k-1 层必须达到最大节点数；(第 n 层的节点数最多为 2^n 个节点 n 层二叉树最多有 2^0+...+2^n=2^(n+1)-1 个节点)
- 第 k 层可以不是满的，但是第 k 层的所有节点必须集中在最左边。
- 任何一个节点不能只有左子树没有右子树

#### 二叉查找树（又叫二叉排序树）

特点：

- 若左子树不空，则左子树上所有结点的值均小于它的根结点的值；
- 若右子树不空，则右子树上所有结点的值均大于或等于它的根结点的值；
- 左、右子树也分别为二叉排序树。
- 二叉排序树的中序遍历一定是从小到大的

#### 遍历

前序遍历：根节点 + 左子树前序遍历 + 右子树前序遍历
中序遍历：左子树中序遍历 + 根节点 + 右字数中序遍历
后序遍历：左子树后序遍历 + 右子树后序遍历 + 根节点

##### 递归遍历法

```JavaScript
function preOrder(root,arr=[]){
    if(root){
        arr.push(root.val)
        preOrder(root.left,arr)
        preOrder(root.right,arr)
    }
    return arr
}
function inOrder(root,arr=[]){
    if(root){
        inOrder(root.left,arr)
        arr.push(root.val)
        inOrder(root.right,arr)
    }
    return arr
}
function postOrder(root,arr=[]){
    if(root){
        postOrder(root.left,arr)
        postOrder(root.right,arr)
        arr.push(root.val)
    }
    return arr
}
```

##### 迭代法

思路：利用栈的特性
前序遍历：前序遍历是中左右，每次先处理的是中间节点，那么先将根节点放入栈中，然后将右孩子加入栈，再加入左孩子。(保证入栈顺序和遍历顺序相反)

```JavaScript
function preOrder(root){
    let stack=[],current=root,res=[]
    stack.push(current)
    while(stack.length){
        current=stack.pop()
        res.push(current.val)
        if(current.right){
            stack.push(current.right)
        }
        if(current.left){
            stack.push(current.left)
        }
    }
    return res
}
```

中序遍历：中序遍历是左中右，先访问的是二叉树顶部的节点，然后一层一层向下访问，直到到达树左面的最底部，再开始处理节点

```JavaScript
function inOrder(root){
    let stack=[],current=root,res=[]
    while(current||stack.length!=0){
        while(current){
            stack.push(current)
            current=current.left
        }
        let node=stack.pop()
        res.push(node.val)
        current=node.right
    }
    return res

}
```

后序遍历：后序遍历是左右中，可以看作是前序遍历的逆序，先将根节点放入栈中。只需要调整一下先序遍历的代码顺序，就变成中右左的遍历顺序，然后在反转 result 数组，输出的结果顺序就是左右中了

```JavaScript
function postOrder(root){
    let stack=[],current=root,res=[]
    stack.push(current)
    while(stack.length){
        current=stack.pop()
        res.push(current.val)
        if(node.left)stack.push(node.left)
        if(node.right)stack.push(node.right)
    }
    return res.reverse()
}
```

### 链表

特点：用一组任意存储的单元来存储线性表的数据元素。一个对象存储着本身的值和下一个元素的地址。
数据结构：

```JavaScript
function ListNode(x){
    this.val = x;
    this.next = null;
}
```

val 属性存储当前的值，next 属性存储下一个节点的引用。当 next 节点是 null 时，说明是最后一个节点，停止遍历。
解题思路：

1. 涉及到可能对头部节点变动时，可以设置虚拟节点 dummy 与 head 连接
2. 双指针思想：利用两个或多个不同位置的指针，通过速度和方向的变换解决问题。

#### 链表常规操作

```JavaScript
// 插入节点
function insertNode(head,index,val){
    const dummy = new ListNode(-1)
    dummy.next = head
    const target=new ListNode(val)
    let start=0,current=dummy
    while(current.next){
        if(start===index){
            target.next=current.next
            current.next=target
        }
        start++
        current=current.next
    }
    return dummy.next
}
// 删除节点
function deleteNode(head,index){
    const dummy = new ListNode(-1)
    dummy.next = head
    let start=0,current=dummy
    while(current.next){
        if(start===index){
            current.next=current.next.next
        }
        start++
        current=current.next
    }
    return dummy.next
}
// 从尾到头打印指针
function printListNode(head){
    let arr=[],current=head
    while(current){
        arr.unshift(current.val)
        current=current.next
    }
    return arr
}
```

#### 翻转列表

思路：双指针，慢指针保存前一个节点的值，快指针进行遍历修改指针方向

```JavaScript
function revertListNode(head){
    let current=head
    let pre=null
    while(current){
        const tmp=current.next
        current.next=pre
        pre=current
        current=tmp
    }
}

```

#### 链表倒数第 K 个节点

思路：双指针，快指针比慢指针间隔 k 步当快指针移动到 null 时慢指针位于 n-k 处

```JavaScript
function findKthFromTail(head,k){
    let fast=head,slow=head,index=0
    while(fast){
        fast=fast.next
        index++
        if(index>k){
            slow=slow.next
        }
    }
    return slow
}
```

##### 延伸：删除倒数第 K 个节点

思路：类似链表倒数第 K 个节点，只是需要找到的节点是倒数 K+1，方便做指针操作；由于删除操作有可能涉及头部节点操作，最好加 dummy

```JavaScript
function deleteKthFromTail(head,k){
    const dummy=new ListNode(-1)
    dummy.next=head
    let fast=dummy,slow=dummy,index=0
    while(fast){
        fast=fast.next
        index++
        if(index>k+1){
            slow=slow.next
        }
    }
    slow.next=slow.next.next
    return dummy.next
}
```

#### 链表是否含环

思路：快慢指针，快指针移动的速度是慢指针的 2 倍，如果快指针和慢指针相遇说明有环

```JavaScript
function hasCircle(head){
    let fast=head,slow=head,index
    while(fast&&fast.next){
        fast=fast.next.next
        slow=slow.fast
        if(fast.val===slow.val){
            return true
        }
    }
    return false
}
```

##### 延伸：找出环起点

思路：相遇时快慢指针的路程差，是环周长的整数倍。如果相遇以后慢指针回到 head、两指针同速，则两指针到环起点会相遇

```JavaScript
function findCircleStart(head){
    let fast=head,slow=head,index
    while(fast&&fast.next){
        fast=fast.next.next
        slow=slow.fast
        if(fast.val===slow.val){
            break;
        }
    }
    //判断是否有环
    if(fast==null||fast.next==null)return
    slow=head
    while(slow!=fast){
        slow=slow.next
        fast=fast.next
    }
    return slow
}
```

#### 链表合并

思路：创建新的链表

```JavaScript
function mergeList(list1,list2){
    const dummy=new ListNode(-1)
    let p1=list1,p2=list2,p=dummy
    while(p1&&p2){
        if(p1.val>p2.val){
            p.next=p2
            p2=p2.next
        }else{
            p.next=p1
            p1=p1.next
        }
        p=p.next
    }
    if(p1){
        p.next=p1
    }
    if(p2){
        p.next=p2
    }
    return dummy.next
}
```

### 栈和队列

#### 有效括号

```JavaScript
var isValid = function(s) {
    let map = {
        '{': '}',
        '(': ')',
        '[': ']'
    }
    let stack = []
    for(let i = 0; i < s.length ; i++) {
        if(map[s[i]]) {
            stack.push(s[i])
        } else if(s[i] !== map[stack.pop()]){
            return false
        }
    }
    return stack.length === 0
};
```

## 算法

### 排序算法

#### 冒泡排序

思路：双循环，外层循环确定冒泡执行的范围；内层循环执行冒泡，冒泡的原理是内循环的首元素跟附近的元素比较，如果大小顺序相反则进行置换

```JavaScript
function bubbleSort(arr){
    for(let outer=arr.length-1;outer>0;outer--){
        for(let inner=0;inner<outer;inner++){
            if(arr[inner]>arr[inner+1]){
                const tmp=arr[inner]
                arr[inner]=arr[inner+1]
                arr[inner+1]=tmp
            }
        }
    }
    return arr
}
```

#### 选择排序

思路：双循环，外层循环确定选择执行的范围；内层循环执行选择排序，找到本次循环的最值移动到对应的位置

```JavaScript
function selectSort(arr){
    if(arr.length<=1)return arr
    for(let outer=arr.length-1;outer>0;outer--){
        for(let inner=0;inner<outer;inner++){
            if(arr[inner]>arr[outer]){
                const tmp=arr[inner]
                arr[inner]=arr[outer]
                arr[outer]=tmp
            }
        }
    }
    return arr
}

```

#### 快速排序

思路：递归，函数体内以传入数组长度小于等于 1 的情况作为结束递归的方式。选取数组内的一个值作为基准，将其他的值分为两个数组存储，一个是大于基准的数组，一个是小于基准的数组，对这两个数组进行快速排序后和基准值进行连接

```JavaScript
function quickSort(arr){
    if(arr.length<=1)return arr
    const ele=arr.splice(0,1),left=[],right=[]
    for(let i=0;i<arr.length;i++){
        if(arr[i]<ele){
            left.push(arr[i])
        }else{
            right.push(arr[i])
        }
    }
    return quickSort(left).concat(ele,quickSort(right))
}
```

### 递归

#### 爬楼梯

情景：有一楼梯共 n 级，刚开始时你在第一级，若每次只能跨上一级或二级，要走上第 n 级，共有多少种走法
思路：倒退，完成最后一步时可能是 n-1 级台阶走一级，也可能是 n-2 级台阶走两级。在完成 n-1 级台阶走法的计算方式和 n 级走法计算本质是一样的。所以需要找基本情况即递归的结束情况

```JavaScript
function climbStairs(n){
    if(n<=0)return 0
    if(n===1)return 1
    if(n===2)return 2
    return climbStairs(n-1)+climbStairs(n-2)
}
```

### 回溯

回溯是递归的副产品，只要有递归就会有回溯。

回溯模版：
回溯算法中函数通常没有返回值

1. 设置终止条件
2. 回溯遍历：回溯法的搜索过程就是一个树型结构的遍历过程，for 循环用来横向遍历，递归的过程是纵向遍历。

```JavaScript
function backtracking(参数) {
    if (终止条件) {
        存放结果;
        return;
    }

    for (选择：本层集合中元素（树中节点孩子的数量就是集合的大小）) {
        处理节点;
        backtracking(路径，选择列表); // 递归
        回溯，撤销处理结果
    }
}
```

回溯解决问题类型：

1. 组合问题：N 个数里面按一定规则找出 k 个数的集合
2. 切割问题：一个字符串按一定规则有几种切割方式
3. 子集问题：一个 N 个数的集合里有多少符合条件的子集
4. 排列问题：N 个数按一定规则全排列，有几种排列方式
5. 棋盘问题：N 皇后，解数独等等

#### 组合

情景：给定两个整数 n 和 k，返回范围 [1, n] 中所有可能的 k 个数的组合。
解题思路：

- 增加存储变量：k 个数组合的结果可以用 tmp 暂时存储，最终的结果用 res 存储；组合内部是没有顺序要求的，因此需要记录起始点
- 设置回溯函数形参：存储变量一定也加到形参
- 设置回溯函数终止条件：tmp 推入的数据长度等于目标长度 k 时需要将本次组合推入 res 结束递归，注意要传 tmp 的复制而不是本身，因为 tmp 后续还要做操作
- 设置回溯函数循环体：循环体的起始点取形参的传入变量，tmp 推入元素，backtrack 函数调用更新 startIdx，再退出路径

```JavaScript
/**
 * @param {number} n
 * @param {number} k
 * @return {number[][]}
 */
var combine = function(n, k) {
    let tmp=[],res=[]
    backtrack(n,k,tmp,res,1)
    return res
};
var backtrack=function(n,k,tmp,res,startIdx){
    if(tmp.length===k){
        res.push(tmp.slice())
        return
    }
    for(let i=startIdx;i<=n;i++){
        tmp.push(i)
        backtrack(n,k,tmp,res,i+1)
        tmp.pop()
    }
}
```

#### 和为 sum 的 n 个数

情景：给你一个 无重复元素 的整数数组  candidates 和一个目标整数  target ，找出  candidates  中可以使数字和为目标数  target 的 所有   不同组合 ，并以列表形式返回。
解题思路：

- 增加存储变量：k 个数组合的结果可以用 tmp 暂时存储，最终的结果用 res 存储；组合内部是没有顺序要求的，因此需要记录起始点
- 设置回溯函数形参：存储变量一定也加到形参
- 设置回溯函数终止条件：tmp 推入的数据和等于目标值 时需要将本次组合推入 res 结束递归，大于目标值 时直接结束递归；注意要传 tmp 的复制而不是本身，因为 tmp 后续还要做操作
- 设置回溯函数循环体：循环体的起始点取形参的传入变量，tmp 推入元素，backtrack 函数调用更新 startIdx（startIdx 是当前索引值即可），再退出路径

```JavaScript
/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */
var combinationSum = function(candidates, target) {
    var res=[],tmp=[]
    backtracking(candidates,target,tmp,res,0)
    return res
};
var backtracking=function(candidates,target,tmp,res,startIdx){
    if(tmp.reduce((pre,cur)=>pre+cur,0)>target){
        return
    }
    if(tmp.reduce((pre,cur)=>pre+cur,0)===target){
        res.push(tmp.slice())
        return
    }
    for(let i=startIdx;i<candidates.length;i++){
        tmp.push(candidates[i])
        backtracking(candidates,target,tmp,res,i)
        tmp.pop()
    }
}
```

##### 延伸情景

1. 给定一个候选人编号的集合  candidates  和一个目标数  target ，找出  candidates  中所有可以使数字和为  target  的组合。
   candidates  中的每个数字在每个组合中只能使用   一次  。
   思路：与上一题相比需要排除相同元素的组合结果。解决方法是需要先进行排序，让相同的元素靠在一起，如果发现 `nums[i] == nums[i-1]`，则跳过

```JavaScript
/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */
var combinationSum2 = function(candidates, target) {
var res=[],tmp=[]
    backtracking(candidates.sort((a,b)=>a-b),target,tmp,res,0)
    return res
};
var backtracking=function(candidates,target,tmp,res,startIdx){
    if(tmp.reduce((pre,cur)=>pre+cur,0)>target){
        return
    }
    if(tmp.reduce((pre,cur)=>pre+cur,0)===target){
        res.push(tmp.slice())
        return
    }
    for(let i=startIdx;i<candidates.length;i++){
        if(i>startIdx&&candidates[i]===candidates[i-1])continue
        tmp.push(candidates[i])
        backtracking(candidates,target,tmp,res,i+1)
        tmp.pop()
    }
}
```

#### 全排列

情景：给定一个不含重复数字的数组 nums ，返回其 所有可能的全排列 。你可以 按任意顺序 返回答案。
解题思路：
**思路 1**

- 增加存储变量：全排列组合的结果可以用 tmp 暂时存储，最终的结果用 res 存储；组合内部有顺序要求，只是使用过的元素不可以再次使用，因此使用 boolean 数组 used 存储
- 设置回溯函数形参：存储变量一定也加到形参
- 设置回溯函数终止条件：tmp 推入的数据长度等于目标长度 k 时需要将本次组合推入 res 结束递归，注意要传 tmp 的复制而不是本身，因为 tmp 后续还要做操作
- 设置回溯函数循环体：循环体内部判断元素是否已经使用，使用则 continue 跳过此次循环 tmp 推入元素，used 更新，backtrack 函数调用更新 used，再退出路径

```JavaScript
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permute = function(nums) {
    var tmp=[],res=[],used=new Array(nums.length).fill(false);
    backtracking(tmp,res,nums,used)
    return res;

};
var backtracking=function(tmp,res,nums,used){
    if(nums.length==tmp.length){
        res.push(tmp.slice())
        return
    }
    for(let i=0;i<nums.length;i++){
        if(used[i])continue
        tmp.push(nums[i]);
        used[i]=true
        backtracking(tmp,res,nums,used)
        tmp.pop();
        used[i]=false
    }
}
```

**思路 2**
全排列的思路是使用数组的一个元素，剩下的元素接着进行全排列，再与提取出来的元素组合。因此可以在回溯算法内部改变使用的数组内容，同时终止条件也需要改变

- 增加存储变量：全排列组合的结果可以用 tmp 暂时存储，最终的结果用 res 存储
- 设置回溯函数形参：存储变量一定也加到形参
- 设置回溯函数终止条件：nums 长度为 0 即所有元素全排列结束时需要将本次组合推入 res 结束递归，注意要传 tmp 的复制而不是本身，因为 tmp 后续还要做操作
- 设置回溯函数循环体：循环体内部 tmp 推入元素，backtrack 函数调用更新 传入的数组 nums，再退出路径

```JavaScript
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permute = function(nums) {
    var tmp=[],res=[];
    backtracking(tmp,res,nums)
    return res;

};
var backtracking=function(tmp,res,nums){
    if(nums.length==0){
        res.push(tmp.slice())
        return
    }
    for(let i=0;i<nums.length;i++){
        tmp.push(nums[i]);
        backtracking(tmp,res,nums.slice(0,i).concat(nums.slice(i+1)))
        tmp.pop();
    }
}
```

### 广度优先搜索(BFS)

特点:越是接近根结点的结点将越早地遍历。
在 BFS 中，结点的处理顺序与它们添加到队列的顺序是完全相同的顺序，即先进先出，所以广度优先搜索一般使用队列实现。
适用场景：

1. 前序遍历、层序遍历、之字遍历，树的最左最右点，二叉树最小深度
2. 矩阵/网格的最短路径

模版：

```JavaScript
function bfs(){
    queue.push(start)
    while(queue.length){
        var size=queue.length
        for(let i=0;i<size;i++){
            var node=queue.shift()
            var next=node+dir
            if(越界)continue
            if(满足条件)queue.push(next)
        }
    }
}
```

#### 二叉树层序遍历

```JavaScript
/**
 * @param {TreeNode} root
 * @return {number[][]}
 */
var levelOrder = function(root) {
    if(!root)return []
    let res=[],queue=[root],tmp=[]
    while(queue.length){
        let size=queue.length
        for(let i=0;i<size;i++){
            let node=queue.shift()
            tmp.push(node.val)
            if(node.left)queue.push(node.left)
            if(node.right)queue.push(node.right)
        }
        res.push(tmp)
        tmp=[]
    }
    return res
}
```

#### 二叉树最小深度

```JavaScript
function minDepth(root) {
    if(!root)return 0
    let queue=[],dep=0
    queue.push(root)
    while(queue.length){
        let size=queue.length
        dep++;
        for(let i=0;i<size;i++){
            let node=queue.shift()
            if(!node.left&&!node.right)return dep
            if(node.left)queue.push(node.left)
            if(node.right)queue.push(node.right)
        }
    }
}
```

### 深度优先搜索(DFS)

特点：更早访问的结点可能不是更靠近根结点的结点。
结点的处理顺序是完全相反的顺序，就像它们被添加到栈中一样，它是后进先出。所以深度优先搜索一般使用栈实现。

模版：

```JavaScript
// 二叉树的遍历
function dfs(root){
   dfs(root.left)
   dfs(root.right)
}
// 二维矩阵的遍历
function dfs(grid:number[][],i:number,j:number,visited:boolean[][]){
    let m = grid.length, n = grid[0].length;
    if (i < 0 || j < 0 || i >= m || j >= n) {
        // 超出索引边界
        return;
    }
    if (visited[i][j]) {
        // 已遍历过 (i, j)
        return;
    }
    // 进⼊节点 (i, j)
    visited[i][j] = true;
    dfs(grid, i - 1, j, visited); // 上
    dfs(grid, i + 1, j, visited); // 下
    dfs(grid, i, j - 1, visited); // 左
    dfs(grid, i, j + 1, visited); // 右
}
```

适用场景：

1. 中序遍历、二叉树最大深度
2. 岛屿数量

#### 路径总和

```JavaScript
/**
 * @param {TreeNode} root
 * @param {number} targetSum
 * @return {boolean}
 */
var hasPathSum = function(root, targetSum) {
    if(!root)return false
    if(!root.left&&!root.right)return root.val===targetSum
    return hasPathSum(root.left,targetSum-root.val)||hasPathSum(root.right,targetSum-root.val)
};
```

#### 岛屿数量

思路：遍历二维数组，同时维护一个与原数组同样大小的 boolean 数组 visited（创建二维数组时避免数组元素指向同一引用）记录已经遍历过的元素；也可以使用海水淹没法

```JavaScript
/**
 * @param {character[][]} grid
 * @return {number}
 */
var numIslands = function (grid) {
    const m = grid.length, n = grid[0].length
    let visited = new Array(m).fill(0).map(() => new Array(n).fill(false)), res = 0
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (grid[i][j] == '1' && visited[i][j] === false) {
                res++;
                dfs(grid, visited, i, j, m, n)
            }
        }
    }
    return res
};
var dfs = function (grid, visited, i, j, m, n) {
    if (i >= m || i < 0 || j < 0 || j >= n) return
    if (grid[i][j] == '0' || visited[i][j] === true) return
    visited[i][j] = true
    dfs(grid, visited, i - 1, j, m, n)
    dfs(grid, visited, i + 1, j, m, n)
    dfs(grid, visited, i, j - 1, m, n)
    dfs(grid, visited, i, j + 1, m, n)
}
```

## 参考文献

（1）[前端该如何准备数据结构和算法](https://juejin.cn/post/6844903919722692621)
