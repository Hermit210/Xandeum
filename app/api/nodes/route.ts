import { NextResponse } from "next/server";
import { PrpcClient } from "xandeum-prpc";

export async function GET() {
  try {
    const client = new PrpcClient("192.190.136.36");
    const data = await client.getPods();

    return NextResponse.json(data.pods || []);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Unable to fetch Xandeum pNodes", details: err.message },
      { status: 500 }
    );
  }
}

