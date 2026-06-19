import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import PartsManagement from './pages/PartsManagement';
import ConfigurationBuilder from './pages/ConfigurationBuilder';
import Configurations from './pages/Configurations';

const NAV = [
  { path: '/',              label: 'Dashboard',     icon: '▣' },
  { path: '/parts',         label: 'Parts Library', icon: '⊞' },
  { path: '/builder',       label: 'New Config',    icon: '+' },
  { path: '/configurations',label: 'Saved Configs', icon: '≡' },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">HERO</div>
        <div className="logo-sub">Pricing Engine</div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-label">Navigation</div>
        {NAV.map(item => (
          <button
            key={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span style={{ fontSize: 16, width: 18, textAlign: 'center' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        Hero Cycles Ltd. · Pricing Engine v1.0
      </div>
    </aside>
  );
}

function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/"               element={<Dashboard />} />
          <Route path="/parts"          element={<PartsManagement />} />
          <Route path="/builder"        element={<ConfigurationBuilder />} />
          <Route path="/configurations" element={<Configurations />} />
        </Routes>
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1e2128',
            color: '#f0f1f3',
            border: '1px solid #2a2d35',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#2dce89', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#e8321e', secondary: '#fff' } },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
