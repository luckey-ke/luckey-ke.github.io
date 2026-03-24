## 前言

如果你刚接触 Vue 3，或者从 Vue 2 迁移过来感到迷茫，这篇文章帮你理清学习路线，从零搭建一个完整的 Vue 3 项目。

---

## 前置准备

开始之前确保你有这些基础：

- **HTML / CSS / JavaScript** — 基本的前端三件套
- **ES6+ 语法** — 箭头函数、解构、模块、Promise
- **Node.js** — v16+ 推荐
- **包管理器** — npm 或 pnpm（推荐 pnpm）

```bash
# 检查环境
node -v    # >= 16
npm -v     # >= 8
```

---

## 第一步：创建项目

```bash
# 官方推荐方式
npm create vue@latest

# 交互式选择：
# ✔ 项目名称: my-vue-app
# ✔ TypeScript? No（初学先跳过）
# ✔ JSX? No
# ✔ Vue Router? Yes
# ✔ Pinia? Yes
# ✔ Vitest? No
# ✔ ESLint? Yes

cd my-vue-app
npm install
npm run dev
```

项目结构：

```
my-vue-app/
├── src/
│   ├── assets/          # 静态资源
│   ├── components/      # 组件
│   ├── router/          # 路由配置
│   ├── stores/          # Pinia 状态
│   ├── views/           # 页面
│   ├── App.vue          # 根组件
│   └── main.js          # 入口
├── public/              # 公共静态文件
├── index.html           # HTML 入口
├── vite.config.js       # Vite 配置
└── package.json
```

---

## 第二步：理解 SFC（单文件组件）

Vue 的核心概念：一个 `.vue` 文件包含 HTML、JS、CSS。

```vue
<!-- MyComponent.vue -->
<script setup>
// JavaScript — 组件逻辑
import { ref } from 'vue'

const msg = ref('你好，Vue 3！')
</script>

<template>
  <!-- HTML — 模板 -->
  <h1>{{ msg }}</h1>
  <input v-model="msg">
</template>

<style scoped>
/* CSS — 样式（scoped 限定在本组件） */
h1 {
  color: #42b883;
}
</style>
```

**三个区块**：
- `<script setup>` — 组件逻辑，自动注册
- `<template>` — 模板，描述 UI 结构
- `<style scoped>` — 样式，scoped 避免全局污染

---

## 第三步：响应式数据

Vue 的核心就是**数据驱动视图**——数据变了，页面自动更新。

```vue
<script setup>
import { ref, reactive } from 'vue'

// ref — 基本类型（数字、字符串、布尔）
const count = ref(0)
const name = ref('Vue')

// reactive — 对象/数组
const user = reactive({
  name: '小明',
  age: 18,
  hobbies: ['coding', 'gaming']
})

// 修改数据
function addCount() {
  count.value++  // ref 需要 .value
}

function growUp() {
  user.age++     // reactive 直接访问
}
</script>

<template>
  <p>计数: {{ count }}</p>
  <button @click="addCount">+1</button>

  <p>{{ user.name }} 今年 {{ user.age }} 岁</p>
  <button @click="growUp">长大</button>
</template>
```

**记忆技巧**：
- `ref` → 基本类型 → 模板自动解包，JS 里要 `.value`
- `reactive` → 对象 → 直接访问属性

---

## 第四步：指令和事件

```vue
<script setup>
import { ref } from 'vue'

const show = ref(true)
const items = ref(['苹果', '香蕉', '橙子'])
const newItem = ref('')

function addItem() {
  if (newItem.value.trim()) {
    items.value.push(newItem.value)
    newItem.value = ''
  }
}

function removeItem(index) {
  items.value.splice(index, 1)
}
</script>

<template>
  <!-- 条件渲染 -->
  <button @click="show = !show">
    {{ show ? '隐藏' : '显示' }}
  </button>
  <p v-if="show">你看到我了！</p>

  <!-- 列表渲染 -->
  <ul>
    <li v-for="(item, index) in items" :key="index">
      {{ item }}
      <button @click="removeItem(index)">删除</button>
    </li>
  </ul>

  <!-- 添加新项 -->
  <input v-model="newItem" @keyup.enter="addItem" placeholder="输入水果名">
  <button @click="addItem">添加</button>
</template>
```

---

## 第五步：组件拆分

当页面变复杂时，拆分成小组件。

```vue
<!-- components/TodoItem.vue -->
<script setup>
defineProps(['text', 'done'])
defineEmits(['toggle', 'remove'])
</script>

<template>
  <li :class="{ done }">
    <span @click="$emit('toggle')">{{ text }}</span>
    <button @click="$emit('remove')">✕</button>
  </li>
</template>

<style scoped>
.done span {
  text-decoration: line-through;
  color: #999;
}
</style>
```

