import { useState } from "react";
import { BellRing, Send } from "lucide-react";

const formatAnnouncementDate = (value) =>
  new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function HODAnnouncementPanel({ announcements, onSend }) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const wasSent = onSend(message);

    if (wasSent) {
      setMessage("");
    }
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_1.15fr]">
      <aside className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-800">
          <BellRing className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-slate-900">Announcement Broadcast</h2>
       

        <div className="mt-6 space-y-4">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={8}
            placeholder="Type your announcement here..."
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />

          <button
            type="button"
            onClick={handleSend}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            <Send className="h-4 w-4" />
            Send Announcement
          </button>
        </div>
      </aside>

      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-semibold text-slate-900">Recent Announcements</h2>
          <p className="text-sm text-slate-500">
            The latest department messages are listed here for quick review.
          </p>
        </div>

        <div className="space-y-4 p-6">
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <article
                key={announcement.id}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-slate-900">{announcement.author}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    {formatAnnouncementDate(announcement.createdAt)}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{announcement.message}</p>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 px-6 py-12 text-center text-sm text-slate-500">
              No announcements have been sent yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
