import { Link } from "react-router-dom";
import { BellRing, ClipboardCheck, GraduationCap, Users } from "lucide-react";
import HODMetricCards from "../components/hod/HODMetricCards";
import { useHodDashboardData } from "../hooks/useHodDashboardData";

const quickLinks = [
  {
    to: "/subject-master",
    title: "Subjects",
    description: "Manage department subjects directly from the HOD workspace.",
    icon: Users,
  },
  {
    to: "/hod-pending-approvals",
    title: "Pending Approvals",
    description: "Review course and lesson items waiting for HOD approval.",
    icon: ClipboardCheck,
  },
  {
    to: "/hod-faculty-overview",
    title: "Faculty Overview",
    description: "See teachers, subjects, and lesson workload at a glance.",
    icon: Users,
  },
  {
    to: "/hod-announcements",
    title: "Announcements",
    description: "Broadcast department-wide updates from one place.",
    icon: BellRing,
  },
  {
    to: "/hod-student-details",
    title: "Student Details",
    description: "Open the student records view directly from the dashboard.",
    icon: GraduationCap,
  },
];

export default function HODDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { loading, metrics } = useHodDashboardData();

  return (
    <section className="space-y-8">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-900 px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                Overview
              </h1>
            </div>
          </div>

          <div className="mt-8">
            <HODMetricCards metrics={metrics} loading={loading} />
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {quickLinks.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="inline-flex rounded-2xl bg-blue-100 p-3 text-blue-800">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
