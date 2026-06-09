const BASE_URL = "https://corsproxy.io/?https://bacnet.tools.thefusionapps.com";
const AUTH_HEADER = "Basic " + btoa("admin:admin123");

const headers = { "Authorization": AUTH_HEADER };

export async function fetchHealth() {
  const res = await fetch(`${BASE_URL}/api/health`, { headers });
  if (!res.ok) throw new Error("Failed to fetch health");
  return res.json();
}

export async function fetchDevices() {
  const res = await fetch(`${BASE_URL}/api/devices`, { headers });
  if (!res.ok) throw new Error("Failed to fetch devices");
  return res.json();
}

export async function fetchDeviceDetail(deviceId) {
  const res = await fetch(`${BASE_URL}/api/devices/${deviceId}`, { headers });
  if (!res.ok) throw new Error("Device not found");
  return res.json();
}

export async function writePointValue(deviceId, pointName, value) {
  const res = await fetch(`${BASE_URL}/api/devices/${deviceId}/points`, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ point_name: pointName, value }),
  });
  if (!res.ok) throw new Error("Failed to write point value");
  return res.json();
}

export async function fetchAlarms(activeOnly = false) {
  const res = await fetch(`${BASE_URL}/api/alarms?active_only=${activeOnly}&limit=100`, { headers });
  if (!res.ok) throw new Error("Failed to fetch alarms");
  return res.json();
}

export async function fetchEvents(limit = 50) {
  const res = await fetch(`${BASE_URL}/api/events?limit=${limit}`, { headers });
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

export async function fetchScenarios() {
  const res = await fetch(`${BASE_URL}/api/scenarios`, { headers });
  if (!res.ok) throw new Error("Failed to fetch scenarios");
  return res.json();
}

export async function startScenario(scenarioId, params = {}) {
  const res = await fetch(`${BASE_URL}/api/scenarios/${scenarioId}/start`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ params }),
  });
  if (!res.ok) throw new Error("Failed to start scenario");
  return res.json();
}

export async function stopScenario(scenarioId) {
  const res = await fetch(`${BASE_URL}/api/scenarios/${scenarioId}/stop`, {
    method: "POST",
    headers,
  });
  if (!res.ok) throw new Error("Failed to stop scenario");
  return res.json();
}
