export default function TestImages() {
  return (
    <div className="min-h-screen bg-black p-8">
      <h1 className="text-white text-2xl mb-4">Image Test Page</h1>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-white mb-2">Logo (Xandeum.avif):</h2>
          <img 
            src="/Xandeum.avif" 
            alt="Xandeum Logo" 
            className="w-32 h-32 bg-white p-4"
            onError={(e) => {
              console.error('Xandeum.avif failed to load');
              e.currentTarget.style.border = '2px solid red';
            }}
          />
        </div>

        <div>
          <h2 className="text-white mb-2">Logo PNG Fallback:</h2>
          <img 
            src="/logo.png" 
            alt="Logo PNG" 
            className="w-32 h-32 bg-white p-4"
          />
        </div>

        <div>
          <h2 className="text-white mb-2">Background (background.jpeg):</h2>
          <div 
            className="w-full h-64 border-2 border-white"
            style={{
              backgroundImage: 'url(/background.jpeg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>

        <div>
          <h2 className="text-white mb-2">Direct Image Tag:</h2>
          <img 
            src="/background.jpeg" 
            alt="Background" 
            className="w-full h-64 object-cover"
          />
        </div>
      </div>

      <div className="mt-8">
        <a href="/" className="text-blue-400 underline">Back to Dashboard</a>
      </div>
    </div>
  );
}
