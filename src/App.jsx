import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoginPage       from './pages/LoginPage';
import DashboardPage   from './pages/DashboardPage';
import DevicesPage     from './pages/DevicesPage';
import AlarmsPage      from './pages/AlarmsPage';
import TrendsPage      from './pages/TrendsPage';
import EventLogPage    from './pages/EventLogPage';
import PlaceholderPage from './pages/PlaceholderPage';
import Sidebar         from './components/Sidebar';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn) {
    return <LoginPage onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', background: '#f8faf9', minHeight: '100vh' }}>
        <Sidebar onLogout={() => setLoggedIn(false)} />
        <main style={{
          marginLeft: 220,
          flex: 1,
          padding: '28px 32px',
          minHeight: '100vh',
          maxWidth: 'calc(100vw - 220px)',
        }}>
          <Routes>
            <Route path="/"            element={<DashboardPage />}  />
            <Route path="/devices"     element={<DevicesPage />}    />
            <Route path="/alarms"      element={<AlarmsPage />}     />
            <Route path="/trends"      element={<TrendsPage />}     />
            <Route path="/events"      element={<EventLogPage />}   />
            {/* Remaining pages — wire up as backend adds endpoints */}
            <Route path="/objects"     element={<PlaceholderPage name="Object Explorer" />} />
            <Route path="/livepoints"  element={<PlaceholderPage name="Live Points" />}     />
            <Route path="/schedules"   element={<PlaceholderPage name="Schedules" />}       />
            <Route path="/energy"      element={<PlaceholderPage name="Energy" />}          />
            <Route path="/performance" element={<PlaceholderPage name="Performance" />}     />
            <Route path="/reports"     element={<PlaceholderPage name="Reports" />}         />
            <Route path="/network"     element={<PlaceholderPage name="Network" />}         />
            <Route path="/users"       element={<PlaceholderPage name="Users & Roles" />}   />
            <Route path="/settings"    element={<PlaceholderPage name="Settings" />}        />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
