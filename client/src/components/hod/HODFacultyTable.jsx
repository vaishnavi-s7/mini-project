const statusClasses = {
  Assigned: "bg-blue-100 text-blue-700",
  "Awaiting Allocation": "bg-amber-100 text-amber-700",
};

export default function HODFacultyTable({ facultyOverview, loading }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-xl font-semibold text-slate-900">Faculty Details</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr className="text-left text-sm font-semibold text-slate-600">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Assigned Subjects</th>
              <th className="px-6 py-4">Workload</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-sm text-slate-500">
                  Loading faculty overview...
                </td>
              </tr>
            ) : facultyOverview.length > 0 ? (
              facultyOverview.map((teacher) => (
                <tr key={teacher.id} className="text-sm text-slate-700">
                  <td className="px-6 py-4 font-medium text-slate-900">{teacher.name}</td>
                  <td className="px-6 py-4">{teacher.assignedSubjects}</td>
                  <td className="px-6 py-4">{teacher.workload} lessons</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        statusClasses[teacher.status] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {teacher.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-sm text-slate-500">
                  No faculty records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
