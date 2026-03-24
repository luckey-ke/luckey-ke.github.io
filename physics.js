/**
 * physics.js — 高级 2D 物理引擎 + 粒子背景
 * 
 * 物理模型：
 *   - 重力（可调，带浮力模拟）
 *   - 空气阻力（速度平方关系 Cd * v²）
 *   - Perlin 噪声流场（有机湍流）
 *   - 弹性碰撞（含角动量传递）
 *   - 粒子拖尾（速度相关衰减）
 *   - 碰撞脉冲发光
 *   - 鼠标交互（斥力场 + 涡旋）
 */
;(function () {
  'use strict'

  const canvas = document.getElementById('physics-canvas')
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  let W, H
  let mouse = { x: -9999, y: -9999, vx: 0, vy: 0, prevX: -9999, prevY: -9999, active: false }
  let particles = []
  let dpr = window.devicePixelRatio || 1
  let frame = 0
  let lastTime = performance.now()

  // ===== Config =====
  const CFG = {
    count: 45,
    gravity: 0.04,             // 微重力（背景装饰用）
    buoyancy: -0.02,           // 浮力（部分抵消重力，模拟热气球感）
    airDensity: 0.0008,        // 空气阻力系数 Cd
    noiseScale: 0.002,         // 流场噪声缩放
    noiseStrength: 0.12,       // 流场力强度
    restitution: 0.65,         // 弹性系数
    angularDamping: 0.97,      // 角速度阻尼
    trailLength: 6,            // 拖尾帧数
    trailFade: 0.82,           // 拖尾衰减
    mouseRadius: 150,
    mouseRepel: 1.2,           // 鼠标斥力
    mouseVortex: 0.3,          // 鼠标涡旋力
    minR: 3,
    maxR: 7,
    pulseDecay: 0.92,          // 碰撞脉冲衰减
    colors: [
      { r: 124, g: 92, b: 252 },   // 紫
      { r: 192, g: 132, b: 252 },  // 浅紫
      { r: 244, g: 114, b: 182 },  // 粉
      { r: 96, g: 165, b: 250 },   // 蓝
      { r: 52, g: 211, b: 153 },   // 绿
    ],
  }

  // ===== Simplex Noise (compact 2D) =====
  // 用简化版 Perlin 风格噪声实现流场
  const noise = (() => {
    const perm = new Uint8Array(512)
    const grad = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]
    const seed = Math.random() * 65536 | 0
    for (let i = 0; i < 256; i++) perm[i] = i
    for (let i = 255; i > 0; i--) {
      const j = (seed + i * 137) % (i + 1)
      ;[perm[i], perm[j]] = [perm[j], perm[i]]
    }
    for (let i = 0; i < 256; i++) perm[i + 256] = perm[i]

    function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10) }
    function lerp(a, b, t) { return a + t * (b - a) }
    function dot(g, x, y) { return g[0] * x + g[1] * y }

    return function noise2d(x, y) {
      const X = Math.floor(x) & 255
      const Y = Math.floor(y) & 255
      x -= Math.floor(x)
      y -= Math.floor(y)
      const u = fade(x)
      const v = fade(y)
      const aa = perm[perm[X] + Y] & 7
      const ab = perm[perm[X] + Y + 1] & 7
      const ba = perm[perm[X + 1] + Y] & 7
      const bb = perm[perm[X + 1] + Y + 1] & 7
      return lerp(
        lerp(dot(grad[aa], x, y), dot(grad[ba], x - 1, y), u),
        lerp(dot(grad[ab], x, y - 1), dot(grad[bb], x - 1, y - 1), u),
        v
      )
    }
  })()

  // ===== Resize =====
  function resize() {
    W = window.innerWidth
    H = window.innerHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = W + 'px'
    canvas.style.height = H + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  // ===== Particle =====
  class Particle {
    constructor(x, y) {
      this.x = x ?? Math.random() * W
      this.y = y ?? Math.random() * H * 0.7
      this.vx = (Math.random() - 0.5) * 1.5
      this.vy = (Math.random() - 0.5) * 1.5
      this.r = CFG.minR + Math.random() * (CFG.maxR - CFG.minR)
      this.mass = this.r * this.r * 0.5
      this.invMass = 1 / this.mass
      // 角动量
      this.angle = Math.random() * Math.PI * 2
      this.angularVel = (Math.random() - 0.5) * 0.02
      // 颜色
      const c = CFG.colors[Math.floor(Math.random() * CFG.colors.length)]
      this.color = c
      this.baseAlpha = 0.35 + Math.random() * 0.35
      this.pulse = 0 // 碰撞脉冲亮度
      // 拖尾历史
      this.trail = []
      // 生命周期微调（让不同粒子有略微不同的浮力）
      this.buoyancyFactor = 0.7 + Math.random() * 0.6
    }

    update(dt) {
      // ===== 流场噪声力 =====
      const t = frame * 0.003
      const nx = noise(this.x * CFG.noiseScale + t, this.y * CFG.noiseScale)
      const ny = noise(this.x * CFG.noiseScale, this.y * CFG.noiseScale + t + 100)
      this.vx += nx * CFG.noiseStrength
      this.vy += ny * CFG.noiseStrength

      // ===== 重力 + 浮力 =====
      this.vy += CFG.gravity
      this.vy += CFG.buoyancy * this.buoyancyFactor

      // ===== 空气阻力 F = -Cd * |v| * v =====
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
      if (speed > 0.01) {
        const drag = CFG.airDensity * speed
        this.vx -= this.vx * drag
        this.vy -= this.vy * drag
      }

      // ===== 鼠标交互（斥力 + 涡旋）=====
      if (mouse.active) {
        const dx = this.x - mouse.x
        const dy = this.y - mouse.y
        const distSq = dx * dx + dy * dy
        const dist = Math.sqrt(distSq)
        if (dist < CFG.mouseRadius && dist > 1) {
          const falloff = 1 - dist / CFG.mouseRadius
          const falloffSq = falloff * falloff // 平方衰减更自然

          // 斥力（距离越近越强）
          const repelForce = CFG.mouseRepel * falloffSq / (dist * 0.1)
          this.vx += (dx / dist) * repelForce
          this.vy += (dy / dist) * repelForce

          // 涡旋（切向力）
          const vortexForce = CFG.mouseVortex * falloffSq
          this.vx += (-dy / dist) * vortexForce
          this.vy += (dx / dist) * vortexForce

          // 鼠标运动传递部分动量
          this.vx += mouse.vx * falloff * 0.05
          this.vy += mouse.vy * falloff * 0.05
        }
      }

      // ===== 积分位置 =====
      this.x += this.vx
      this.y += this.vy

      // ===== 墙壁碰撞 =====
      if (this.x - this.r < 0) {
        this.x = this.r
        this.vx *= -CFG.restitution
        this.angularVel += this.vy * 0.01 // 碰墙产生旋转
        this.pulse = Math.min(1, this.pulse + Math.abs(this.vx) * 0.3)
      }
      if (this.x + this.r > W) {
        this.x = W - this.r
        this.vx *= -CFG.restitution
        this.angularVel -= this.vy * 0.01
        this.pulse = Math.min(1, this.pulse + Math.abs(this.vx) * 0.3)
      }
      if (this.y - this.r < 0) {
        this.y = this.r
        this.vy *= -CFG.restitution
        this.angularVel += this.vx * 0.01
        this.pulse = Math.min(1, this.pulse + Math.abs(this.vy) * 0.3)
      }
      if (this.y + this.r > H) {
        this.y = H - this.r
        this.vy *= -CFG.restitution
        this.angularVel -= this.vx * 0.01
        this.pulse = Math.min(1, this.pulse + Math.abs(this.vy) * 0.3)
        // 地面摩擦
        this.vx *= 0.96
      }

      // ===== 角动量 =====
      this.angle += this.angularVel
      this.angularVel *= CFG.angularDamping

      // ===== 脉冲衰减 =====
      this.pulse *= CFG.pulseDecay
      if (this.pulse < 0.01) this.pulse = 0

      // ===== 拖尾记录 =====
      this.trail.push({ x: this.x, y: this.y })
      if (this.trail.length > CFG.trailLength) this.trail.shift()
    }

    draw() {
      const { r, g, b } = this.color
      const alpha = this.baseAlpha + this.pulse * 0.5

      // 拖尾
      if (this.trail.length > 1) {
        for (let i = 0; i < this.trail.length - 1; i++) {
          const t = i / this.trail.length
          const trailAlpha = t * alpha * 0.15
          const trailR = this.r * (0.3 + t * 0.7)
          ctx.beginPath()
          ctx.arc(this.trail[i].x, this.trail[i].y, trailR, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${r},${g},${b},${trailAlpha})`
          ctx.fill()
        }
      }

      // 主体（带旋转的不完美圆形，增强物理感）
      ctx.save()
      ctx.translate(this.x, this.y)
      ctx.rotate(this.angle)

      // 核心
      ctx.beginPath()
      // 用椭圆模拟轻微形变（高速时更明显）
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
      const stretch = Math.min(speed * 0.04, 0.3)
      ctx.ellipse(0, 0, this.r * (1 + stretch), this.r * (1 - stretch * 0.5), 0, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
      ctx.fill()

      // 内部高光
      const hlGrad = ctx.createRadialGradient(-this.r * 0.3, -this.r * 0.3, 0, 0, 0, this.r)
      hlGrad.addColorStop(0, `rgba(255,255,255,${0.15 + this.pulse * 0.3})`)
      hlGrad.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(0, 0, this.r, 0, Math.PI * 2)
      ctx.fillStyle = hlGrad
      ctx.fill()

      ctx.restore()

      // 光晕（碰撞脉冲时更亮）
      const glowR = this.r * (2.5 + this.pulse * 3)
      const glowAlpha = alpha * (0.25 + this.pulse * 0.4)
      const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowR)
      glow.addColorStop(0, `rgba(${r},${g},${b},${glowAlpha})`)
      glow.addColorStop(0.4, `rgba(${r},${g},${b},${glowAlpha * 0.3})`)
      glow.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(this.x, this.y, glowR, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()
    }
  }

  // ===== 碰撞检测与响应（含角动量）=====
  function resolveCollisions() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const distSq = dx * dx + dy * dy
        const minDist = a.r + b.r

        if (distSq < minDist * minDist && distSq > 0.01) {
          const dist = Math.sqrt(distSq)
          const nx = dx / dist
          const ny = dy / dist

          // 分离重叠
          const overlap = minDist - dist
          const totalInvMass = a.invMass + b.invMass
          a.x -= nx * overlap * (a.invMass / totalInvMass)
          a.y -= ny * overlap * (a.invMass / totalInvMass)
          b.x += nx * overlap * (b.invMass / totalInvMass)
          b.y += ny * overlap * (b.invMass / totalInvMass)

          // 相对速度
          const dvx = a.vx - b.vx
          const dvy = a.vy - b.vy
          const dvDotN = dvx * nx + dvy * ny

          if (dvDotN > 0) {
            // 弹性碰撞冲量（含弹性系数）
            const e = CFG.restitution
            const j_impulse = -(1 + e) * dvDotN / totalInvMass

            a.vx += j_impulse * a.invMass * nx
            a.vy += j_impulse * a.invMass * ny
            b.vx -= j_impulse * b.invMass * nx
            b.vy -= j_impulse * b.invMass * ny

            // 角动量传递（切向分量）
            const tx = -ny, ty = nx
            const dvTan = dvx * tx + dvy * ty
            const angTransfer = dvTan * 0.005
            a.angularVel += angTransfer
            b.angularVel -= angTransfer

            // 碰撞脉冲发光
            const impact = Math.abs(dvDotN)
            a.pulse = Math.min(1, a.pulse + impact * 0.15)
            b.pulse = Math.min(1, b.pulse + impact * 0.15)
          }
        }
      }
    }
  }

  // ===== 连接线（模拟分子键 / 引力线）=====
  function drawConnections() {
    const maxDist = 140
    const maxDistSq = maxDist * maxDist

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j]
        const dx = b.x - a.x, dy = b.y - a.y
        const distSq = dx * dx + dy * dy

        if (distSq < maxDistSq) {
          const dist = Math.sqrt(distSq)
          const ratio = dist / maxDist
          const alpha = (1 - ratio) * 0.1

          // 混合两粒子颜色
          const r = (a.color.r + b.color.r) >> 1
          const g = (a.color.g + b.color.g) >> 1
          const bl = (a.color.b + b.color.b) >> 1

          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = `rgba(${r},${g},${bl},${alpha})`
          ctx.lineWidth = (1 - ratio) * 1.5
          ctx.stroke()

          // 连线中点小光点（非常近时）
          if (ratio < 0.4) {
            const mx = (a.x + b.x) / 2
            const my = (a.y + b.y) / 2
            const dotAlpha = (1 - ratio / 0.4) * 0.25
            ctx.beginPath()
            ctx.arc(mx, my, 1.5, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(${r},${g},${bl},${dotAlpha})`
            ctx.fill()
          }
        }
      }
    }
  }

  // ===== 流场可视化（调试用，可选）=====
  function drawFlowField() {
    // 不绘制，纯计算驱动
  }

  // ===== 主循环 =====
  function animate(now) {
    const dt = Math.min((now - lastTime) / 16.67, 3) // 限制最大 dt 防止弹射
    lastTime = now
    frame++

    // 半透明清除（产生微弱的运动模糊效果）
    ctx.fillStyle = 'rgba(0,0,0,0)'
    ctx.clearRect(0, 0, W, H)

    // 更新鼠标速度
    mouse.vx = mouse.x - mouse.prevX
    mouse.vy = mouse.y - mouse.prevY
    mouse.prevX = mouse.x
    mouse.prevY = mouse.y

    drawConnections()

    for (const p of particles) {
      p.update(dt)
    }

    resolveCollisions()

    for (const p of particles) {
      p.draw()
    }

    requestAnimationFrame(animate)
  }

  // ===== Init =====
  function init() {
    resize()
    particles = []
    const count = Math.min(CFG.count, Math.floor((W * H) / 30000))
    for (let i = 0; i < count; i++) {
      particles.push(new Particle())
    }
  }

  // ===== Events =====
  window.addEventListener('resize', resize)

  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX
    mouse.y = e.clientY
    mouse.active = true
  })

  document.addEventListener('mouseleave', () => {
    mouse.active = false
  })

  // Touch
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX
      mouse.y = e.touches[0].clientY
      mouse.active = true
    }
  }, { passive: true })

  document.addEventListener('touchend', () => {
    mouse.active = false
  })

  // 点击爆发粒子
  document.addEventListener('click', (e) => {
    if (e.target.closest('.nav, .btn, .blog-card, .project-card, a, button')) return
    const burst = 6 + Math.floor(Math.random() * 4)
    for (let i = 0; i < burst; i++) {
      const angle = (Math.PI * 2 / burst) * i + Math.random() * 0.5
      const speed = 3 + Math.random() * 5
      const p = new Particle(e.clientX, e.clientY)
      p.vx = Math.cos(angle) * speed
      p.vy = Math.sin(angle) * speed - 2
      p.pulse = 0.8
      particles.push(p)
    }
    // 限制总数
    while (particles.length > 100) particles.shift()
  })

  init()
  requestAnimationFrame(animate)
})()
