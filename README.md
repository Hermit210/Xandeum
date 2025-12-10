# Xandeum pNode Analytics Dashboard

Real-time analytics platform for monitoring Xandeum pNodes on DevNet. Fetches live data from the Xandeum network using the official pRPC client.

## Features

- ✅ **Live pNode Data** - Fetches real pNodes from Xandeum DevNet (192.190.136.36)
- ✅ **Real-time Updates** - Auto-refreshes every 30 seconds
- ✅ **100+ Active Nodes** - Displays all nodes from the Xandeum network
- ✅ **Node Information**:
  - Public Key (Solana-style addresses)
  - IP Address & Port
  - Software Version
  - Last Seen (relative time)
- ✅ **Professional UI** - Clean, responsive design with Tailwind CSS
- ✅ **Error Handling** - Graceful error states with retry functionality
- ✅ **No Setup Required** - Connects directly to public DevNet

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
