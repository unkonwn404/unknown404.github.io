---
title: SQL语法入门
date: 2026-08-24 10:00:00
categories:
  - 技术学习
tags:
  - SQL
  - 数据库
---

SQL（Structured Query Language，结构化查询语言）是用于操作关系型数据库的标准语言。本文将会整理日常开发中最常用的语法，帮助自己记忆理解。

<!-- more -->

## 1. 表的基本结构与信息

在写查询之前，先了解关系型数据库中"表"的基本构成。

### 1.1 表、行、列

- **表（Table）**：一张二维数据表，对应一个实体或一类数据，如 `users`（用户）、`orders`（订单）。
- **列 / 字段（Column）**：表的纵向维度，定义数据的属性，如 `name`、`age`。每列都有明确的数据类型。
- **行 / 记录（Row）**：表的横向维度，代表一条具体的数据，如用户 Alice 的整条信息。

```
┌────┬───────┬─────┬──────────┐
│ id │ name  │ age │  city    │  ← 列（字段）
├────┼───────┼─────┼──────────┤
│ 1  │ Alice │ 25  │ Beijing  │  ← 行（记录）
│ 2  │ Bob   │ 30  │ Shanghai │
└────┴───────┴─────┴──────────┘
```

### 1.2 常见列属性与约束

建表时为每列指定**数据类型**和**约束**，保证数据的正确性与一致性：

| 概念 | 说明 | 常见示例 |
| --- | --- | --- |
| 数据类型 | 列中允许存储的数据种类 | `INT`（整数）、`VARCHAR(n)`（变长字符串）、`DECIMAL(m,n)`（小数）、`DATE`（日期）、`BOOLEAN`（布尔） |
| PRIMARY KEY（主键） | 唯一标识一行，不可重复、不可为空 | `id INT PRIMARY KEY` |
| NOT NULL | 该列必须填值，不能为空 | `name VARCHAR(50) NOT NULL` |
| UNIQUE | 列值（或列组合）在整个表中不能重复 | `email VARCHAR(100) UNIQUE` |
| DEFAULT | 未提供值时的默认值 | `status VARCHAR(10) DEFAULT 'active'` |
| FOREIGN KEY（外键） | 引用另一张表的主键，建立表间关联 | `user_id INT REFERENCES users(id)` |
| INDEX（索引） | 为列建立"目录"，加速查询（非约束，但常在建表时一并定义） | `INDEX idx_city (city)` |

### 1.2.1 UNIQUE 详解

`UNIQUE` 约束保证某一列（或多列组合）的值在整张表中**不重复**，常用来防止出现两条"同一个东西"的数据，例如两个用户注册了相同的邮箱。

**基本用法（列级约束）**

```sql
CREATE TABLE users (
  id    INT PRIMARY KEY,
  email VARCHAR(100) UNIQUE,   -- 单列唯一：邮箱不能重复
  name  VARCHAR(50)
);
```

**多列联合唯一（表级约束）**

当"单独每一列都可能重复，但几列组合起来不能重复"时，用联合唯一约束。例如一个用户可以对同一商品下多个订单，但不能对同一个订单重复评价——评价表的 `(user_id, order_id)` 组合必须唯一：

```sql
CREATE TABLE reviews (
  id       INT PRIMARY KEY,
  user_id  INT,
  order_id INT,
  content  TEXT,
  -- 组合唯一：同一用户对同一订单只能评价一次
  UNIQUE (user_id, order_id)
);
```

**给约束命名（便于后续删除 / 管理）**

```sql
CREATE TABLE users (
  id    INT PRIMARY KEY,
  email VARCHAR(100),
  CONSTRAINT uk_users_email UNIQUE (email)
);
```

**已存在的表追加 / 删除唯一约束**

```sql
-- 追加
ALTER TABLE users ADD CONSTRAINT uk_users_email UNIQUE (email);

-- 删除（注意：不同数据库语法略有差异，MySQL 用 DROP INDEX）
ALTER TABLE users DROP CONSTRAINT uk_users_email;   -- PostgreSQL / SQL Server
-- ALTER TABLE users DROP INDEX uk_users_email;     -- MySQL
```

