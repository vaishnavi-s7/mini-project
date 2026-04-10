import {
  AlertCircle,
  Archive,
  BookOpen,
  BookText,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  ExternalLink,
  Layers,
  LayoutDashboard,
  List,
  Search,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { getCourses } from "../services/courseService";
import { getLessons } from "../services/lessonService";
import { getSubjects } from "../services/subjectService";
 
const statusStyles = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Inactive: "bg-slate-50 text-slate-600 border-slate-100",
  Draft: "bg-amber-50 text-amber-700 border-amber-100",
  Archived: "bg-rose-50 text-rose-700 border-rose-100",
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
const TABLE_LESSON_ROW_HEIGHT = 44;
const HIERARCHY_VIEW_HEIGHT = "calc(100vh - 140px)";
const HIERARCHY_LIST_MAX_HEIGHT = "28rem";
 
export default function MasterDashboardContent() {
  const navigate = useNavigate();
  const location = useLocation();
 
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
 
  const [viewMode, setViewMode] = useState("hierarchy");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [expandedCourseIds, setExpandedCourseIds] = useState({});
 
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
        const restoreDashboard = location.state?.restoreDashboard;
 
        if (restoreDashboard) {
          setViewMode(restoreDashboard.viewMode || "hierarchy");
          setSearchQuery(restoreDashboard.searchQuery || "");
          setSelectedSubjectId(restoreDashboard.selectedSubjectId || "");
          setSelectedCourseId(restoreDashboard.selectedCourseId || "");
          setExpandedCourseIds(restoreDashboard.expandedCourseIds || {});
        } else if (nextSubjects[0]?._id) {
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
  }, [location.state]);
 
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
 
  const groupedTableRows = useMemo(() => {
    const query = normalize(searchQuery.trim());
 
    return filteredSubjects.map((subject) => {
      const subjectCourses = courses.filter((course) => course.subject?._id === subject._id);
      const subjectMatches =
        !query ||
        normalize(subject.subject_name).includes(query) ||
        normalize(subject.subject_code).includes(query) ||
        normalize(subject.description).includes(query);
 
      const groupedCourses = subjectCourses
        .map((course) => {
          const courseLessons = lessons.filter((lesson) => lesson.course?._id === course._id);
          const courseMatches =
            !query ||
            normalize(course.course_name).includes(query) ||
            normalize(course.course_code).includes(query) ||
            normalize(course.description).includes(query);
 
          const visibleLessons = !query
            ? courseLessons
            : courseLessons.filter(
                (lesson) =>
                  courseMatches ||
                  subjectMatches ||
                  normalize(lesson.lesson_title).includes(query) ||
                  normalize(lesson.lesson_code).includes(query) ||
                  normalize(lesson.description).includes(query)
              );
 
          if (!query || subjectMatches || courseMatches || visibleLessons.length > 0) {
            return {
              ...course,
              lessons: visibleLessons,
            };
          }
 
          return null;
        })
        .filter(Boolean);
 
      return {
        ...subject,
        courses: groupedCourses,
      };
    });
  }, [courses, filteredSubjects, lessons, searchQuery]);
 
  const toggleCourseExpansion = (courseId) => {
    setExpandedCourseIds((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };
 
  const getVisibleLessons = (course) => {
    if (!course.lessons?.length) {
      return [];
    }
 
    return expandedCourseIds[course._id] ? course.lessons : course.lessons.slice(0, 1);
  };
 
  const getCourseBlockHeight = (course) => {
    const visibleLessonCount = Math.max(getVisibleLessons(course).length, 1);
    return visibleLessonCount * TABLE_LESSON_ROW_HEIGHT;
  };
 
  const openLessonDetails = (lessonId) => {
    navigate(`/lesson-details/${lessonId}`, {
      state: {
        from: {
          pathname: location.pathname,
          search: location.search,
        },
        dashboardState: {
          viewMode,
          searchQuery,
          selectedSubjectId,
          selectedCourseId,
          expandedCourseIds,
        },
      },
    });
  };
 
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <main className="flex min-h-screen flex-col px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search everything..."
              className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className="flex shrink-0 items-center gap-4">
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
        </div>
 
        <div className="flex min-h-[calc(100vh-140px)] overflow-hidden">
          {isLoading ? (
          <div className="flex flex-1 items-center justify-center bg-slate-50">
            <p className="text-sm text-slate-500">Loading master data...</p>
          </div>
        ) : viewMode === "hierarchy" ? (
          <div className="flex flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-white/50 shadow-xl shadow-slate-200/50 backdrop-blur-sm">
            <div
              className="flex w-80 flex-col border-r border-slate-200 bg-white/50 backdrop-blur-sm"
              style={{ height: HIERARCHY_VIEW_HEIGHT }}
            >
              <div className="flex items-center justify-between border-b bg-white p-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Subjects</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                  {filteredSubjects.length}
                </span>
              </div>
              <div
                className="flex-1 space-y-3 overflow-y-auto p-4"
                style={{ maxHeight: HIERARCHY_LIST_MAX_HEIGHT }}
              >
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
 
            <div
              className="flex w-80 flex-col border-r border-slate-200 bg-white/30 backdrop-blur-sm"
              style={{ height: HIERARCHY_VIEW_HEIGHT }}
            >
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
              <div
                className="flex-1 space-y-3 overflow-y-auto p-4"
                style={{ maxHeight: HIERARCHY_LIST_MAX_HEIGHT }}
              >
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
 
            <div
              className="flex flex-1 flex-col bg-slate-50/30"
              style={{ height: HIERARCHY_VIEW_HEIGHT }}
            >
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
 
              <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: HIERARCHY_VIEW_HEIGHT }}>
                {selectedCourse ? (
                  <div className="grid grid-cols-1 gap-4 auto-rows-fr">
                    {courseLessons.map((lesson) => (
                      <div
                        key={lesson._id}
                        className="flex h-full min-h-[110px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h4
                            className="min-w-0 flex-1 whitespace-normal break-words text-sm font-bold leading-snug text-slate-900"
                            title={lesson.lesson_title}
                          >
                            {lesson.lesson_title}
                          </h4>
                          <StatusBadge status={lesson.status || "Inactive"} />
                        </div>

                        <div className="pt-3">
                          <button
                            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700"
                            onClick={() => openLessonDetails(lesson._id)}
                          >
                            View Details <ChevronRight className="h-3 w-3" />
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
          <div className="flex flex-1 overflow-hidden bg-slate-50/50">
            <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/50 shadow-xl shadow-slate-200/50 backdrop-blur-sm">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/90 p-4">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">All Master Data</h2>
                  </div>
              </div>
 
              <div className="flex-1 overflow-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="border-b px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Code</th>
                        <th className="border-b px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Subject</th>
                        <th className="border-b px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Course</th>
                        <th className="border-b px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Lesson</th>
                        <th className="border-b px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                        <th className="border-b px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">View Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {groupedTableRows.map((subject) => (
                        <tr key={subject._id} className="transition-colors hover:bg-slate-50/50">
                          <td className="px-6 py-6 align-top font-mono text-[10px] uppercase tracking-wider text-slate-400">
                            {subject.subject_code || "-"}
                          </td>
                          <td className="px-6 py-6 align-top text-sm font-semibold text-slate-900">
                            {subject.subject_name || "-"}
                          </td>
                          <td className="px-6 py-6 align-top">
                            {subject.courses.length > 0 ? (
                              <div className="space-y-4">
                                {subject.courses.map((course) => (
                                  <div
                                    key={course._id}
                                    className="flex items-start text-sm text-slate-700"
                                    style={{ minHeight: `${getCourseBlockHeight(course)}px` }}
                                  >
                                    {course.course_name || "-"}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-6 align-top">
                            {subject.courses.length > 0 ? (
                              <div className="space-y-4">
                                {subject.courses.map((course) => (
                                  <div
                                    key={course._id}
                                    className="flex flex-col justify-start"
                                    style={{ minHeight: `${getCourseBlockHeight(course)}px` }}
                                  >
                                    {course.lessons.length > 0 ? (
                                      <>
                                        {getVisibleLessons(course).map((lesson) => (
                                          <div
                                            key={lesson._id}
                                            className="flex min-h-[44px] items-start text-xs text-slate-500"
                                          >
                                            <div className="flex items-center gap-1">
                                              <p className="font-medium text-slate-700">{lesson.lesson_title || "-"}</p>
                                              {course.lessons.length > 1 && lesson._id === getVisibleLessons(course)[0]?._id ? (
                                                <button
                                                  type="button"
                                                  onClick={() => toggleCourseExpansion(course._id)}
                                                  className="inline-flex h-5 w-5 items-center justify-center rounded-md text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
                                                  title={expandedCourseIds[course._id] ? "Collapse lessons" : "Expand lessons"}
                                                  aria-label={expandedCourseIds[course._id] ? "Collapse lessons" : "Expand lessons"}
                                                >
                                                  <ChevronDown
                                                    className={`h-3.5 w-3.5 transition-transform ${
                                                      expandedCourseIds[course._id] ? "rotate-180" : ""
                                                    }`}
                                                  />
                                                </button>
                                              ) : null}
                                            </div>
                                          </div>
                                        ))}
                                      </>
                                    ) : (
                                      <div className="flex min-h-[44px] items-start">
                                        <span className="text-xs text-slate-400">-</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-6 align-top">
                            <StatusBadge status={subject.status || "Inactive"} />
                          </td>
                          <td className="px-6 py-6 align-top">
                            {subject.courses.length > 0 ? (
                              <div className="space-y-4">
                                {subject.courses.map((course) => (
                                  <div
                                    key={course._id}
                                    className="flex flex-col justify-start"
                                    style={{ minHeight: `${getCourseBlockHeight(course)}px` }}
                                  >
                                    {course.lessons.length > 0 ? (
                                      getVisibleLessons(course).map((lesson) => (
                                        <button
                                          key={lesson._id}
                                          type="button"
                                          onClick={() => openLessonDetails(lesson._id)}
                                          className="flex h-6 w-6 items-center justify-center rounded-full border border-transparent text-slate-500 transition hover:bg-blue-50/60 hover:text-blue-600"
                                          title={`Open ${lesson.lesson_title}`}
                                          aria-label={`Open ${lesson.lesson_title}`}
                                        >
                                          <ExternalLink className="h-3.5 w-3.5" />
                                        </button>
                                      ))
                                    ) : (
                                      <div className="flex min-h-[44px] items-start">
                                        <span className="text-xs text-slate-400">-</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
