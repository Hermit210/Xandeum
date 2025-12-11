import { NextResponse } from "next/server";
import { PrpcClient } from "xandeum-prpc";

// In-memory cache for geo-IP data
const geoCache = new Map<string, any>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function fetchGeoData(ip: string) {
  // Check cache first
  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { 'User-Agent': 'Xandeum-Dashboard/1.0' }
    });
    
    if (!response.ok) {
      throw new Error('Geo API failed');
    }

    const data = await response.json();
    const geoData = {
      city: data.city || 'Unknown',
      country: data.country_name || 'Unknown',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      provider: data.org || 'Unknown'
    };

    // Cache the result
    geoCache.set(ip, { data: geoData, timestamp: Date.now() });
    return geoData;
  } catch (err) {
    // Return default data on error
    return {
      city: 'Unknown',
      country: 'Unknown',
      latitude: 0,
      longitude: 0,
      provider: 'Unknown'
    };
  }
}

export async function GET() {
  try {
    const client = new PrpcClient("192.190.136.36");
    const data = await client.getPods();
    const pods = data.pods || [];

    // Enrich nodes with geo data (batch process to avoid rate limits)
    const enrichedPods = await Promise.all(
      pods.map(async (pod: any) => {
        const ip = pod.address.split(':')[0];
        const geoData = await fetchGeoData(ip);
        
        return {
          ...pod,
          ...geoData
        };
      })
    );

    return NextResponse.json(enrichedPods);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Unable to fetch Xandeum pNodes", details: err.message },
      { status: 500 }
    );
  }
}