```vue
<!-- TodoList.vue -->
<script setup>
import { ref } from 'vue'
import TodoItem from './components/TodoItem.vue'

const todos = ref([
  { id: 1, text: '学习 Vue 3', done: false },
  { id: 2, text: '写个 TODO 应用', done: false },
  { id: 3, text: '部署上线', done: false }
])

function toggleTodo(id) {
  const todo = todos.value.find(t => t.id === id)
  if (todo) todo.done = !todo.done
}

function removeTodo(id) {
  todos.value = todos.value.filter(t => t.id !== id)
}
</script>

<template>
  <h1>📝 待办清单</h1>
  <ul>
    <TodoItem
      v-for="todo in todos"
      :key="todo.id"
      :text="todo.text"
      :done="todo.done"
      @toggle="toggleTodo(todo.id)"
      @remove="removeTodo(todo.id)"
    />
  </ul>
  <p>完成: {{ todos.filter(t => t.done).length }} / {{ todos.length }}</p>
</template>
```

---

## 第六步：路由（多页面导航）

```vue
<!-- views/Home.vue -->
<template>
  <h1>首页</h1>
  <router-link to="/about">关于</router-link>
</template>

<!-- views/About.vue -->
<template>
  <h1>关于页</h1>
  <router-link to="/">返回首页</router-link>
</template>
```

```vue
<!-- App.vue -->
<template>
  <nav>
    <router-link to="/">首页</router-link>
    <router-link to="/about">关于</router-link>
  </nav>
  <router-view />  <!-- 页面内容渲染在这里 -->
</template>
```

---

## 第七步：状态管理（Pinia）

跨组件共享状态。

```js
// stores/counter.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const double = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  return { count, double, increment }
})
```

```vue
<script setup>
import { useCounterStore } from '../stores/counter'

const counter = useCounterStore()
</script>

<template>
  <p>计数: {{ counter.count }} (双倍: {{ counter.double }})</p>
  <button @click="counter.increment()">+1</button>
</template>
```

---

## 第八步：实际项目中的常用模式

### 1. 组合式函数封装

```js
// composables/useCounter.js
import { ref } from 'vue'

export function useCounter(initial = 0) {
  const count = ref(initial)
  const increment = () => count.value++
  const decrement = () => count.value--
  const reset = () => count.value = initial
  return { count, increment, decrement, reset }
}
```

### 2. 生命周期

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  console.log('组件出现了！')
  // 请求数据、绑定事件、启动定时器
})

onUnmounted(() => {
  console.log('组件消失了！')
  // 清理定时器、解绑事件
})
</script>
```

### 3. 异步数据请求

```vue
<script setup>
import { ref, onMounted } from 'vue'

const users = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch('https://api.example.com/users')
    users.value = await res.json()
  } catch (e) {
    console.error('请求失败:', e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <p v-if="loading">加载中...</p>
  <ul v-else>
    <li v-for="user in users" :key="user.id">{{ user.name }}</li>
  </ul>
</template>
```

---

## 学习路线建议

```
第 1 周: 项目搭建 + SFC 基础 + ref/reactive
第 2 周: 指令 + 事件 + 组件通信（props/emit）
第 3 周: 生命周期 + 组合式函数 + 插槽
第 4 周: Vue Router + Pinia
第 5 周: 实战项目（TODO、博客、后台管理）
第 6 周: TypeScript + 测试 + 部署
```

---

## 常见问题

**Q: 选 Options API 还是 Composition API？**
新项目建议直接 Composition API。老项目维护可以继续 Options API。

**Q: Vue 3 还需要学 Vuex 吗？**
不需要。Pinia 是官方推荐的替代方案，更简洁。

**Q: `<script setup>` 和普通 `<script>` 有什么区别？**
`<script setup>` 是语法糖，自动注册组件、自动暴露变量，代码量更少。新项目推荐使用。

**Q: 怎么学最快？**
边学边做。学完基础语法后，立刻做一个完整项目（比如 TODO、博客），遇到问题再查文档。

---

## 推荐资源

- [Vue 3 官方文档](https://cn.vuejs.org/) — 中文，非常详细
- [Vue Router 文档](https://router.vuejs.org/zh/)
- [Pinia 文档](https://pinia.vuejs.org/zh/)
- [Vite 文档](https://cn.vitejs.dev/)

---

## 总结

Vue 3 的学习曲线并不陡峭，核心就是：

1. **响应式数据** — ref / reactive
2. **模板语法** — 指令、事件、插值
3. **组件化** — props / emit / 插槽
4. **路由和状态** — Vue Router + Pinia

从一个小项目开始，逐步深入。不需要一次学完所有内容。
