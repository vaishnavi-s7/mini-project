import HODApprovalTable from "../components/hod/HODApprovalTable";
import { useHodDashboardData } from "../hooks/useHodDashboardData";

export default function HODPendingApprovals() {
  const { approveItem, loading, pendingApprovals, requestChanges } = useHodDashboardData();

  return (
    <section className="space-y-6">
      {/* <div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-700">
          HOD Workspace
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Pending Approvals</h1>
      </div> */}

      <HODApprovalTable
        approvals={pendingApprovals}
        loading={loading}
        onApprove={approveItem}
        onRequestChanges={requestChanges}
      />
    </section>
  );
}
