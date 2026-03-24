## 🎯 为什么要自己写物理引擎？

市面上有很多成熟的物理引擎（Matter.js, Box2D, Planck.js），但它们往往体积庞大，API 复杂。如果你只是想在网页上加一些有趣的物理效果，完全可以自己写一个轻量级的。

本文将从最基础的物理概念出发，逐步构建一个支持**重力**、**弹性碰撞**、**摩擦力**和**鼠标交互**的 2D 物理引擎。

## 📐 核心物理概念

### 1. 速度与加速度

最基本的运动模型：每一帧更新位置 = 位置 + 速度，每一帧更新速度 = 速度 + 加速度。

```javascript
// 每帧更新
particle.x += particle.vx;
particle.y += particle.vy;
particle.vy += gravity; // 重力加速度
```

### 2. 弹性碰撞

当两个圆形粒子碰撞时，需要计算碰撞法线方向，然后沿法线方向交换动量。这里用到的核心公式是**弹性碰撞的动量守恒**：

```javascript
function resolveCollision(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const minDist = a.radius + b.radius;

  if (dist < minDist) {
    // 碰撞法线
    const nx = dx / dist;
    const ny = dy / dist;

    // 分离重叠
    const overlap = minDist - dist;
    const totalMass = a.mass + b.mass;
    a.x -= nx * overlap * (b.mass / totalMass);
    a.y -= ny * overlap * (b.mass / totalMass);
    b.x += nx * overlap * (a.mass / totalMass);
    b.y += ny * overlap * (a.mass / totalMass);

    // 弹性碰撞：交换法线方向速度
    const dvx = a.vx - b.vx;
    const dvy = a.vy - b.vy;
    const dvDotN = dvx * nx + dvy * ny;

    if (dvDotN > 0) {
      const impulse = (2 * dvDotN) / totalMass;
      a.vx -= impulse * b.mass * nx;
      a.vy -= impulse * b.mass * ny;
      b.vx += impulse * a.mass * nx;
      b.vy += impulse * a.mass * ny;
    }
  }
}
```

### 3. 摩擦力与能量损失

真实的物理世界不存在完美的弹性碰撞。我们在每次碰撞时乘以一个**恢复系数 (restitution)**，在运动中乘以**摩擦系数**：

```javascript
// 恢复系数: 0 = 完全非弹性, 1 = 完全弹性
velocity *= restitution;

// 空气/地面摩擦
velocity *= friction; // e.g., 0.99
```

### 4. 边界反弹

```javascript
// 左右边界
if (particle.x - particle.r < 0) {
  particle.x = particle.r;
  particle.vx *= -restitution;
}
if (particle.x + particle.r > canvasWidth) {
  particle.x = canvasWidth - particle.r;
  particle.vx *= -restitution;
}
```

## 🖱️ 鼠标交互

鼠标交互让物理效果更有生命力。我们实现一个"引力场"效果：鼠标附近的粒子会被吸引或排斥。

```javascript
function applyMouseForce(particle, mouseX, mouseY) {
  const dx = mouseX - particle.x;
  const dy = mouseY - particle.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < MOUSE_RADIUS && dist > 0) {
    const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE;
    // 近处推开，远处吸引
    const direction = dist < MOUSE_RADIUS * 0.3 ? -1 : 1;
    particle.vx += (dx / dist) * force * direction;
    particle.vy += (dy / dist) * force * direction;
  }
}
```

## ⚡ 性能优化

暴力检测所有粒子对的碰撞是 O(n²) 的。对于少于 100 个粒子的场景这完全够用。如果粒子数量更多，可以用以下优化：

- **空间分割 (Spatial Partitioning)**：将画布分成网格，只检测同一格子或相邻格子中的粒子
- **四叉树 (Quadtree)**：递归地将空间分成四块，快速剔除不相关的粒子对
- **Sweep and Prune**：沿一个轴排序，只检测区间重叠的粒子

## 🎨 视觉增强

物理准确只是基础，视觉效果同样重要：

- 每个粒子加一个径向渐变的**辉光效果**
- 距离较近的粒子之间画**连接线**，模拟分子间作用力
- 点击时**爆发新粒子**，带随机初速度
- 使用 `requestAnimationFrame` 保证 60fps 流畅度

## 🚀 总结

自己动手写物理引擎是理解游戏开发和模拟系统最好的方式。不需要复杂框架，几百行 JavaScript 就能做出令人惊艳的效果。

> 💡 **小贴士：**本博客背景的粒子系统就是用这篇文章介绍的技术实现的。打开开发者工具可以在 physics.js 中看到完整源码。
