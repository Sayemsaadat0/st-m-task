export default function Dashboard() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-white">Dashboard</h1>
        <p className="text-white/70 mt-2">Welcome to your dashboard</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-t-black/70 rounded-lg p-6 border border-white/10">
          <h3 className="text-white/70 text-sm font-medium mb-2">Total Students</h3>
          <p className="text-3xl font-bold text-white">0</p>
        </div>
        <div className="bg-t-black/70 rounded-lg p-6 border border-white/10">
          <h3 className="text-white/70 text-sm font-medium mb-2">Total Courses</h3>
          <p className="text-3xl font-bold text-white">0</p>
        </div>
        <div className="bg-t-black/70 rounded-lg p-6 border border-white/10">
          <h3 className="text-white/70 text-sm font-medium mb-2">Total Faculty</h3>
          <p className="text-3xl font-bold text-white">0</p>
        </div>
        <div className="bg-t-black/70 rounded-lg p-6 border border-white/10">
          <h3 className="text-white/70 text-sm font-medium mb-2">Active Sessions</h3>
          <p className="text-3xl font-bold text-white">0</p>
        </div>
      </div>
    </div>
  );
}
