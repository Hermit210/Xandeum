# Xandeum pNode Analytics Dashboard

Real-time analytics platform for monitoring Xandeum pNodes on DevNet. Fetches live data from the Xandeum network using the official pRPC client.

## Features

### Core Functionality
- **Live pNode Data** - Real-time data from Xandeum DevNet (192.190.136.36)
- **100+ Active Nodes** - Complete network visibility
- **Auto-refresh** - Updates every 30 seconds
- **No Setup Required** - Connects directly to public DevNet

### Dashboard Features
- **Network Statistics** - Total nodes, online count, version distribution
- **Search & Filter** - Find nodes by public key, address, version, or status
- **Professional UI** - Clean, modern design inspired by top validator dashboards
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Status Indicators** - Real-time online/stale/offline status with color coding
- **Version Tracking** - Monitor software versions across the network

### Technical Features
- **Fast Performance** - Optimized React components with useMemo
- **Type Safety** - Full TypeScript implementation
- **Clean Code** - Professional architecture and best practices
- **Production Ready** - Error handling, loading states, empty states

## How to Run

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

### Data Flow
```
Frontend (app/page.tsx)
    ↓ fetch("/api/nodes")
API Route (app/api/nodes/route.ts)
    ↓ PrpcClient("192.190.136.36")
Xandeum DevNet pNode
    ↓ getPods()
Live pNode Data
```

### Tech Stack
- **Next.js 16** - App Router with Server Components
- **React 19** - Client-side interactivity
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **xandeum-prpc** - Official Xandeum pRPC client

## Project Structure

```
/app
  ├── page.tsx              # Dashboard UI
  ├── layout.tsx            # Root layout
  ├── globals.css           # Tailwind CSS
  └── api/
      └── nodes/
          └── route.ts      # pRPC API endpoint
```

## API Endpoint

**GET** `/api/nodes`

Returns array of pNode objects from Xandeum DevNet.

Example response:
```json
[
  {
    "publicKey": "...",
    "ipAddress": "...",
    "isPublic": true,
    "softwareVersion": "...",
    "uptimeSeconds": 123456,
    "storageCommittedGb": 500,
    "storageUsedMb": 45000,
    "storageUsagePercent": 88.2
  }
]
```

## Development

No local pNode setup required! The dashboard connects directly to Xandeum's public DevNet node.

## Deployment

Ready to deploy to Vercel, Netlify, or any Next.js hosting platform.