**UNIQUE 与 PRIMARY KEY 的区别**

两者都要求"不重复"，但有三个关键差异：

| 对比项 | PRIMARY KEY | UNIQUE |
| --- | --- | --- |
| 是否允许 NULL | 不允许（隐式 NOT NULL） | 允许（标准 SQL 下多个 NULL 不算重复；但 MySQL 中唯一列只允许一个 NULL，需注意） |
| 一张表的数量 | 只能有一个 | 可以有多个 |
| 语义 | 唯一标识一行（行的"身份证"） | 业务上的唯一性（如邮箱、手机号） |

简单说：**主键用来定位行，UNIQUE 用来约束业务字段不重复**。一张表只能有一个主键，但可以有多个 `UNIQUE` 约束（比如邮箱唯一、手机号也唯一）。

### 1.3 主键与外键（表之间的关系）

- **主键（Primary Key）**：每张表通常有且只有一个主键，用来唯一定位一条记录（如 `users.id`）。
- **外键（Foreign Key）**：在子表中引用父表的主键，从而把两张表关联起来。例如 `orders.user_id` 引用 `users.id`，表示"这笔订单属于哪个用户"。

这种"外键引用主键"的关系，正是后续 `JOIN` 多表查询能够把数据拼起来的基础。

### 1.3.1 外键的级联行为（ON DELETE / ON UPDATE）

定义外键时，可以指定当**被引用的父记录**被修改或删除时，子表该怎么响应。以下面的代码为例：

```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
```

- `FOREIGN KEY (user_id)`：当前表（如 `orders`）的 `user_id` 列是外键。
- `REFERENCES users(id)`：它引用 `users` 表的主键 `id`，即 `orders.user_id` 的值必须在 `users.id` 中存在。
- `ON DELETE CASCADE`：**级联删除**——当父记录被删除时，子表里所有引用它的记录也自动被删除。

```sql
-- 删除 id=1 的用户，同时 orders 里所有 user_id=1 的订单会被自动删掉
DELETE FROM users WHERE id = 1;
```

常见的级联行为对照：

| 行为 | 含义 |
| --- | --- |
| `ON DELETE CASCADE` | 父删，子跟着删 |
| `ON DELETE SET NULL` | 父删，子的外键列置为 NULL（该列需允许 NULL） |
| `ON DELETE RESTRICT` / `NO ACTION` | 父还有子引用时，拒绝删除父记录（默认，最安全） |
| `ON UPDATE CASCADE` | 父主键被修改时，子的外键值同步更新 |

> 注意：`ON DELETE CASCADE` 很方便也很危险——删一个用户会连带删掉其所有订单，且通常不可恢复。生产环境一般更倾向用 `RESTRICT` 先拦住，或做"软删除"（加 `deleted_at` 列标记），避免误删大量数据。

### 1.4 索引（INDEX）详解

索引是一份**额外的"目录"**，帮助数据库不必逐行扫描整张表就能快速定位数据。

- **没有索引**：执行 `WHERE city = 'Beijing'` 时，数据库只能从头到尾扫描每一行（全表扫描 / Full Table Scan），表越大越慢。
- **有索引**：在 `city` 列上建立类似 B+Tree 的目录结构，查找时直接"翻目录"定位，速度从 O(n) 降到约 O(log n)。

```sql
-- 为单列建索引，加速按 city 的查询
CREATE INDEX idx_users_city ON users(city);

-- 联合索引（多列组合查询时更有用，注意最左前缀原则）
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at);

-- 查看 / 删除索引
SHOW INDEX FROM users;              -- MySQL
DROP INDEX idx_users_city ON users; -- MySQL
```

使用索引的注意点：

1. **加速读、拖慢写**：索引占用空间，且每次 `INSERT` / `UPDATE` / `DELETE` 都要同步维护索引。
2. **主键和 UNIQUE 约束会自动建索引**，所以按主键查询本来就很快。
3. **不是越多越好**：只在频繁用于 `WHERE`、`JOIN`、`ORDER BY` 的列上建索引。

### 1.5 查看表结构的信息

