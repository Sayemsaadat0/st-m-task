export default function Students() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-white">Students</h1>
        <p className="text-white/70 mt-2">Manage your students</p>
      </div>
      
      <div className="bg-t-black/70 rounded-lg p-6 border border-white/10">
        <p className="text-white/70">No students found. Add your first student to get started.</p>
      </div>
    </div>
  );
}
