export default function HODApprovalTable({
  approvals,
  loading,
  onApprove,
  onRequestChanges,
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-xl font-semibold text-slate-900">Pending Approvals</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr className="text-left text-sm font-semibold text-slate-600">
              <th className="px-6 py-4">Item Name</th>
              <th className="px-6 py-4">Submitted By</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-sm text-slate-500">
                  Loading approvals...
                </td>
              </tr>
            ) : approvals.length > 0 ? (
              approvals.map((approval) => (
                <tr key={approval.id} className="text-sm text-slate-700">
                  <td className="px-6 py-4 font-medium text-slate-900">{approval.itemName}</td>
                  <td className="px-6 py-4">{approval.submittedBy}</td>
                  <td className="px-6 py-4">{approval.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onApprove(approval)}
                        className="rounded-full bg-blue-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-800"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => onRequestChanges(approval)}
                        className="rounded-full border border-blue-200 px-4 py-2 text-xs font-semibold text-blue-900 transition hover:bg-blue-50"
                      >
                        Request Changes
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-sm text-slate-500">
                  No pending approvals right now.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
