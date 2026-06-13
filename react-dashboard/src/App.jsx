import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Skills from './pages/Skills'
import './index.css'
import './App.css'

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')

  const pages = {
    dashboard: <Dashboard />,
    projects: <Projects />,
    skills: <Skills />,
  }

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="app-content">
        {pages[activePage]}
      </main>
    </div>
  )
}
