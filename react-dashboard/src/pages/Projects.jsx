import React, { useState } from 'react'

const allProjects = [
  {
    id: 1,
    title: 'OPA 201',
    desc: 'Сайт городской любительской футбольной лиги. Canvas-анимации, HLS видеопотоки матчей и динамичная навигация.',
    tags: ['HTML', 'CSS', 'GSAP', 'HLS.js'],
    status: 'live',
    statusLabel: 'Live',
    emoji: '⚽',
    gradient: 'linear-gradient(135deg, #064e3b, #065f46)',
    category: 'web',
  },
  {
    id: 2,
    title: 'Juggler',
    desc: 'Платформа для управления задачами с авторизацией, галереей и Node.js бэкендом.',
    tags: ['Node.js', 'Canvas', 'JavaScript', 'HTML'],
    status: 'demo',
    statusLabel: 'Demo',
    emoji: '🎯',
    gradient: 'linear-gradient(135deg, #1e1b4b, #312e81)',
    category: 'fullstack',
  },
  {
    id: 3,
    title: 'Moodle v2',
    desc: 'Переработанная LMS система с HLS-видеолекциями и панелью администратора.',
    tags: ['HTML', 'CSS', 'HLS.js', 'Admin'],
    status: 'demo',
    statusLabel: 'Demo',
    emoji: '📚',
    gradient: 'linear-gradient(135deg, #7c2d12, #9a3412)',
    category: 'web',
  },
  {
    id: 4,
    title: 'BITER Dashboard',
    desc: 'Аналитическая панель разработчика с графиками, статистикой и лентой активности.',
    tags: ['React', 'Recharts', 'Framer Motion', 'Vite'],
    status: 'wip',
    statusLabel: 'In Progress',
    emoji: '📊',
    gradient: 'linear-gradient(135deg, #3b0764, #4c1d95)',
    category: 'react',
  },
  {
    id: 5,
    title: 'BITER STUDIO WebGL',
    desc: 'WebGL сайт студии с Three.js сценами, частицами и scroll-driven анимациями.',
    tags: ['Three.js', 'WebGL', 'GSAP', 'GLSL'],
    status: 'wip',
    statusLabel: 'In Progress',
    emoji: '🌌',
    gradient: 'linear-gradient(135deg, #0c4a6e, #075985)',
    category: 'web',
  },
  {
    id: 6,
    title: 'NFT Telegram Bot',
    desc: 'Telegram бот для торговли NFT на TON блокчейне с маркетплейсом и кошельком.',
    tags: ['Python', 'aiogram', 'TON', 'SQLite'],
    status: 'wip',
    statusLabel: 'In Progress',
    emoji: '🤖',
    gradient: 'linear-gradient(135deg, #0f172a, #1e293b)',
    category: 'bot',
  },
]

const filters = [
  { id: 'all', label: 'Все' },
  { id: 'web', label: 'Web' },
  { id: 'react', label: 'React' },
  { id: 'fullstack', label: 'Fullstack' },
  { id: 'bot', label: 'Bots' },
]

export default function Projects() {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all'
    ? allProjects
    : allProjects.filter(p => p.category === filter)

  return (
    <div className="page">
      <div className="page__header">
        <div className="page__kicker">BITER · PORTFOLIO</div>
        <h1 className="page__title">Проекты</h1>
        <p className="page__sub">Все работы — от идеи до деплоя.</p>
      </div>

      <div className="filter-tabs">
        {filters.map(f => (
          <button
            key={f.id}
            className={`filter-tab${filter === f.id ? ' active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="projects-grid">
        {filtered.map(p => (
          <div className="project-card" key={p.id}>
            <div className="project-card__banner" style={{ background: p.gradient }}>
              <span style={{ fontSize: '3.5rem', filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))' }}>
                {p.emoji}
              </span>
            </div>
            <div className="project-card__body">
              <div className={`project-card__status status-${p.status}`}>
                <span className="status-dot"></span>
                {p.statusLabel}
              </div>
              <div className="project-card__title">{p.title}</div>
              <div className="project-card__desc">{p.desc}</div>
              <div className="project-card__tags">
                {p.tags.map((t, i) => <span className="tag" key={i}>{t}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
