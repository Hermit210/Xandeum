"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";

type Node = {
  address: string;
  pubkey: string | null;
  version: string;
  last_seen_timestamp: number;
};

type SortField = "pubkey" | "address" | "version" | "last_seen";

export default function Home() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("last_seen");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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

  // 1) NODE HEALTH STATUS
  const getNodeHealth = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    if (diff < 30) return { status: "active", color: "bg-green-500", label: "Active" };
    if (diff < 120) return { status: "warning", color: "bg-yellow-500", label: "Warning" };
    return { status: "offline", color: "bg-red-500", label: "Offline" };
  };

  // 3) UPTIME PROGRESS
  const getUptimePercentage = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    const percentage = Math.max(0, Math.min(100, ((300 - diff) / 300) * 100));
    return percentage;
  };

  const getUptimeColor = (percentage: number) => {
    if (percentage > 75) return "bg-green-500";
    if (percentage > 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  // 2) DUPLICATE DETECTION
  const duplicates = useMemo(() => {
    const pubkeyCount: Record<string, number> = {};
    const ipCount: Record<string, number> = {};

    nodes.forEach((n) => {
      if (n.pubkey) pubkeyCount[n.pubkey] = (pubkeyCount[n.pubkey] || 0) + 1;
      const ip = n.address.split(":")[0];
      ipCount[ip] = (ipCount[ip] || 0) + 1;
    });

    const dupPubkeys = Object.values(pubkeyCount).filter((c) => c > 1).length;
    const dupIPs = Object.values(ipCount).filter((c) => c > 1).length;

    return { pubkeys: dupPubkeys, ips: dupIPs };
  }, [nodes]);



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

  const filteredAndSortedNodes = useMemo(() => {
    let filtered = nodes.filter((node) =>
      node.pubkey?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      if (sortField === "last_seen") {
        aVal = a.last_seen_timestamp;
        bVal = b.last_seen_timestamp;
      } else {
        aVal = a[sortField] || "";
        bVal = b[sortField] || "";
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [nodes, searchTerm, sortField, sortOrder]);

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
      <div className="min-h-screen bg-[#0d3b2e] text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-64 skeleton rounded mb-8"></div>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 skeleton rounded-xl"></div>
            ))}
          </div>
          <div className="h-96 skeleton rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d3b2e] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-5xl mb-4">⚠</div>
          <h2 className="text-xl font-bold mb-2">Connection Error</h2>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={() => fetchNodes()}
            className="bg-white text-black hover:bg-gray-200 px-6 py-2 rounded-lg font-bold transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const COLORS = ["#0d3b2e", "#166534", "#15803d", "#16a34a", "#22c55e"];

  return (
    <div className="min-h-screen bg-[#0d3b2e] text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-black">
              Xandeum pNode Analytics
            </h1>
            <p className="text-white text-xs mt-1 font-bold">Real-time DevNet monitoring</p>
          </div>
          <div className="flex items-center gap-3">
            {refreshing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white text-sm flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                Refreshing...
              </motion.div>
            )}
            <button
              onClick={() => fetchNodes(true)}
              className="px-4 py-2 bg-white border border-white rounded-lg text-black hover:bg-gray-200 transition-colors text-sm font-bold"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Compact Stats & Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Metrics - Compact Grid */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/95 backdrop-blur border-2 border-white rounded-lg p-3 hover:shadow-lg transition-all"
            >
              <div className="text-black/60 text-[10px] font-black mb-1 uppercase tracking-wider">Total</div>
              <div className="text-2xl font-black text-black">{stats.total}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white/95 backdrop-blur border-2 border-white rounded-lg p-3 hover:shadow-lg transition-all"
            >
              <div className="text-black/60 text-[10px] font-black mb-1 uppercase tracking-wider">Active</div>
              <div className="text-2xl font-black text-black">{stats.active}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/95 backdrop-blur border-2 border-white rounded-lg p-3 hover:shadow-lg transition-all"
            >
              <div className="text-black/60 text-[10px] font-black mb-1 uppercase tracking-wider">Versions</div>
              <div className="text-2xl font-black text-black">{stats.versions}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/95 backdrop-blur border-2 border-white rounded-lg p-3 hover:shadow-lg transition-all"
            >
              <div className="text-black/60 text-[10px] font-black mb-1 uppercase tracking-wider">IPs</div>
              <div className="text-2xl font-black text-black">{stats.uniqueIPs}</div>
            </motion.div>
          </div>

          {/* Version Chart - Compact */}
          <div className="bg-white/95 backdrop-blur border-2 border-white rounded-lg p-3 hover:shadow-lg transition-all">
            <h3 className="text-xs font-black text-black mb-2 uppercase tracking-wider">Versions</h3>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={versionData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent, x, y }) => (
                    <text
                      x={x}
                      y={y}
                      fill="#000000"
                      textAnchor={x > 200 ? "start" : "end"}
                      dominantBaseline="central"
                      style={{ fontSize: "14px", fontWeight: "bold" }}
                    >
                      {`${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    </text>
                  )}
                  outerRadius={55}
                  innerRadius={20}
                  fill="#000000"
                  dataKey="value"
                  stroke="#ffffff"
                  strokeWidth={3}
                >
                  {versionData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#ffffff" strokeWidth={3} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Activity Chart - Compact */}
          <div className="bg-white/95 backdrop-blur border-2 border-white rounded-lg p-3 hover:shadow-lg transition-all">
            <h3 className="text-xs font-black text-black mb-2 uppercase tracking-wider">Activity</h3>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={activityData}>
                <XAxis dataKey="time" stroke="#000000" />
                <YAxis stroke="#000000" />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: "#ffffff", border: "2px solid #000000" }}
                />
                <Line type="monotone" dataKey="count" stroke="#000000" strokeWidth={4} dot={{ fill: "#000000", r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2) DUPLICATE DETECTION BANNER */}
        {(duplicates.pubkeys > 0 || duplicates.ips > 0) && (
          <div className="mb-4 bg-yellow-500/20 border-2 border-yellow-400 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-yellow-300 font-black text-sm">⚠️ Duplicate nodes detected:</span>
              <span className="text-white font-bold text-sm">
                {duplicates.pubkeys > 0 && `${duplicates.pubkeys} pubkeys`}
                {duplicates.pubkeys > 0 && duplicates.ips > 0 && ", "}
                {duplicates.ips > 0 && `${duplicates.ips} IPs`}
              </span>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Search nodes by public key or IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/95 backdrop-blur text-black border-2 border-white rounded-lg px-4 py-2.5 text-sm font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent shadow-sm hover:shadow-md transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-black/70 font-black"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/10 border border-white rounded-xl overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/20 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-black text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th
                    onClick={() => handleSort("pubkey")}
                    className="text-left px-4 py-3 text-xs font-black text-white uppercase tracking-wider cursor-pointer hover:bg-white/30 transition-colors"
                  >
                    Public Key {sortField === "pubkey" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("address")}
                    className="text-left px-4 py-3 text-xs font-black text-white uppercase tracking-wider cursor-pointer hover:bg-white/30 transition-colors"
                  >
                    Address {sortField === "address" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("version")}
                    className="text-left px-4 py-3 text-xs font-black text-white uppercase tracking-wider cursor-pointer hover:bg-white/30 transition-colors"
                  >
                    Version {sortField === "version" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-black text-white uppercase tracking-wider">
                    Uptime
                  </th>
                  <th
                    onClick={() => handleSort("last_seen")}
                    className="text-right px-4 py-3 text-xs font-black text-white uppercase tracking-wider cursor-pointer hover:bg-white/30 transition-colors"
                  >
                    Last Seen {sortField === "last_seen" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {filteredAndSortedNodes.map((node, index) => {
                  const health = getNodeHealth(node.last_seen_timestamp);
                  const uptimePercent = getUptimePercentage(node.last_seen_timestamp);

                  return (
                    <motion.tr
                      key={node.pubkey || index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.01 }}
                      onClick={() => setSelectedNode(node)}
                      className="cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      {/* 1) HEALTH STATUS */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${health.color}`}></div>
                          <span className="text-xs font-bold text-white">{health.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-bold text-white">
                          {node.pubkey ? `${node.pubkey.slice(0, 8)}...${node.pubkey.slice(-4)}` : "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-white">{node.address}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black bg-white text-black">
                          {node.version}
                        </span>
                      </td>
                      {/* 3) UPTIME PROGRESS BAR */}
                      <td className="px-4 py-3">
                        <div className="w-full">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-white/20 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full ${getUptimeColor(uptimePercent)} transition-all`}
                                style={{ width: `${uptimePercent}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-bold text-white min-w-[40px]">
                              {uptimePercent.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-bold text-white">
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

      {/* Side Panel */}
      <AnimatePresence>
        {selectedNode && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNode(null)}
              className="fixed inset-0 bg-[#1e3a8a]/80 z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-[#0d3b2e] border-l border-white z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Node Details</h2>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-white hover:text-white/70 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  {/* HEALTH STATUS IN PANEL */}
                  <div>
                    <div className="text-xs text-white font-black mb-2 uppercase">Health Status</div>
                    <div className="flex items-center gap-3 bg-white/10 p-3 rounded border border-white">
                      <div className={`w-4 h-4 rounded-full ${getNodeHealth(selectedNode.last_seen_timestamp).color}`}></div>
                      <span className="text-sm font-bold text-white">
                        {getNodeHealth(selectedNode.last_seen_timestamp).label}
                      </span>
                    </div>
                  </div>

                  {/* UPTIME IN PANEL */}
                  <div>
                    <div className="text-xs text-white font-black mb-2 uppercase">Uptime Progress</div>
                    <div className="bg-white/10 p-3 rounded border border-white">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex-1 bg-white/20 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full ${getUptimeColor(getUptimePercentage(selectedNode.last_seen_timestamp))}`}
                            style={{ width: `${getUptimePercentage(selectedNode.last_seen_timestamp)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-white min-w-[50px]">
                          {getUptimePercentage(selectedNode.last_seen_timestamp).toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-white/70">Based on 5-minute window</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-white font-black mb-2 uppercase">Public Key</div>
                    <div className="font-mono text-sm text-white break-all bg-white/10 p-3 rounded border border-white">
                      {selectedNode.pubkey || "N/A"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-white font-black mb-2 uppercase">Address</div>
                    <div className="font-mono text-sm text-white bg-white/10 p-3 rounded border border-white">
                      {selectedNode.address}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-white font-black mb-2 uppercase">Version</div>
                    <div className="text-sm text-white bg-white/10 p-3 rounded border border-white">
                      {selectedNode.version}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-white font-black mb-2 uppercase">Last Seen</div>
                    <div className="text-sm text-white bg-white/10 p-3 rounded border border-white">
                      {getTimeSince(selectedNode.last_seen_timestamp)} ago
                      <div className="text-xs text-white/70 mt-1">
                        {new Date(selectedNode.last_seen_timestamp * 1000).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}








