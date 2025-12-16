Xandeum pNode Analytics Dashboard
A real-time analytics platform for monitoring Xandeum pNodes on DevNet, built using official pNode RPC (pRPC) calls.
The dashboard provides transparent visibility into node activity, versions, and network health — similar in spirit to Solana validator dashboards like topvalidators.app.
🌐 Live Demo: https://xandeumm.vercel.app
📦 Repository: https://github.com/Hermit210/Xandeum

Overview
Xandeum pNode Analytics is a web-based dashboard that retrieves live pNode gossip data from the Xandeum DevNet using public pRPC endpoints and presents it in a clear, user-friendly interface.
The platform focuses on:


Network transparency


Real-time monitoring


Developer and community usability



Features
Core Functionality


Live pNode Data
Fetches real-time data from Xandeum DevNet using public pRPC endpoints.


100+ Nodes Visible
Displays all pNodes currently appearing in gossip.


Auto Refresh
Automatically updates data every 30 seconds.


No Local pNode Required
Connects directly to public DevNet endpoints.



Dashboard Features


Network Statistics


Total nodes


Active nodes (recently seen)


Version distribution


Unique IP count




Search & Filter


Search by public key or IP address


Sort by last seen, version, or address




Interactive Node Details


Click any node to view detailed metadata


Raw JSON view for developers




Analytics


Version distribution pie chart


Activity timeline based on last-seen timestamps




Professional UI


Clean, minimal design inspired by top validator dashboards


Responsive layout (desktop, tablet, mobile)





Status Indicators
Node status is derived from the last_seen_timestamp field:


Active – Seen within the last 30 seconds


Warning – Seen between 30–120 seconds


Offline – Not seen for over 120 seconds



These statuses are calculated client-side for visualization only.


Technical Details
Tech Stack


Next.js 16 – App Router


React 19


TypeScript


Tailwind CSS


xandeum-prpc – Official pRPC client


Recharts & Framer Motion – Charts and animations



Architecture
Data Flow:
Frontend (app/page.tsx)
        ↓ fetch("/api/nodes")
API Route (app/api/nodes/route.ts)
        ↓ PrpcClient(public-endpoint)
Xandeum DevNet pNode
        ↓ get-pods-with-stats
Live pNode Gossip Data


API Endpoint
GET /api/nodes
Returns an array of pNode objects retrieved via the get-pods-with-stats pRPC call.
Example (simplified):
[
  {
    "pubkey": "2asTHq4vVGazKrmEa3YTXKuYiNZBdv1cQoLc1Tr2kvaw",
    "address": "192.190.136.36:9001",
    "version": "0.7.3",
    "last_seen_timestamp": 1765204349,
    "uptime": 3271,
    "storage_committed": 104857600,
    "storage_used": 26069,
    "storage_usage_percent": 0.02
  }
]


Important Notes & Disclaimers
DevNet Disclaimer


This dashboard uses Xandeum DevNet data.


Public pRPC endpoints do not guarantee uptime or version stability.


Node availability and metrics may change frequently.


About Uptime


The uptime field represents node-reported runtime since last restart.


It is not historical uptime and not related to staking performance.


Staking


Staking is not yet live on pNodes.


This dashboard does not display staking or reward data, as it is not currently available via pRPC.



How to Run Locally
npm install
npm run dev

Then open:
http://localhost:3000

Project Structure
/app
  ├── page.tsx              # Dashboard UI
  ├── layout.tsx            # Root layout
  ├── globals.css           # Global styles
  └── api/
      └── nodes/
          └── route.ts      # pRPC data fetcher


Why This Dashboard Matters


Network Transparency
Provides public visibility into the health and scale of the Xandeum pNode network.


Developer Tooling
Helps developers understand node availability and software distribution.


Community Insight
Empowers users to monitor decentralization and network growth in real time.



About Xandeum
Xandeum is building a scalable storage layer for Solana dApps, enabling exabyte-scale storage with smart contract–native integration and random access.
pNodes form the decentralized storage backbone of the Xandeum network.
Learn more at: https://www.xandeum.network




