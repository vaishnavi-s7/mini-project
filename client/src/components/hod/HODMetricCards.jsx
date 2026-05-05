import {
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Users,
} from "lucide-react";

const metricIcons = {
  faculty: Users,
  students: GraduationCap,
  approvals: ClipboardCheck,
  completion: CheckCircle2,
};

export default function HODMetricCards({ metrics, loading }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metricIcons[metric.id];

        return (
          <article
            key={metric.id}
            className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {loading ? "..." : metric.value}
                </p>
                <p className="mt-2 text-sm text-slate-500">{metric.detail}</p>
              </div>

              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${metric.accent} text-white shadow-lg`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
