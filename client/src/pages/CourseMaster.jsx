import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import {
  createCourse,
  getCourses,
  updateCourse,
} from "../services/courseService";
import { getSubjects } from "../services/subjectService";
import { getLocalSubjectIcon } from "../utils/subjectIcons";
 
const initialForm = {
  course_name: "",
  course_code: "",
  subject: "",
  description: "",
};
 
const initialEditForm = {
  id: "",
  course_name: "",
  subject: "",
  description: "",
  status: "Active",
};
 
const PAGE_SIZE = 5;
const API_ORIGIN = "http://localhost:5000";
 
const getSubjectIconUrl = (iconPath) =>
  iconPath
    ? iconPath.startsWith("http") || iconPath.startsWith("blob:")
      ? iconPath
      : `${API_ORIGIN}${iconPath}`
    : "";
 
function SubjectOptionRow({ subject }) {
  const iconUrl = getLocalSubjectIcon(subject) || getSubjectIconUrl(subject?.icon_path);
 
  return (
    <div className="flex items-center gap-3">
      {iconUrl ? (
        <img
          src={iconUrl}
          alt={subject.subject_name || "Subject icon"}
          className="h-8 w-8 rounded-lg border border-slate-200 object-cover"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-500">
          {subject.subject_name?.charAt(0)?.toUpperCase() || "?"}
        </div>
      )}
      <span>
        {subject.subject_name} ({subject.subject_code})
      </span>
    </div>
  );
}
 
