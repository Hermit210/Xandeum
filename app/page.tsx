"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Area, AreaChart } from "recharts";

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
type ViewMode = "overview" | "analytics" | "docs";

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
  const [currentView, setCurrentView] = useState<ViewMode>("overview");
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);

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
      .sort((a, b) => b.value - a.value);
      // Show ALL versions, not just top 5
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

  const availableVersions = useMemo(() => {
    return Array.from(new Set(nodes.map(n => n.version))).sort();
  }, [nodes]);

  const filteredAndSortedNodes = useMemo(() => {
    console.log('Filtering with status:', filterStatus);
    
    let filtered = nodes.filter((node) => {
      const matchesSearch = node.pubkey?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.city?.toLowerCase().includes(searchTerm.toLowerCase());

      const health = getNodeHealth(node.last_seen_timestamp);
      const matchesStatus = filterStatus === "all" || health.status === filterStatus;

      const matchesVersion = filterVersion === "all" || node.version === filterVersion;

      return matchesSearch && matchesStatus && matchesVersion;
    });
    
    console.log('Filtered nodes count:', filtered.length, 'from', nodes.length);

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

  const COLORS = [
    "#14b8a6", // Teal
    "#0d9488", // Dark teal
    "#f59e0b", // Amber
    "#a855f7", // Purple
    "#06b6d4", // Cyan
    "#10b981", // Emerald
    "#f97316", // Orange
    "#8b5cf6", // Violet
    "#ec4899", // Pink
    "#6366f1", // Indigo
    "#84cc16", // Lime
    "#f43f5e", // Rose
  ];

  return (
    <div className="min-h-screen bg-[#050b1f] relative">
      {/* Background Layer 1 - background.jpeg (subtle) */}
      <div 
        className="fixed inset-0 z-0 opacity-30"
        style={{
          backgroundImage: 'url(/background.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Background Layer 2 - Xandeum.avif logo pattern (more visible) */}
      <div 
        className="fixed inset-0 z-0 opacity-15"
        style={{
          backgroundImage: 'url(/Xandeum.avif)',
          backgroundSize: '200px 200px',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
        }}
      />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* TOP NAVIGATION BAR */}
        <div className="sticky top-0 z-50 -mx-6 backdrop-blur-sm">
          <div className="px-4 md:px-6 py-3 md:py-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 w-full">
              {/* Left Side - Logo */}
              <div className="flex items-center gap-2 md:gap-3">
                <img
                  src="/Xandeum.avif"
                  alt="Xandeum Logo"
                  className="w-6 h-6 md:w-8 md:h-8 object-contain"
                  onError={(e) => {
                    console.error('Logo failed to load, trying fallback');
                    e.currentTarget.src = '/logo.png';
                  }}
                />
                <div>
                  <h1 className="text-sm md:text-lg font-black text-white">
                    Xandeum pNode Analytics
                  </h1>
                  <p className="text-[#14b8a6] text-[10px] font-medium">Real-time DevNet monitoring</p>
                </div>
              </div>

              {/* Right Side - Navigation Tabs and Actions */}
              <div className="flex items-center gap-2 md:gap-3">
                <div className="flex items-center gap-3 md:gap-6 overflow-x-auto">
                  <button
                    onClick={() => setCurrentView("overview")}
                    className={`px-2 py-2 text-xs md:text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                      currentView === "overview"
                        ? "text-[#14b8a6] border-[#14b8a6]"
                        : "text-gray-400 border-transparent hover:text-white"
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setShowAnalyticsModal(true)}
                    className="px-2 py-2 text-xs md:text-sm font-bold transition-all border-b-2 whitespace-nowrap text-gray-400 border-transparent hover:text-white"
                  >
                    Analytics
                  </button>
                  <button
                    onClick={() => setShowDocsModal(true)}
                    className="px-2 py-2 text-xs md:text-sm font-bold transition-all border-b-2 whitespace-nowrap text-gray-400 border-transparent hover:text-white"
                  >
                    Docs
                  </button>
                </div>
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
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="p-4 md:p-6">
          <AnimatePresence mode="wait">
            {/* OVERVIEW VIEW */}
            {currentView === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >

                {/* STATS - Ultra Minimal */}
                <div className="text-sm text-gray-400 mb-4">
                  <span className="text-white font-medium">{stats.total}</span> nodes · <span className="text-[#14b8a6] font-medium">{stats.active}</span> active · <span className="text-white font-medium">{stats.versions}</span> versions · <span className="text-white font-medium">{stats.uniqueIPs}</span> IPs
                  {(filterStatus !== "all" || filterVersion !== "all") && (
                    <span className="ml-2 text-yellow-500">
                      · Showing {filteredAndSortedNodes.length} 
                      {filterStatus !== "all" && ` ${filterStatus}`}
                      {filterVersion !== "all" && ` v${filterVersion}`}
                      {" "}nodes
                    </span>
                  )}
                </div>

                {/* SLIM FILTER TOOLBAR */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4 py-2">
          {/* Status Filters - Pill Style */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterStatus === "all"
                  ? "bg-[#14b8a6] text-white"
                  : "text-gray-400 hover:text-white hover:bg-[#14b8a6]/10"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterStatus === "active"
                  ? "bg-[#14b8a6] text-white"
                  : "text-gray-400 hover:text-white hover:bg-[#14b8a6]/10"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus("warning")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterStatus === "warning"
                  ? "bg-[#14b8a6] text-white"
                  : "text-gray-400 hover:text-white hover:bg-[#14b8a6]/10"
              }`}
            >
              Warning
            </button>
            <button
              onClick={() => setFilterStatus("offline")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterStatus === "offline"
                  ? "bg-[#14b8a6] text-white"
                  : "text-gray-400 hover:text-white hover:bg-[#14b8a6]/10"
              }`}
            >
              Offline
            </button>
          </div>

          <div className="hidden md:block h-4 w-px bg-[#14b8a6]/20"></div>

          {/* Version Dropdown */}
          <select
            value={filterVersion}
            onChange={(e) => setFilterVersion(e.target.value)}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-transparent text-gray-400 hover:text-white border border-[#14b8a6]/20 outline-none cursor-pointer transition-all"
          >
            <option value="all" className="bg-[#0d1425] text-white">All Versions</option>
            {availableVersions.map((version) => (
              <option key={version} value={version} className="bg-[#0d1425] text-white">
                {version}
              </option>
            ))}
          </select>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by public key, IP, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 rounded-full text-xs bg-transparent border border-[#14b8a6]/20 focus:border-[#14b8a6]/40 outline-none text-white placeholder-gray-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-[#0d1425]/95 rounded-xl overflow-hidden border border-[#14b8a6]/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0d1425] sticky top-0 border-b-2 border-[#14b8a6]/40">
                <tr>
                  <th className="text-left px-3 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th
                    onClick={() => handleSort("pubkey")}
                    className="text-left px-3 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    Public Key {sortField === "pubkey" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("address")}
                    className="text-left px-3 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    Address {sortField === "address" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("version")}
                    className="text-left px-3 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    Version {sortField === "version" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("uptime")}
                    className="text-left px-3 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-colors"
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
                <AnimatePresence mode="popLayout">
                {filteredAndSortedNodes.map((node, index) => {
                  const health = getNodeHealth(node.last_seen_timestamp);
                  const uptimePercent = getUptimePercentage(node.last_seen_timestamp);

                  return (
                    <motion.tr
                      key={node.pubkey || `node-${index}`}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setSelectedNode(node)}
                      className="cursor-pointer hover:bg-white/5 transition-all"
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
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
              </motion.div>
            )}

            {/* ANALYTICS VIEW REMOVED - NOW A MODAL */}
            {false && currentView === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-6xl mx-auto"
              >
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border-2 border-white text-center">
                    <div className="text-4xl font-bold text-gray-900">
                      {Math.round((stats.active / stats.total) * 100)}%
                    </div>
                  </div>
                  
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border-2 border-white text-center">
                    <div className="text-4xl font-bold text-gray-900">
                      {statusData.find(s => s.name === 'Warning')?.value || 0}
                    </div>
                  </div>
                  
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border-2 border-white text-center">
                    <div className="text-4xl font-bold text-gray-900">
                      {statusData.find(s => s.name === 'Offline')?.value || 0}
                    </div>
                  </div>
                </div>

                {/* Timeline Chart */}
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-5 border-2 border-white mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Activity Timeline</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={activityData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                      <defs>
                        <linearGradient id="colorCountFull" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="time"
                        stroke="#6b7280"
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#6b7280"
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #14b8a6',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#14b8a6"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 6, fill: "#14b8a6", strokeWidth: 2, stroke: "#0d1425" }}
                        fill="url(#colorCountFull)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Distribution Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Version Distribution */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-5 border-2 border-white">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Version Distribution</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={versionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={70}
                          innerRadius={45}
                          fill="#000000"
                          dataKey="value"
                          paddingAngle={2}
                          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
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

                  {/* Status Distribution */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-5 border-2 border-white">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={200}>
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
                          paddingAngle={2}
                          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
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
                </div>
              </motion.div>
            )}

            {/* DOCS VIEW REMOVED - NOW A MODAL */}
            {false && currentView === "docs" && (
              <motion.div
                key="docs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-[#0d1425]/95 backdrop-blur-sm rounded-xl p-8 border border-[#14b8a6]/20 max-w-4xl mx-auto">
                  <h2 className="text-3xl font-black text-white mb-6">Documentation</h2>

                  <div className="space-y-8">
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

                  {/* FAQ */}
                  <section>
                    <h3 className="text-xl font-bold text-[#14b8a6] mb-3">Frequently Asked Questions</h3>
                    <div className="space-y-3">
                      <details className="bg-[#050b1f] p-4 rounded-lg border border-[#14b8a6]/20 group">
                        <summary className="font-bold text-white text-sm cursor-pointer hover:text-[#14b8a6] transition-colors">
                          What is a pNode?
                        </summary>
                        <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                          A pNode (Participant Node) is a node in the Xandeum network that participates in consensus and validation. pNodes help secure the network and process transactions.
                        </p>
                      </details>

                      <details className="bg-[#050b1f] p-4 rounded-lg border border-[#14b8a6]/20 group">
                        <summary className="font-bold text-white text-sm cursor-pointer hover:text-[#14b8a6] transition-colors">
                          How do I run my own pNode?
                        </summary>
                        <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                          Visit the official Xandeum documentation at xandeum.network for detailed instructions on setting up and running your own pNode. You'll need to meet the minimum hardware requirements and follow the installation guide.
                        </p>
                      </details>

                      <details className="bg-[#050b1f] p-4 rounded-lg border border-[#14b8a6]/20 group">
                        <summary className="font-bold text-white text-sm cursor-pointer hover:text-[#14b8a6] transition-colors">
                          Why is my node showing as "Warning" or "Offline"?
                        </summary>
                        <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                          Nodes are marked as "Warning" if they haven't been seen in 30-120 seconds, and "Offline" if not seen for over 2 minutes. This could be due to network issues, node downtime, or synchronization problems. Check your node's logs and network connectivity.
                        </p>
                      </details>

                      <details className="bg-[#050b1f] p-4 rounded-lg border border-[#14b8a6]/20 group">
                        <summary className="font-bold text-white text-sm cursor-pointer hover:text-[#14b8a6] transition-colors">
                          What does "Uptime" percentage mean?
                        </summary>
                        <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                          The uptime percentage is calculated based on a 5-minute rolling window. It shows how recently your node was active. A node last seen 30 seconds ago will show ~90% uptime, while a node seen just now shows 100%.
                        </p>
                      </details>

                      <details className="bg-[#050b1f] p-4 rounded-lg border border-[#14b8a6]/20 group">
                        <summary className="font-bold text-white text-sm cursor-pointer hover:text-[#14b8a6] transition-colors">
                          How often is the data updated?
                        </summary>
                        <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                          The dashboard automatically refreshes every 30 seconds to fetch the latest node data from the Xandeum DevNet. You can also manually refresh using the "Refresh" button in the navigation bar.
                        </p>
                      </details>

                      <details className="bg-[#050b1f] p-4 rounded-lg border border-[#14b8a6]/20 group">
                        <summary className="font-bold text-white text-sm cursor-pointer hover:text-[#14b8a6] transition-colors">
                          Can I track multiple nodes?
                        </summary>
                        <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                          Currently, the "My Node" feature tracks one node at a time. You can change the tracked node by entering a different public key. For monitoring multiple nodes, use the search function or bookmark specific filtered views.
                        </p>
                      </details>

                      <details className="bg-[#050b1f] p-4 rounded-lg border border-[#14b8a6]/20 group">
                        <summary className="font-bold text-white text-sm cursor-pointer hover:text-[#14b8a6] transition-colors">
                          What are the different node versions?
                        </summary>
                        <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                          Node versions represent different software releases of the Xandeum client. Running the latest version ensures you have the newest features, bug fixes, and security updates. Check the Analytics page to see version distribution across the network.
                        </p>
                      </details>

                      <details className="bg-[#050b1f] p-4 rounded-lg border border-[#14b8a6]/20 group">
                        <summary className="font-bold text-white text-sm cursor-pointer hover:text-[#14b8a6] transition-colors">
                          Is this data real-time?
                        </summary>
                        <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                          Yes! All data is fetched directly from the Xandeum DevNet using pRPC (Participant RPC). The dashboard shows actual node data with no mock or simulated information. Geographic data is cached for 24 hours to improve performance.
                        </p>
                      </details>
                    </div>
                  </section>

                  {/* Quick Tips */}
                  <section>
                    <h3 className="text-xl font-bold text-[#14b8a6] mb-3">Quick Tips</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-[#050b1f] p-3 rounded-lg border border-[#14b8a6]/20">
                        <div className="text-white font-bold text-sm mb-1">Keyboard Shortcuts</div>
                        <p className="text-gray-300 text-xs">Click column headers to sort, use search to quickly find nodes</p>
                      </div>
                      <div className="bg-[#050b1f] p-3 rounded-lg border border-[#14b8a6]/20">
                        <div className="text-white font-bold text-sm mb-1">Analytics View</div>
                        <p className="text-gray-300 text-xs">Check the Analytics tab for timeline and distribution charts</p>
                      </div>
                      <div className="bg-[#050b1f] p-3 rounded-lg border border-[#14b8a6]/20">
                        <div className="text-white font-bold text-sm mb-1">Advanced Search</div>
                        <p className="text-gray-300 text-xs">Search works on public keys, IPs, and city names simultaneously</p>
                      </div>
                      <div className="bg-[#050b1f] p-3 rounded-lg border border-[#14b8a6]/20">
                        <div className="text-white font-bold text-sm mb-1">Mobile Friendly</div>
                        <p className="text-gray-300 text-xs">Fully responsive design works on all devices and screen sizes</p>
                      </div>
                    </div>
                  </section>

                  {/* Support & Links */}
                  <section>
                    <h3 className="text-xl font-bold text-[#14b8a6] mb-3">Resources & Support</h3>
                    <div className="space-y-3">
                      <div className="bg-[#050b1f] p-4 rounded-lg border border-[#14b8a6]/20">
                        <div className="font-bold text-white text-sm mb-2">Official Website</div>
                        <a 
                          href="https://www.xandeum.network/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#14b8a6] hover:text-[#0d9488] underline text-sm"
                        >
                          xandeum.network
                        </a>
                      </div>
                      <div className="bg-[#050b1f] p-4 rounded-lg border border-[#14b8a6]/20">
                        <div className="font-bold text-white text-sm mb-2">Documentation</div>
                        <p className="text-gray-300 text-sm">Visit the official Xandeum documentation for setup guides, API references, and technical specifications.</p>
                      </div>
                      <div className="bg-[#050b1f] p-4 rounded-lg border border-[#14b8a6]/20">
                        <div className="font-bold text-white text-sm mb-2">Community</div>
                        <p className="text-gray-300 text-sm">Join the Xandeum community channels for support, discussions, and updates from the core team.</p>
                      </div>
                    </div>
                    </section>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
              className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-[#0d1425]/98 backdrop-blur-md z-50 overflow-y-auto shadow-2xl border-l border-[#14b8a6]/30"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#14b8a6]/30">
                  <h2 className="text-2xl font-black text-white">Node Details</h2>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-[#14b8a6] hover:text-[#0d9488] transition-colors text-2xl font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Status Overview Card */}
                  <div className="bg-gradient-to-br from-[#14b8a6]/10 to-transparent rounded-lg p-3 border border-[#14b8a6]/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getNodeHealth(selectedNode.last_seen_timestamp).color} animate-pulse`}></div>
                        <span className={`text-base font-bold ${getNodeHealth(selectedNode.last_seen_timestamp).textColor}`}>
                          {getNodeHealth(selectedNode.last_seen_timestamp).label}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {getTimeSince(selectedNode.last_seen_timestamp)} ago
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-gray-400">Uptime</span>
                        <span className="text-xs font-bold text-white">
                          {getUptimePercentage(selectedNode.last_seen_timestamp).toFixed(1)}%
                        </span>
                      </div>
                      <div className="bg-[#0d1425] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full transition-all bg-gradient-to-r from-[#14b8a6] to-[#0d9488]"
                          style={{ width: `${getUptimePercentage(selectedNode.last_seen_timestamp)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Node Information Grid */}
                  <div className="grid grid-cols-1 gap-2">
                    {/* Public Key */}
                    <div className="bg-[#050b1f] p-2 rounded-lg border border-[#14b8a6]/30">
                      <div className="text-[10px] text-[#14b8a6] font-bold mb-1">Public Key</div>
                      <div className="font-mono text-[10px] text-white break-all">
                        {selectedNode.pubkey || "N/A"}
                      </div>
                    </div>

                    {/* Address & Version */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#050b1f] p-2 rounded-lg border border-[#14b8a6]/30">
                        <div className="text-[10px] text-[#14b8a6] font-bold mb-1">Address</div>
                        <div className="font-mono text-[10px] text-white">
                          {selectedNode.address}
                        </div>
                      </div>
                      
                      <div className="bg-[#050b1f] p-2 rounded-lg border border-[#14b8a6]/30">
                        <div className="text-[10px] text-[#14b8a6] font-bold mb-1">Version</div>
                        <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white">
                          {selectedNode.version}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <div className="text-[10px] text-[#14b8a6] font-bold mb-1 uppercase tracking-wider">Location</div>
                    <div className="bg-[#050b1f] p-2 rounded-lg border border-[#14b8a6]/30 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-semibold text-[10px]">City:</span>
                        <span className="text-white font-medium text-xs">{selectedNode.city || "Unknown"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-semibold text-[10px]">Country:</span>
                        <span className="text-white font-medium text-xs">{selectedNode.country || "Unknown"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-semibold text-[10px]">Coordinates:</span>
                        <span className="text-white font-mono text-[10px]">
                          {selectedNode.latitude?.toFixed(4)}, {selectedNode.longitude?.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Provider */}
                  <div>
                    <div className="text-[10px] text-[#14b8a6] font-bold mb-1 uppercase tracking-wider">Provider</div>
                    <div className="text-xs text-white bg-[#050b1f] p-2 rounded-lg border border-[#14b8a6]/30">
                      {selectedNode.provider || "Unknown"}
                    </div>
                  </div>

                  {/* Last Seen */}
                  <div>
                    <div className="text-[10px] text-[#14b8a6] font-bold mb-1 uppercase tracking-wider">Last Seen</div>
                    <div className="bg-[#050b1f] p-2 rounded-lg border border-[#14b8a6]/30">
                      <div className="text-sm font-bold text-white mb-0.5">
                        {getTimeSince(selectedNode.last_seen_timestamp)} ago
                      </div>
                      <div className="text-[10px] text-gray-400">
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

      {/* ANALYTICS MODAL */}
      <AnimatePresence>
        {showAnalyticsModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAnalyticsModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-4 md:inset-10 lg:inset-20 bg-[#0d1425]/98 backdrop-blur-md z-50 overflow-y-auto shadow-2xl border border-[#14b8a6]/30 rounded-2xl"
            >
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl md:text-3xl font-black text-white">Analytics</h2>
                  <button
                    onClick={() => setShowAnalyticsModal(false)}
                    className="text-[#14b8a6] hover:text-[#0d9488] transition-colors text-2xl font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="max-w-6xl mx-auto">
                  {/* Stats Row */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border-2 border-white mb-5">
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide">Network Health</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {Math.round((stats.active / stats.total) * 100)}%
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide">Warnings</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {statusData.find(s => s.name === 'Warning')?.value || 0}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide">Offline</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {statusData.find(s => s.name === 'Offline')?.value || 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline and Charts Combined Box */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border-2 border-white pb-6">
                    {/* Timeline Chart */}
                    <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-semibold text-gray-900">Activity Timeline</h3>
                      <div className="text-[10px] text-gray-500">Last 24 Hours</div>
                    </div>
                    <ResponsiveContainer width="100%" height={175}>
                      <AreaChart data={activityData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorCountModal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="time"
                          stroke="#9ca3af"
                          tick={{ fontSize: 10, fill: '#6b7280' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#9ca3af"
                          tick={{ fontSize: 10, fill: '#6b7280' }}
                          axisLine={false}
                          tickLine={false}
                          width={30}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '11px',
                            padding: '6px 10px'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#14b8a6"
                          strokeWidth={2}
                          fill="url(#colorCountModal)"
                          dot={{ fill: "#14b8a6", r: 3 }}
                          activeDot={{ r: 5, fill: "#14b8a6", stroke: "#fff", strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                    </div>

                    {/* Distribution Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Version Distribution */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border-2 border-white">
                      <h3 className="text-xs font-semibold text-gray-900 mb-3">Version Distribution</h3>
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <ResponsiveContainer width={138} height={138}>
                            <PieChart>
                              <Pie
                                data={versionData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={55}
                                innerRadius={35}
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
                                  borderRadius: '6px',
                                  fontSize: '11px'
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex-1 space-y-1.5 max-h-[130px] overflow-y-auto">
                          {versionData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2.5 h-2.5 rounded-sm" 
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                ></div>
                                <span className="text-gray-700">{item.name}</span>
                              </div>
                              <span className="font-semibold text-gray-900">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Status Distribution */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border-2 border-white">
                      <h3 className="text-xs font-semibold text-gray-900 mb-3">Status Distribution</h3>
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <ResponsiveContainer width={120} height={120}>
                            <PieChart>
                              <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={50}
                                innerRadius={30}
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
                                  borderRadius: '6px',
                                  fontSize: '11px'
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex-1 space-y-1.5">
                          {statusData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2.5 h-2.5 rounded-full" 
                                  style={{ backgroundColor: item.color }}
                                ></div>
                                <span className="text-gray-700">{item.name}</span>
                              </div>
                              <span className="font-semibold text-gray-900">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DOCS MODAL */}
      <AnimatePresence>
        {showDocsModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDocsModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-4 md:inset-10 lg:inset-20 bg-[#0d1425]/98 backdrop-blur-md z-50 overflow-y-auto shadow-2xl border border-[#14b8a6]/30 rounded-2xl"
            >
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl md:text-3xl font-black text-white">Documentation</h2>
                  <button
                    onClick={() => setShowDocsModal(false)}
                    className="text-[#14b8a6] hover:text-[#0d9488] transition-colors text-2xl font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex gap-6 max-w-7xl mx-auto">
                  {/* Sidebar Navigation */}
                  <div className="hidden lg:block w-64 flex-shrink-0">
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border-2 border-white sticky top-0" style={{ height: 'calc(100vh - 180px)' }}>
                      <h3 className="text-base font-bold text-gray-900 mb-6 uppercase tracking-wide">Contents</h3>
                      <nav className="space-y-3">
                        <a href="#overview" className="block text-sm font-bold text-gray-900 hover:text-[#14b8a6] hover:bg-gray-100 transition-colors py-3 px-4 rounded">Overview</a>
                        <a href="#features" className="block text-sm font-bold text-gray-900 hover:text-[#14b8a6] hover:bg-gray-100 transition-colors py-3 px-4 rounded">Key Features</a>
                        <a href="#how-to-use" className="block text-sm font-bold text-gray-900 hover:text-[#14b8a6] hover:bg-gray-100 transition-colors py-3 px-4 rounded">How to Use</a>
                        <a href="#status" className="block text-sm font-bold text-gray-900 hover:text-[#14b8a6] hover:bg-gray-100 transition-colors py-3 px-4 rounded">Status Indicators</a>
                        <a href="#about" className="block text-sm font-bold text-gray-900 hover:text-[#14b8a6] hover:bg-gray-100 transition-colors py-3 px-4 rounded">About Xandeum</a>
                        <a href="#faq" className="block text-sm font-bold text-gray-900 hover:text-[#14b8a6] hover:bg-gray-100 transition-colors py-3 px-4 rounded">FAQ</a>
                        <a href="#resources" className="block text-sm font-bold text-gray-900 hover:text-[#14b8a6] hover:bg-gray-100 transition-colors py-3 px-4 rounded">Resources</a>
                        <a href="#technical" className="block text-sm font-bold text-gray-900 hover:text-[#14b8a6] hover:bg-gray-100 transition-colors py-3 px-4 rounded">Technical Details</a>
                      </nav>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 border-2 border-white flex-1 overflow-y-auto" style={{ height: 'calc(100vh - 180px)' }}>
                  <div className="space-y-8">
                    {/* Overview */}
                    <section id="overview">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Overview</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Xandeum pNode Analytics is a real-time monitoring dashboard for Xandeum DevNet nodes.
                        Track node health, performance metrics, and geographic distribution across the network.
                      </p>
                    </section>

                    {/* Features */}
                    <section id="features">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Key Features</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-gray-900">•</span>
                          <span><strong className="text-gray-900">Real-time Monitoring:</strong> Auto-refreshes every 30 seconds with live data from DevNet</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gray-900">•</span>
                          <span><strong className="text-gray-900">Node Health Status:</strong> Active, Warning, and Offline indicators</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gray-900">•</span>
                          <span><strong className="text-gray-900">Advanced Filtering:</strong> Filter by status, version, and search by pubkey</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gray-900">•</span>
                          <span><strong className="text-gray-900">Analytics Dashboard:</strong> View activity timelines and distribution charts</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gray-900">•</span>
                          <span><strong className="text-gray-900">Geographic Insights:</strong> See node locations and provider information</span>
                        </li>
                      </ul>
                    </section>

                    {/* How to Use */}
                    <section id="how-to-use">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">How to Use</h3>
                      <div className="space-y-3 text-gray-700">
                        <p><strong className="text-gray-900">1. Overview Tab:</strong> View all nodes in a sortable table with real-time status</p>
                        <p><strong className="text-gray-900">2. Click Any Node:</strong> Opens detailed information panel on the right</p>
                        <p><strong className="text-gray-900">3. Filter Nodes:</strong> Use status and version filters to narrow down results</p>
                        <p><strong className="text-gray-900">4. Search:</strong> Find specific nodes by pubkey or address</p>
                        <p><strong className="text-gray-900">5. Analytics:</strong> Click Analytics button to view charts and statistics</p>
                      </div>
                    </section>

                    {/* Status Indicators */}
                    <section id="status">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Status Indicators</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-lg border border-gray-300">
                          <div className="w-3 h-3 rounded-full bg-[#14b8a6]"></div>
                          <span className="text-gray-900 font-semibold">Active:</span>
                          <span className="text-gray-700">Last seen within 30 seconds</span>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-lg border border-gray-300">
                          <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                          <span className="text-gray-900 font-semibold">Warning:</span>
                          <span className="text-gray-700">Last seen 30-120 seconds ago</span>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-lg border border-gray-300">
                          <div className="w-3 h-3 rounded-full bg-gray-700"></div>
                          <span className="text-gray-900 font-semibold">Offline:</span>
                          <span className="text-gray-700">Last seen over 120 seconds ago</span>
                        </div>
                      </div>
                    </section>

                    {/* About Xandeum */}
                    <section id="about">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">About Xandeum</h3>
                      <p className="text-gray-700 leading-relaxed mb-3">
                        Xandeum is revolutionizing blockchain storage by solving the storage trilemma. Our solution provides scalable storage to exabytes, smart contract native integration, and random access capabilities for Solana.
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        Through our pNode network and liquid staking solutions, we enable decentralized storage that compounds your earnings while supporting the network.
                      </p>
                    </section>

                    {/* Frequently Asked Questions */}
                    <section id="faq">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">What is a pNode?</h4>
                          <p className="text-gray-700 text-sm">pNodes are decentralized storage nodes that form the backbone of Xandeum's storage network. They use erasure coding technology to provide reliable, scalable storage for Solana.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">How often does the data refresh?</h4>
                          <p className="text-gray-700 text-sm">The dashboard automatically refreshes every 30 seconds to provide real-time monitoring of all DevNet nodes.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">What does the uptime percentage mean?</h4>
                          <p className="text-gray-700 text-sm">Uptime percentage indicates how recently a node was active. It's calculated based on the last seen timestamp, with 100% meaning the node was seen within the last 30 seconds.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Can I run my own pNode?</h4>
                          <p className="text-gray-700 text-sm">Yes! Visit the Xandeum website to learn how to set up and run your own pNode to contribute to the decentralized storage network.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">What is STOINC?</h4>
                          <p className="text-gray-700 text-sm">STOINC (Storage Income) is Xandeum's revolutionary passive income solution that allows you to earn through scalable storage solutions on the Solana network.</p>
                        </div>
                      </div>
                    </section>

                    {/* Resources */}
                    <section id="resources">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Resources</h3>
                      <div className="space-y-2">
                        <a href="https://www.xandeum.network/" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 underline">
                          Official Website
                        </a>
                        <a href="https://www.xandeum.network/stoinc" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 underline">
                          STOINC - Passive Income Solution
                        </a>
                        <a href="https://xandsol.xandeum.network/" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 underline">
                          Liquid Staking Platform
                        </a>
                        <a href="https://www.xandeum.network/blog" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 underline">
                          Latest News & Updates
                        </a>
                      </div>
                    </section>

                    {/* Technical Details */}
                    <section id="technical">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Technical Details</h3>
                      <div className="space-y-2 text-gray-700">
                        <p><strong className="text-gray-900">Network:</strong> Solana DevNet</p>
                        <p><strong className="text-gray-900">Refresh Rate:</strong> 30 seconds</p>
                        <p><strong className="text-gray-900">Storage Technology:</strong> Erasure Coding</p>
                        <p><strong className="text-gray-900">Scalability:</strong> Exabytes+</p>
                        <p><strong className="text-gray-900">Integration:</strong> Smart Contract Native</p>
                      </div>
                    </section>
                  </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
