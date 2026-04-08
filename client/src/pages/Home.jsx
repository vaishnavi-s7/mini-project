import { useEffect, useMemo, useState } from "react";
import {
  BookCopy,
  BookOpen,
  Database,
  FileSpreadsheet,
  GraduationCap,
  Table2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getSubjects } from "../services/subjectService";
import { getCourses } from "../services/courseService";
import { getLessons } from "../services/lessonService";

const masterCards = [
  {
    key: "subjects",
    title: "Subjects",
    description: "Open the saved subject master table.",
    icon: BookOpen,
    accent: "from-blue-500 to-cyan-500",
    href: "/master-dashboard?view=subjects",
  },
  {
    key: "courses",
    title: "Courses",
    description: "Open the saved course master table.",
    icon: GraduationCap,
    accent: "from-emerald-500 to-teal-500",
    href: "/master-dashboard?view=courses",
  },
  {
    key: "lessons",
    title: "Lessons",
    description: "Open the saved lesson master table.",
    icon: BookCopy,
    accent: "from-amber-500 to-orange-500",
    href: "/master-dashboard?view=lessons",
  },
  {
    key: "all",
    title: "All Master Data",
    description: "See all connected master rows together.",
    icon: Database,
    accent: "from-violet-500 to-indigo-500",
    href: "/master-dashboard?view=all",
  },
];

export default function Home() {
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadMasterCounts = async () => {
      if (!token) {
        setSubjects([]);
        setCourses([]);
        setLessons([]);
        return;
      }

      try {
        setIsLoadingCounts(true);
        const [subjectRes, courseRes, lessonRes] = await Promise.all([
          getSubjects(),
          getCourses(),
          getLessons(),
        ]);

        setSubjects(
          Array.isArray(subjectRes.data?.data) ? subjectRes.data.data : []
        );
        setCourses(Array.isArray(courseRes.data?.data) ? courseRes.data.data : []);
        setLessons(Array.isArray(lessonRes.data?.data) ? lessonRes.data.data : []);
      } catch {
        setSubjects([]);
        setCourses([]);
        setLessons([]);
      } finally {
        setIsLoadingCounts(false);
      }
    };

    loadMasterCounts();
  }, [token]);

  const counts = useMemo(
    () => ({
      subjects: subjects.length,
      courses: courses.length,
      lessons: lessons.length,
      all: subjects.length + courses.length + lessons.length,
    }),
    [courses.length, lessons.length, subjects.length]
  );

  return (
    <div className="mx-auto max-w-6xl px-6">
      <div className="mb-14 text-center">

        {/* <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/upload-csv"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white shadow transition hover:bg-blue-700"
          >
            Upload CSV
          </Link>

          <Link
            to="/view-data"
            className="rounded-lg bg-gray-200 px-6 py-3 transition hover:bg-gray-300"
          >
            View Records
          </Link>
        </div> */}
      </div>

      <section className="mb-12 rounded-[2rem] bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Overview</h2>
          </div>
          {!token && (
            <p className="text-sm text-blue-100">
              Login to load live subject and course counts.
            </p>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {masterCards.map((card) => {
            const Icon = card.icon;
            const content = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-white/80">{card.title}</p>
                    <p className="mt-2 text-3xl font-semibold">
                      {isLoadingCounts && token ? "..." : counts[card.key]}
                    </p>
                  </div>
                  <div
                    className={`rounded-2xl bg-gradient-to-br ${card.accent} p-3 shadow-lg`}
                  >
                    <Icon size={20} />
                  </div>
                </div>
                <p className="mt-4 text-sm text-white/75">{card.description}</p>
              </>
            );

            if (!token || card.disabled) {
              return (
                <div
                  key={card.key}
                  className={`rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm ${
                    card.disabled ? "opacity-75" : ""
                  }`}
                >
                  {content}
                </div>
              );
            }

            return (
              <Link
                key={card.key}
                to={card.href}
                className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm transition hover:-translate-y-1 hover:border-white/30 hover:bg-white/15"
              >
                {content}
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-lg transition hover:scale-105">
          <div className="mb-4 inline-flex rounded-2xl bg-blue-100 p-3 text-blue-700">
            <FileSpreadsheet size={22} />
          </div>
          <h3 className="mb-2 text-xl font-semibold">Upload CSV Files</h3>

          <p className="text-gray-600">
            Upload student CSV files directly into the system using a simple
            drag and drop interface.
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-lg transition hover:scale-105">
          <div className="mb-4 inline-flex rounded-2xl bg-amber-100 p-3 text-amber-700">
            <Table2 size={22} />
          </div>
          <h3 className="mb-2 text-xl font-semibold">Preview & Validate</h3>

          <p className="text-gray-600">
            Preview CSV data before uploading. Only rows containing valid
            fields like name, email, grade and section are stored.
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-lg transition hover:scale-105">
          <div className="mb-4 inline-flex rounded-2xl bg-emerald-100 p-3 text-emerald-700">
            <Database size={22} />
          </div>
          <h3 className="mb-2 text-xl font-semibold">Manage Student Data</h3>

          <p className="text-gray-600">
            View all uploaded records in a structured table and manage your
            dataset easily.
          </p>
        </div>
      </div>

    </div>
  );
}
