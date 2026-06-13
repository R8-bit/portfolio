import React, { useEffect, useState, useRef } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts'

// ── Данные ──────────────────────────────────────────────
const earningsData = [
  { month: 'Янв', value: 12000 },
  { month: 'Фев', value: 18500 },
  { month: 'Мар', value: 14200 },
  { month: 'Апр', value: 22000 },
  { month: 'Май', value: 19800 },
  { month: 'Июн', value: 31000 },
  { month: 'Июл', value: 28500 },
  { month: 'Авг', value: 35000 },
]

const techPieData = [
  { name: 'JavaScript', value: 35, color: '#f7df1e' },
  { name: 'React', value: 25, color: '#61dafb' },
  { name: 'CSS/GSAP', value: 20, color: '#a78bfa' },
  { name: 'Node.js', value: 12, color: '#34d399' },
  { name: 'Three.js', value: 8,  color: '#f472b6' },
]

const activityData = [
  { action: 'Деплой OPA 201 на production', sub: 'HTML · CSS · GSAP', time: '2ч назад', color: '#34d399' },
  { action: 'Добавил WebGL сцены в STUDIO', sub: 'Three.js · GLSL',   time: '5ч назад', color: '#a78bfa' },
  { action: 'Обновил React Dashboard',       sub: 'React · Recharts',  time: '1д назад', color: '#22d3ee' },
  { action: 'Создал NFT бота',               sub: 'Python · aiogram',  time: '2д назад', color: '#f472b6' },
  { action: 'Мооdle v2 — HLS видео',         sub: 'HTML · HLS.js',     time: '3д назад', color: '#fb923c' },
]

// ── Кастомный тултип ────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#13132a',
      border: '1px solid rgba(139,92,246,0.3)',
      borderRadius: 8,
      padding: '10px 16px',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '0.75rem'
    }}>
      <div style={{ color: 'rgba(238,238,245,0.4)', marginBottom: 4 }}>{label}</div>
      <div style={{ color: '#a78bfa', fontWeight: 600 }}>
        {payload[0].value.toLocaleString('ru-RU')} ₽
      </div>
    </div>
  )
}

// ── Анимированный счётчик ───────────────────────────────
function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const duration = 1500
        const startTime = performance.now()
        const tick = (now) => {
          const elapsed = now - startTime
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setCount(Math.round(target * eased))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        observer.disconnect()
      }
    })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{count.toLocaleString('ru-RU')}{suffix}</span>
}

// ── КОМПОНЕНТ ───────────────────────────────────────────
export default function Dashboard() {
  return (
    <div className="page">
      <div className="page__header">
        <div className="page__kicker">BITER · DEVELOPER HQ</div>
        <h1 className="page__title">Dashboard</h1>
        <p className="page__sub">Аналитика, активность и статистика проектов в реальном времени.</p>
      </div>

      {/* Статистика */}
      <div className="stat-grid">
        {[
          { icon: '⚡', label: 'Проектов завершено', val: 6, suf: '', change: '+3 на этой неделе' },
          { icon: '💰', label: 'Общий доход (₽)',    val: 181000, suf: '', change: '+35k в этом месяце' },
          { icon: '⏱', label: 'Часов написано кода', val: 840, suf: 'h', change: 'avg 4h/день' },
          { icon: '🌐', label: 'Технологий освоено', val: 12, suf: '', change: '+3 в этом квартале' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <span className="stat-card__icon">{s.icon}</span>
            <div className="stat-card__value">
              <Counter target={s.val} suffix={s.suf} />
            </div>
            <div className="stat-card__label">{s.label}</div>
            <div className="stat-card__change">↑ {s.change}</div>
          </div>
        ))}
      </div>

      {/* Графики */}
      <div className="charts-grid">
        {/* Доходы */}
        <div className="card">
          <div className="card__title">Доходы по месяцам</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={earningsData}>
              <defs>
                <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="0" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(238,238,245,0.35)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(238,238,245,0.35)', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#a78bfa" strokeWidth={2} fill="url(#earningsGrad)" dot={{ fill: '#a78bfa', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#a78bfa' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Технологии */}
        <div className="card">
          <div className="card__title">Стек по времени</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={techPieData}
                cx="50%" cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {techPieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} opacity={0.85} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val, name) => [`${val}%`, name]}
                contentStyle={{
                  background: '#13132a',
                  border: '1px solid rgba(139,92,246,0.3)',
                  borderRadius: 8,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.75rem'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {techPieData.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(238,238,245,0.4)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.color, display: 'inline-block' }}></span>
                {t.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Активность */}
      <div className="card">
        <div className="card__title">Последняя активность</div>
        <div className="activity-list">
          {activityData.map((item, i) => (
            <div className="activity-item" key={i}>
              <div className="activity-dot" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }}></div>
              <div className="activity-item__body">
                <div className="activity-item__title">{item.action}</div>
                <div className="activity-item__sub">{item.sub}</div>
              </div>
              <div className="activity-item__time">{item.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
