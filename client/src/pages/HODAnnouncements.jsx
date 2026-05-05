import HODAnnouncementPanel from "../components/hod/HODAnnouncementPanel";
import { useHodDashboardData } from "../hooks/useHodDashboardData";

export default function HODAnnouncements() {
  const { announcements, sendAnnouncement } = useHodDashboardData();

  return (
    <section className="space-y-6">
      {/* <div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-700">
          HOD Workspace
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Announcements</h1>
      </div> */}

      <HODAnnouncementPanel announcements={announcements} onSend={sendAnnouncement} />
    </section>
  );
}
