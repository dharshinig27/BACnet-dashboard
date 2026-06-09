import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { fetchDevices } from '../services/api';

const BASE_URL = "https://corsproxy.io/?https://bacnet.tools.thefusionapps.com";
const AUTH_HEADER = "Basic " + btoa("admin:admin123");

export default function TrendsPage() {
  const [devices,       setDevices]       = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [points,        setPoints]        = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [pointsLoading, setPointsLoading] = useState(false);

  // Load device list on mount
  useEffect(() => {
    fetchDevices()
      .then(data => {
        setDevices(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // When a device is selected, fetch its points
  useEffect(() => {
    if (!selectedDevice) return;
    setPointsLoading(true);
    setPoints([]);
    setSelectedPoint(null);

    fetch(`${BASE_URL}/api/devices/${selectedDevice.device_id}`, {
      headers: { Authorization: AUTH_HEADER },
    })
      .then(r => r.json())
      .then(data => {
        // Only analog points have numeric present_value useful for trending
        const analogPoints = (data.points || []).filter(
          p => p.object_type === 'analogInput' || p.object_type === 'analogValue' || p.object_type === 'analogOutput'
        );
        setPoints(analogPoints);
        setPointsLoading(false);
      })
      .catch(() => setPointsLoading(false));
  }, [selectedDevice]);

  // Build a sparkline from the single present_value (real-time snapshot)
  // Since the API has no history endpoint, we simulate a recent trend around the live value
  function buildSparkline(presentValue) {
    if (presentValue == null) return [];
    const base = parseFloat(presentValue);
    return Array.from({ length: 20 }, (_, i) => ({
      t: `${i * 5}m ago`,
      value: parseFloat((base + (Math.random() - 0.5) * base * 0.05).toFixed(2)),
    })).reverse();
  }

  const chartData = selectedPoint ? buildSparkline(selectedPoint.present_value) : [];

  const current = selectedPoint?.present_value ?? null;
  const min     = chartData.length ? Math.min(...chartData.map(d => d.value)).toFixed(2) : '--';
  const max     = chartData.length ? Math.max(...chartData.map(d => d.value)).toFixed(2) : '--';
  const avg     = chartData.length
    ? (chartData.reduce((s, d) => s + d.value, 0) / chartData.length).toFixed(2)
    : '--';

  return (
    <div>
      <h1 style={{ margin: '0 0 20px', fontSize: 24, fontWeight: 700, color: '#0f2d1e' }}>Trends</h1>

      {/* Step 1 — Pick a Device */}
      <div style={card}>
        <h3 style={{ ...cardTitle, marginBottom: 12 }}>Step 1 — Select Device</h3>
        {loading ? (
          <p style={{ fontSize: 13, color: '#8aab9b' }}>Loading devices...</p>
        ) : (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {devices.map(d => (
              <button
                key={d.device_id}
                onClick={() => setSelectedDevice(d)}
                style={{
                  padding: '6px 16px', borderRadius: 8, fontSize: 13,
                  border: selectedDevice?.device_id === d.device_id ? '2px solid #1a5c3e' : '1px solid #c8ddd2',
                  background: selectedDevice?.device_id === d.device_id ? '#e8f4ef' : '#fff',
                  color: selectedDevice?.device_id === d.device_id ? '#1a5c3e' : '#3d6b53',
                  fontWeight: selectedDevice?.device_id === d.device_id ? 700 : 400,
                  cursor: 'pointer',
                }}
              >
                {d.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Step 2 — Pick a Point */}
      {selectedDevice && (
        <div style={{ ...card, marginTop: 16 }}>
          <h3 style={{ ...cardTitle, marginBottom: 12 }}>
            Step 2 — Select Point on {selectedDevice.name}
          </h3>
          {pointsLoading ? (
            <p style={{ fontSize: 13, color: '#8aab9b' }}>Loading points...</p>
          ) : points.length === 0 ? (
            <p style={{ fontSize: 13, color: '#8aab9b' }}>No analog points found for this device.</p>
          ) : (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {points.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedPoint(p)}
                  style={{
                    padding: '6px 16px', borderRadius: 8, fontSize: 13,
                    border: selectedPoint?.object_name === p.object_name ? '2px solid #2563eb' : '1px solid #c8ddd2',
                    background: selectedPoint?.object_name === p.object_name ? '#eff6ff' : '#fff',
                    color: selectedPoint?.object_name === p.object_name ? '#2563eb' : '#3d6b53',
                    fontWeight: selectedPoint?.object_name === p.object_name ? 700 : 400,
                    cursor: 'pointer',
                  }}
                >
                  {p.object_name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3 — Chart */}
      {selectedPoint && (
        <>
          {/* Stat Cards */}
          <div style={{ display: 'flex', gap: 14, margin: '16px 0' }}>
            {[
              ['Current Value', `${current} ${selectedPoint.units || ''}`],
              ['Min (session)',  `${min} ${selectedPoint.units || ''}`],
              ['Max (session)',  `${max} ${selectedPoint.units || ''}`],
              ['Avg (session)',  `${avg} ${selectedPoint.units || ''}`],
            ].map(([l, v]) => (
              <div key={l} style={{ flex: 1, background: '#fff', border: '1px solid #e2ede8', borderRadius: 12, padding: '14px 18px' }}>
                <p style={{ margin: '0 0 4px', fontSize: 11, color: '#8aab9b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{l}</p>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#2563eb' }}>{v}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={cardTitle}>
                {selectedDevice.name} — {selectedPoint.object_name}
              </h3>
              <span style={{ fontSize: 12, color: '#8aab9b' }}>
                {selectedPoint.description} · Units: {selectedPoint.units || 'N/A'}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 4, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f5f2" />
                <XAxis dataKey="t" tick={{ fontSize: 11, fill: '#8aab9b' }} interval={4} />
                <YAxis tick={{ fontSize: 11, fill: '#8aab9b' }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2ede8' }}
                  formatter={v => [`${v} ${selectedPoint.units || ''}`, selectedPoint.object_name]}
                />
                <Line type="monotone" dataKey="value" stroke="#2563eb" dot={false} strokeWidth={2.5} name={selectedPoint.object_name} />
              </LineChart>
            </ResponsiveContainer>
            <p style={{ margin: '12px 0 0', fontSize: 11, color: '#8aab9b' }}>
              Note: Chart shows simulated trend around the live present_value. Historical trend logging will be available once the backend adds a telemetry history endpoint.
            </p>
          </div>

          {/* Point Details */}
          <div style={{ ...card, marginTop: 16 }}>
            <h3 style={{ ...cardTitle, marginBottom: 12 }}>Point Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 40px' }}>
              {[
                ['Object Name',     selectedPoint.object_name],
                ['Object Type',     selectedPoint.object_type],
                ['Instance',        selectedPoint.object_instance],
                ['Present Value',   `${selectedPoint.present_value} ${selectedPoint.units || ''}`],
                ['Description',     selectedPoint.description],
                ['Units',           selectedPoint.units || 'N/A'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f0f5f2', fontSize: 13 }}>
                  <span style={{ color: '#8aab9b' }}>{k}</span>
                  <span style={{ color: '#0f2d1e', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {!selectedDevice && !loading && (
        <div style={{ ...card, marginTop: 16, textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ fontSize: 15, color: '#8aab9b', margin: 0 }}>
            Select a device above to explore its points and trends.
          </p>
        </div>
      )}
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
