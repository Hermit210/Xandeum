"use client";

import { useState, useEffect } from "react";

type Node = {
  address: string;
  pubkey: string | null;
  version: string;
  last_seen_timestamp: number;
};

export default function Home() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNodes = async () => {
    try {
      setError(null);
      const response = await fetch("/api/nodes");

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setNodes(data.filter((n: Node) => n.pubkey !== null));
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch nodes");
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const getTimeSince = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  useEffect(() => {
    fetchNodes();
    const interval = setInterval(fetchNodes, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-slate-400">Loading Xandeum pNodes...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">⚠️ Error</div>
          <p className="text-slate-400">{error}</p>
          <button
            onClick={fetchNodes}
            className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Xandeum pNode Analytics</h1>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-green-900 text-green-300 rounded text-xs">
            🔴 Live DevNet
          </span>
          <div className="text-sm text-slate-400">
            {nodes.length} nodes • Auto-refresh: 30s
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-slate-700 text-sm">
          <thead className="bg-slate-900">
            <tr>
              <th className="p-3 text-left">Public Key</th>
              <th className="p-3 text-left">Address</th>
              <th className="p-3 text-left">Version</th>
              <th className="p-3 text-right">Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {nodes.map((node, index) => (
              <tr
                key={node.pubkey || index}
                className="border-t border-slate-800 hover:bg-slate-900"
              >
                <td className="p-3 font-mono text-xs">
                  {node.pubkey || "Unknown"}
                </td>
                <td className="p-3">{node.address}</td>
                <td className="p-3">
                  <span className="px-2 py-1 bg-slate-800 rounded text-xs">
                    {node.version}
                  </span>
                </td>
                <td className="p-3 text-right text-slate-400">
                  {getTimeSince(node.last_seen_timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {nodes.length === 0 && (
        <div className="text-center text-slate-400 mt-8">
          No nodes available
        </div>
      )}
    </main>
  );
}
