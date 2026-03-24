/**
 * physics.js — 2D 物理引擎 + 粒子背景
 * 支持重力、弹性碰撞、摩擦力、鼠标交互
 */
;(function () {
  'use strict'

  const canvas = document.getElementById('physics-canvas')
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  let W, H
  let mouse = { x: -9999, y: -9999, active: false }
  let particles = []
  let dpr = window.devicePixelRatio || 1

  // ===== Config =====
  const CFG = {
    count: 50,
    gravity: 0.15,
    friction: 0.99,
    restitution: 0.7,     // 弹性系数
    mouseRadius: 120,
    mouseForce: 0.8,
    minR: 3,
    maxR: 8,
    colors: [
      'rgba(124,92,252,0.6)',
      'rgba(192,132,252,0.5)',
      'rgba(244,114,182,0.5)',
      'rgba(96,165,250,0.5)',
      'rgba(52,211,153,0.4)',
    ],
  }

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
      this.y = y ?? Math.random() * H * 0.6
      this.vx = (Math.random() - 0.5) * 2
      this.vy = (Math.random() - 0.5) * 2
      this.r = CFG.minR + Math.random() * (CFG.maxR - CFG.minR)
      this.mass = this.r * this.r
      this.color = CFG.colors[Math.floor(Math.random() * CFG.colors.length)]
      this.opacity = 0.3 + Math.random() * 0.5
    }

    update() {
      // Gravity
      this.vy += CFG.gravity

      // Mouse interaction (attraction + repulsion zone)
      if (mouse.active) {
        const dx = mouse.x - this.x
        const dy = mouse.y - this.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < CFG.mouseRadius && dist > 0) {
          const force = (1 - dist / CFG.mouseRadius) * CFG.mouseForce
          // Push away if very close, attract if medium distance
          const dir = dist < CFG.mouseRadius * 0.3 ? -1 : 1
          this.vx += (dx / dist) * force * dir
          this.vy += (dy / dist) * force * dir
        }
      }

      // Friction
      this.vx *= CFG.friction
      this.vy *= CFG.friction

      // Position
      this.x += this.vx
      this.y += this.vy

      // Wall bounce (with restitution)
      if (this.x - this.r < 0) {
        this.x = this.r
        this.vx *= -CFG.restitution
      }
      if (this.x + this.r > W) {
        this.x = W - this.r
        this.vx *= -CFG.restitution
      }
      if (this.y - this.r < 0) {
        this.y = this.r
        this.vy *= -CFG.restitution
      }
      if (this.y + this.r > H) {
        this.y = H - this.r
        this.vy *= -CFG.restitution
        // Ground friction
        this.vx *= 0.95
      }
    }

    draw() {
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
      ctx.fillStyle = this.color
      ctx.fill()

      // Glow
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.r * 2.5, 0, Math.PI * 2)
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 2.5)
      grad.addColorStop(0, this.color)
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.fill()
    }
  }

  // ===== Collision Detection (simple brute-force, fine for < 100 particles) =====
  function resolveCollisions() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const minDist = a.r + b.r

        if (dist < minDist && dist > 0) {
          // Normal
          const nx = dx / dist
          const ny = dy / dist

          // Separate
          const overlap = minDist - dist
          const totalMass = a.mass + b.mass
          a.x -= nx * overlap * (b.mass / totalMass)
          a.y -= ny * overlap * (b.mass / totalMass)
          b.x += nx * overlap * (a.mass / totalMass)
          b.y += ny * overlap * (a.mass / totalMass)

          // Elastic collision impulse
          const dvx = a.vx - b.vx
          const dvy = a.vy - b.vy
          const dvDotN = dvx * nx + dvy * ny

          if (dvDotN > 0) {
            const impulse = (2 * dvDotN) / totalMass * CFG.restitution
            a.vx -= impulse * b.mass * nx
            a.vy -= impulse * b.mass * ny
            b.vx += impulse * a.mass * nx
            b.vy += impulse * a.mass * ny
          }
        }
      }
    }
  }

  // ===== Draw connection lines =====
  function drawConnections() {
    const maxDist = 150
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j]
        const dx = b.x - a.x, dy = b.y - a.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.12
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = `rgba(124,92,252,${alpha})`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }
    }
  }

  // ===== Loop =====
  function animate() {
    ctx.clearRect(0, 0, W, H)

    drawConnections()

    for (const p of particles) {
      p.update()
      p.draw()
    }

    resolveCollisions()

    requestAnimationFrame(animate)
  }

  // ===== Init =====
  function init() {
    resize()
    particles = []
    const count = Math.min(CFG.count, Math.floor((W * H) / 25000))
    for (let i = 0; i < count; i++) {
      particles.push(new Particle())
    }
  }

  // ===== Events =====
  window.addEventListener('resize', () => {
    resize()
  })

  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX
    mouse.y = e.clientY
    mouse.active = true
  })

  document.addEventListener('mouseleave', () => {
    mouse.active = false
  })

  // Touch support
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

  // Click to spawn particles
  document.addEventListener('click', (e) => {
    if (e.target.closest('.nav, .btn, .blog-card, .project-card, a, button')) return
    for (let i = 0; i < 5; i++) {
      const p = new Particle(e.clientX, e.clientY)
      p.vx = (Math.random() - 0.5) * 8
      p.vy = (Math.random() - 0.5) * 8 - 3
      particles.push(p)
    }
    // Cap particles
    while (particles.length > 120) particles.shift()
  })

  init()
  animate()
})()