日常开发中，经常需要先了解一张表有哪些字段、类型是什么。不同数据库提供了对应的命令：

```sql
-- MySQL / PostgreSQL：查看表结构
DESCRIBE users;
-- 或等价写法
SHOW COLUMNS FROM users;

-- SQLite：查看建表语句
.schema users;

-- 标准 SQL：查询系统视图（多数数据库支持，字段名略有差异）
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users';
```

理解了表由"行 + 列"组成、列有类型与约束、表之间通过主键/外键关联、索引能加速查询，再看后面的增删改查语法会清晰很多。

## 2. SQL 操作语法：增删改查（CRUD）

SQL 对数据的操作可以归纳成四类，对应英文 CRUD：

| 操作 | 英文 | 对应 SQL 关键字 | 含义 |
| --- | --- | --- | --- |
| 增 | Create | `INSERT`（及建表 `CREATE TABLE`） | 新建表、插入新数据 |
| 查 | Read | `SELECT` | 从表中读取 / 查询数据 |
| 改 | Update | `UPDATE` | 修改已有数据 |
| 删 | Delete | `DELETE`（及 `DROP TABLE`） | 删除数据 / 删除表 |

下面按这四类分别介绍，示例统一使用第 1 节中 `users` / `orders` 两张表的结构。

### 2.1 增（Create）：建表与插入数据

建表用 `CREATE TABLE`，插入数据用 `INSERT INTO`。

```sql
-- 用户表
CREATE TABLE users (
  id      INT PRIMARY KEY,
  name    VARCHAR(50),
  age     INT,
  city    VARCHAR(50)
);

-- 订单表
CREATE TABLE orders (
  id        INT PRIMARY KEY,
  user_id   INT,
  amount    DECIMAL(10,2),
  created_at DATE
);
```

插入数据的几种常见写法：

```sql
-- 1) 指定列插入一条
INSERT INTO users (id, name, age, city)
VALUES (1, 'Alice', 25, 'Beijing');

-- 2) 一次插入多条
INSERT INTO users (id, name, age, city) VALUES
(2, 'Bob',   30, 'Shanghai'),
(3, 'Cara',  28, 'Beijing'),
(4, 'Dan',   35, 'Shenzhen'),
(5, 'Eve',   22, 'Shanghai');

-- 3) 插入时忽略某些列（使用默认值或 NULL）
INSERT INTO users (id, name) VALUES (6, 'Frank');

-- 4) 主键/唯一键冲突时忽略（MySQL / PostgreSQL 语法略有差异）
INSERT IGNORE INTO users (id, name) VALUES (1, 'Alice');          -- MySQL
-- INSERT INTO users (id, name) VALUES (1, 'Alice') ON CONFLICT DO NOTHING;  -- PostgreSQL
```

常用的示例数据（后续查询都基于它）：

```sql
INSERT INTO orders (id, user_id, amount, created_at) VALUES
(1, 1, 100.00, '2026-01-10'),
(2, 1,  50.00, '2026-02-15'),
(3, 2, 200.00, '2026-01-20'),
(4, 3,  80.00, '2026-03-05'),
(5, 5, 120.00, '2026-02-28');
```

### 2.2 查（Read）：SELECT 家族

`SELECT` 是最常用的语句，用于从表中读取数据。基础用法：

```sql
-- 查询所有列
SELECT * FROM users;

-- 查询指定列
SELECT name, age FROM users;

-- 为列起别名
SELECT name AS 姓名, age AS 年龄 FROM users;

-- 去重查询
SELECT DISTINCT city FROM users;
```

#### 2.2.1 WHERE 条件过滤

`WHERE` 用于筛选满足条件的行。

```sql
-- 数值比较
SELECT * FROM users WHERE age > 28;

-- 多条件组合
SELECT * FROM users WHERE age > 25 AND city = 'Beijing';

-- IN 匹配多个值
SELECT * FROM users WHERE city IN ('Beijing', 'Shanghai');

-- LIKE 模糊匹配（% 表示任意多个字符，_ 表示单个字符）
SELECT * FROM users WHERE name LIKE 'A%';

-- BETWEEN 范围
SELECT * FROM orders WHERE amount BETWEEN 50 AND 150;

-- IS NULL 判断空值
SELECT * FROM users WHERE city IS NOT NULL;
```

