import Link from "next/link";

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b-2 border-white bg-black">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Xandeum pNode Dashboard</h1>
              <p className="text-xs text-gray-400">Live pNode analytics via pRPC</p>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/about" className="text-sm font-bold text-white">
                About
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white text-black border-2 border-black rounded-xl p-8">
          <h2 className="text-3xl font-black mb-6">About This Project</h2>

          <div className="space-y-6">
            <section>
              <h3 className="text-xl font-bold mb-3">What are Xandeum pNodes?</h3>
              <p className="text-sm leading-relaxed font-medium">
                Xandeum pNodes are participant nodes in the Xandeum network. They form the backbone
                of the decentralized infrastructure, enabling distributed storage and computation
                across the network.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold mb-3">About This Dashboard</h3>
              <p className="text-sm leading-relaxed font-medium mb-3">
                This analytics platform provides real-time monitoring of Xandeum pNodes on the DevNet.
                It fetches live data directly from the Xandeum network using the official pRPC client.
              </p>
              <ul className="list-disc list-inside text-sm space-y-2 font-medium text-gray-700">
                <li>Real-time node status monitoring</li>
                <li>Network-wide statistics and metrics</li>
                <li>Software version tracking</li>
                <li>Node activity timestamps</li>
                <li>Search and filter capabilities</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold mb-3">Technical Details</h3>
              <div className="bg-black text-white border-2 border-black rounded-lg p-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-400 text-xs font-bold mb-1">Data Source</div>
                    <div className="font-mono font-bold">Xandeum DevNet</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs font-bold mb-1">Update Frequency</div>
                    <div className="font-bold">Every 30 seconds</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs font-bold mb-1">Client</div>
                    <div className="font-mono font-bold">xandeum-prpc</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs font-bold mb-1">Framework</div>
                    <div className="font-bold">Next.js 16</div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold mb-3">Node Status Indicators</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="font-bold">Online - Last seen within 60 seconds</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="font-bold">Stale - Last seen 1-5 minutes ago</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="font-bold">Offline - Last seen over 5 minutes ago</span>
                </div>
              </div>
            </section>

            <section className="pt-4 border-t-2 border-gray-200">
              <p className="text-xs font-bold text-gray-600">
                Built for the Xandeum hackathon. This dashboard provides transparency and insights
                into the Xandeum pNode network.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
