import { NextResponse } from "next/server";
import { PrpcClient } from "xandeum-prpc";

const ENDPOINTS = [
  "192.190.136.36",
  "192.190.136.37",
  "192.190.136.38",
  "173.212.203.145",
  "173.212.220.65",
];

// In-memory cache for node data
let cachedData: any = null;
let cacheTimestamp: number = 0;
const CACHE_MAX_AGE = 2 * 60 * 1000; // 2 minutes
const RETRY_DELAY = 750; // 750ms delay between endpoint retries

// Helper to delay between retries
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET() {
  // Try each endpoint sequentially
  for (let i = 0; i < ENDPOINTS.length; i++) {
    const ip = ENDPOINTS[i];
    
    try {
      console.log(`[pRPC] Trying endpoint ${i + 1}/${ENDPOINTS.length}: ${ip}`);
      const client = new PrpcClient(ip);
      const result = await client.getPods();
      
      console.log(`[pRPC] ✓ Success with ${ip}`);
      
      // Cache the successful result
      cachedData = result;
      cacheTimestamp = Date.now();
      
      return NextResponse.json(result);
    } catch (error: any) {
      console.warn(`[pRPC] ✗ Failed ${ip}: ${error.message || "Unknown error"}`);
      
      // Add delay before trying next endpoint (except for last one)
      if (i < ENDPOINTS.length - 1) {
        await delay(RETRY_DELAY);
      }
    }
  }

  // All endpoints failed - check if we have cached data
  const cacheAge = Date.now() - cacheTimestamp;
  const isCacheValid = cachedData && cacheAge < CACHE_MAX_AGE;

  if (isCacheValid) {
    console.warn(`[pRPC] All endpoints failed, returning stale cache (${Math.floor(cacheAge / 1000)}s old)`);
    return NextResponse.json({
      ...cachedData,
      stale: true,
      cacheAge: Math.floor(cacheAge / 1000),
    });
  }

  // No valid cache available
  console.warn("[pRPC] All endpoints failed and no valid cache available");
  return NextResponse.json({ pods: [], total_count: 0 }, { status: 200 });
}