#### 2.2.2 ORDER BY 排序

```sql
-- 按年龄升序
SELECT * FROM users ORDER BY age ASC;

-- 按年龄降序
SELECT * FROM users ORDER BY age DESC;

-- 多列排序：先按城市，再按年龄降序
SELECT * FROM users ORDER BY city ASC, age DESC;
```

#### 2.2.3 LIMIT 限制条数

```sql
-- 取前 3 条
SELECT * FROM users ORDER BY age DESC LIMIT 3;

-- 分页：跳过前 2 条，取接下来的 3 条
SELECT * FROM users ORDER BY id LIMIT 3 OFFSET 2;
```

#### 2.2.4 聚合函数与 GROUP BY

聚合函数用于对一组数据进行统计：`COUNT`、`SUM`、`AVG`、`MAX`、`MIN`。

```sql
-- 统计用户总数
SELECT COUNT(*) FROM users;

-- 各城市的平均年龄
SELECT city, AVG(age) AS avg_age
FROM users
GROUP BY city;

-- 每个用户的订单总额
SELECT user_id, SUM(amount) AS total
FROM orders
GROUP BY user_id;

-- HAVING 过滤分组结果（注意：WHERE 不能用聚合函数）
SELECT user_id, SUM(amount) AS total
FROM orders
GROUP BY user_id
HAVING SUM(amount) > 100;
```

#### 2.2.5 JOIN 多表连接

`JOIN` 用于把多张表按关联字段组合起来查询。

```sql
-- INNER JOIN：只返回两表都能匹配上的行
SELECT u.name, o.amount, o.created_at
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- LEFT JOIN：返回左表全部，右表无匹配则补 NULL
SELECT u.name, o.amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;

-- 统计每个用户的订单数（含 0 单的用户）
SELECT u.name, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;
```

常见连接类型区别：

| 类型 | 说明 |
| --- | --- |
| INNER JOIN | 两表匹配才返回 |
| LEFT JOIN | 左表全返回，右表不匹配补 NULL |
| RIGHT JOIN | 右表全返回，左表不匹配补 NULL |
| FULL JOIN | 左右表都返回（部分数据库不支持） |

#### 2.2.6 子查询

子查询是嵌套在另一条查询中的 `SELECT`。

```sql
-- 查询订单金额大于平均值的订单
SELECT * FROM orders
WHERE amount > (SELECT AVG(amount) FROM orders);

-- 查询下过单的用户（IN + 子查询）
SELECT name FROM users
WHERE id IN (SELECT DISTINCT user_id FROM orders);
```

##### 2.2.6.1 嵌套子查询（多层子查询）

子查询内部还可以再嵌套子查询，即"子查询里套子查询"。下面先算出每个用户的总消费，再找出总消费高于"整体平均消费"的用户。

```sql
-- 第一层：整体平均消费（来自每个用户的总消费结果）
SELECT *
FROM (
  -- 第二层：每个用户的总消费
  SELECT user_id, SUM(amount) AS total
  FROM orders
  GROUP BY user_id
) AS user_total
WHERE total > (
  -- 第三层（嵌套）：在用户总消费的基础上再求平均
  SELECT AVG(total)
  FROM (
    SELECT user_id, SUM(amount) AS total
    FROM orders
    GROUP BY user_id
  ) AS t
);
```

上面的写法把同一段"用户总消费"逻辑重复用了两次。更清晰的做法是用 `WITH`（公用表表达式 CTE）把中间结果提出来，效果等价：

```sql
WITH user_total AS (
  SELECT user_id, SUM(amount) AS total
  FROM orders
  GROUP BY user_id
)
SELECT *
FROM user_total
WHERE total > (SELECT AVG(total) FROM user_total);
```

##### 2.2.6.2 相关子查询（二次查询 / 逐行关联）

相关子查询的特点是：**子查询会引用外层查询的列，外层每取出一行，子查询就重新执行一次**（所以也常被称为"二次查询"）。

