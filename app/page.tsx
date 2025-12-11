"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis } from "recharts";

type Node = {
  address: string;
  pubkey: string | null;
  version: string;
  last_seen_timestamp: number;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  provider?: string;
};

type SortField = "pubkey" | "address" | "version" | "last_seen" | "city" | "uptime";
type FilterStatus = "all" | "active" | "warning" | "offline";

export default function Home() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("last_seen");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterVersion, setFilterVersion] = useState<string>("all");
  const [myNodePubkey, setMyNodePubkey] = useState("");
  const [showMyNodeInput, setShowMyNodeInput] = useState(false);
  const [showDocs, setShowDocs] = useState(false);

  const fetchNodes = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      setError(null);
      const response = await fetch("/api/nodes");

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setNodes(data.filter((n: Node) => n.pubkey !== null));
      setLoading(false);
      if (showRefresh) setTimeout(() => setRefreshing(false), 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch nodes");
      setLoading(false);
      if (showRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNodes();
    const interval = setInterval(() => fetchNodes(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const getTimeSince = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const getNodeHealth = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    if (diff < 30) return { status: "active", color: "bg-[#14b8a6]", textColor: "text-[#14b8a6]", label: "Active", icon: "●" };
    if (diff < 120) return { status: "warning", color: "bg-gray-500", textColor: "text-gray-400", label: "Warning", icon: "●" };
    return { status: "offline", color: "bg-gray-700", textColor: "text-gray-600", label: "Offline", icon: "●" };
  };

  const getUptimePercentage = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    const percentage = Math.max(0, Math.min(100, ((300 - diff) / 300) * 100));
    return percentage;
  };

  const stats = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    const activeNodes = nodes.filter((n) => now - n.last_seen_timestamp < 30);
    const uniqueIPs = new Set(nodes.map((n) => n.address.split(":")[0])).size;
    const versions = new Set(nodes.map((n) => n.version)).size;

    return {
      total: nodes.length,
      active: activeNodes.length,
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
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [nodes]);

  const activityData = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    const intervals = [0, 30, 60, 120, 300, 600];
    return intervals.map((seconds) => ({
      time: seconds === 0 ? "Now" : `${seconds}s`,
      count: nodes.filter((n) => now - n.last_seen_timestamp <= seconds).length,
    }));
  }, [nodes]);

  const availableVersions = useMemo(() => {
    return Array.from(new Set(nodes.map(n => n.version))).sort();
  }, [nodes]);

  const filteredAndSortedNodes = useMemo(() => {
    let filtered = nodes.filter((node) => {
      const matchesSearch = node.pubkey?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.city?.toLowerCase().includes(searchTerm.toLowerCase());

      const health = getNodeHealth(node.last_seen_timestamp);
      const matchesStatus = filterStatus === "all" || health.status === filterStatus;

      const matchesVersion = filterVersion === "all" || node.version === filterVersion;

      return matchesSearch && matchesStatus && matchesVersion;
    });

    filtered.sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      if (sortField === "last_seen") {
        aVal = a.last_seen_timestamp;
        bVal = b.last_seen_timestamp;
      } else if (sortField === "uptime") {
        aVal = getUptimePercentage(a.last_seen_timestamp);
        bVal = getUptimePercentage(b.last_seen_timestamp);
      } else if (sortField === "city") {
        aVal = a.city || "";
        bVal = b.city || "";
      } else {
        aVal = a[sortField] || "";
        bVal = b[sortField] || "";
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [nodes, searchTerm, sortField, sortOrder, filterStatus, filterVersion]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050b1f] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-12 w-80 bg-white/10 rounded-lg mb-2 animate-pulse"></div>
          <div className="h-4 w-48 bg-white/10 rounded mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-white/10 rounded-xl animate-pulse"></div>
            ))}
          </div>
          <div className="h-96 bg-white/10 rounded-xl animate-pulse"></div>
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
            className="bg-gradient-to-r from-[#14b8a6] to-[#0d9488] hover:opacity-90 text-white px-8 py-3 rounded-lg font-bold transition-all transform hover:scale-105 shadow-lg"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const COLORS = ["#14b8a6", "#0d9488", "#f59e0b", "#a855f7", "#06b6d4"];

  return (
    <div className="min-h-screen bg-[#050b1f]">
      <div className="max-w-7xl mx-auto p-6">
        {/* MODERN HEADER */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Xandeum Logo"
                className="w-10 h-10 md:w-12 md:h-12 object-contain"
              />
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white mb-0.5">
                  Xandeum pNode Analytics
                </h1>
                <p className="text-[#14b8a6] text-xs font-medium">Real-time DevNet monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowDocs(true)}
                className="flex items-center gap-1.5 text-[#14b8a6] hover:text-[#0d9488] font-bold transition-all text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Docs
              </button>
              {refreshing && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1.5 text-white text-xs font-medium"
                >
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  Refreshing...
                </motion.div>
              )}
              <button
                onClick={() => fetchNodes(true)}
                className="flex items-center gap-1.5 text-[#14b8a6] hover:text-[#0d9488] font-bold transition-all text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* STATS & CHARTS - ONE ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 mb-4">
          {/* Stats Cards - 3 columns */}
          <div className="lg:col-span-3 grid grid-cols-2 gap-1.5">
            {/* Total Nodes */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group"
            >
              <div className="relative bg-[#0d1425] rounded p-1.5 shadow-sm flex flex-col justify-between border border-[#14b8a6]/30">
                <div className="flex items-center justify-between mb-1">
                  <svg className="w-3 h-3 text-[#14b8a6]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  <div className="w-0.5 h-0.5 bg-[#14b8a6] rounded-full animate-pulse"></div>
                </div>
                <div>
                  <div className="text-[6px] font-bold text-[#14b8a6] uppercase tracking-wider">Total</div>
                  <div className="text-base font-black text-white">{stats.total}</div>
                </div>
              </div>
            </motion.div>

            {/* Active Nodes */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="relative group"
            >
              <div className="relative bg-[#0d1425] rounded p-1.5 shadow-sm flex flex-col justify-between border border-[#14b8a6]/30">
                <div className="flex items-center justify-between mb-1">
                  <svg className="w-3 h-3 text-[#14b8a6]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="w-0.5 h-0.5 bg-[#14b8a6] rounded-full animate-pulse"></div>
                </div>
                <div>
                  <div className="text-[6px] font-bold text-[#14b8a6] uppercase tracking-wider">Active</div>
                  <div className="text-base font-black text-white">{stats.active}</div>
                </div>
              </div>
            </motion.div>
            

            {/* Versions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative group"
            >
              <div className="relative bg-[#0d1425] rounded p-1.5 shadow-sm flex flex-col justify-between border border-[#14b8a6]/30">
                <div className="flex items-center justify-between mb-1">
                  <svg className="w-3 h-3 text-[#14b8a6]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                  <div className="w-0.5 h-0.5 bg-[#14b8a6] rounded-full animate-pulse"></div>
                </div>
                <div>
                  <div className="text-[6px] font-bold text-[#14b8a6] uppercase tracking-wider">Versions</div>
                  <div className="text-base font-black text-white">{stats.versions}</div>
                </div>
              </div>
            </motion.div>


            {/* Unique IPs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="relative group"
            >
              <div className="relative bg-[#0d1425] rounded p-1.5 shadow-sm flex flex-col justify-between border border-[#14b8a6]/30">
                <div className="flex items-center justify-between mb-1">
                  <svg className="w-3 h-3 text-[#14b8a6]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                  </svg>
                  <div className="w-0.5 h-0.5 bg-[#14b8a6] rounded-full animate-pulse"></div>
                </div>
                <div>
                  <div className="text-[6px] font-bold text-[#14b8a6] uppercase tracking-wider">IPs</div>
                  <div className="text-base font-black text-white">{stats.uniqueIPs}</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Charts - 9 columns */}
          <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Version Chart with Pie */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#0d1425] rounded-lg p-2.5 shadow-md border border-[#14b8a6]/30"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <svg className="w-4 h-4 text-[#14b8a6]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                  <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                  <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                </svg>
                <h3 className="text-[10px] font-black text-white">Top Versions</h3>
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={versionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={40}
                    innerRadius={25}
                    fill="#000000"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {versionData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-1.5 space-y-1">
                {versionData.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-[#050b1f] rounded px-2 py-1 border border-[#14b8a6]/10">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                      <span className="text-[9px] font-bold text-gray-300">{item.name}</span>
                    </div>
                    <span className="text-[9px] font-black text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Activity Timeline with Graph */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-[#0d1425] rounded-lg p-2.5 shadow-md border border-[#14b8a6]/30"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#14b8a6]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  <h3 className="text-[10px] font-black text-white">Network Activity</h3>
                </div>
                <div className="flex items-center gap-0.5 bg-[#050b1f] px-1.5 py-0.5 rounded-full border border-[#14b8a6]/30">
                  <div className="text-[7px] font-black text-[#14b8a6]">LIVE</div>
                  <div className="w-0.5 h-0.5 bg-[#14b8a6] rounded-full animate-pulse"></div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={activityData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    stroke="#9ca3af"
                    tick={{ fontSize: 8, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    tick={{ fontSize: 8, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#14b8a6"
                    strokeWidth={2}
                    dot={{ fill: "#14b8a6", r: 2, strokeWidth: 1.5, stroke: "#fff" }}
                    activeDot={{ r: 4, strokeWidth: 1.5 }}
                    fill="url(#colorCount)"
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                <div className="bg-[#050b1f] rounded p-1.5 text-center border border-[#14b8a6]/10">
                  <div className="text-[7px] text-[#14b8a6] font-bold mb-0.5">NOW</div>
                  <div className="text-sm font-black text-white">{activityData[0]?.count || 0}</div>
                </div>
                <div className="bg-[#050b1f] rounded p-1.5 text-center border border-[#14b8a6]/10">
                  <div className="text-[7px] text-[#14b8a6] font-bold mb-0.5">60s</div>
                  <div className="text-sm font-black text-white">{activityData[2]?.count || 0}</div>
                </div>
                <div className="bg-[#050b1f] rounded p-1.5 text-center border border-[#14b8a6]/10">
                  <div className="text-[7px] text-[#14b8a6] font-bold mb-0.5">600s</div>
                  <div className="text-sm font-black text-white">{activityData[5]?.count || 0}</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="bg-[#0d1425] rounded-xl p-6 shadow-lg mb-6 border border-[#14b8a6]/30">
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${filterStatus === "all"
                ? "bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white shadow-md"
                : "bg-[#050b1f] text-white hover:bg-[#050b1f]/80 border border-[#14b8a6]/20"
                }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${filterStatus === "active"
                ? "bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white shadow-md"
                : "bg-[#050b1f] text-white hover:bg-[#050b1f]/80 border border-[#14b8a6]/20"
                }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus("warning")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${filterStatus === "warning"
                ? "bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white shadow-md"
                : "bg-[#050b1f] text-white hover:bg-[#050b1f]/80 border border-[#14b8a6]/20"
                }`}
            >
              Warning
            </button>
            <button
              onClick={() => setFilterStatus("offline")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${filterStatus === "offline"
                ? "bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white shadow-md"
                : "bg-[#050b1f] text-white hover:bg-[#050b1f]/80 border border-[#14b8a6]/20"
                }`}
            >
              Offline
            </button>

            <div className="h-8 w-px bg-gray-300 mx-2"></div>

            <select
              value={filterVersion}
              onChange={(e) => setFilterVersion(e.target.value)}
              className="px-4 py-2 rounded-lg font-semibold bg-[#050b1f] text-white hover:bg-[#050b1f]/80 transition-all border border-[#14b8a6]/20 outline-none cursor-pointer"
            >
              <option value="all">All Versions</option>
              {availableVersions.map((version) => (
                <option key={version} value={version}>
                  {version}
                </option>
              ))}
            </select>

            <div className="h-8 w-px bg-gray-300 mx-2"></div>

            <button
              onClick={() => setShowMyNodeInput(!showMyNodeInput)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${myNodePubkey
                ? "bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white shadow-md"
                : "bg-[#050b1f] text-white hover:bg-[#050b1f]/80 border border-[#14b8a6]/20"
                }`}
            >
              My Node
            </button>
          </div>

          {showMyNodeInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4"
            >
              <input
                type="text"
                placeholder="Enter your node's public key..."
                value={myNodePubkey}
                onChange={(e) => setMyNodePubkey(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-[#14b8a6]/30 bg-[#050b1f] focus:border-[#14b8a6] outline-none font-mono text-sm text-white placeholder-gray-400"
              />
            </motion.div>
          )}

          <div className="relative mt-4">
            <input
              type="text"
              placeholder="🔍 Search by public key, IP address, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-[#14b8a6]/30 bg-[#050b1f] focus:border-[#14b8a6] outline-none font-medium text-white placeholder-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-gray-400 font-bold text-xl"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-[#0d1425] rounded-xl shadow-lg overflow-hidden mb-8 border border-[#14b8a6]/30">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#050b1f] sticky top-0 border-b border-[#14b8a6]/30">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th
                    onClick={() => handleSort("pubkey")}
                    className="text-left px-6 py-4 text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    Public Key {sortField === "pubkey" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("address")}
                    className="text-left px-6 py-4 text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    Address {sortField === "address" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("version")}
                    className="text-left px-6 py-4 text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    Version {sortField === "version" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("uptime")}
                    className="text-left px-6 py-4 text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    Uptime {sortField === "uptime" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("city")}
                    className="text-left px-6 py-4 text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    City {sortField === "city" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("last_seen")}
                    className="text-right px-6 py-4 text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    Last Seen {sortField === "last_seen" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#14b8a6]/10">
                {filteredAndSortedNodes.map((node, index) => {
                  const health = getNodeHealth(node.last_seen_timestamp);
                  const uptimePercent = getUptimePercentage(node.last_seen_timestamp);
                  const isMyNode = myNodePubkey && node.pubkey?.includes(myNodePubkey);

                  return (
                    <motion.tr
                      key={node.pubkey || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => setSelectedNode(node)}
                      className={`cursor-pointer hover:bg-white/5 transition-all ${isMyNode ? "bg-white/10" : ""
                        }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${health.color}`}></div>
                          <span className={`text-sm font-bold ${health.textColor}`}>{health.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-semibold text-white">
                          {node.pubkey ? `${node.pubkey.slice(0, 8)}...${node.pubkey.slice(-4)}` : "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-white">{node.address}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white">
                          {node.version}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-white/20 rounded-full h-2 overflow-hidden max-w-[100px]">
                            <div
                              className={`h-full transition-all ${uptimePercent > 75 ? "bg-green-500" : uptimePercent > 30 ? "bg-yellow-500" : "bg-red-500"
                                }`}
                              style={{ width: `${uptimePercent}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-white min-w-[45px]">
                            {uptimePercent.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-white">{node.city || "Unknown"}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-white">
                          {getTimeSince(node.last_seen_timestamp)} ago
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DOCS MODAL */}
      <AnimatePresence>
        {showDocs && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDocs(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-[#0d1425] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#14b8a6]/30">
                <div className="sticky top-0 bg-[#0d1425] border-b border-[#14b8a6]/30 p-6 flex items-center justify-between">
                  <h2 className="text-3xl font-black text-white">Xandeum Analytics Documentation</h2>
                  <button
                    onClick={() => setShowDocs(false)}
                    className="text-[#14b8a6] hover:text-[#0d9488] transition-colors text-2xl font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-8 space-y-8">
                  {/* Overview */}
                  <section>
                    <h3 className="text-xl font-bold text-[#14b8a6] mb-3">Overview</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Xandeum pNode Analytics is a real-time monitoring dashboard for Xandeum DevNet nodes.
                      Track node health, performance metrics, and geographic distribution across the network.
                    </p>
                  </section>

                  {/* Features */}
                  <section>
                    <h3 className="text-xl font-bold text-[#14b8a6] mb-3">Key Features</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-[#14b8a6]">•</span>
                        <span><strong className="text-white">Real-time Monitoring:</strong> Auto-refreshes every 30 seconds with live data from DevNet</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#14b8a6]">•</span>
                        <span><strong className="text-white">Node Health Status:</strong> Active, Warning, and Offline indicators</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#14b8a6]">•</span>
                        <span><strong className="text-white">Geographic Data:</strong> City, country, and provider information for each node</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#14b8a6]">•</span>
                        <span><strong className="text-white">Advanced Filtering:</strong> Filter by status, version, or track your own node</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#14b8a6]">•</span>
                        <span><strong className="text-white">Data Visualization:</strong> Charts for version distribution and activity timeline</span>
                      </li>
                    </ul>
                  </section>

                  {/* How to Use */}
                  <section>
                    <h3 className="text-xl font-bold text-[#14b8a6] mb-3">How to Use</h3>
                    <div className="space-y-3">
                      <div className="bg-[#050b1f] p-3 rounded-lg border border-[#14b8a6]/20">
                        <h4 className="font-bold text-white mb-1 text-sm">Filtering Nodes</h4>
                        <p className="text-gray-300 text-sm">Use the filter bar to view specific node types: All, Active, Warning, or Offline. Select a version from the dropdown to filter by software version.</p>
                      </div>
                      <div className="bg-[#050b1f] p-3 rounded-lg border border-[#14b8a6]/20">
                        <h4 className="font-bold text-white mb-1 text-sm">Tracking Your Node</h4>
                        <p className="text-gray-300 text-sm">Click "My Node" and enter your public key to highlight your node in the table.</p>
                      </div>
                      <div className="bg-[#050b1f] p-3 rounded-lg border border-[#14b8a6]/20">
                        <h4 className="font-bold text-white mb-1 text-sm">Searching</h4>
                        <p className="text-gray-300 text-sm">Use the search box to find nodes by public key, IP address, or city name.</p>
                      </div>
                      <div className="bg-[#050b1f] p-3 rounded-lg border border-[#14b8a6]/20">
                        <h4 className="font-bold text-white mb-1 text-sm">Sorting</h4>
                        <p className="text-gray-300 text-sm">Click any column header to sort the table. Click again to reverse the sort order.</p>
                      </div>
                      <div className="bg-[#050b1f] p-3 rounded-lg border border-[#14b8a6]/20">
                        <h4 className="font-bold text-white mb-1 text-sm">Node Details</h4>
                        <p className="text-gray-300 text-sm">Click any row in the table to open a detailed side panel with complete node information.</p>
                      </div>
                    </div>
                  </section>

                  {/* Node Status */}
                  <section>
                    <h3 className="text-xl font-bold text-[#14b8a6] mb-3">Node Status Indicators</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 bg-[#050b1f] p-3 rounded-lg border border-[#14b8a6]/20">
                        <div className="w-2 h-2 rounded-full bg-[#14b8a6]"></div>
                        <div>
                          <div className="font-bold text-white text-sm">Active</div>
                          <div className="text-xs text-gray-400">Last seen less than 30 seconds ago</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-[#050b1f] p-3 rounded-lg border border-[#14b8a6]/20">
                        <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                        <div>
                          <div className="font-bold text-white text-sm">Warning</div>
                          <div className="text-xs text-gray-400">Last seen 30 seconds to 2 minutes ago</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-[#050b1f] p-3 rounded-lg border border-[#14b8a6]/20">
                        <div className="w-2 h-2 rounded-full bg-gray-700"></div>
                        <div>
                          <div className="font-bold text-white text-sm">Offline</div>
                          <div className="text-xs text-gray-400">Last seen more than 2 minutes ago</div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Technical Details */}
                  <section>
                    <h3 className="text-xl font-bold text-[#14b8a6] mb-3">Technical Details</h3>
                    <div className="bg-[#050b1f] p-3 rounded-lg border border-[#14b8a6]/20 space-y-1.5 text-sm">
                      <p className="text-gray-300"><strong className="text-white">Data Source:</strong> Xandeum DevNet (192.190.136.36)</p>
                      <p className="text-gray-300"><strong className="text-white">Update Frequency:</strong> Every 30 seconds</p>
                      <p className="text-gray-300"><strong className="text-white">Geo-IP Provider:</strong> ipapi.co (cached for 24 hours)</p>
                      <p className="text-gray-300"><strong className="text-white">Tech Stack:</strong> Next.js 16, React 19, TypeScript, Tailwind CSS</p>
                    </div>
                  </section>

                  {/* Support */}
                  <section>
                    <h3 className="text-xl font-bold text-[#14b8a6] mb-3">Support</h3>
                    <p className="text-gray-300 mb-3 text-sm">
                      For issues or questions about Xandeum pNode Analytics, please visit the Xandeum community channels or check the project repository.
                    </p>
                    <div className="bg-[#050b1f] p-3 rounded-lg border border-[#14b8a6]/20">
                      <p className="text-gray-300 text-sm mb-2">Learn more about Xandeum:</p>
                      <a 
                        href="https://www.xandeum.network/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#14b8a6] hover:text-[#0d9488] underline font-semibold text-sm"
                      >
                        https://www.xandeum.network/
                      </a>
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* SIDE PANEL */}
      <AnimatePresence>
        {selectedNode && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNode(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-[#0d1425] z-50 overflow-y-auto shadow-2xl border-l border-[#14b8a6]/30"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black text-white">Node Details</h2>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-[#14b8a6] hover:text-[#0d9488] transition-colors text-2xl font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Health Status */}
                  <div>
                    <div className="text-xs text-[#14b8a6] font-bold mb-2 uppercase tracking-wider">Health Status</div>
                    <div className="flex items-center gap-3 bg-[#050b1f] p-4 rounded-xl border border-[#14b8a6]/30">
                      <div className={`w-3 h-3 rounded-full ${getNodeHealth(selectedNode.last_seen_timestamp).color}`}></div>
                      <span className={`text-lg font-bold ${getNodeHealth(selectedNode.last_seen_timestamp).textColor}`}>
                        {getNodeHealth(selectedNode.last_seen_timestamp).label}
                      </span>
                    </div>
                  </div>

                  {/* Uptime */}
                  <div>
                    <div className="text-xs text-[#14b8a6] font-bold mb-2 uppercase tracking-wider">Uptime Progress</div>
                    <div className="bg-[#050b1f] p-4 rounded-xl border border-[#14b8a6]/30">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex-1 bg-[#0d1425] rounded-full h-4 overflow-hidden">
                          <div
                            className="h-full transition-all bg-gradient-to-r from-[#14b8a6] to-[#0d9488]"
                            style={{ width: `${getUptimePercentage(selectedNode.last_seen_timestamp)}%` }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold text-white min-w-[60px]">
                          {getUptimePercentage(selectedNode.last_seen_timestamp).toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">Based on 5-minute window</div>
                    </div>
                  </div>

                  {/* Public Key */}
                  <div>
                    <div className="text-xs text-[#14b8a6] font-bold mb-2 uppercase tracking-wider">Public Key</div>
                    <div className="font-mono text-sm text-white break-all bg-[#050b1f] p-4 rounded-xl border border-[#14b8a6]/30">
                      {selectedNode.pubkey || "N/A"}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <div className="text-xs text-[#14b8a6] font-bold mb-2 uppercase tracking-wider">Address</div>
                    <div className="font-mono text-sm text-white bg-[#050b1f] p-4 rounded-xl border border-[#14b8a6]/30">
                      {selectedNode.address}
                    </div>
                  </div>

                  {/* Version */}
                  <div>
                    <div className="text-xs text-[#14b8a6] font-bold mb-2 uppercase tracking-wider">Version</div>
                    <div className="text-sm text-white bg-[#050b1f] p-4 rounded-xl border border-[#14b8a6]/30">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white">
                        {selectedNode.version}
                      </span>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <div className="text-xs text-[#14b8a6] font-bold mb-2 uppercase tracking-wider">Location</div>
                    <div className="bg-[#050b1f] p-4 rounded-xl border border-[#14b8a6]/30 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-semibold">City:</span>
                        <span className="text-white font-medium">{selectedNode.city || "Unknown"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-semibold">Country:</span>
                        <span className="text-white font-medium">{selectedNode.country || "Unknown"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-semibold">Coordinates:</span>
                        <span className="text-white font-mono text-sm">
                          {selectedNode.latitude?.toFixed(4)}, {selectedNode.longitude?.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Provider */}
                  <div>
                    <div className="text-xs text-[#14b8a6] font-bold mb-2 uppercase tracking-wider">Provider</div>
                    <div className="text-sm text-white bg-[#050b1f] p-4 rounded-xl border border-[#14b8a6]/30">
                      {selectedNode.provider || "Unknown"}
                    </div>
                  </div>

                  {/* Last Seen */}
                  <div>
                    <div className="text-xs text-[#14b8a6] font-bold mb-2 uppercase tracking-wider">Last Seen</div>
                    <div className="bg-[#050b1f] p-4 rounded-xl border border-[#14b8a6]/30">
                      <div className="text-lg font-bold text-white mb-1">
                        {getTimeSince(selectedNode.last_seen_timestamp)} ago
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(selectedNode.last_seen_timestamp * 1000).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Raw JSON */}
                  <details className="group">
                    <summary className="text-xs text-[#14b8a6] font-bold mb-2 uppercase tracking-wider cursor-pointer hover:text-[#0d9488]">
                      Raw JSON ▼
                    </summary>
                    <pre className="text-xs text-white bg-[#050b1f] p-4 rounded-xl border border-[#14b8a6]/30 overflow-x-auto mt-2">
                      {JSON.stringify(selectedNode, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
