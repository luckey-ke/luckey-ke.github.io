/**
 * main.js — 交互逻辑
 * 打字机效果、滚动动画、导航、主题切换
 */
;(function () {
  'use strict'

  // ===== Typewriter =====
  const roles = [
    '全栈开发者',
    '开源爱好者',
    'UI 设计玩家',
    '终端美学主义者',
    'AI 探索者',
    '代码创作者',
  ]
  let roleIdx = 0, charIdx = 0, deleting = false
  const typeEl = document.getElementById('typewriter')

  function typewrite() {
    if (!typeEl) return
    const current = roles[roleIdx]

    if (!deleting) {
      typeEl.textContent = current.slice(0, charIdx + 1)
      charIdx++
      if (charIdx === current.length) {
        setTimeout(() => { deleting = true; typewrite() }, 2000)
        return
      }
    } else {
      typeEl.textContent = current.slice(0, charIdx)
      charIdx--
      if (charIdx < 0) {
        deleting = false
        charIdx = 0
        roleIdx = (roleIdx + 1) % roles.length
        setTimeout(typewrite, 400)
        return
      }
    }
    setTimeout(typewrite, deleting ? 40 : 80)
  }
  setTimeout(typewrite, 1000)

  // ===== Nav scroll behavior =====
  const nav = document.getElementById('nav')
  let lastScroll = 0
  window.addEventListener('scroll', () => {
    const st = window.scrollY
    if (st > 100 && st > lastScroll) {
      nav?.classList.add('hidden')
    } else {
      nav?.classList.remove('hidden')
    }
    lastScroll = st
  }, { passive: true })

  // Active nav link
  const sections = document.querySelectorAll('section[id]')
  const navLinks = document.querySelectorAll('.nav-link')
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'))
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`)
        active?.classList.add('active')
      }
    })
  }, { threshold: 0.3 })
  sections.forEach(s => observer.observe(s))

  // ===== Scroll Reveal =====
  const reveals = document.querySelectorAll('.blog-card, .project-card, .section-header, .about-grid')
  reveals.forEach(el => el.classList.add('reveal'))
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
      }
    })
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })
  reveals.forEach(el => revealObserver.observe(el))

  // ===== Theme Toggle =====
  const toggle = document.getElementById('theme-toggle')
  const saved = localStorage.getItem('theme')
  if (saved) document.documentElement.setAttribute('data-theme', saved)

  toggle?.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light'
    document.documentElement.setAttribute('data-theme', isLight ? 'dark' : 'light')
    localStorage.setItem('theme', isLight ? 'dark' : 'light')
  })

  // ===== Physics hover effect on cards =====
  document.querySelectorAll('[data-physics="hover"]').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const rotateX = (y - centerY) / 20
      const rotateY = (centerX - x) / 20
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`
    })
    card.addEventListener('mouseleave', () => {
      card.style.transform = ''
    })
  })

  // ===== Smooth anchor scroll =====
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'))
      if (target) {
        e.preventDefault()
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  })
})()
