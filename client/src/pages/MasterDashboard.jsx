import {
  AlertCircle,
  Archive,
  BookOpen,
  BookText,
  CheckCircle2,
  ChevronRight,
  Clock,
  Filter,
  GraduationCap,
  Layers,
  LayoutDashboard,
  List,
  MoreVertical,
  Search,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getCourses } from "../services/courseService";
import { getLessons } from "../services/lessonService";
import { getSubjects } from "../services/subjectService";

const statusStyles = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Inactive: "bg-slate-50 text-slate-600 border-slate-100",
  Draft: "bg-amber-50 text-amber-700 border-amber-100",
  Archived: "bg-rose-50 text-rose-700 border-rose-100",
};

const typeStyles = {
  Subject: "bg-blue-50 text-blue-600",
  Course: "bg-indigo-50 text-indigo-600",
  Lesson: "bg-emerald-50 text-emerald-600",
};

const getStatusKey = (status) => {
  if (status === "Active" || status === "Inactive" || status === "Draft" || status === "Archived") {
    return status;
  }
  return "Inactive";
};

const StatusBadge = ({ status }) => {
  const statusKey = getStatusKey(status);

  const icons = {
    Active: <CheckCircle2 className="h-3 w-3" />,
    Inactive: <Clock className="h-3 w-3" />,
    Draft: <AlertCircle className="h-3 w-3" />,
    Archived: <Archive className="h-3 w-3" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[statusKey]}`}
    >
      {icons[statusKey]}
      {statusKey}
    </span>
  );
};

const NodeCard = ({ title, code, status, isSelected, onClick, iconElement, description }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group relative w-full rounded-xl border p-4 text-left transition-all duration-200 ${
      isSelected
        ? "border-blue-500 bg-white shadow-lg shadow-blue-500/10 ring-1 ring-blue-500"
        : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <div
          className={`rounded-lg p-2 transition-colors ${
            isSelected
              ? "bg-blue-50 text-blue-600"
              : "bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500"
          }`}
        >
          {iconElement}
        </div>
        <div>
          <h3 className={`text-sm font-semibold ${isSelected ? "text-blue-900" : "text-slate-900"}`}>{title}</h3>
          <p className="mt-0.5 text-[10px] font-mono uppercase tracking-wider text-slate-400">{code}</p>
        </div>
      </div>
      <StatusBadge status={status} />
    </div>

    <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500">{description || "No description"}</p>

    {isSelected && <span className="absolute -right-2 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-blue-500" />}
  </button>
);

const normalize = (value) => String(value || "").toLowerCase();

export default function MasterDashboardContent() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [viewMode, setViewMode] = useState("hierarchy");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const [subjectRes, courseRes, lessonRes] = await Promise.all([
          getSubjects(),
          getCourses(),
          getLessons(),
        ]);

        const nextSubjects = Array.isArray(subjectRes.data?.data) ? subjectRes.data.data : [];
        const nextCourses = Array.isArray(courseRes.data?.data) ? courseRes.data.data : [];
        const nextLessons = Array.isArray(lessonRes.data?.data) ? lessonRes.data.data : [];

        setSubjects(nextSubjects);
        setCourses(nextCourses);
        setLessons(nextLessons);

        if (nextSubjects[0]?._id) {
          setSelectedSubjectId(nextSubjects[0]._id);
          const firstCourse = nextCourses.find((course) => course.subject?._id === nextSubjects[0]._id);
          setSelectedCourseId(firstCourse?._id || "");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load master dashboard data");
        setSubjects([]);
        setCourses([]);
        setLessons([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const filteredSubjects = useMemo(() => {
    const query = normalize(searchQuery.trim());
    if (!query) return subjects;

    return subjects.filter((subject) => {
      const subjectMatch =
        normalize(subject.subject_name).includes(query) ||
        normalize(subject.subject_code).includes(query) ||
        normalize(subject.description).includes(query);

      if (subjectMatch) return true;

      const subjectCourses = courses.filter((course) => course.subject?._id === subject._id);

      return subjectCourses.some((course) => {
        if (
          normalize(course.course_name).includes(query) ||
          normalize(course.course_code).includes(query) ||
          normalize(course.description).includes(query)
        ) {
          return true;
        }

        const courseLessons = lessons.filter((lesson) => lesson.course?._id === course._id);

        return courseLessons.some(
          (lesson) =>
            normalize(lesson.lesson_title).includes(query) ||
            normalize(lesson.lesson_code).includes(query) ||
            normalize(lesson.description).includes(query)
        );
      });
    });
  }, [courses, lessons, searchQuery, subjects]);

  useEffect(() => {
    if (!filteredSubjects.length) {
      setSelectedSubjectId("");
      setSelectedCourseId("");
      return;
    }

    const exists = filteredSubjects.some((item) => item._id === selectedSubjectId);
    if (!exists) {
      const nextSubject = filteredSubjects[0];
      setSelectedSubjectId(nextSubject._id);
      const nextCourse = courses.find((course) => course.subject?._id === nextSubject._id);
      setSelectedCourseId(nextCourse?._id || "");
    }
  }, [courses, filteredSubjects, selectedSubjectId]);

  const selectedSubject = useMemo(
    () => filteredSubjects.find((subject) => subject._id === selectedSubjectId) || null,
    [filteredSubjects, selectedSubjectId]
  );

  const subjectCourses = useMemo(() => {
    if (!selectedSubject) return [];

    const query = normalize(searchQuery.trim());
    const list = courses.filter((course) => course.subject?._id === selectedSubject._id);

    if (!query) return list;

    return list.filter(
      (course) =>
        normalize(course.course_name).includes(query) ||
        normalize(course.course_code).includes(query) ||
        normalize(course.description).includes(query) ||
        lessons.some(
          (lesson) =>
            lesson.course?._id === course._id &&
            (normalize(lesson.lesson_title).includes(query) ||
              normalize(lesson.lesson_code).includes(query) ||
              normalize(lesson.description).includes(query))
        )
    );
  }, [courses, lessons, searchQuery, selectedSubject]);

  useEffect(() => {
    if (!subjectCourses.length) {
      setSelectedCourseId("");
      return;
    }

    const exists = subjectCourses.some((item) => item._id === selectedCourseId);
    if (!exists) {
      setSelectedCourseId(subjectCourses[0]._id);
    }
  }, [selectedCourseId, subjectCourses]);

  const selectedCourse = useMemo(
    () => subjectCourses.find((course) => course._id === selectedCourseId) || null,
    [selectedCourseId, subjectCourses]
  );

  const courseLessons = useMemo(() => {
    if (!selectedCourse) return [];

    const query = normalize(searchQuery.trim());
    const list = lessons.filter((lesson) => lesson.course?._id === selectedCourse._id);

    if (!query) return list;

    return list.filter(
      (lesson) =>
        normalize(lesson.lesson_title).includes(query) ||
        normalize(lesson.lesson_code).includes(query) ||
        normalize(lesson.description).includes(query)
    );
  }, [lessons, searchQuery, selectedCourse]);

  const tableRows = useMemo(() => {
    const rows = [];

    filteredSubjects.forEach((subject) => {
      rows.push({
        id: `subject-${subject._id}`,
        type: "Subject",
        code: subject.subject_code || "-",
        subject: subject.subject_name || "-",
        course: "-",
        lesson: "-",
        status: subject.status || "Inactive",
        lessonId: null,
      });

      const subjectCourseRows = courses.filter((course) => course.subject?._id === subject._id);

      subjectCourseRows.forEach((course) => {
        rows.push({
          id: `course-${course._id}`,
          type: "Course",
          code: course.course_code || "-",
          subject: subject.subject_name || "-",
          course: course.course_name || "-",
          lesson: "-",
          status: course.status || "Inactive",
          lessonId: null,
        });

        lessons
          .filter((lesson) => lesson.course?._id === course._id)
          .forEach((lesson) => {
            rows.push({
              id: `lesson-${lesson._id}`,
              type: "Lesson",
              code: lesson.lesson_code || "-",
              subject: lesson.course?.subject?.subject_name || subject.subject_name || "-",
              course: course.course_name || lesson.course?.course_name || "-",
              lesson: lesson.lesson_title || "-",
              status: lesson.status || "Inactive",
              lessonId: lesson._id,
            });
          });
      });
    });

    return rows;
  }, [courses, filteredSubjects, lessons]);

  return (
    <div className="min-h-screen font-sans">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <GraduationCap className="h-6 w-6" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search everything..."
              className="w-64 rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1">
            <button
              onClick={() => setViewMode("hierarchy")}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                viewMode === "hierarchy" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Hierarchy
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                viewMode === "table" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              Master Table
            </button>
          </div>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-64px)] overflow-hidden">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center bg-slate-50">
            <p className="text-sm text-slate-500">Loading master data...</p>
          </div>
        ) : viewMode === "hierarchy" ? (
          <div className="flex flex-1 overflow-x-auto bg-slate-50/50">
            <div className="flex w-80 flex-col border-r bg-white/50 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b bg-white p-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Subjects</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                  {filteredSubjects.length}
                </span>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {filteredSubjects.map((subject) => (
                  <NodeCard
                    key={subject._id}
                    title={subject.subject_name}
                    code={subject.subject_code}
                    status={subject.status || "Inactive"}
                    isSelected={selectedSubjectId === subject._id}
                    onClick={() => {
                      setSelectedSubjectId(subject._id);
                      const firstCourse = courses.find((course) => course.subject?._id === subject._id);
                      setSelectedCourseId(firstCourse?._id || "");
                    }}
                    iconElement={<BookOpen className="h-5 w-5" />}
                    description={subject.description}
                  />
                ))}
              </div>
            </div>

            <div className="flex w-80 flex-col border-r bg-white/30 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b bg-white/80 p-4">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-600" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Courses</h2>
                </div>
                {selectedSubject && (
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
                    {subjectCourses.length}
                  </span>
                )}
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {selectedSubject ? (
                  subjectCourses.map((course) => (
                    <NodeCard
                      key={course._id}
                      title={course.course_name}
                      code={course.course_code}
                      status={course.status || "Inactive"}
                      isSelected={selectedCourseId === course._id}
                      onClick={() => setSelectedCourseId(course._id)}
                      iconElement={<Layers className="h-5 w-5" />}
                      description={course.description}
                    />
                  ))
                ) : (
                  <div className="flex h-full flex-col items-center justify-center space-y-2 py-12 text-slate-400">
                    <ChevronRight className="h-8 w-8 opacity-20" />
                    <p className="text-xs font-medium">Select a subject to view courses</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-1 flex-col bg-slate-50/30">
              <div className="flex items-center justify-between border-b bg-white/50 p-4">
                <div className="flex items-center gap-2">
                  <BookText className="h-4 w-4 text-emerald-600" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Lessons</h2>
                </div>
                {selectedCourse && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                    {courseLessons.length}
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {selectedCourse ? (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                    {courseLessons.map((lesson) => (
                      <div
                        key={lesson._id}
                        className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
                      >
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                            <BookText className="h-5 w-5" />
                          </div>
                          <StatusBadge status={lesson.status || "Inactive"} />
                        </div>

                        <h4 className="mb-1 text-slate-900 font-bold">{lesson.lesson_title}</h4>
                        <p className="mb-3 text-[10px] font-mono uppercase tracking-widest text-slate-400">{lesson.lesson_code}</p>
                        <p className="mb-4 text-xs leading-relaxed text-slate-500">{lesson.description || "No description"}</p>

                        <div className="flex items-center justify-between border-t pt-4">
                          <button
                            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700"
                            onClick={() => navigate(`/lesson-details/${lesson._id}`)}
                          >
                            View Details <ChevronRight className="h-3 w-3" />
                          </button>
                          <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center space-y-2 text-slate-400">
                    <ChevronRight className="h-8 w-8 opacity-20" />
                    <p className="text-xs font-medium">Select a course to view lessons</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto bg-slate-50 p-8">
            <div className="mx-auto max-w-7xl">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">All Master Data</h2>
                    <p className="mt-1 text-xs text-slate-500">Comprehensive view of all subjects, courses, and lessons.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100">
                      <Filter className="h-3.5 w-3.5" />
                      Filter
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="border-b px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Type</th>
                        <th className="border-b px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Code</th>
                        <th className="border-b px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Subject</th>
                        <th className="border-b px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Course</th>
                        <th className="border-b px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Lesson</th>
                        <th className="border-b px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tableRows.map((row) => (
                        <tr key={row.id} className="group transition-colors hover:bg-slate-50/50">
                          <td className="px-6 py-4">
                            <span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${typeStyles[row.type]}`}>
                              {row.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-[10px] uppercase tracking-wider text-slate-400">{row.code}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900">{row.subject}</td>
                          <td className="px-6 py-4 text-xs text-slate-500">{row.course}</td>
                          <td className="px-6 py-4 text-xs text-slate-500">{row.lesson}</td>
                          <td className="px-6 py-4">
                            <StatusBadge status={row.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            {row.lessonId ? (
                              <button
                                onClick={() => navigate(`/lesson-details/${row.lessonId}`)}
                                className="mr-2 text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700"
                              >
                                View Details
                              </button>
                            ) : null}
                            <button className="rounded-lg p-2 text-slate-400 opacity-0 transition-all hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100">
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

