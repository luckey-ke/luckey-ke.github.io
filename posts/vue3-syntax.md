## 前言

Vue 3 带来了 Composition API、更好的 TypeScript 支持、性能提升等一系列改进。本文是 Vue 3 的语法速查手册，涵盖从基础到进阶的所有核心语法。

---

## 项目创建

```bash
# 使用 create-vue（推荐）
npm create vue@latest my-project

# 使用 Vite
npm create vite@latest my-project -- --template vue

# Vue 2 项目迁移
npm install -g @vue/cli
vue upgrade
```

---

## 组件基础

### 选项式 API (Options API)

```vue
<script>
export default {
  data() {
    return {
      count: 0,
      message: 'Hello Vue 3'
    }
  },
  methods: {
    increment() {
      this.count++
    }
  },
  computed: {
    doubleCount() {
      return this.count * 2
    }
  },
  watch: {
    count(newVal, oldVal) {
      console.log(`从 ${oldVal} 变为 ${newVal}`)
    }
  },
  mounted() {
    console.log('组件已挂载')
  }
}
</script>

<template>
  <div>
    <p>{{ message }}</p>
    <p>计数: {{ count }} (双倍: {{ doubleCount }})</p>
    <button @click="increment">+1</button>
  </div>
</template>
```

### 组合式 API (Composition API)

```vue
<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const count = ref(0)
const message = ref('Hello Vue 3')

const doubleCount = computed(() => count.value * 2)

function increment() {
  count.value++
}

watch(count, (newVal, oldVal) => {
  console.log(`从 ${oldVal} 变为 ${newVal}`)
})

onMounted(() => {
  console.log('组件已挂载')
})
</script>

<template>
  <div>
    <p>{{ message }}</p>
    <p>计数: {{ count }} (双倍: {{ doubleCount }})</p>
    <button @click="increment">+1</button>
  </div>
</template>
```

---

## 响应式基础

### ref 和 reactive

```vue
<script setup>
import { ref, reactive, toRefs } from 'vue'

// ref — 用于基本类型
const count = ref(0)
console.log(count.value)  // 访问需要 .value

// reactive — 用于对象
const state = reactive({
  name: 'Vue',
  version: 3,
  features: ['Composition API', 'Teleport', 'Suspense']
})

// 在模板中自动解包，不需要 .value
// toRefs — 将 reactive 对象解构为独立的 ref
const { name, version } = toRefs(state)
</script>
```

### computed 计算属性

```vue
<script setup>
import { ref, computed } from 'vue'

const firstName = ref('张')
const lastName = ref('三')

// 只读
const fullName = computed(() => `${firstName.value}${lastName.value}`)

// 可写
const writableFullName = computed({
  get: () => `${firstName.value}${lastName.value}`,
  set: (val) => {
    const [first, ...rest] = val.split('')
    firstName.value = first
    lastName.value = rest.join('')
  }
})
</script>
```

### watch 和 watchEffect

```vue
<script setup>
import { ref, watch, watchEffect } from 'vue'

const keyword = ref('')
const userId = ref(1)

// watch — 监听指定源
watch(keyword, (newVal, oldVal) => {
  console.log(`搜索词: ${oldVal} → ${newVal}`)
  fetchResults(newVal)
}, { immediate: true })  // 立即执行一次

// 监听多个源
watch([keyword, userId], ([newKw, newId], [oldKw, oldId]) => {
  console.log('任一变化都会触发')
})

// 深度监听
const formData = reactive({ user: { name: '' } })
watch(formData, (val) => {
  console.log('对象变化:', val)
}, { deep: true })

// watchEffect — 自动追踪依赖
watchEffect(() => {
  // keyword 变化时自动重新执行
  console.log('当前搜索词:', keyword.value)
})
</script>
```

---

## 模板语法

### 指令

