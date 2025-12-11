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
    if (diff < 30) return { status: "active", color: "bg-green-500", textColor: "text-green-500", label: "Active", icon: "🟢" };
    if (diff < 120) return { status: "warning", color: "bg-yellow-500", textColor: "text-yellow-500", label: "Warning", icon: "🟡" };
    return { status: "offline", color: "bg-red-500", textColor: "text-red-500", label: "Offline", icon: "🔴" };
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
      <div className="min-h-screen bg-[#0d3b2e] p-6">
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
      <div className="min-h-screen bg-[#0d3b2e] flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-2xl max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-black mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => fetchNodes()}
            className="bg-white hover:bg-gray-200 text-black px-8 py-3 rounded-lg font-bold transition-all transform hover:scale-105 shadow-lg"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const COLORS = ["#0d3b2e", "#166534", "#15803d", "#16a34a", "#22c55e"];

  return (
    <div className="min-h-screen bg-[#0d3b2e]">
      <div className="max-w-7xl mx-auto p-6">
        {/* MODERN HEADER */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-black mb-1">
                Xandeum pNode Analytics
              </h1>
              <p className="text-white text-sm font-medium">Real-time DevNet monitoring</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowDocs(true)}
                className="px-6 py-3 bg-white hover:bg-gray-200 text-black rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
              >
                📚 Docs
              </button>
              {refreshing && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-white text-sm font-medium"
                >
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  Refreshing...
                </motion.div>
              )}
              <button
                onClick={() => fetchNodes(true)}
                className="px-6 py-3 bg-white hover:bg-gray-200 text-black rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* STATS & CHARTS - ONE ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-5">
          {/* Stats Cards - 4 columns */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-2">
            {/* Total Nodes */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group aspect-square"
            >
              <div className="absolute inset-0 bg-[#0d3b2e] rounded transform rotate-1 group-hover:rotate-2 transition-transform opacity-10"></div>
              <div className="relative bg-white rounded p-2 shadow-sm h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="w-4 h-4 bg-black rounded-sm flex items-center justify-center">
                    <span className="text-white text-[8px] font-black">◆</span>
                  </div>
                  <div className="w-0.5 h-0.5 bg-[#0d3b2e] rounded-full animate-pulse"></div>
                </div>
                <div>
                  <div className="text-[7px] font-bold text-gray-500 uppercase tracking-wider">Total</div>
                  <div className="text-lg font-black text-black">{stats.total}</div>
                </div>
              </div>
            </motion.div>

            {/* Active Nodes */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="relative group aspect-square"
            >
              <div className="absolute inset-0 bg-[#0d3b2e] rounded transform -rotate-1 group-hover:-rotate-2 transition-transform opacity-10"></div>
              <div className="relative bg-white rounded p-2 shadow-sm h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="w-4 h-4 bg-black rounded-sm flex items-center justify-center">
                    <span className="text-white text-[8px] font-black">●</span>
                  </div>
                  <div className="w-0.5 h-0.5 bg-[#0d3b2e] rounded-full animate-pulse"></div>
                </div>
                <div>
                  <div className="text-[7px] font-bold text-gray-500 uppercase tracking-wider">Active</div>
                  <div className="text-lg font-black text-black">{stats.active}</div>
                </div>
              </div>
            </motion.div>

            {/* Versions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative group aspect-square"
            >
              <div className="absolute inset-0 bg-[#0d3b2e] rounded transform rotate-1 group-hover:rotate-2 transition-transform opacity-10"></div>
              <div className="relative bg-white rounded p-2 shadow-sm h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="w-4 h-4 bg-black rounded-sm flex items-center justify-center">
                    <span className="text-white text-[8px] font-black">■</span>
                  </div>
                  <div className="w-0.5 h-0.5 bg-[#0d3b2e] rounded-full animate-pulse"></div>
                </div>
                <div>
                  <div className="text-[7px] font-bold text-gray-500 uppercase tracking-wider">Versions</div>
                  <div className="text-lg font-black text-black">{stats.versions}</div>
                </div>
              </div>
            </motion.div>

            {/* Unique IPs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="relative group aspect-square"
            >
              <div className="absolute inset-0 bg-[#0d3b2e] rounded transform -rotate-1 group-hover:-rotate-2 transition-transform opacity-10"></div>
              <div className="relative bg-white rounded p-2 shadow-sm h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="w-4 h-4 bg-black rounded-sm flex items-center justify-center">
                    <span className="text-white text-[8px] font-black">▲</span>
                  </div>
                  <div className="w-0.5 h-0.5 bg-[#0d3b2e] rounded-full animate-pulse"></div>
                </div>
                <div>
                  <div className="text-[7px] font-bold text-gray-500 uppercase tracking-wider">IPs</div>
                  <div className="text-lg font-black text-black">{stats.uniqueIPs}</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Charts - 8 columns */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Version Chart with Pie */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg p-3 shadow-md"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                  <span className="text-white text-[10px] font-black">V</span>
                </div>
                <h3 className="text-xs font-black text-black">Top Versions</h3>
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={versionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={50}
                    innerRadius={30}
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
              <div className="mt-2 space-y-1">
                {versionData.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                      <span className="text-[10px] font-bold text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-[10px] font-black text-black">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Activity Timeline with Graph */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-lg p-3 shadow-md"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                    <span className="text-white text-[10px] font-black">⚡</span>
                  </div>
                  <h3 className="text-xs font-black text-black">Network Activity</h3>
                </div>
                <div className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded-full">
                  <div className="text-[8px] font-black text-black">LIVE</div>
                  <div className="w-1 h-1 bg-[#0d3b2e] rounded-full animate-pulse"></div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={activityData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d3b2e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0d3b2e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    stroke="#9ca3af"
                    tick={{ fontSize: 9, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    tick={{ fontSize: 9, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#0d3b2e"
                    strokeWidth={2.5}
                    dot={{ fill: "#0d3b2e", r: 3, strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 5, strokeWidth: 2 }}
                    fill="url(#colorCount)"
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                <div className="bg-gray-50 rounded p-1.5 text-center">
                  <div className="text-[8px] text-gray-500 font-bold mb-0.5">NOW</div>
                  <div className="text-base font-black text-black">{activityData[0]?.count || 0}</div>
                </div>
                <div className="bg-gray-50 rounded p-1.5 text-center">
                  <div className="text-[8px] text-gray-500 font-bold mb-0.5">60s</div>
                  <div className="text-base font-black text-black">{activityData[2]?.count || 0}</div>
                </div>
                <div className="bg-gray-50 rounded p-1.5 text-center">
                  <div className="text-[8px] text-gray-500 font-bold mb-0.5">600s</div>
                  <div className="text-base font-black text-black">{activityData[5]?.count || 0}</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${filterStatus === "all"
                ? "bg-black text-white shadow-md"
                : "bg-gray-100 text-black hover:bg-gray-200"
                }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${filterStatus === "active"
                ? "bg-black text-white shadow-md"
                : "bg-gray-100 text-black hover:bg-gray-200"
                }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus("warning")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${filterStatus === "warning"
                ? "bg-black text-white shadow-md"
                : "bg-gray-100 text-black hover:bg-gray-200"
                }`}
            >
              Warning
            </button>
            <button
              onClick={() => setFilterStatus("offline")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${filterStatus === "offline"
                ? "bg-black text-white shadow-md"
                : "bg-gray-100 text-black hover:bg-gray-200"
                }`}
            >
              Offline
            </button>

            <div className="h-8 w-px bg-gray-300 mx-2"></div>

            <select
              value={filterVersion}
              onChange={(e) => setFilterVersion(e.target.value)}
              className="px-4 py-2 rounded-lg font-semibold bg-gray-100 text-black hover:bg-gray-200 transition-all border-none outline-none cursor-pointer"
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
                ? "bg-black text-white shadow-md"
                : "bg-gray-100 text-black hover:bg-gray-200"
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
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-black outline-none font-mono text-sm text-black"
              />
            </motion.div>
          )}

          <div className="relative mt-4">
            <input
              type="text"
              placeholder="🔍 Search by public key, IP address, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-black outline-none font-medium text-black"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-gray-600 font-bold text-xl"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-[#0a2f23] rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0a2f23] sticky top-0 border-b border-white/10">
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
              <tbody className="divide-y divide-white/5">
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
                          <span className="text-lg">{health.icon}</span>
                          <span className="text-sm font-bold text-white">{health.label}</span>
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
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white text-black">
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
              <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                  <h2 className="text-3xl font-black text-black">📚 Xandeum Analytics Documentation</h2>
                  <button
                    onClick={() => setShowDocs(false)}
                    className="text-gray-400 hover:text-black transition-colors text-2xl font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-8 space-y-8">
                  {/* Overview */}
                  <section>
                    <h3 className="text-2xl font-bold text-black mb-4">Overview</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Xandeum pNode Analytics is a real-time monitoring dashboard for Xandeum DevNet nodes.
                      Track node health, performance metrics, and geographic distribution across the network.
                    </p>
                  </section>

                  {/* Features */}
                  <section>
                    <h3 className="text-2xl font-bold text-black mb-4">Key Features</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <span className="text-black font-bold">•</span>
                        <span><strong className="text-black">Real-time Monitoring:</strong> Auto-refreshes every 30 seconds with live data from DevNet</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-black font-bold">•</span>
                        <span><strong className="text-black">Node Health Status:</strong> Active (green), Warning (yellow), Offline (red) indicators</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-black font-bold">•</span>
                        <span><strong className="text-black">Geographic Data:</strong> City, country, and provider information for each node</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-black font-bold">•</span>
                        <span><strong className="text-black">Advanced Filtering:</strong> Filter by status, version, or track your own node</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-black font-bold">•</span>
                        <span><strong className="text-black">Data Visualization:</strong> Charts for version distribution and activity timeline</span>
                      </li>
                    </ul>
                  </section>

                  {/* How to Use */}
                  <section>
                    <h3 className="text-2xl font-bold text-black mb-4">How to Use</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-bold text-black mb-2">Filtering Nodes</h4>
                        <p className="text-gray-700">Use the filter bar to view specific node types: All, Active, Warning, or Offline. Select a version from the dropdown to filter by software version.</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-bold text-black mb-2">Tracking Your Node</h4>
                        <p className="text-gray-700">Click "My Node" and enter your public key to highlight your node in the table with a special background color.</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-bold text-black mb-2">Searching</h4>
                        <p className="text-gray-700">Use the search box to find nodes by public key, IP address, or city name. Search works together with filters.</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-bold text-black mb-2">Sorting</h4>
                        <p className="text-gray-700">Click any column header to sort the table. Click again to reverse the sort order.</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-bold text-black mb-2">Node Details</h4>
                        <p className="text-gray-700">Click any row in the table to open a detailed side panel with complete node information including location and provider data.</p>
                      </div>
                    </div>
                  </section>

                  {/* Node Status */}
                  <section>
                    <h3 className="text-2xl font-bold text-black mb-4">Node Status Indicators</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 bg-green-50 p-3 rounded-lg">
                        <span className="text-2xl">🟢</span>
                        <div>
                          <div className="font-bold text-black">Active</div>
                          <div className="text-sm text-gray-600">Last seen less than 30 seconds ago</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-yellow-50 p-3 rounded-lg">
                        <span className="text-2xl">🟡</span>
                        <div>
                          <div className="font-bold text-black">Warning</div>
                          <div className="text-sm text-gray-600">Last seen 30 seconds to 2 minutes ago</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-red-50 p-3 rounded-lg">
                        <span className="text-2xl">🔴</span>
                        <div>
                          <div className="font-bold text-black">Offline</div>
                          <div className="text-sm text-gray-600">Last seen more than 2 minutes ago</div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Technical Details */}
                  <section>
                    <h3 className="text-2xl font-bold text-black mb-4">Technical Details</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-gray-700">
                      <p><strong className="text-black">Data Source:</strong> Xandeum DevNet (192.190.136.36)</p>
                      <p><strong className="text-black">Update Frequency:</strong> Every 30 seconds</p>
                      <p><strong className="text-black">Geo-IP Provider:</strong> ipapi.co (cached for 24 hours)</p>
                      <p><strong className="text-black">Tech Stack:</strong> Next.js 16, React 19, TypeScript, Tailwind CSS</p>
                    </div>
                  </section>

                  {/* Support */}
                  <section>
                    <h3 className="text-2xl font-bold text-black mb-4">Support</h3>
                    <p className="text-gray-700">
                      For issues or questions about Xandeum pNode Analytics, please visit the Xandeum community channels or check the project repository.
                    </p>
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
              className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-[#0d3b2e] z-50 overflow-y-auto shadow-2xl border-l border-white"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black text-black">Node Details</h2>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-white hover:text-gray-300 transition-colors text-2xl font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Health Status */}
                  <div>
                    <div className="text-xs text-white font-bold mb-2 uppercase tracking-wider">Health Status</div>
                    <div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl border-2 border-white">
                      <span className="text-2xl">{getNodeHealth(selectedNode.last_seen_timestamp).icon}</span>
                      <span className="text-lg font-bold text-white">
                        {getNodeHealth(selectedNode.last_seen_timestamp).label}
                      </span>
                    </div>
                  </div>

                  {/* Uptime */}
                  <div>
                    <div className="text-xs text-white font-bold mb-2 uppercase tracking-wider">Uptime Progress</div>
                    <div className="bg-white/10 p-4 rounded-xl border-2 border-white">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex-1 bg-white/20 rounded-full h-4 overflow-hidden">
                          <div
                            className={`h-full transition-all ${getUptimePercentage(selectedNode.last_seen_timestamp) > 75
                              ? "bg-green-500"
                              : getUptimePercentage(selectedNode.last_seen_timestamp) > 30
                                ? "bg-yellow-500"
                                : "bg-red-500"
                              }`}
                            style={{ width: `${getUptimePercentage(selectedNode.last_seen_timestamp)}%` }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold text-white min-w-[60px]">
                          {getUptimePercentage(selectedNode.last_seen_timestamp).toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-white/70">Based on 5-minute window</div>
                    </div>
                  </div>

                  {/* Public Key */}
                  <div>
                    <div className="text-xs text-white font-bold mb-2 uppercase tracking-wider">Public Key</div>
                    <div className="font-mono text-sm text-white break-all bg-white/10 p-4 rounded-xl border-2 border-white">
                      {selectedNode.pubkey || "N/A"}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <div className="text-xs text-white font-bold mb-2 uppercase tracking-wider">Address</div>
                    <div className="font-mono text-sm text-white bg-white/10 p-4 rounded-xl border-2 border-white">
                      {selectedNode.address}
                    </div>
                  </div>

                  {/* Version */}
                  <div>
                    <div className="text-xs text-white font-bold mb-2 uppercase tracking-wider">Version</div>
                    <div className="text-sm text-white bg-white/10 p-4 rounded-xl border-2 border-white">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-white text-black">
                        {selectedNode.version}
                      </span>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <div className="text-xs text-white font-bold mb-2 uppercase tracking-wider">Location</div>
                    <div className="bg-white/10 p-4 rounded-xl border-2 border-white space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-white/70 font-semibold">City:</span>
                        <span className="text-white font-medium">{selectedNode.city || "Unknown"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/70 font-semibold">Country:</span>
                        <span className="text-white font-medium">{selectedNode.country || "Unknown"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/70 font-semibold">Coordinates:</span>
                        <span className="text-white font-mono text-sm">
                          {selectedNode.latitude?.toFixed(4)}, {selectedNode.longitude?.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Provider */}
                  <div>
                    <div className="text-xs text-white font-bold mb-2 uppercase tracking-wider">Provider</div>
                    <div className="text-sm text-white bg-white/10 p-4 rounded-xl border-2 border-white">
                      {selectedNode.provider || "Unknown"}
                    </div>
                  </div>

                  {/* Last Seen */}
                  <div>
                    <div className="text-xs text-white font-bold mb-2 uppercase tracking-wider">Last Seen</div>
                    <div className="bg-white/10 p-4 rounded-xl border-2 border-white">
                      <div className="text-lg font-bold text-white mb-1">
                        {getTimeSince(selectedNode.last_seen_timestamp)} ago
                      </div>
                      <div className="text-xs text-white/70">
                        {new Date(selectedNode.last_seen_timestamp * 1000).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Raw JSON */}
                  <details className="group">
                    <summary className="text-xs text-white font-bold mb-2 uppercase tracking-wider cursor-pointer hover:text-white/70">
                      Raw JSON ▼
                    </summary>
                    <pre className="text-xs text-white bg-white/10 p-4 rounded-xl border-2 border-white overflow-x-auto mt-2">
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