```sql
-- 查询"消费金额高于自己历史平均订单金额"的订单
SELECT *
FROM orders o1
WHERE o1.amount > (
  -- 子查询引用外层 o1.user_id，逐行计算该用户的平均金额
  SELECT AVG(o2.amount)
  FROM orders o2
  WHERE o2.user_id = o1.user_id
);
```

再举一个常见的"分组取最大值"场景：查询每个用户金额最高的那笔订单。

```sql
SELECT *
FROM orders o1
WHERE o1.amount = (
  SELECT MAX(o2.amount)
  FROM orders o2
  WHERE o2.user_id = o1.user_id
);
```

> 注意关联约束的方向：**内层去匹配外层**。相关子查询中，外层表（如 `o1`）是"当前驱动行"，内层表（如 `o2`）通过 `内层列 = 外层列` 去匹配当前行。等号两边（`o2.user_id = o1.user_id` 与 `o1.user_id = o2.user_id`）等价可换，但内外层表的角色不能对调，否则就不再是"按当前行逐行关联"的语义。

相关子查询与非相关子查询的区别：

| 类型 | 是否引用外层列 | 执行方式 |
| --- | --- | --- |
| 非相关子查询 | 否 | 只执行一次，结果传给外层 |
| 相关子查询（二次查询） | 是 | 外层每取一行就执行一次 |

### 2.3 改（Update）：修改数据

`UPDATE` 用于修改已有行的数据，**必需配合 **`WHERE`联合使用，否则会更新整张表。

```sql
-- 把 id = 1 的用户城市改为 'Guangzhou'
UPDATE users
SET city = 'Guangzhou'
WHERE id = 1;

-- 同时修改多列
UPDATE users
SET age = 26, city = 'Beijing'
WHERE name = 'Alice';

-- 不加 WHERE 会更新所有行（慎用！）
-- UPDATE users SET city = 'Unknown';
```

### 2.4 删（Delete）：删除数据

`DELETE` 用于删除行，同样**必须配合 **`WHERE`，否则会清空整张表。

```sql
-- 删除 id = 5 的用户
DELETE FROM users WHERE id = 5;

-- 删除上海的所有用户
DELETE FROM users WHERE city = 'Shanghai';

-- 不加 WHERE 会删除所有行（慎用！）
-- DELETE FROM users;

-- 清空整张表（速度比 DELETE 快，但不走事务日志，且重置自增）
-- TRUNCATE TABLE users;

-- 连同表结构一起删除
-- DROP TABLE users;
```

> 安全提示：`UPDATE` 和 `DELETE` 影响的是真实数据，执行前建议先用 `SELECT ... WHERE ...` 确认要影响的范围，并在生产环境开启事务（`BEGIN;` ... `ROLLBACK;` / `COMMIT;`）以便出错时回滚。

实际生产环境里，一般可能会使用软删除（即只更新状态字段，不删除数据），避免误删。

## 3. 综合实例

下面用一个综合例子把上面的语法串起来：查询 "2026 年 2 月之后下过单、且订单总额超过 100 元的用户姓名与城市"。

```sql
SELECT u.name, u.city, SUM(o.amount) AS total
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.created_at >= '2026-02-01'
GROUP BY u.id, u.name, u.city
HAVING SUM(o.amount) > 100
ORDER BY total DESC;
```

## 4. 总结

SQL 的四大操作（CRUD）对应关键字：`INSERT`（增）、`SELECT`（查）、`UPDATE`（改）、`DELETE`（删）。其中查询 `SELECT` 最常用，其标准结构如下：

```sql
SELECT   列
FROM     表
JOIN     关联表 ON 条件
WHERE    行过滤
GROUP BY 分组列
HAVING   分组过滤
ORDER BY 排序列
LIMIT    条数;
```

记住执行顺序（逻辑上）：`FROM` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `ORDER BY` → `LIMIT`。理解了这条主线，再配合聚合函数、连接查询与子查询，就能解决绝大多数日常 SQL 操作需求。同时谨记：**`UPDATE` 和 `DELETE` 一定要带 `WHERE`**，避免误改全表数据。