```vue
<template>
  <!-- 条件渲染 -->
  <p v-if="show">显示</p>
  <p v-else-if="loading">加载中...</p>
  <p v-else>隐藏</p>
  <p v-show="visible">始终渲染，CSS 切换显示</p>

  <!-- 列表渲染 -->
  <ul>
    <li v-for="(item, index) in list" :key="item.id">
      {{ index }}. {{ item.name }}
    </li>
  </ul>

  <!-- 属性绑定 -->
  <img :src="imageUrl" :alt="title">
  <div :class="{ active: isActive, 'text-bold': isBold }"></div>
  <div :style="{ color: textColor, fontSize: size + 'px' }"></div>

  <!-- 事件绑定 -->
  <button @click="handleClick">点击</button>
  <form @submit.prevent="onSubmit">阻止默认</form>
  <div @scroll.passive="onScroll">passive 优化</div>
  <input @keyup.enter="search" @keyup.ctrl.s="save">

  <!-- 双向绑定 -->
  <input v-model="message">
  <textarea v-model="bio"></textarea>
  <select v-model="selected">
    <option v-for="opt in options" :key="opt" :value="opt">{{ opt }}</option>
  </select>
  <input type="checkbox" v-model="agreed">
  <input type="radio" v-model="gender" value="male">
  <input type="radio" v-model="gender" value="female">
</template>
```

### 修饰符

```vue
<template>
  <!-- 表单修饰符 -->
  <input v-model.lazy="msg">      <!-- change 事件触发 -->
  <input v-model.number="age">    <!-- 自动转数字 -->
  <input v-model.trim="name">     <!-- 自动去空格 -->

  <!-- 事件修饰符 -->
  <div @click.stop="handler">     <!-- 阻止冒泡 -->
  <div @click.once="handler">     <!-- 只触发一次 -->
  <div @click.self="handler">     <!-- 只在自身触发 -->
  <a @click.prevent="handler">    <!-- 阻止默认行为 -->

  <!-- 按键修饰符 -->
  <input @keyup.enter="submit">
  <input @keyup.tab="next">
  <input @keyup.delete="remove">
  <input @keyup.esc="cancel">
  <input @keyup.space="toggle">
</template>
```

---

## 组件通信

### Props 和 Emits

```vue
<!-- 子组件 Child.vue -->
<script setup>
// 定义 props
const props = defineProps({
  title: { type: String, required: true },
  count: { type: Number, default: 0 },
  list: { type: Array, default: () => [] }
})

// 定义 emits
const emit = defineEmits(['update', 'delete'])

function handleUpdate() {
  emit('update', { id: props.count, data: 'new' })
}
</script>

<template>
  <div>
    <h3>{{ title }}</h3>
    <button @click="handleUpdate">更新</button>
    <button @click="$emit('delete', count)">删除</button>
  </div>
</template>
```

```vue
<!-- 父组件 -->
<template>
  <Child
    :title="myTitle"
    :count="42"
    :list="items"
    @update="onUpdate"
    @delete="onDelete"
  />
</template>
```

### v-model 组件双向绑定

```vue
<!-- 子组件 CustomInput.vue -->
<script setup>
const model = defineModel()  // Vue 3.4+

// 或传统方式
// const props = defineProps(['modelValue'])
// const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <input :value="model" @input="model = $event.target.value">
</template>

<!-- 使用 -->
<CustomInput v-model="searchText" />
```

### provide / inject（跨层级传值）

```vue
<!-- 祖先组件 -->
<script setup>
import { provide, ref } from 'vue'

const theme = ref('dark')
provide('theme', theme)
provide('version', '3.0')
</script>

<!-- 后代组件（任意深度） -->
<script setup>
import { inject } from 'vue'

const theme = inject('theme', ref('light'))  // 带默认值
const version = inject('version')
</script>
```

### 状态管理 — Pinia

```js
// stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  getters: {
    double: (state) => state.count * 2
  },
  actions: {
    increment() {
      this.count++
    },
    async fetchCount() {
      this.count = await api.getCount()
    }
  }
})

// 组合式写法
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const double = computed(() => count.value * 2)
  function increment() { count.value++ }
  return { count, double, increment }
})
```

---

## 生命周期

