// components/helpContent.ts

export const helpTopics = [
  // Node Status
  {
    keywords: ["active", "active node", "active nodes", "active status"],
    answer: (stats?: any) =>
      `Active nodes are pNodes last seen within 30 seconds. They are currently participating in the network. Currently, there are ${stats?.active ?? "some"} active nodes on DevNet.`,
  },
  {
    keywords: ["warning", "warning node", "warning nodes", "warning status"],
    answer: (stats?: any) =>
      `Warning nodes were last seen between 30 and 120 seconds ago. They may be experiencing connectivity issues. Currently, there are ${stats?.warning ?? "some"} warning nodes on DevNet.`,
  },
  {
    keywords: ["offline", "offline node", "offline nodes", "offline status"],
    answer: (stats?: any) =>
      `Offline nodes have not been seen for more than 120 seconds. They are not currently responding in the network. Currently, there are ${stats?.offline ?? "some"} offline nodes on DevNet.`,
  },
  {
    keywords: ["status", "node status", "status indicator", "status color"],
    answer: () =>
      "Node status is determined by last_seen_timestamp: Active (green, <30s), Warning (gray, 30-120s), Offline (dark gray, >120s).",
  },

  // Uptime
  {
    keywords: ["uptime", "uptime percentage", "uptime bar", "uptime metric"],
    answer: () =>
      "Uptime is a recent-activity metric calculated from the last_seen_timestamp over a 5-minute window. It shows recent activity, NOT long-term historical uptime. 100% means seen within last 30 seconds.",
  },

  // Refresh and Updates
  {
    keywords: ["refresh", "update", "real time", "auto refresh", "refresh button"],
    answer: () =>
      "The dashboard auto-refreshes every 30 seconds using live DevNet pRPC data. You can also manually refresh using the Refresh button in the navigation bar.",
  },
  {
    keywords: ["refresh rate", "update frequency", "how often"],
    answer: () =>
      "The dashboard automatically refreshes every 30 seconds. Data comes from live DevNet pRPC endpoints.",
  },

  // Versions
  {
    keywords: ["version", "versions", "software version", "node version"],
    answer: (stats?: any) =>
      `Versions represent the software version each pNode is running. Currently, there are ${stats?.versions ?? "multiple"} different versions on the network. You can filter nodes by version using the dropdown in the filter toolbar.`,
  },
  {
    keywords: ["version filter", "filter by version"],
    answer: () =>
      "Use the version dropdown in the filter toolbar to show only nodes running a specific software version.",
  },

  // Filtering and Search
  {
    keywords: ["filter", "filtering", "filter nodes"],
    answer: () =>
      "You can filter nodes by status (All, Active, Warning, Offline) using the filter buttons, or by version using the dropdown menu.",
  },
  {
    keywords: ["search", "search bar", "search nodes", "find node"],
    answer: () =>
      "Use the search bar to find nodes by public key, IP address, or city name. The search works across all visible fields.",
  },
  {
    keywords: ["public key", "pubkey", "search pubkey"],
    answer: () =>
      "Public keys are unique identifiers for each node. You can search for a node by entering its public key (full or partial) in the search bar.",
  },
  {
    keywords: ["ip address", "address", "search ip"],
    answer: () =>
      "Each node has an IP address and port (e.g., 192.190.136.36:9001). You can search for nodes by their IP address in the search bar.",
  },

  // Sorting
  {
    keywords: ["sort", "sorting", "sort table", "sort nodes", "sort by"],
    answer: () =>
      "Click any column header to sort the table by that field. Click again to reverse the sort order. You can sort by Status, Public Key, Address, Version, Uptime, or Last Seen.",
  },
  {
    keywords: ["last seen", "last seen column", "sort last seen"],
    answer: () =>
      "The Last Seen column shows how long ago each node was last seen. Click the header to sort nodes by most recently active or least recently active.",
  },

  // Analytics
  {
    keywords: ["analytics", "analytics modal", "analytics page", "charts"],
    answer: () =>
      "Click the Analytics button in the navigation bar to open the Analytics modal. It shows activity timelines, version distribution pie chart, and status distribution charts with network health statistics.",
  },
  {
    keywords: ["chart", "charts", "pie chart", "timeline chart"],
    answer: () =>
      "The Analytics modal includes: Activity Timeline (line chart showing node activity over time), Version Distribution (pie chart), and Status Distribution (pie chart showing Active/Warning/Offline breakdown).",
  },
  {
    keywords: ["network health", "health percentage"],
    answer: () =>
      "Network health is calculated as the percentage of active nodes out of total nodes. This is shown in the Analytics modal statistics.",
  },

  // Node Details
  {
    keywords: ["node details", "details panel", "click node", "node info"],
    answer: () =>
      "Click any row in the node table to open a detailed information panel on the right side. The panel shows full public key, address, version, status, uptime, last seen timestamp, and raw JSON data. Click outside or the X button to close.",
  },
  {
    keywords: ["raw json", "json data", "node json"],
    answer: () =>
      "In the node details panel, expand the 'Raw JSON' section to see the complete raw data structure from the pRPC endpoint. Useful for developers.",
  },
  {
    keywords: ["close panel", "close details", "exit panel"],
    answer: () =>
      "Close the node details panel by clicking the X button in the top-right corner, or click anywhere outside the panel on the dark backdrop.",
  },

  // Navigation
  {
    keywords: ["navigation", "nav bar", "menu", "navigation bar"],
    answer: () =>
      "The navigation bar at the top includes: Dashboard (main view), Analytics button (opens modal), Docs link (documentation page), and Refresh button. On mobile, use the hamburger menu.",
  },
  {
    keywords: ["dashboard", "main page", "home page"],
    answer: () =>
      "The Dashboard is the main page showing the node table with all pNodes, filters, search, and sorting options.",
  },
  {
    keywords: ["docs", "documentation", "docs page"],
    answer: () =>
      "Click 'Docs' in the navigation bar to view comprehensive documentation about the dashboard, features, API reference, FAQ, and how to use all features.",
  },
  {
    keywords: ["about", "about page"],
    answer: () =>
      "The About page provides information about what pNodes are, what this dashboard does, technical details, and node status indicators. Access it via the /about route.",
  },

  // Statistics
  {
    keywords: ["stats", "statistics", "total nodes", "node count"],
    answer: (stats?: any) =>
      `Current statistics: ${stats?.total ?? "N"} total nodes, ${stats?.active ?? "N"} active nodes, ${stats?.warning ?? "N"} warning nodes, ${stats?.offline ?? "N"} offline nodes, ${stats?.versions ?? "N"} different versions, and ${stats?.uniqueIPs ?? "N"} unique IP addresses.`,
  },
  {
    keywords: ["total", "total nodes", "how many nodes"],
    answer: (stats?: any) =>
      `There are currently ${stats?.total ?? "multiple"} pNodes visible on the DevNet dashboard.`,
  },
  {
    keywords: ["how many active", "how many active nodes", "count active"],
    answer: (stats?: any) =>
      `There are currently ${stats?.active ?? "N"} active nodes on the network. Active nodes were last seen within the last 30 seconds.`,
  },
  {
    keywords: ["how many warning", "how many warning nodes", "count warning"],
    answer: (stats?: any) =>
      `There are currently ${stats?.warning ?? "N"} warning nodes on the network. Warning nodes were last seen between 30 and 120 seconds ago.`,
  },
  {
    keywords: ["how many offline", "how many offline nodes", "count offline"],
    answer: (stats?: any) =>
      `There are currently ${stats?.offline ?? "N"} offline nodes on the network. Offline nodes have not been seen for more than 120 seconds.`,
  },
  {
    keywords: ["how many versions", "how many different versions", "count versions"],
    answer: (stats?: any) =>
      `There are currently ${stats?.versions ?? "N"} different software versions running on the network.`,
  },
  {
    keywords: ["unique ip", "ip count", "how many ips", "how many ip addresses"],
    answer: (stats?: any) =>
      `There are ${stats?.uniqueIPs ?? "multiple"} unique IP addresses hosting pNodes on the network.`,
  },

  // pNodes General
  {
    keywords: ["pnode", "pnodes", "what is pnode", "what are pnodes"],
    answer: () =>
      "pNodes are participant storage nodes that power Xandeum's decentralized storage network. They provide storage infrastructure for the Solana ecosystem using erasure coding technology.",
  },
  {
    keywords: ["xandeum", "what is xandeum"],
    answer: () =>
      "Xandeum is building a scalable storage layer for Solana dApps, enabling exabyte-scale storage with smart contract-native integration and random access capabilities.",
  },
  {
    keywords: ["devnet", "devnet network"],
    answer: () =>
      "This dashboard displays data from Xandeum DevNet (development network). Node counts, versions, and availability may change frequently as this is a development environment.",
  },

  // Table Features
  {
    keywords: ["table", "node table", "table columns"],
    answer: () =>
      "The main table displays: Status (colored indicator), Public Key (truncated), Address (IP:PORT), Version (badge), Uptime (progress bar with %), and Last Seen (time ago). Click any column header to sort.",
  },
  {
    keywords: ["columns", "table columns", "what columns"],
    answer: () =>
      "The table has 6 columns: Status, Public Key, Address, Version, Uptime, and Last Seen. All columns are sortable by clicking the header.",
  },
  {
    keywords: ["truncated", "shortened", "abbreviated pubkey"],
    answer: () =>
      "Public keys in the table are truncated for readability (showing first 8 and last 4 characters). Click the row to see the full public key in the details panel.",
  },

  // Mobile Features
  {
    keywords: ["mobile", "mobile view", "phone", "responsive"],
    answer: () =>
      "The dashboard is fully responsive. On mobile devices, nodes are displayed as cards instead of a table, and there's a hamburger menu for navigation.",
  },
  {
    keywords: ["mobile menu", "hamburger menu"],
    answer: () =>
      "On mobile devices, tap the hamburger menu icon (three lines) in the navigation bar to access Dashboard, Analytics, Docs, and Refresh options.",
  },

  // Data Source
  {
    keywords: ["data source", "where data", "prpc", "api"],
    answer: () =>
      "Data comes from public Xandeum DevNet pRPC endpoints using the get-pods-with-stats method. The dashboard fetches from multiple endpoints for reliability.",
  },
  {
    keywords: ["endpoint", "prpc endpoint", "api endpoint"],
    answer: () =>
      "The dashboard uses public pRPC endpoints to fetch node data. Geographic data is enriched using IP geolocation services.",
  },
  {
    keywords: ["gossip", "gossip data", "network gossip", "gossip protocol"],
    answer: () =>
      "Yes, gossip is part of how this website works! The dashboard retrieves live pNode gossip data from the Xandeum DevNet network. Gossip is the protocol nodes use to communicate with each other and share information about their status. The dashboard displays all pNodes that appear in the network gossip, and the 'last_seen_timestamp' shows when each node was last active in gossip. This is how the dashboard knows which nodes are online and their current status.",
  },

  // Staking and Rewards
  {
    keywords: [
      "stake",
      "staking",
      "rewards",
      "earn",
      "earnings",
      "apy",
      "apr",
      "yield",
      "income"
    ],
    answer: () =>
      "Staking and rewards are not currently available on the Xandeum pNode Analytics dashboard. This dashboard only displays live DevNet node activity and network statistics. If staking or rewards are added in the future, they will be shown directly on the official website and reflected in this dashboard.",
  },

  // Time and Timestamps
  {
    keywords: ["last seen timestamp", "timestamp", "when seen"],
    answer: () =>
      "The last_seen_timestamp shows when each node was last active in the network gossip. It's displayed both as relative time (e.g., '2m ago') and absolute timestamp in the details panel.",
  },
  {
    keywords: ["time ago", "how long ago", "when was"],
    answer: () =>
      "The 'Last Seen' column shows relative time (e.g., '15s ago', '2m ago', '1h ago', '3d ago') indicating how long since the node was last seen.",
  },

  // Geographic Data
  {
    keywords: ["location", "city", "country", "geographic", "geolocation"],
    answer: () =>
      "Geographic data (city, country, coordinates) is determined by IP geolocation services. This information helps visualize network distribution across regions.",
  },
  {
    keywords: ["ip geolocation", "where is node located"],
    answer: () =>
      "Node locations are determined using IP geolocation. This shows the geographic distribution of the Xandeum pNode network.",
  },

  // How to Use
  {
    keywords: ["how to use", "how do i", "how to filter", "how to search"],
    answer: () =>
      "Filter nodes: Use status buttons (All/Active/Warning/Offline) or version dropdown. Search: Type in the search bar (works with pubkey, IP, or city). Sort: Click column headers. View details: Click any row. View analytics: Click Analytics button.",
  },
  {
    keywords: ["help", "how", "instructions", "guide"],
    answer: () =>
      "I'm here to help! Ask me about: node status, filtering, searching, sorting, analytics, node details, versions, uptime, refresh, or any other dashboard features.",
  },
  {
    keywords: ["what can i do", "features", "functionality"],
    answer: () =>
      "You can: view all pNodes in a table, filter by status/version, search by pubkey/IP, sort columns, click nodes for details, view analytics charts, refresh data manually, and access documentation. Everything updates in real-time!",
  },

  // Official Website
  {
    keywords: ["official website", "main website", "xandeum website", "xandeum.network", "official site", "main site"],
    answer: () =>
      "The official Xandeum website is https://www.xandeum.network/ - Visit it to learn more about Xandeum, liquid staking, pNodes, documentation, and the latest news and updates.",
  },
  {
    keywords: ["website", "site", "xandeum.network"],
    answer: () =>
      "For the official Xandeum website, visit https://www.xandeum.network/ where you can learn about Xandeum's vision, liquid staking, pNodes, documentation, DAO, tokenomics, and more.",
  },
];
