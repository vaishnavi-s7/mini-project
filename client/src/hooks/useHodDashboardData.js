import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAllData } from "../services/dataService";
import { getSubjects } from "../services/subjectService";
import { getCourses, updateCourse } from "../services/courseService";
import { getLessons, updateLesson } from "../services/lessonService";
import { getTeachers } from "../services/teacherService";

const ANNOUNCEMENT_STORAGE_KEY = "hodAnnouncements";

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStoredAnnouncements = () => {
  try {
    const rawValue = localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
};

export function useHodDashboardData() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setAnnouncements(getStoredAnnouncements());
  }, []);

  useEffect(() => {
    const loadHodData = async () => {
      try {
        setLoading(true);

        const [studentsRes, subjectsRes, coursesRes, lessonsRes, teachersRes] =
          await Promise.all([
            getAllData(),
            getSubjects(),
            getCourses(),
            getLessons(),
            getTeachers(),
          ]);

        setStudents(Array.isArray(studentsRes.data?.data) ? studentsRes.data.data : []);
        setSubjects(Array.isArray(subjectsRes.data?.data) ? subjectsRes.data.data : []);
        setCourses(Array.isArray(coursesRes.data?.data) ? coursesRes.data.data : []);
        setLessons(Array.isArray(lessonsRes.data?.data) ? lessonsRes.data.data : []);
        setTeachers(Array.isArray(teachersRes.data?.data) ? teachersRes.data.data : []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load HOD dashboard data");
        setStudents([]);
        setSubjects([]);
        setCourses([]);
        setLessons([]);
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    };

    loadHodData();
  }, [refreshKey]);

  const teacherSubjectMap = teachers.reduce((map, teacher) => {
    const subjectKey = normalizeText(teacher?.subject);

    if (subjectKey && !map[subjectKey]) {
      map[subjectKey] = teacher;
    }

    return map;
  }, {});

  const facultyOverview = teachers.map((teacher) => {
    const matchedSubject = subjects.find((subject) => (
      normalizeText(subject?.subject_name) === normalizeText(teacher?.subject)
      || normalizeText(subject?.subject_code) === normalizeText(teacher?.subject)
    ));

    const relatedCourses = matchedSubject
      ? courses.filter((course) => course?.subject?._id === matchedSubject._id)
      : [];

    const relatedCourseIds = relatedCourses.map((course) => course._id);
    const workload = lessons.filter((lesson) => relatedCourseIds.includes(lesson?.course?._id)).length;

    return {
      id: teacher._id,
      name: teacher.username || teacher.name || teacher.email,
      assignedSubjects: teacher.subject || "Not assigned",
      workload,
      status: workload > 0 ? "Assigned" : "Awaiting Allocation",
    };
  });

  const createApprovalRecord = (item, type, subjectName) => {
    const teacher = teacherSubjectMap[normalizeText(subjectName)];

    return {
      id: `${type}-${item._id}`,
      entityId: item._id,
      type,
      itemName:
        item.subject_name
        || item.course_name
        || item.lesson_title
        || "Untitled Item",
      submittedBy: teacher?.username || teacher?.name || teacher?.email || "Not mapped",
      date: formatDate(item.updatedAt || item.createdAt),
      raw: item,
    };
  };

  const pendingApprovals = [
    ...courses
      .filter((course) => course?.status === "Inactive")
      .map((course) => createApprovalRecord(course, "course", course?.subject?.subject_name)),
    ...lessons
      .filter((lesson) => lesson?.status === "Inactive")
      .map((lesson) => createApprovalRecord(lesson, "lesson", lesson?.course?.subject?.subject_name)),
  ];

  const metrics = [
    {
      id: "faculty",
      label: "Total Faculty",
      value: String(teachers.length),
      detail: "Active teachers in the department",
      accent: "from-slate-900 to-blue-900",
    },
    {
      id: "students",
      label: "Active Students",
      value: String(students.length),
      detail: "Current enrollments across all years",
      accent: "from-blue-700 to-indigo-700",
    },
  ];

  const refreshData = () => {
    setRefreshKey((currentValue) => currentValue + 1);
  };

  const approveItem = async (approval) => {
    try {
      if (approval.type === "course") {
        await updateCourse(approval.entityId, {
          course_name: approval.raw.course_name,
          subject: approval.raw.subject?._id || approval.raw.subject,
          description: approval.raw.description || "",
          status: "Active",
        });
      }

      if (approval.type === "lesson") {
        await updateLesson(approval.entityId, {
          lesson_title: approval.raw.lesson_title,
          course: approval.raw.course?._id || approval.raw.course,
          lesson_order: approval.raw.lesson_order,
          description: approval.raw.description || "",
          question_bank: Array.isArray(approval.raw.question_bank)
            ? approval.raw.question_bank
            : [],
          status: "Active",
        });
      }

      toast.success("Approval completed successfully.");
      refreshData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve item");
    }
  };

  const requestChanges = (approval) => {
    toast.success(`Change request noted for ${approval.itemName}.`);
  };

  const sendAnnouncement = (message) => {
    const trimmedMessage = String(message || "").trim();

    if (!trimmedMessage) {
      toast.error("Enter an announcement before sending.");
      return false;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const nextAnnouncements = [
      {
        id: crypto.randomUUID(),
        message: trimmedMessage,
        author: user?.username || user?.name || "HOD",
        createdAt: new Date().toISOString(),
      },
      ...announcements,
    ];

    setAnnouncements(nextAnnouncements);
    localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(nextAnnouncements));
    toast.success("Announcement sent successfully.");
    return true;
  };

  return {
    announcements,
    approveItem,
    facultyOverview,
    loading,
    metrics,
    pendingApprovals,
    requestChanges,
    sendAnnouncement,
    teachers,
  };
}
