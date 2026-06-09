import React, { useState, useEffect } from 'react';
import { fetchAlarms } from '../services/api';

// Map API severity → display category
function getSeverityLabel(severity) {
  if (severity === 'critical' || severity === 'high')   return 'ALARM';
  if (severity === 'medium')                             return 'WARN';
  return 'INFO';
}

const SEVERITY_COLOR = { ALARM: '#dc2626', WARN: '#ea580c', INFO: '#2563eb' };
const SEVERITY_BG    = { ALARM: '#fef2f2', WARN: '#fff7ed', INFO: '#eff6ff' };

export default function AlarmsPage() {
  const [filter,  setFilter]  = useState('All');
  const [alarms,  setAlarms]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    // fetch all alarms (not just active) so we can show history too
    fetchAlarms()
      .then(data => { setAlarms(data); setLoading(false); })
      .catch(err  => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) return <p style={{ padding: 40, color: '#5a7d6b', fontSize: 14 }}>Loading alarms...</p>;
  if (error)   return <p style={{ padding: 40, color: '#dc2626', fontSize: 14 }}>Error: {error}</p>;

  // Add a derived severity label to each alarm
  const alarmsWithLabel = alarms.map(a => ({
    ...a,
    severityLabel: getSeverityLabel(a.severity),
  }));

  // Filter by tab
  const filtered = filter === 'All'
    ? alarmsWithLabel
    : alarmsWithLabel.filter(a => a.severityLabel === filter);

  // Counts for summary cards
  const total    = alarmsWithLabel.length;
  const critical = alarmsWithLabel.filter(a => a.severity === 'critical' || a.severity === 'high').length;
  const warning  = alarmsWithLabel.filter(a => a.severity === 'medium').length;
  const info     = alarmsWithLabel.filter(a => a.severity === 'low').length;
  const active   = alarmsWithLabel.filter(a => !a.cleared_at).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f2d1e' }}>Alarms</h1>
        <button
          onClick={() => { setLoading(true); fetchAlarms().then(d => { setAlarms(d); setLoading(false); }); }}
          style={{ padding: '6px 14px', background: '#1a5c3e', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
        >
          Refresh
        </button>
      </div>

      {/* Summary Cards — all from real API */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          ['Total',    total,    '#0f2d1e'],
          ['Active',   active,   '#dc2626'],
          ['Critical', critical, '#dc2626'],
          ['Warning',  warning,  '#ea580c'],
          ['Info',     info,     '#2563eb'],
        ].map(([label, count, color]) => (
          <div key={label} style={{ flex: 1, background: '#fff', border: '1px solid #e2ede8', borderRadius: 12, padding: '16px 20px' }}>
            <p style={{ margin: '0 0 6px', fontSize: 11, color: '#8aab9b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</p>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color }}>{count}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {['All', 'ALARM', 'WARN', 'INFO'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 16px', borderRadius: 20,
            border: filter === f ? '1.5px solid #1a5c3e' : '1px solid #c8ddd2',
            background: filter === f ? '#e8f4ef' : '#fff',
            color: filter === f ? '#1a5c3e' : '#5a7d6b',
            fontSize: 12, fontWeight: filter === f ? 700 : 400, cursor: 'pointer',
          }}>
            {f} {f === 'All' ? `(${total})` : f === 'ALARM' ? `(${critical})` : f === 'WARN' ? `(${warning})` : `(${info})`}
          </button>
        ))}
      </div>

      {/* Alarm List — real data */}
      {filtered.length === 0 && (
        <div style={{ background: '#fff', border: '1px solid #e2ede8', borderRadius: 12, padding: '40px 24px', textAlign: 'center' }}>
          <p style={{ color: '#16a34a', fontSize: 14, fontWeight: 600, margin: 0 }}>No alarms in this category</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((a, i) => {
          const sev = a.severityLabel;
          const isActive = !a.cleared_at;
          return (
            <div key={a.id || i} style={{
              background: SEVERITY_BG[sev],
              border: `1px solid ${SEVERITY_COLOR[sev]}33`,
              borderLeft: `4px solid ${SEVERITY_COLOR[sev]}`,
              borderRadius: 10,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}>
              {/* Severity indicator */}
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: SEVERITY_COLOR[sev] + '22',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 14, color: SEVERITY_COLOR[sev], fontWeight: 700 }}>
                  {sev === 'ALARM' ? '!' : sev === 'WARN' ? '~' : 'i'}
                </span>
              </div>

              {/* Main content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#0f2d1e' }}>
                  Device {a.device_id} — {a.message}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: '#5a7d6b' }}>
                  Point: {a.point_name}
                  {' · '}
                  Severity: {a.severity}
                  {' · '}
                  Raised: {new Date(a.raised_at).toLocaleString()}
                  {a.cleared_at && ` · Cleared: ${new Date(a.cleared_at).toLocaleString()}`}
                </p>
              </div>

              {/* Status badge */}
              <span style={{
                background: isActive ? SEVERITY_COLOR[sev] + '22' : '#e8f4ef',
                color: isActive ? SEVERITY_COLOR[sev] : '#16a34a',
                padding: '3px 10px', borderRadius: 5, fontSize: 11, fontWeight: 700,
                whiteSpace: 'nowrap',
              }}>
                {isActive ? sev : 'CLEARED'}
              </span>

              {/* Severity pill */}
              <span style={{
                background: '#f0f5f2', color: '#5a7d6b',
                padding: '3px 10px', borderRadius: 5, fontSize: 11,
                whiteSpace: 'nowrap',
              }}>
                {a.severity}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
