import { NextResponse } from "next/server";
import { PrpcClient } from "xandeum-prpc";

const ENDPOINTS = [
  "192.190.136.36",
  "192.190.136.37",
  "192.190.136.38",
  "173.212.203.145",
  "173.212.220.65",
];

export async function GET() {
  for (const ip of ENDPOINTS) {
    try {
      console.log(`[pRPC] Trying endpoint: ${ip}`);
      const client = new PrpcClient(ip);
      const pods = await client.getPods();
      console.log(`[pRPC] ✓ Success with ${ip}`);
      return NextResponse.json(pods);
    } catch (error) {
      console.error(`pRPC failed for ${ip}`, error);
      continue;
    }
  }

  console.error("[API] All pRPC endpoints failed - returning empty array");
  return NextResponse.json([], { status: 200 });
}
