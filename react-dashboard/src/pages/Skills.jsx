import React, { useEffect, useRef } from 'react'

const skillCategories = [
  {
    title: '🎨 Frontend',
    skills: [
      { name: 'HTML5 / CSS3', pct: 95, color: 'linear-gradient(90deg, #f97316, #fb923c)' },
      { name: 'JavaScript ES6+', pct: 88, color: 'linear-gradient(90deg, #eab308, #facc15)' },
      { name: 'React', pct: 75, color: 'linear-gradient(90deg, #06b6d4, #22d3ee)' },
      { name: 'GSAP / Animations', pct: 82, color: 'linear-gradient(90deg, #a855f7, #d946ef)' },
      { name: 'Canvas API', pct: 80, color: 'linear-gradient(90deg, #8b5cf6, #a78bfa)' },
    ]
  },
  {
    title: '🌌 3D & WebGL',
    skills: [
      { name: 'Three.js', pct: 72, color: 'linear-gradient(90deg, #ec4899, #f472b6)' },
      { name: 'WebGL / GLSL', pct: 60, color: 'linear-gradient(90deg, #6366f1, #818cf8)' },
    ]
  },
  {
    title: '⚙️ Backend & Tools',
    skills: [
      { name: 'Node.js', pct: 70, color: 'linear-gradient(90deg, #22c55e, #4ade80)' },
      { name: 'Python', pct: 65, color: 'linear-gradient(90deg, #3b82f6, #60a5fa)' },
      { name: 'SQLite / Databases', pct: 60, color: 'linear-gradient(90deg, #64748b, #94a3b8)' },
    ]
  },
  {
    title: '🤖 Telegram & Bots',
    skills: [
      { name: 'aiogram 3', pct: 70, color: 'linear-gradient(90deg, #06b6d4, #22d3ee)' },
      { name: 'TON / Blockchain', pct: 50, color: 'linear-gradient(90deg, #a78bfa, #c4b5fd)' },
    ]
  },
]

function SkillBar({ skill }) {
  const fillRef = useRef(null)

  useEffect(() => {
    const el = fillRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.style.width = skill.pct + '%'
        observer.disconnect()
      }
    }, { threshold: 0.5 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [skill.pct])

  return (
    <div className="skill-bar">
      <div className="skill-bar__name">{skill.name}</div>
      <div className="skill-bar__track">
        <div
          ref={fillRef}
          className="skill-bar__fill"
          style={{ width: 0, background: skill.color }}
        />
      </div>
      <div className="skill-bar__pct">{skill.pct}%</div>
    </div>
  )
}

export default function Skills() {
  return (
    <div className="page">
      <div className="page__header">
        <div className="page__kicker">BITER · SKILLS MAP</div>
        <h1 className="page__title">Навыки</h1>
        <p className="page__sub">Технологии, с которыми я работаю каждый день.</p>
      </div>

      {skillCategories.map((cat, i) => (
        <div className="skills-section" key={i}>
          <div className="skills-section__title">{cat.title}</div>
          {cat.skills.map((skill, j) => (
            <SkillBar key={j} skill={skill} />
          ))}
        </div>
      ))}
    </div>
  )
}
