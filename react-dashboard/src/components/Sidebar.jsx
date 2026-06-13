import React from 'react'

const navItems = [
  { id: 'dashboard', icon: '⬡', label: 'Dashboard' },
  { id: 'projects',  icon: '◈', label: 'Проекты' },
  { id: 'skills',    icon: '◎', label: 'Навыки' },
]

export default function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <div className="sidebar__logo-text">BITER<span>.</span></div>
        <div className="sidebar__logo-sub">DEVELOPER DASHBOARD</div>
      </div>

      <nav className="sidebar__nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`sidebar__item${activePage === item.id ? ' active' : ''}`}
            onClick={() => setActivePage(item.id)}
          >
            <span className="sidebar__item-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__status">
          <span className="sidebar__dot"></span>
          <span>BITER · ONLINE</span>
        </div>
      </div>
    </aside>
  )
}
