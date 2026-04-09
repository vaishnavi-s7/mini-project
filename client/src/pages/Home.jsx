import { useEffect, useMemo, useState } from "react";
import {
  BookCopy,
  BookOpen,
  Database,
  FileSpreadsheet,
  GraduationCap,
  Table2,
} from "lucide-react";
import { getSubjects } from "../services/subjectService";
import { getCourses } from "../services/courseService";
import { getLessons } from "../services/lessonService";

const masterCards = [
  {
    key: "subjects",
    title: "Subjects",
    description: "View the saved subjects.",
    icon: BookOpen,
    accent: "from-blue-500 to-cyan-500",
  },
  {
    key: "courses",
    title: "Courses",
    description: "View the saved courses.",
    icon: GraduationCap,
    accent: "from-emerald-500 to-teal-500",
  },
  {
    key: "lessons",
    title: "Lessons",
    description: "View the saved lessons.",
    icon: BookCopy,
    accent: "from-amber-500 to-orange-500",
  },
  {
    key: "all",
    title: "All Master Data",
    description: "View all registered master data.",
    icon: Database,
    accent: "from-violet-500 to-indigo-500",
  },
];

const modalTitles = {
  subjects: "Registered Subjects",
  courses: "Registered Courses",
  lessons: "Registered Lessons",
  all: "All Registered Master Data",
};

const kindStyles = {
  subject: "bg-blue-50 text-blue-700 ring-blue-100",
  course: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  lesson: "bg-amber-50 text-amber-700 ring-amber-100",
};

const kindLabels = {
  subject: "Subject",
  course: "Course",
  lesson: "Lesson",
};

const modalKeyToKind = {
  subjects: "subject",
  courses: "course",
  lessons: "lesson",
};

const resolveItemKind = (item, activeModalKey) => {
  if (item.kind) {
    return item.kind;
  }

  if (item.id?.startsWith("subject-")) return "subject";
  if (item.id?.startsWith("course-")) return "course";
  if (item.id?.startsWith("lesson-")) return "lesson";

  return modalKeyToKind[activeModalKey] || "subject";
};

export default function Home() {
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);
  const [activeModalKey, setActiveModalKey] = useState(null);
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

  const modalItems = useMemo(() => {
    if (activeModalKey === "subjects") {
      return subjects.map((subject) => ({
        id: subject._id,
        title: subject.subject_name,
        subtitle: subject.subject_code,
        description: subject.description || "No description",
        status: subject.status,
      }));
    }

    if (activeModalKey === "courses") {
      return courses.map((course) => ({
        id: course._id,
        title: course.course_name,
        subtitle: `${course.course_code} • ${course.subject?.subject_name || "No subject"}`,
        description: course.description || "No description",
        status: course.status,
      }));
    }

    if (activeModalKey === "lessons") {
      return lessons.map((lesson) => ({
        id: lesson._id,
        title: lesson.lesson_title,
        subtitle: `${lesson.lesson_code} • ${lesson.course?.course_name || "No course"}`,
        description: lesson.description || "No description",
        status: lesson.status,
      }));
    }

    if (activeModalKey === "all") {
      return [
        ...subjects.map((subject) => ({
          id: `subject-${subject._id}`,
          title: subject.subject_name,
          subtitle: `Subject • ${subject.subject_code}`,
          description: subject.description || "No description",
          status: subject.status,
        })),
        ...courses.map((course) => ({
          id: `course-${course._id}`,
          title: course.course_name,
          subtitle: `Course • ${course.course_code}`,
          description: course.description || "No description",
          status: course.status,
        })),
        ...lessons.map((lesson) => ({
          id: `lesson-${lesson._id}`,
          title: lesson.lesson_title,
          subtitle: `Lesson • ${lesson.lesson_code}`,
          description: lesson.description || "No description",
          status: lesson.status,
        })),
      ];
    }

    return [];
  }, [activeModalKey, courses, lessons, subjects]);

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
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => token && setActiveModalKey(card.key)}
                disabled={!token}
                className="rounded-3xl border border-white/10 bg-white/10 p-5 text-left backdrop-blur-sm transition hover:-translate-y-1 hover:border-white/30 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-75"
              >
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
              </button>
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

      {activeModalKey && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4"
          onClick={() => setActiveModalKey(null)}
        >
          <div
            className="w-full max-w-4xl rounded-[2rem] bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  {modalTitles[activeModalKey]}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {modalItems.length} item{modalItems.length === 1 ? "" : "s"} saved
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalKey(null)}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="mt-6 max-h-[65vh] overflow-y-auto pr-1">
              {modalItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center text-slate-500">
                  No records found.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {modalItems.map((item) => (
                    (() => {
                      const itemKind = resolveItemKind(item, activeModalKey);

                      return (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ring-1 ${kindStyles[itemKind]}`}
                              >
                                {kindLabels[itemKind]}
                              </span>
                              <h4 className="mt-2 text-base font-semibold text-slate-900">
                                {item.title}
                              </h4>
                              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400">
                                {item.subtitle}
                              </p>
                            </div>
                            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                              {item.status || "Inactive"}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {item.description}
                          </p>
                        </div>
                      );
                    })()
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
