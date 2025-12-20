"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";

type Node = {
  address: string;
  pubkey: string | null;
  version: string;
  last_seen_timestamp: number;
};

const COLORS = [
  "#14b8a6", "#0d9488", "#f59e0b", "#a855f7", "#06b6d4", "#10b981",
  "#f97316", "#8b5cf6", "#ec4899", "#6366f1", "#84cc16", "#f43f5e",
];

export default function Analytics() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNodes = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      setError(null);
      const res = await fetch("/api/nodes", { cache: "no-store" });
      const data = await res.json();
      const pods = Array.isArray(data) ? data : (data.pods || []);
      setNodes(pods.filter((n: Node) => n.pubkey !== null));
      setLoading(false);
      if (showRefresh) setTimeout(() => setRefreshing(false), 500);
    } catch (err) {
      console.error("Failed to fetch nodes", err);
      setNodes([]);
      setLoading(false);
      if (showRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNodes();
    const interval = setInterval(() => fetchNodes(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    const active = nodes.filter((n) => now - n.last_seen_timestamp < 30).length;
    const warning = nodes.filter((n) => {
      const diff = now - n.last_seen_timestamp;
      return diff >= 30 && diff < 120;
    }).length;
    const offline = nodes.filter((n) => now - n.last_seen_timestamp >= 120).length;
    const uniqueIPs = new Set(nodes.map((n) => n.address.split(":")[0])).size;
    const versions = new Set(nodes.map((n) => n.version)).size;

    return {
      total: nodes.length,
      active,
      warning,
      offline,
      versions,
      uniqueIPs,
    };
  }, [nodes]);

  const versionData = useMemo(() => {
    const versionCounts: Record<string, number> = {};
    nodes.forEach((n) => {
      versionCounts[n.version] = (versionCounts[n.version] || 0) + 1;
    });
    return Object.entries(versionCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [nodes]);

  const activityData = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    const intervals = [0, 30, 60, 120, 300, 600];
    return intervals.map((seconds) => ({
      time: seconds === 0 ? "Now" : `${seconds}s`,
      count: nodes.filter((n) => now - n.last_seen_timestamp <= seconds).length,
    }));
  }, [nodes]);

  const statusData = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    const active = nodes.filter((n) => now - n.last_seen_timestamp < 30).length;
    const warning = nodes.filter((n) => {
      const diff = now - n.last_seen_timestamp;
      return diff >= 30 && diff < 120;
    }).length;
    const offline = nodes.filter((n) => now - n.last_seen_timestamp >= 120).length;

    return [
      { name: "Active", value: active, color: "#14b8a6" },
      { name: "Warning", value: warning, color: "#f59e0b" },
      { name: "Offline", value: offline, color: "#6b7280" },
    ].filter(item => item.value > 0);
  }, [nodes]);

  const lastSeenHistogramData = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    const ranges = [
      { label: "0-30s", min: 0, max: 30, color: "#14b8a6" },
      { label: "30s-1m", min: 30, max: 60, color: "#f59e0b" },
      { label: "1m-2m", min: 60, max: 120, color: "#f59e0b" },
      { label: "2m-5m", min: 120, max: 300, color: "#6b7280" },
      { label: "5m+", min: 300, max: Infinity, color: "#6b7280" },
    ];

    return ranges.map((range) => {
      const count = nodes.filter((n) => {
        const diff = now - n.last_seen_timestamp;
        return diff >= range.min && diff < range.max;
      }).length;
      return {
        range: range.label,
        count,
        color: range.color,
      };
    });
  }, [nodes]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050b1f] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#14b8a6] text-xl font-bold mb-4">Loading Analytics...</div>
          <div className="w-16 h-16 border-4 border-[#14b8a6]/30 border-t-[#14b8a6] rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050b1f] flex items-center justify-center">
        <div className="text-center bg-[#0d1425] rounded-2xl p-8 shadow-2xl max-w-md border border-[#14b8a6]/30">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => fetchNodes()}
            className="bg-gradient-to-r from-[#14b8a6] to-[#0d9488] hover:opacity-90 text-white px-8 py-3 rounded-lg font-bold transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050b1f] relative">
      {/* Background layers */}
      <div
        className="fixed inset-0 z-0 opacity-30"
        style={{
          backgroundImage: 'url(/background.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div
        className="fixed inset-0 z-0 opacity-15"
        style={{
          backgroundImage: 'url(/Xandeum.avif)',
          backgroundSize: '200px 200px',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-[#14b8a6]/20 bg-[#0d1425]/95 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <img src="/xandeum.png" alt="Xandeum Logo" className="h-6 sm:h-8 object-contain" onError={(e) => { e.currentTarget.src = '/logo.png'; }} />
                <div>
                  <h1 className="text-base sm:text-xl font-bold text-white">Xandeum pNode Analytics</h1>
                  <p className="text-xs sm:text-sm text-gray-400">Analytics Dashboard</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {refreshing && (
                  <div className="hidden sm:flex items-center gap-2 text-gray-400 text-sm font-bold">
                    <div className="w-2 h-2 bg-[#14b8a6] rounded-full animate-pulse"></div>
                    Refreshing...
                  </div>
                )}
                <button
                  onClick={() => fetchNodes(true)}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-[#14b8a6]/10 hover:bg-[#14b8a6]/20 text-[#14b8a6] text-sm font-bold transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                <Link
                  href="/"
                  className="px-3 sm:px-4 py-2 rounded-lg bg-[#14b8a6] hover:bg-[#0d9488] text-white text-xs sm:text-sm font-bold transition-all"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Analytics</h2>
            <p className="text-sm text-gray-400">
              Real-time network statistics and visualizations for Xandeum pNodes on DevNet
            </p>
          </div>

          {/* Stats Row */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 border-2 border-white mb-6 shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-[10px] sm:text-xs text-gray-500 mb-2 uppercase tracking-wide">Total Nodes</div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.total}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] sm:text-xs text-gray-500 mb-2 uppercase tracking-wide">Active</div>
                <div className="text-2xl sm:text-3xl font-bold text-[#14b8a6]">{stats.active}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] sm:text-xs text-gray-500 mb-2 uppercase tracking-wide">Warning</div>
                <div className="text-2xl sm:text-3xl font-bold text-[#f59e0b]">{stats.warning}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] sm:text-xs text-gray-500 mb-2 uppercase tracking-wide">Offline</div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-600">{stats.offline}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] sm:text-xs text-gray-500 mb-2 uppercase tracking-wide">Versions</div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.versions}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] sm:text-xs text-gray-500 mb-2 uppercase tracking-wide">Unique IPs</div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.uniqueIPs}</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-[10px] sm:text-xs text-gray-500 mb-1 uppercase tracking-wide">Network Health</div>
                <div className="text-3xl sm:text-4xl font-black text-gray-900">
                  {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="space-y-6">
            {/* Activity Timeline */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 border-2 border-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Activity Timeline</h3>
                <div className="text-xs sm:text-sm text-gray-500">Last 24 Hours</div>
              </div>
              <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                <AreaChart data={activityData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    stroke="#6b7280"
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#6b7280"
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#14b8a6"
                    strokeWidth={2.5}
                    fill="url(#colorCount)"
                    dot={{ fill: "#14b8a6", r: 4 }}
                    activeDot={{ r: 6, fill: "#14b8a6", strokeWidth: 2, stroke: "#fff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Last Seen Histogram */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 border-2 border-white shadow-lg">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Last Seen Distribution</h3>
              <ResponsiveContainer width="100%" height={200} className="sm:h-[250px]">
                <BarChart data={lastSeenHistogramData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <XAxis
                    dataKey="range"
                    stroke="#6b7280"
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#6b7280"
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {lastSeenHistogramData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Version Distribution */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 border-2 border-white shadow-lg">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Version Distribution</h3>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="flex-shrink-0">
                    <ResponsiveContainer width={200} height={200}>
                      <PieChart>
                        <Pie
                          data={versionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          innerRadius={50}
                          fill="#000000"
                          dataKey="value"
                          paddingAngle={3}
                        >
                          {versionData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #14b8a6',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2 max-h-[200px] overflow-y-auto w-full">
                    {versionData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span className="text-gray-700 font-medium">{item.name}</span>
                        </div>
                        <span className="font-bold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status Distribution */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 border-2 border-white shadow-lg">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Status Distribution</h3>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="flex-shrink-0">
                    <ResponsiveContainer width={180} height={180}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={70}
                          innerRadius={45}
                          fill="#000000"
                          dataKey="value"
                          paddingAngle={3}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #14b8a6',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-3 w-full">
                    {statusData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-gray-700 font-medium">{item.name}</span>
                        </div>
                        <span className="font-bold text-gray-900 text-lg">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