export default function CourseMaster() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [subjectSearchTerm, setSubjectSearchTerm] = useState("");
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubjectsLoading, setIsSubjectsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [editErrors, setEditErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editDropdownOpen, setEditDropdownOpen] = useState(false);
  const [editSubjectSearchTerm, setEditSubjectSearchTerm] = useState("");
 
  const loadSubjects = async () => {
    try {
      setIsSubjectsLoading(true);
      const res = await getSubjects();
      setSubjects(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load subjects");
      setSubjects([]);
    } finally {
      setIsSubjectsLoading(false);
    }
  };
 
  const loadCourses = async () => {
    try {
      setIsLoading(true);
      const res = await getCourses();
      setCourses(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load courses");
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };
 
  useEffect(() => {
    loadSubjects();
    loadCourses();
  }, []);
 
  const activeSubjects = useMemo(
    () => subjects.filter((subject) => subject.status === "Active"),
    [subjects]
  );
 
  const editableSubjects = useMemo(() => {
    const currentSubject = subjects.find(
      (subject) => subject._id === editForm.subject
    );
 
    if (!currentSubject || currentSubject.status === "Active") {
      return activeSubjects;
    }
 
    return [currentSubject, ...activeSubjects];
  }, [activeSubjects, editForm.subject, subjects]);
 
  const validateForm = () => {
    const nextErrors = {};
 
    if (!form.course_name.trim()) {
      nextErrors.course_name = "Course name is required";
    }
 
    if (!form.course_code.trim()) {
      nextErrors.course_code = "Course code is required";
    }
 
    if (!form.subject) {
      nextErrors.subject = "Subject is required";
    }
 
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };
 
  const handleChange = (e) => {
    const { name, value } = e.target;
 
    setForm((prev) => ({
      ...prev,
      [name]: name === "course_code" ? value.toUpperCase() : value,
    }));
 
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };
 
  const handleSubjectSearchChange = (e) => {
    setSubjectSearchTerm(e.target.value);
  };
 
  const handleSubjectSelectChange = (e) => {
    const { value } = e.target;
 
    setForm((prev) => ({
      ...prev,
      subject: value,
    }));
 
    setErrors((prev) => ({
      ...prev,
      subject: "",
    }));
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
 
    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }
 
    try {
      setIsSaving(true);
      const payload = {
        ...form,
        course_name: form.course_name.trim(),
        course_code: form.course_code.trim().toUpperCase(),
        description: form.description.trim(),
        status: "Active",
      };
 
      const res = await createCourse(payload);
      const savedCourse = res.data?.data;
 
      if (savedCourse) {
        setCourses((prev) => [...prev, savedCourse]);
        setCurrentPage(Math.ceil((courses.length + 1) / PAGE_SIZE));
      } else {
        await loadCourses();
      }
 
      setForm(initialForm);
      setSubjectSearchTerm("");
      setDropdownOpen(false);
      setErrors({});
      toast.success(res.data?.message || "Course created successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save course");
    } finally {
      setIsSaving(false);
    }
  };
 
  const filteredCourses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
 
    return courses.filter((course) => {
      const matchesSubject = selectedSubject
        ? course.subject?._id === selectedSubject
        : true;
 
      const matchesSearch = normalizedSearch
        ? [
            course.course_id,
            course.course_name,
            course.course_code,
            course.description,
            course.subject?.subject_name,
            course.subject?.subject_code,
          ]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(normalizedSearch))
        : true;
 
      return matchesSubject && matchesSearch;
    });
  }, [courses, searchTerm, selectedSubject]);
 
  const subjectSuggestions = useMemo(() => {
    const normalizedSearch = subjectSearchTerm.trim().toLowerCase();
 
    if (!normalizedSearch) {
      return activeSubjects.slice(0, 8);
    }
 
    return activeSubjects
      .filter(
        (subject) =>
          subject.subject_name.toLowerCase().startsWith(normalizedSearch) ||
          subject.subject_code.toLowerCase().startsWith(normalizedSearch)
      )
      .slice(0, 8);
  }, [activeSubjects, subjectSearchTerm]);
 
  const editSubjectSuggestions = useMemo(() => {
    const normalizedSearch = editSubjectSearchTerm.trim().toLowerCase();
 
    if (!normalizedSearch) {
      return editableSubjects.slice(0, 8);
    }
 
    return editableSubjects
      .filter(
        (subject) =>
          subject.subject_name.toLowerCase().startsWith(normalizedSearch) ||
          subject.subject_code.toLowerCase().startsWith(normalizedSearch)
      )
      .slice(0, 8);
  }, [editSubjectSearchTerm, editableSubjects]);
 
  const activeCount = useMemo(
    () => filteredCourses.filter((course) => course.status === "Active").length,
    [filteredCourses]
  );
 
  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));
 
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredCourses.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredCourses]);
 
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSubject]);
 
  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);
 
  const openEditModal = (course) => {
    setEditForm({
      id: course._id,
      course_name: course.course_name,
      subject: course.subject?._id || "",
      description: course.description,
      status: course.status,
    });
    setEditSubjectSearchTerm("");
    setEditDropdownOpen(false);
    setEditErrors({});
    setIsEditOpen(true);
  };
 
  const closeEditModal = () => {
    setIsEditOpen(false);
    setEditForm(initialEditForm);
    setEditSubjectSearchTerm("");
    setEditDropdownOpen(false);
    setEditErrors({});
  };
 
  const handleEditChange = (e) => {
    const { name, value } = e.target;
 
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
 
    setEditErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };
 
  const validateEditForm = () => {
    const nextErrors = {};
 
    if (!editForm.course_name.trim()) {
      nextErrors.course_name = "Course name is required";
    }
 
    if (!editForm.subject) {
      nextErrors.subject = "Subject is required";
    }
 
    if (!["Active", "Inactive"].includes(editForm.status)) {
      nextErrors.status = "Valid status is required";
    }
 
    setEditErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };
 
  const handleEditSubmit = async (e) => {
    e.preventDefault();
 
    if (!validateEditForm()) {
      toast.error("Please complete all required edit fields");
      return;
    }
 
    try {
      setIsUpdating(true);
      const payload = {
        course_name: editForm.course_name.trim(),
        subject: editForm.subject,
        description: editForm.description.trim(),
        status: editForm.status,
      };
 
      const res = await updateCourse(editForm.id, payload);
      const updatedCourse = res.data?.data;
 
      setCourses((prev) =>
        prev.map((item) => (item._id === editForm.id ? updatedCourse : item))
      );
 
      toast.success(res.data?.message || "Course updated successfully");
      closeEditModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update course");
    } finally {
      setIsUpdating(false);
    }
  };
 
  return (
    <div className="space-y-8">
      {/* <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 p-8 text-white shadow-xl">
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Course Master</h1>
 
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-blue-100">Visible courses</p>
            <p className="mt-2 text-2xl font-semibold">
              {filteredCourses.length}
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-blue-100">Active courses</p>
            <p className="mt-2 text-2xl font-semibold">{activeCount}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-blue-100">Connected subjects</p>
            <p className="mt-2 text-2xl font-semibold">
              {activeSubjects.length}
            </p>
          </div>
        </div>
      </section> */}
 
      <section className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">New Course</h2>
          </div>
 
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Subject <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div
                  className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-300 px-4 py-3"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                >
                  <div
                    className={form.subject ? "text-slate-900" : "text-slate-400"}
                  >
                    {form.subject ? (
                      <SubjectOptionRow
                        subject={subjects.find((s) => s._id === form.subject) || {}}
                      />
                    ) : (
                      "Select subject"
                    )}
                  </div>
                  <span>▾</span>
                </div>
 
                {dropdownOpen && (
                  <div className="absolute z-50 mt-2 w-full rounded-xl border bg-white shadow-lg">
                    <input
                      type="text"
                      value={subjectSearchTerm}
                      onChange={handleSubjectSearchChange}
                      placeholder="Search subject..."
                      className="w-full border-b px-4 py-2 outline-none"
                    />
 
                    <div className="max-h-60 overflow-y-auto">
                      {subjectSuggestions.length === 0 ? (
                        <p className="p-3 text-sm text-slate-400">
                          No subjects found
                        </p>
                      ) : (
                        subjectSuggestions.map((subject) => (
                          <div
                            key={subject._id}
                            onClick={() => {
                              handleSubjectSelectChange({
                                target: { value: subject._id },
                              });
                              setDropdownOpen(false);
                            }}
                            className="cursor-pointer px-4 py-2 text-sm hover:bg-blue-50"
                          >
                            <SubjectOptionRow subject={subject} />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              {errors.subject && (
                <p className="mt-2 text-sm text-red-600">{errors.subject}</p>
              )}
            </div>
 
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Course Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="course_name"
                value={form.course_name}
                onChange={handleChange}
                placeholder="Enter course name"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              />
              {errors.course_name && (
                <p className="mt-2 text-sm text-red-600">{errors.course_name}</p>
              )}
            </div>
 
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Course Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="course_code"
                value={form.course_code}
                onChange={handleChange}
                placeholder="Example: ALG101"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 uppercase outline-none transition focus:border-blue-500"
              />
              {errors.course_code && (
                <p className="mt-2 text-sm text-red-600">{errors.course_code}</p>
              )}
            </div>
 
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                placeholder="Enter a short course description"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
 
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Status
              </label>
              <input
                type="text"
                value="Active"
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500 outline-none"
              />
              <p className="mt-2 text-xs text-slate-500">
                New courses are created as Active by default.
              </p>
            </div>
 
            <button
              type="submit"
              disabled={isSaving || isSubjectsLoading || activeSubjects.length === 0}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isSaving ? "Saving Course..." : "Save"}
            </button>
          </form>
        </div>
      </section>
 
      <section className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-6 flex flex-col gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Courses</h2>
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end"></div>
        </div>
 
        {isLoading ? (
          <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-slate-500">
            Loading courses...
          </p>
        ) : filteredCourses.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-slate-500">
            {courses.length === 0
              ? "No courses saved yet"
              : "No courses match the selected subject or search"}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full overflow-hidden rounded-2xl border border-slate-200">
              <thead className="bg-slate-100 text-left text-sm text-slate-700">
                <tr>
                  <th className="px-4 py-3">Course ID</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Course Name</th>
                  <th className="px-4 py-3">Course Code</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-700">
                {paginatedCourses.map((course) => (
                  <tr key={course._id} className="border-t border-slate-200">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {course.course_id}
                    </td>
                    <td className="px-4 py-3">
                      {course.subject ? (
                        <SubjectOptionRow subject={course.subject} />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3">{course.course_name}</td>
                    <td className="px-4 py-3">{course.course_code}</td>
                    <td className="px-4 py-3">
                      <span
                        className="block max-w-[420px] truncate"
                        title={course.description}
                      >
                        {course.description}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            course.status === "Active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {course.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => openEditModal(course)}
                          className="text-slate-500 transition hover:text-blue-700"
                          aria-label={`Edit ${course.course_name}`}
                          title="Edit course"
                        >
                          <Pencil size={16} strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
 
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing {(currentPage - 1) * PAGE_SIZE + 1} to{" "}
                {Math.min(currentPage * PAGE_SIZE, filteredCourses.length)} of{" "}
                {filteredCourses.length} courses
              </p>
 
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                  aria-label="Previous page"
                  title="Previous page"
                >
                  <ChevronLeft size={18} strokeWidth={2.25} />
                </button>
 
                <span className="text-sm font-medium text-slate-600">
                  Page {currentPage} of {totalPages}
                </span>
 
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                  aria-label="Next page"
                  title="Next page"
                >
                  <ChevronRight size={18} strokeWidth={2.25} />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
 
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Edit Course</h3>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
              >
                Close
              </button>
            </div>
 
            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Subject *
                </label>
                <div className="relative">
                  <div
                    className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-300 px-4 py-3"
                    onClick={() => setEditDropdownOpen((prev) => !prev)}
                  >
                    <div
                      className={
                        editForm.subject ? "text-slate-900" : "text-slate-400"
                      }
                    >
                      {editForm.subject ? (
                        <SubjectOptionRow
                          subject={
                            editableSubjects.find(
                              (subject) => subject._id === editForm.subject
                            ) || {}
                          }
                        />
                      ) : (
                        "Select subject"
                      )}
                    </div>
                    <span>▾</span>
                  </div>
 
                  {editDropdownOpen && (
                    <div className="absolute z-50 mt-2 w-full rounded-xl border bg-white shadow-lg">
                      <input
                        type="text"
                        value={editSubjectSearchTerm}
                        onChange={(e) => setEditSubjectSearchTerm(e.target.value)}
                        placeholder="Search subject..."
                        className="w-full border-b px-4 py-2 outline-none"
                      />
 
                      <div className="max-h-60 overflow-y-auto">
                        {editSubjectSuggestions.length === 0 ? (
                          <p className="p-3 text-sm text-slate-400">
                            No subjects found
                          </p>
                        ) : (
                          editSubjectSuggestions.map((subject) => (
                            <div
                              key={subject._id}
                              onClick={() => {
                                handleEditChange({
                                  target: { name: "subject", value: subject._id },
                                });
                                setEditDropdownOpen(false);
                              }}
                              className="cursor-pointer px-4 py-2 text-sm hover:bg-blue-50"
                            >
                              <SubjectOptionRow subject={subject} />
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {editErrors.subject && (
                  <p className="mt-2 text-sm text-red-600">{editErrors.subject}</p>
                )}
              </div>
 
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Course Name *
                </label>
                <input
                  type="text"
                  name="course_name"
                  value={editForm.course_name}
                  onChange={handleEditChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                />
                {editErrors.course_name && (
                  <p className="mt-2 text-sm text-red-600">
                    {editErrors.course_name}
                  </p>
                )}
              </div>
 
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  rows="4"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                />
                {editErrors.description && (
                  <p className="mt-2 text-sm text-red-600">
                    {editErrors.description}
                  </p>
                )}
              </div>
 
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Status *
                </label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                {editErrors.status && (
                  <p className="mt-2 text-sm text-red-600">{editErrors.status}</p>
                )}
              </div>
 
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {isUpdating ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
 
 