```
onBeforeMount   → 挂载前
onMounted       → 挂载后（可访问 DOM）
onBeforeUpdate  → 更新前
onUpdated       → 更新后
onBeforeUnmount → 卸载前
onUnmounted     → 卸载后（清理定时器、事件监听）
onErrorCaptured → 捕获后代组件错误
onActivated     → keep-alive 缓存激活
onDeactivated   → keep-alive 缓存失活
```

---

## 组合式函数 (Composables)

复用有状态逻辑的函数，替代 mixins。

```js
// composables/useMouse.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(e) {
    x.value = e.pageX
    y.value = e.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}

// composables/useFetch.js
import { ref, watchEffect } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(true)

  watchEffect(() => {
    loading.value = true
    fetch(url)
      .then(r => r.json())
      .then(json => { data.value = json; loading.value = false })
      .catch(e => { error.value = e; loading.value = false })
  })

  return { data, error, loading }
}
```

```vue
<!-- 使用 -->
<script setup>
import { useMouse } from './composables/useMouse'
import { useFetch } from './composables/useFetch'

const { x, y } = useMouse()
const { data: users, loading } = useFetch('/api/users')
</script>
```

---

## 路由 — Vue Router

```js
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('./views/Home.vue') },
  {
    path: '/user/:id',
    component: () => import('./views/User.vue'),
    props: true,  // 路由参数作为 props 传入
    children: [
      { path: 'profile', component: () => import('./views/Profile.vue') }
    ]
  },
  { path: '/:pathMatch(.*)*', component: () => import('./views/404.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

```vue
<!-- 使用 -->
<template>
  <nav>
    <router-link to="/">首页</router-link>
    <router-link :to="{ name: 'user', params: { id: 123 }}">用户</router-link>
  </nav>
  <router-view />

  <!-- 编程式导航 -->
  <button @click="$router.push('/about')">跳转</button>
  <button @click="$router.replace('/login')">替换</button>
  <button @click="$router.go(-1)">后退</button>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

console.log(route.params.id)
console.log(route.query.keyword)

router.push({ path: '/user', query: { page: 1 } })
</script>
```

---

## 高级特性

### Teleport

将组件渲染到 DOM 中的其他位置。

```vue
<template>
  <button @click="showModal = true">打开弹窗</button>

  <Teleport to="body">
    <div v-if="showModal" class="modal">
      <h2>弹窗内容</h2>
      <button @click="showModal = false">关闭</button>
    </div>
  </Teleport>
</template>
```

### Suspense

异步组件的加载状态处理。

```vue
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <div>加载中...</div>
    </template>
  </Suspense>
</template>
```

### 动态组件

```vue
<template>
  <component :is="currentTab" />

  <!-- 带缓存 -->
  <keep-alive>
    <component :is="currentTab" />
  </keep-alive>
</template>
```

### 自定义指令

```vue
<script setup>
// 注册局部指令
const vFocus = {
  mounted: (el) => el.focus()
}

const vHighlight = {
  mounted: (el, binding) => {
    el.style.backgroundColor = binding.value || 'yellow'
  }
}
</script>

<template>
  <input v-focus />
  <p v-highlight="'#ff0'">高亮文字</p>
</template>
```

### 插槽

```vue
<!-- 子组件 Layout.vue -->
<template>
  <header><slot name="header">默认标题</slot></header>
  <main><slot /></main>  <!-- 默认插槽 -->
  <footer><slot name="footer" :year="currentYear"></slot></footer>
</template>

<!-- 父组件使用 -->
<Layout>
  <template #header>自定义标题</template>
  <p>主内容</p>
  <template #footer="{ year }">
    <p>© {{ year }} 版权所有</p>
  </template>
</Layout>
```

---

## 总结

Vue 3 的核心改进：

- **Composition API** — 更好的逻辑复用和 TypeScript 支持
- **ref/reactive** — 精细的响应式控制
- **组合式函数** — 替代 mixins 的更好方案
- **Pinia** — 官方推荐的状态管理
- **Teleport/Suspense** — 解决实际开发痛点
- **性能提升** — 更快的 diff、Tree-shaking、更小的包体积

建议新项目直接使用 `<script setup>` + Composition API，这是 Vue 3 的主流写法。
