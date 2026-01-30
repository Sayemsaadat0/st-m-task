export default function Courses() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-white">Courses</h1>
        <p className="text-white/70 mt-2">Manage your courses</p>
      </div>
      
      <div className="bg-t-black/70 rounded-lg p-6 border border-white/10">
        <p className="text-white/70">No courses found. Add your first course to get started.</p>
      </div>
    </div>
  );
}
