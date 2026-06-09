import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import StatCard   from '../components/StatCard';
import DonutChart from '../components/DonutChart';
import { TIME_SERIES, NETWORK_SUMMARY } from '../data/mockData';
import { fetchDevices, fetchAlarms, fetchEvents } from '../services/api';

const chartData = TIME_SERIES.filter((_, i) => i % 3 === 0);

const PIE_DATA = [
  { name: 'Analog Input (AI)',  value: 1842, color: '#2563eb' },
  { name: 'Binary Input (BI)',  value: 914,  color: '#16a34a' },
  { name: 'Analog Value (AV)', value: 500,  color: '#ea580c' },
];

const ALARM_COLORS = { ALARM: '#dc2626', WARN: '#ea580c', INFO: '#2563eb', ACK: '#8aab9b' };

// Map API severity to display label
function severityLabel(s) {
  if (!s) return 'INFO';
  if (s === 'critical' || s === 'high') return 'ALARM';
  if (s === 'medium') return 'WARN';
  return 'INFO';
}

export default function DashboardPage() {
  const [time,    setTime]    = useState(new Date());
  const [devices, setDevices] = useState([]);
  const [alarms,  setAlarms]  = useState([]);
  const [events,  setEvents]  = useState([]);

  // Clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch real data
  useEffect(() => {
    fetchDevices().then(setDevices).catch(() => {});
    fetchAlarms().then(setAlarms).catch(() => {});
    fetchEvents().then(setEvents).catch(() => {});
  }, []);

  // Computed from real device data
  const online      = devices.filter(d => d.status === 'online').length;
  const offline     = devices.filter(d => d.status === 'offline').length;
  const totalPoints = devices.reduce((s, d) => s + (d.point_count || 0), 0);
  const onlinePct   = devices.length ? Math.round((online / devices.length) * 100) : 0;

  // Active alarms = not cleared
  const activeAlarms    = alarms.filter(a => !a.cleared_at);
  const criticalAlarms  = alarms.filter(a => a.severity === 'critical' || a.severity === 'high');

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#0f2d1e', letterSpacing: '-0.5px' }}>
          BACnet Dashboard
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#5a7d6b' }}>
            Time: {time.toLocaleTimeString()}
          </span>
          <button style={btnOutline} onClick={() => window.location.reload()}>
            Refresh
          </button>
        </div>
      </div>

      {/* Stat Cards — all real data */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatCard
          label="Total BACnet Devices"
          value={devices.length || '...'}
          sub={devices.length ? `Online ${online} (${onlinePct}%)` : 'Loading...'}
          icon="+"
        />
        <StatCard
          label="Total Points"
          value={totalPoints ? totalPoints.toLocaleString() : '...'}
          sub={`Across ${devices.length} devices`}
          icon="*"
        />
        <StatCard
          label="Active Alarms"
          value={activeAlarms.length}
          sub={`Critical ${criticalAlarms.length}`}
          subColor="#dc2626"
          icon="!"
        />
        <StatCard
          label="Online Devices"
          value={online}
          sub="Network healthy"
          subColor="#16a34a"
          icon="O"
        />
        <StatCard
          label="Offline Devices"
          value={offline}
          sub={offline === 0 ? 'All clear' : 'Needs attention'}
          subColor={offline > 0 ? '#dc2626' : '#16a34a'}
          icon="X"
        />
      </div>

      {/* Live Points Chart — mock time series (no telemetry endpoint yet) */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={cardTitle}>Building Overview - Live Points</h3>
          <div style={{ display: 'flex', gap: 18, fontSize: 12, color: '#5a7d6b', flexWrap: 'wrap' }}>
            {[['#2563eb', 'Temperature (C)'], ['#16a34a', 'Humidity (%)'], ['#ea580c', 'CO2 (ppm)']].map(([c, l]) => (
              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'inline-block' }} />
                {l}
              </span>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData} margin={{ top: 4, right: 60, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f5f2" />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#8aab9b' }} interval={5} />
            <YAxis yAxisId="temp"     tick={{ fontSize: 11, fill: '#2563eb' }} domain={[15, 32]} />
            <YAxis yAxisId="humidity" orientation="right" tick={{ fontSize: 11, fill: '#16a34a' }} domain={[40, 80]} />
            <YAxis yAxisId="co2"      orientation="right" tick={{ fontSize: 11, fill: '#ea580c' }} domain={[500, 1100]} hide />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2ede8' }} />
            <Line yAxisId="temp"     type="monotone" dataKey="temp"     stroke="#2563eb" dot={false} strokeWidth={2} name="Temp (C)"     />
            <Line yAxisId="humidity" type="monotone" dataKey="humidity" stroke="#16a34a" dot={false} strokeWidth={2} name="Humidity (%)"  />
            <Line yAxisId="co2"      type="monotone" dataKey="co2"      stroke="#ea580c" dot={false} strokeWidth={2} name="CO2 (ppm)"     />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginTop: 20 }}>

        {/* Device Status — real data */}
        <div style={card}>
          <h3 style={{ ...cardTitle, marginBottom: 12 }}>Device Status</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <DonutChart
              segments={[
                { value: online  || 0, color: '#16a34a' },
                { value: offline || 0, color: '#9ca3af' },
              ]}
              total={devices.length || 1}
              label="Devices"
            />
            <div style={{ fontSize: 13 }}>
              {[
                ['#16a34a', 'Online',  `${online} (${onlinePct}%)`],
                ['#9ca3af', 'Offline', `${offline} (${100 - onlinePct}%)`],
              ].map(([c, l, v]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: c, flexShrink: 0 }} />
                  <span style={{ color: '#5a7d6b' }}>{l}</span>
                  <span style={{ color: '#0f2d1e', fontWeight: 600, marginLeft: 4 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Active Alarms — real data */}
        <div style={card}>
          <h3 style={{ ...cardTitle, marginBottom: 12 }}>Top Active Alarms</h3>
          {activeAlarms.length === 0 && (
            <p style={{ color: '#16a34a', fontSize: 13 }}>No active alarms</p>
          )}
          {activeAlarms.slice(0, 4).map(a => {
            const sev = severityLabel(a.severity);
            return (
              <div key={a.id} style={{ borderBottom: '1px solid #f0f5f2', paddingBottom: 10, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 12 }}>
                    {sev === 'ALARM' ? '[!]' : sev === 'WARN' ? '[~]' : '[i]'}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0f2d1e', flex: 1 }}>
                    Device {a.device_id} — {a.message?.slice(0, 28) || 'Alarm raised'}
                  </span>
                  <span style={{ fontSize: 11, color: '#8aab9b', whiteSpace: 'nowrap' }}>
                    {new Date(a.raised_at).toLocaleTimeString()}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 11, color: '#8aab9b' }}>
                  Point: {a.point_name} · Severity: {a.severity}
                </p>
              </div>
            );
          })}
        </div>

        {/* Points by Object Type — still mock until API provides this */}
        <div style={card}>
          <h3 style={{ ...cardTitle, marginBottom: 12 }}>Points by Object Type</h3>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                {PIE_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 8 }}>
            {PIE_DATA.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, fontSize: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                <span style={{ color: '#5a7d6b', flex: 1 }}>{d.name}</span>
                <span style={{ color: '#0f2d1e', fontWeight: 600 }}>{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Events — real data */}
      <div style={{ ...card, marginTop: 20 }}>
        <h3 style={{ ...cardTitle, marginBottom: 14 }}>Recent Events</h3>
        {events.length === 0 ? (
          <p style={{ fontSize: 13, color: '#8aab9b' }}>No recent events</p>
        ) : (
          <table style={{ width: '100%', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2ede8' }}>
                {['Time', 'Type', 'Device', 'Description'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 12px', color: '#8aab9b', fontWeight: 500, fontSize: 11 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.slice(0, 6).map((e, i) => {
                const typeLabel = e.event_type?.replace('_', ' ').toUpperCase() || 'EVENT';
                const color = e.event_type?.includes('alarm') ? '#dc2626' : e.event_type?.includes('value') ? '#2563eb' : '#5a7d6b';
                return (
                  <tr key={e.id || i} style={{ borderBottom: '1px solid #f0f5f2' }}>
                    <td style={{ padding: '9px 12px', color: '#5a7d6b' }}>
                      {new Date(e.timestamp).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: '9px 12px' }}>
                      <span style={{ background: color + '22', color, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                        {typeLabel.slice(0, 12)}
                      </span>
                    </td>
                    <td style={{ padding: '9px 12px', fontWeight: 600, color: '#0f2d1e' }}>
                      Device {e.payload?.device_id || '—'}
                    </td>
                    <td style={{ padding: '9px 12px', color: '#3d6b53', fontSize: 12 }}>
                      {e.payload?.point_name || e.event_type || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Network Summary */}
      <div style={{ ...card, marginTop: 20 }}>
        <h3 style={{ ...cardTitle, marginBottom: 12 }}>Network Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 40px' }}>
          {[
            ['Total Devices',   devices.length],
            ['Online',          online],
            ['Total Points',    totalPoints.toLocaleString()],
            ['Active Alarms',   activeAlarms.length],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f0f5f2', fontSize: 13 }}>
              <span style={{ color: '#5a7d6b' }}>{k}</span>
              <span style={{ color: '#0f2d1e', fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

const card = {
  background: '#fff',
  border: '1px solid #e2ede8',
  borderRadius: 12,
  padding: '20px 24px',
};

const cardTitle = {
  margin: 0,
  fontSize: 15,
  fontWeight: 700,
  color: '#0f2d1e',
};

const btnOutline = {
  padding: '6px 14px',
  borderRadius: 7,
  border: '1px solid #c8ddd2',
  background: '#fff',
  fontSize: 13,
  color: '#3d6b53',
  cursor: 'pointer',
};
