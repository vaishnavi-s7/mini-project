import { useEffect, useMemo, useState } from "react";
import {
  BookCopy,
  BookOpen,
  GraduationCap,
  Rows3,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { getSubjects } from "../services/subjectService";
import { getCourses } from "../services/courseService";
import { getLessons } from "../services/lessonService";

const VIEW_CONFIG = {
  all: {
    label: "All Data",
    type: null,
    icon: Rows3,
    iconClass: "text-cyan-100",
    cardClass: "bg-white/10",
    textClass: "text-cyan-100",
    count: (subjects, courses, lessons) =>
      subjects.length + courses.length + lessons.length,
  },
  subjects: {
    label: "Subjects",
    type: "Subject",
    icon: BookOpen,
    iconClass: "text-blue-100",
    cardClass: "bg-blue-500/20",
    textClass: "text-blue-100",
    count: (subjects) => subjects.length,
  },
  courses: {
    label: "Courses",
    type: "Course",
    icon: GraduationCap,
    iconClass: "text-emerald-100",
    cardClass: "bg-emerald-500/20",
    textClass: "text-emerald-100",
    count: (_subjects, courses) => courses.length,
  },
  lessons: {
    label: "Lessons",
    type: "Lesson",
    icon: BookCopy,
    iconClass: "text-amber-100",
    cardClass: "bg-amber-500/20",
    textClass: "text-amber-100",
    count: (_subjects, _courses, lessons) => lessons.length,
  },
};

const getValidatedView = (value) =>
  Object.prototype.hasOwnProperty.call(VIEW_CONFIG, value) ? value : "all";

export default function MasterDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [subjectSearch, setSubjectSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [lessonSearch, setLessonSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const activeView = getValidatedView(searchParams.get("view") || "all");

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);

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
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load dashboard data"
        );
        setSubjects([]);
        setCourses([]);
        setLessons([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const tableRows = useMemo(() => {
    const subjectRows = subjects.map((subject) => ({
      rowId: `subject-${subject._id}`,
      type: "Subject",
      Id: subject.subject_id || "-",
      name: subject.subject_name || "-",
      code: subject.subject_code || "-",
      subjectName: subject.subject_name || "-",
      courseName: "-",
      lessonName: "-",
      status: subject.status || "-",
      rawSubject: [
        subject.subject_id,
        subject.subject_name,
        subject.subject_code,
        subject.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
      rawCourse: "",
      rawLesson: "",
    }));

    const courseRows = courses.map((course) => ({
      rowId: `course-${course._id}`,
      type: "Course",
      Id: course.course_id || "-",
      name: course.course_name || "-",
      code: course.course_code || "-",
      subjectName: course.subject?.subject_name || "-",
      courseName: course.course_name || "-",
      lessonName: "-",
      status: course.status || "-",
      rawSubject: [
        course.subject?.subject_name,
        course.subject?.subject_code,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
      rawCourse: [
        course.course_id,
        course.course_name,
        course.course_code,
        course.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
      rawLesson: "",
    }));

    const lessonRows = lessons.map((lesson, index) => ({
      rowId: `lesson-${lesson._id || index}`,
      type: "Lesson",
      Id: lesson.lesson_id || "-",
      name: lesson.lesson_title || "-",
      code: lesson.lesson_code || "-",
      subjectName: lesson.course?.subject?.subject_name || "-",
      courseName: lesson.course?.course_name || "-",
      lessonName: lesson.lesson_title || "-",
      status: lesson.status || "-",
      rawSubject: [lesson.course?.subject?.subject_name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
      rawCourse: [lesson.course?.course_name, lesson.course?.course_code]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
      rawLesson: [
        lesson.lesson_id,
        lesson.lesson_title,
        lesson.lesson_code,
        lesson.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    }));

    return [...subjectRows, ...courseRows, ...lessonRows];
  }, [courses, lessons, subjects]);

  const filteredRows = useMemo(() => {
    const normalizedSubjectSearch = subjectSearch.trim().toLowerCase();
    const normalizedCourseSearch = courseSearch.trim().toLowerCase();
    const normalizedLessonSearch = lessonSearch.trim().toLowerCase();
    const selectedType = VIEW_CONFIG[activeView].type;

    return tableRows.filter((row) => {
      const matchesView = selectedType ? row.type === selectedType : true;
      const matchesSubject = normalizedSubjectSearch
        ? row.rawSubject.includes(normalizedSubjectSearch)
        : true;
      const matchesCourse = normalizedCourseSearch
        ? row.rawCourse.includes(normalizedCourseSearch)
        : true;
      const matchesLesson = normalizedLessonSearch
        ? row.rawLesson.includes(normalizedLessonSearch)
        : true;

      return matchesView && matchesSubject && matchesCourse && matchesLesson;
    });
  }, [activeView, courseSearch, lessonSearch, subjectSearch, tableRows]);

  const activeSubjects = useMemo(
    () => subjects.filter((subject) => subject.status === "Active").length,
    [subjects]
  );

  const activeCourses = useMemo(
    () => courses.filter((course) => course.status === "Active").length,
    [courses]
  );

  const activeLessons = useMemo(
    () => lessons.filter((lesson) => lesson.status === "Active").length,
    [lessons]
  );

  const selectedViewMeta = VIEW_CONFIG[activeView];

  const handleCardSelect = (viewKey) => {
    if (VIEW_CONFIG[viewKey].disabled) {
      return;
    }

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("view", viewKey);
      return next;
    });
  };

  return (
    <div className="space-y-8">

      <section className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Search</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Search subjects
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-300 px-4 py-3">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                value={subjectSearch}
                onChange={(e) => setSubjectSearch(e.target.value)}
                placeholder="Subject name, code, or id"
                className="w-full outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Search courses
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-300 px-4 py-3">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                placeholder="Course name, code, or id"
                className="w-full outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Search lessons
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-300 px-4 py-3">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                value={lessonSearch}
                onChange={(e) => setLessonSearch(e.target.value)}
                placeholder="Lesson name, code, or id"
                className="w-full outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {selectedViewMeta.label} Table
            </h2>
          </div>
        </div>

        {isLoading ? (
          <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-slate-500">
            Loading dashboard data...
          </p>
        ) : filteredRows.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-slate-500">
            No data matches the current selection
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full overflow-hidden rounded-2xl border border-slate-200">
              <thead className="bg-slate-100 text-left text-sm text-slate-700">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Lesson</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-700">
                {filteredRows.map((row) => (
                  <tr key={row.rowId} className="border-t border-slate-200">
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          row.type === "Subject"
                            ? "bg-blue-100 text-blue-700"
                            : row.type === "Course"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {row.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {row.Id}
                    </td>
                    <td className="px-4 py-3">
                      <span className="block max-w-[180px] truncate" title={row.name}>
                        {row.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block max-w-[120px] truncate" title={row.code}>
                        {row.code}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="block max-w-[180px] truncate"
                        title={row.subjectName}
                      >
                        {row.subjectName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="block max-w-[180px] truncate"
                        title={row.courseName}
                      >
                        {row.courseName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="block max-w-[180px] truncate"
                        title={row.lessonName}
                      >
                        {row.lessonName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          row.status === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
