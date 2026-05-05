import HODFacultyTable from "../components/hod/HODFacultyTable";
import { useHodDashboardData } from "../hooks/useHodDashboardData";

export default function HODFacultyOverview() {
  const { facultyOverview, loading } = useHodDashboardData();

  return (
    <section className="space-y-6">
      {/* <div>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Faculty Details</h1>
      </div> */}

      <HODFacultyTable facultyOverview={facultyOverview} loading={loading} />
    </section>
  );
}
