"use client";

import Link from "next/link";
import { useState } from "react";

export default function Docs() {
  const [activeSection, setActiveSection] = useState("overview");

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src="/logo.png" alt="Xandeum Logo" className="h-6 sm:h-8 object-contain" />
              <div>
                <h1 className="text-base sm:text-xl font-bold text-white">Xandeum pNode Analytics</h1>
                <p className="text-xs sm:text-sm text-gray-400">Documentation</p>
              </div>
            </div>
            <Link
              href="/"
              className="px-3 sm:px-4 py-2 rounded-lg bg-[#14b8a6] hover:bg-[#0d9488] text-white text-xs sm:text-sm font-bold transition-all"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar Navigation - Hidden on mobile, shown on desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24 h-fit">
            <nav className="space-y-1">
              <button
                onClick={() => scrollToSection("overview")}
                className={`w-full text-left px-4 py-2 rounded-lg font-bold transition-colors ${
                  activeSection === "overview"
                    ? "bg-[#14b8a6] text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-900"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => scrollToSection("getting-started")}
                className={`w-full text-left px-4 py-2 rounded-lg font-bold transition-colors ${
                  activeSection === "getting-started"
                    ? "bg-[#14b8a6] text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-900"
                }`}
              >
                Getting Started
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className={`w-full text-left px-4 py-2 rounded-lg font-bold transition-colors ${
                  activeSection === "features"
                    ? "bg-[#14b8a6] text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-900"
                }`}
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("dashboard")}
                className={`w-full text-left px-4 py-2 rounded-lg font-bold transition-colors ${
                  activeSection === "dashboard"
                    ? "bg-[#14b8a6] text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-900"
                }`}
              >
                Using the Dashboard
              </button>
              <button
                onClick={() => scrollToSection("analytics")}
                className={`w-full text-left px-4 py-2 rounded-lg font-bold transition-colors ${
                  activeSection === "analytics"
                    ? "bg-[#14b8a6] text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-900"
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => scrollToSection("node-details")}
                className={`w-full text-left px-4 py-2 rounded-lg font-bold transition-colors ${
                  activeSection === "node-details"
                    ? "bg-[#14b8a6] text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-900"
                }`}
              >
                Node Details
              </button>
              <button
                onClick={() => scrollToSection("api")}
                className={`w-full text-left px-4 py-2 rounded-lg font-bold transition-colors ${
                  activeSection === "api"
                    ? "bg-[#14b8a6] text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-900"
                }`}
              >
                API Reference
              </button>
              <button
                onClick={() => scrollToSection("deployment")}
                className={`w-full text-left px-4 py-2 rounded-lg font-bold transition-colors ${
                  activeSection === "deployment"
                    ? "bg-[#14b8a6] text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-900"
                }`}
              >
                Deployment
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className={`w-full text-left px-4 py-2 rounded-lg font-bold transition-colors ${
                  activeSection === "faq"
                    ? "bg-[#14b8a6] text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-900"
                }`}
              >
                FAQ
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-8 sm:space-y-12 w-full">
            {/* Overview */}
            <section id="overview" className="scroll-mt-24">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">Overview</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  Xandeum pNode Analytics is a real-time monitoring dashboard for Xandeum DevNet nodes. 
                  Built using official pNode RPC (pRPC) calls, it provides transparent visibility into node 
                  activity, versions, and network health.
                </p>
                <p>
                  The platform retrieves live pNode gossip data from public pRPC endpoints and presents it 
                  in a clear, user-friendly interface similar to Solana validator dashboards.
                </p>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6 mt-6">
                  <h3 className="text-xl font-bold text-white mb-3">Key Highlights</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-[#14b8a6] mt-1">•</span>
                      <span>Real-time data from Xandeum DevNet</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#14b8a6] mt-1">•</span>
                      <span>100+ nodes monitored continuously</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#14b8a6] mt-1">•</span>
                      <span>Auto-refresh every 30 seconds</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#14b8a6] mt-1">•</span>
                      <span>No local pNode setup required</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Getting Started */}
            <section id="getting-started" className="scroll-mt-24">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">Getting Started</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Installation</h3>
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                    <pre className="text-sm text-gray-300">
                      <code>{`# Clone the repository
git clone https://github.com/Hermit210/Xandeum.git

# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
http://localhost:3000`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            {/* Features */}
            <section id="features" className="scroll-mt-24">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
                  <h3 className="text-lg font-bold text-white mb-3">Network Statistics</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Total node count</li>
                    <li>• Active nodes (recently seen)</li>
                    <li>• Version distribution</li>
                    <li>• Unique IP addresses</li>
                  </ul>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
                  <h3 className="text-lg font-bold text-white mb-3">Search & Filter</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Search by public key</li>
                    <li>• Filter by status (Active/Warning/Offline)</li>
                    <li>• Filter by version</li>
                    <li>• Sort by multiple columns</li>
                  </ul>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
                  <h3 className="text-lg font-bold text-white mb-3">Real-time Monitoring</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Auto-refresh every 30 seconds</li>
                    <li>• Live status indicators</li>
                    <li>• Uptime percentage tracking</li>
                    <li>• Last seen timestamps</li>
                  </ul>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
                  <h3 className="text-lg font-bold text-white mb-3">Geographic Data</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Node location (city, country)</li>
                    <li>• Provider information</li>
                    <li>• IP geolocation</li>
                    <li>• Coordinates display</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Using the Dashboard */}
            <section id="dashboard" className="scroll-mt-24">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">Using the Dashboard</h2>
              <div className="space-y-6">
                <p className="text-gray-300 leading-relaxed">
                  The main dashboard provides a comprehensive table view of all pNodes in the network with 
                  real-time status updates, filtering capabilities, and interactive features.
                </p>

                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Table Columns</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-white mb-2">Status</h4>
                      <p className="text-sm text-gray-300">
                        Visual indicator showing node health based on last_seen_timestamp. Displays a colored dot 
                        and label (Active/Warning/Offline) to quickly identify node state.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-2">Public Key</h4>
                      <p className="text-sm text-gray-300">
                        Truncated node public key displayed in monospace font. Shows first 8 and last 4 characters 
                        (e.g., "2asTHq4v...kvaw"). Click the row to view the full public key.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-2">Address</h4>
                      <p className="text-sm text-gray-300">
                        Node's IP address and port in format "IP:PORT" (e.g., "192.190.136.36:9001"). This is the 
                        network endpoint where the pNode can be reached.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-2">Version</h4>
                      <p className="text-sm text-gray-300">
                        Software version running on the node, displayed in a teal gradient badge. Helps identify 
                        which nodes are running the latest software.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-2">Uptime</h4>
                      <p className="text-sm text-gray-300">
                        Visual progress bar and percentage showing recent activity. Calculated based on last_seen_timestamp. 
                        100% means seen within last 30 seconds. This is NOT historical uptime.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-2">City</h4>
                      <p className="text-sm text-gray-300">
                        Geographic location of the node based on IP geolocation. Helps understand network distribution 
                        across different regions. Hidden on smaller screens.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-2">Last Seen</h4>
                      <p className="text-sm text-gray-300">
                        Time elapsed since the node was last seen in gossip (e.g., "15s ago", "2m ago"). Updates 
                        automatically every 30 seconds with fresh data.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
                  <h3 className="text-xl font-bold text-white mb-3">Status Indicators</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-[#14b8a6]"></div>
                      <span className="font-bold text-white">Active:</span>
                      <span className="text-gray-300">Last seen within 30 seconds - Node is currently participating in the network</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                      <span className="font-bold text-white">Warning:</span>
                      <span className="text-gray-300">Last seen 30-120 seconds ago - Node may be experiencing connectivity issues</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gray-700"></div>
                      <span className="font-bold text-white">Offline:</span>
                      <span className="text-gray-300">Last seen over 120 seconds ago - Node is not currently responding</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
                  <h3 className="text-xl font-bold text-white mb-3">Sorting</h3>
                  <p className="text-gray-300 mb-3">
                    Click any column header to sort the table by that field. Click again to reverse the sort order. 
                    The active sort column shows an arrow indicator (↑ or ↓).
                  </p>
                  <p className="text-sm text-gray-400">
                    Tip: Sort by "Last Seen" to find the most recently active nodes, or by "Version" to group nodes 
                    running the same software version.
                  </p>
                </div>
              </div>
            </section>

            {/* Analytics */}
            <section id="analytics" className="scroll-mt-24">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">Analytics</h2>
              <div className="space-y-6">
                <p className="text-gray-300 leading-relaxed">
                  The analytics section provides visual insights into network activity, version distribution, 
                  and node status patterns through interactive charts.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
                    <h3 className="text-lg font-bold text-white mb-3">Version Distribution</h3>
                    <p className="text-sm text-gray-300 mb-4">
                      Pie chart showing the distribution of software versions across all nodes in the network. 
                      Each version is represented with a different color segment, making it easy to identify 
                      which versions are most popular.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>• Visual breakdown of version adoption</li>
                      <li>• Percentage labels for each version</li>
                      <li>• Color-coded segments for clarity</li>
                      <li>• Shows all versions in the network</li>
                    </ul>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
                    <h3 className="text-lg font-bold text-white mb-3">Activity Timeline</h3>
                    <p className="text-sm text-gray-300 mb-4">
                      Line chart displaying node activity patterns based on last-seen timestamps. 
                      Helps identify trends and patterns in network participation over time.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>• Time-based activity visualization</li>
                      <li>• Smooth line chart with gradient fill</li>
                      <li>• Interactive tooltips on hover</li>
                      <li>• Real-time data updates</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Node Details Panel */}
            <section id="node-details" className="scroll-mt-24">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">Node Details Panel</h2>
              <div className="space-y-6">
                <p className="text-gray-300 leading-relaxed">
                  Click any row in the node table to open a detailed information panel on the right side of the screen. 
                  This panel provides comprehensive information about the selected node.
                </p>

                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Panel Sections</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-white mb-2">Status Overview Card</h4>
                      <p className="text-sm text-gray-300 mb-2">
                        Displays the current health status with an animated pulse indicator. Shows the node's status 
                        (Active/Warning/Offline) and how long ago it was last seen.
                      </p>
                      <p className="text-sm text-gray-300">
                        Includes an uptime progress bar showing the calculated uptime percentage based on recent activity.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-white mb-2">Public Key</h4>
                      <p className="text-sm text-gray-300">
                        Full public key of the node displayed in monospace font. This is the complete identifier, 
                        not the truncated version shown in the table. You can copy this for reference or verification.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-white mb-2">Address & Version</h4>
                      <p className="text-sm text-gray-300">
                        Shows the complete network address (IP:PORT) and the software version running on the node. 
                        The version is displayed in a teal gradient badge for easy identification.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-white mb-2">Location Information</h4>
                      <p className="text-sm text-gray-300">
                        Geographic details including city, country, and precise coordinates (latitude/longitude). 
                        This data is obtained through IP geolocation services and helps visualize network distribution.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-white mb-2">Provider</h4>
                      <p className="text-sm text-gray-300">
                        Internet service provider or hosting company information. Helps identify infrastructure diversity 
                        across the network (e.g., "Google LLC", "Amazon AWS", "DigitalOcean").
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-white mb-2">Last Seen</h4>
                      <p className="text-sm text-gray-300">
                        Displays both relative time (e.g., "2m ago") and absolute timestamp (full date and time). 
                        This helps track when the node was last active in the network gossip.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-white mb-2">Raw JSON Data</h4>
                      <p className="text-sm text-gray-300">
                        Expandable section showing the complete raw JSON response from the pRPC endpoint. Useful for 
                        developers who want to see all available fields and data structure.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
                  <h3 className="text-xl font-bold text-white mb-3">Closing the Panel</h3>
                  <p className="text-gray-300">
                    Click the X button in the top-right corner of the panel, or click anywhere outside the panel 
                    (on the dark backdrop) to close it and return to the main table view.
                  </p>
                </div>
              </div>
            </section>

            {/* API Reference */}
            <section id="api" className="scroll-mt-24">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">API Reference</h2>
              <div className="space-y-6">
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
                  <h3 className="text-xl font-bold text-white mb-3">GET /api/nodes</h3>
                  <p className="text-gray-300 mb-4">
                    Fetches live pNode data from DevNet using the <code className="bg-black px-2 py-1 rounded text-[#14b8a6]">get-pods-with-stats</code> pRPC method.
                  </p>
                  <div className="bg-black border border-gray-700 rounded-lg p-4">
                    <pre className="text-sm text-gray-300 overflow-x-auto">
                      <code>{`// Response Example
[
  {
    "pubkey": "2asTHq4vVGazKrmEa3YTXKuYiNZBdv1cQoLc1Tr2kvaw",
    "address": "192.190.136.36:9001",
    "version": "0.7.3",
    "last_seen_timestamp": 1765204349,
    "city": "Los Angeles",
    "country": "United States",
    "latitude": 34.0522,
    "longitude": -118.2437,
    "provider": "Google LLC"
  }
]`}</code>
                    </pre>
                  </div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
                  <h3 className="text-xl font-bold text-white mb-3">Data Source</h3>
                  <p className="text-gray-300">
                    Data is fetched from public DevNet pNode RPC endpoints. Geographic information is enriched 
                    using IP geolocation services. Public endpoints have no guarantee of uptime or version consistency.
                  </p>
                </div>
              </div>
            </section>

            {/* Deployment */}
            <section id="deployment" className="scroll-mt-24">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">Deployment</h2>
              <div className="space-y-6">
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
                  <h3 className="text-xl font-bold text-white mb-3">Vercel Deployment</h3>
                  <p className="text-gray-300 mb-4">
                    The dashboard is deployed on Vercel for optimal performance and automatic deployments.
                  </p>
                  <div className="bg-black border border-gray-700 rounded-lg p-4">
                    <pre className="text-sm text-gray-300">
                      <code>{`# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod`}</code>
                    </pre>
                  </div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
                  <h3 className="text-xl font-bold text-white mb-3">Environment Variables</h3>
                  <p className="text-gray-300 mb-3">No environment variables required. The dashboard uses public pRPC endpoints.</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
                  <h3 className="text-xl font-bold text-white mb-3">Build Command</h3>
                  <div className="bg-black border border-gray-700 rounded-lg p-4">
                    <pre className="text-sm text-gray-300">
                      <code>{`npm run build`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="scroll-mt-24">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6 group">
                  <summary className="text-lg font-bold text-white cursor-pointer list-none flex items-center justify-between">
                    <span>What is a pNode?</span>
                    <span className="text-[#14b8a6] group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-gray-300 mt-4 leading-relaxed">
                    pNodes (participant nodes) are storage nodes in the Xandeum network. They participate in providing 
                    decentralized storage for the Solana ecosystem using erasure coding technology.
                  </p>
                </details>

                <details className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6 group">
                  <summary className="text-lg font-bold text-white cursor-pointer list-none flex items-center justify-between">
                    <span>How often does the data refresh?</span>
                    <span className="text-[#14b8a6] group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-gray-300 mt-4 leading-relaxed">
                    The dashboard automatically refreshes every 30 seconds by querying public pRPC endpoints for the 
                    latest node data from the DevNet network.
                  </p>
                </details>

                <details className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6 group">
                  <summary className="text-lg font-bold text-white cursor-pointer list-none flex items-center justify-between">
                    <span>What does the uptime percentage mean?</span>
                    <span className="text-[#14b8a6] group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-gray-300 mt-4 leading-relaxed">
                    The uptime percentage is a calculated metric based on the last_seen_timestamp. It represents recent 
                    activity, not historical uptime. 100% means the node was seen within the last 30 seconds. This is 
                    not related to staking performance.
                  </p>
                </details>

                <details className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6 group">
                  <summary className="text-lg font-bold text-white cursor-pointer list-none flex items-center justify-between">
                    <span>Where does the data come from?</span>
                    <span className="text-[#14b8a6] group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-gray-300 mt-4 leading-relaxed">
                    Data is fetched from public DevNet pNode RPC endpoints using the get-pods-with-stats pRPC method. 
                    Geographic data is enriched using IP geolocation services. Public endpoints have no guarantee of 
                    uptime or version consistency.
                  </p>
                </details>

                <details className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6 group">
                  <summary className="text-lg font-bold text-white cursor-pointer list-none flex items-center justify-between">
                    <span>Does this show staking or rewards?</span>
                    <span className="text-[#14b8a6] group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-gray-300 mt-4 leading-relaxed">
                    No. Staking and rewards are not yet live on pNodes. This dashboard only displays node activity and 
                    network statistics. It does not show stake, rewards, or payout data as these features are not 
                    currently available via pRPC.
                  </p>
                </details>

                <details className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6 group">
                  <summary className="text-lg font-bold text-white cursor-pointer list-none flex items-center justify-between">
                    <span>Is this data from MainNet?</span>
                    <span className="text-[#14b8a6] group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-gray-300 mt-4 leading-relaxed">
                    No. This dashboard displays DevNet data only. Node counts and availability are subject to change as 
                    this is a development network. Values, versions, and node availability may change frequently.
                  </p>
                </details>

                <details className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6 group">
                  <summary className="text-lg font-bold text-white cursor-pointer list-none flex items-center justify-between">
                    <span>Can I run my own pNode?</span>
                    <span className="text-[#14b8a6] group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-gray-300 mt-4 leading-relaxed">
                    Yes! Visit the Xandeum website at{" "}
                    <a href="https://www.xandeum.network" target="_blank" rel="noopener noreferrer" className="text-[#14b8a6] hover:underline">
                      xandeum.network
                    </a>{" "}
                    to learn how to set up and run your own pNode to contribute to the decentralized storage network.
                  </p>
                </details>

                <details className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6 group">
                  <summary className="text-lg font-bold text-white cursor-pointer list-none flex items-center justify-between">
                    <span>How do I filter nodes by status?</span>
                    <span className="text-[#14b8a6] group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-gray-300 mt-4 leading-relaxed">
                    Use the filter buttons (All, Active, Warning, Offline) in the toolbar above the node table. You can 
                    also filter by version using the dropdown menu, or search for specific nodes using the search bar.
                  </p>
                </details>

                <details className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6 group">
                  <summary className="text-lg font-bold text-white cursor-pointer list-none flex items-center justify-between">
                    <span>What technology is used to build this dashboard?</span>
                    <span className="text-[#14b8a6] group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-gray-300 mt-4 leading-relaxed">
                    The dashboard is built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS. It uses 
                    the official xandeum-prpc client for data fetching, Recharts for visualizations, and Framer Motion 
                    for animations.
                  </p>
                </details>

                <details className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6 group">
                  <summary className="text-lg font-bold text-white cursor-pointer list-none flex items-center justify-between">
                    <span>Is the source code available?</span>
                    <span className="text-[#14b8a6] group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-gray-300 mt-4 leading-relaxed">
                    Yes! The dashboard is open source and available on GitHub at{" "}
                    <a href="https://github.com/Hermit210/Xandeum" target="_blank" rel="noopener noreferrer" className="text-[#14b8a6] hover:underline">
                      github.com/Hermit210/Xandeum
                    </a>
                    . You can clone, fork, and contribute to the project.
                  </p>
                </details>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
