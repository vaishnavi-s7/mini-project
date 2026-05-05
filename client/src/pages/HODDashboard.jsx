import { UserPlus } from "lucide-react";

/**
 * HOD landing page after login.
 */
export default function HODDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <section className="mx-auto max-w-5xl">
      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              HOD Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Welcome, {user?.username || user?.name || "HOD"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Use the Add Teacher button in the navbar to create teacher
              accounts and send onboarding credentials.
            </p>
          </div>

          <div className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <UserPlus className="h-7 w-7" />
          </div>
        </div>
      </div>
    </section>
  );
}
