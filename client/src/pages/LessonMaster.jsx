import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import {
    createLesson,
    getLessons,
    updateLesson,
} from "../services/lessonService";
import { getCourses } from "../services/courseService";
import { getLocalSubjectIcon } from "../utils/subjectIcons";

const API_ORIGIN = "http://localhost:5000";

const getCourseIconUrl = (iconPath) =>
    iconPath
        ? iconPath.startsWith("http") || iconPath.startsWith("blob:")
            ? iconPath
            : `${API_ORIGIN}${iconPath}`
        : "";

const initialForm = {
    lesson_title: "",
    lesson_code: "",
    course: "",
    lesson_order: "",
    description: "",
};

const initialEditForm = {
    id: "",
    lesson_title: "",
    course: "",
    lesson_order: "",
    description: "",
    status: "Active",
};

const PAGE_SIZE = 5;

export default function LessonMaster() {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [courses, setCourses] = useState([]);
    const [courseSearchTerm, setCourseSearchTerm] = useState("");
    const [lessons, setLessons] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isCoursesLoading, setIsCoursesLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editForm, setEditForm] = useState(initialEditForm);
    const [editErrors, setEditErrors] = useState({});
    const [isUpdating, setIsUpdating] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const loadCourses = async () => {
        try {
            setIsCoursesLoading(true);
            const res = await getCourses();
            setCourses(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load courses");
            setCourses([]);
        } finally {
            setIsCoursesLoading(false);
        }
    };

    const loadLessons = async () => {
        try {
            setIsLoading(true);
            const res = await getLessons();

            setLessons(Array.isArray(res.data?.data) ? res.data.data : []);

        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load lessons");
            setLessons([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCourses();
        loadLessons();
    }, []);

    const formatCourseOption = (course) =>
        `${course.course_name} (${course.course_code})`;

    const getDescriptionPreview = (description) => {
        const normalizedDescription = description?.trim() || "";

        if (!normalizedDescription) {
            return "-";
        }

        const words = normalizedDescription.split(/\s+/);

        if (words.length <= 2) {
            return normalizedDescription;
        }

        return `${words.slice(0, 2).join(" ")}...`;
    };

    const validateForm = () => {
        const nextErrors = {};

        if (!form.lesson_title.trim()) {
            nextErrors.lesson_title = "Lesson title is required";
        }

        if (!form.lesson_code.trim()) {
            nextErrors.lesson_code = "Lesson code is required";
        }

        if (!form.course) {
            nextErrors.course = "Course is required";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: name === "lesson_code" ? value.toUpperCase() : value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const handleCourseSearchChange = (e) => {
        setCourseSearchTerm(e.target.value);
    };

    const handleCourseSelectChange = (e) => {
        const { value } = e.target;

        setForm((prev) => ({
            ...prev,
            course: value,
        }));

        setErrors((prev) => ({
            ...prev,
            course: "",
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
            const nextLessonOrder =
                lessons
                    .filter((lesson) => lesson.course?._id === form.course)
                    .reduce(
                        (maxOrder, lesson) =>
                            Math.max(maxOrder, Number(lesson.lesson_order) || 0),
                        0
                    ) + 1;

            const payload = {
                ...form,
                lesson_title: form.lesson_title.trim(),
                lesson_code: form.lesson_code.trim().toUpperCase(),
                lesson_order: nextLessonOrder,
                description: form.description.trim(),
                status: "Active",
            };

            const res = await createLesson(payload);
            const savedLesson = res.data?.data;

            if (savedLesson) {
                setLessons((prev) => [...prev, savedLesson]);
                setCurrentPage(Math.ceil((lessons.length + 1) / PAGE_SIZE));
            } else {
                await loadLessons();
            }

            setForm(initialForm);
            setCourseSearchTerm("");
            setErrors({});
            toast.success(res.data?.message || "Lesson created successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save lesson");
        } finally {
            setIsSaving(false);
        }
    };
    function CourseOptionRow({ course }) {
        const iconUrl = course?.icon_path
            ? `http://localhost:5000${course.icon_path}`
            : "";

        return (
            <div className="flex items-center gap-3">
                {iconUrl ? (
                    <img
                        src={iconUrl}
                        alt={course.course_name || "Course icon"}
                        className="h-8 w-8 rounded-lg border border-slate-200 object-cover"
                    />
                ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-500">
                        {course.course_name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                )}
                <span>
                    {course.course_name} ({course.course_code})
                </span>
            </div>
        );
    }
    const activeCourses = useMemo(
        () => courses.filter((c) => c.status === "Active"),
        [courses]
    );

    const filteredLessons = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return lessons.filter((lesson) => {
            const matchesCourse = selectedCourse
                ? lesson.course?._id === selectedCourse
                : true;

            const matchesSearch = normalizedSearch
                ? [
                    lesson.lesson_id,
                    lesson.lesson_title,
                    lesson.lesson_code,
                    lesson.description,
                    lesson.course?.course_name,
                    lesson.course?.course_code,
                ]
                    .filter(Boolean)
                    .some((value) => value.toLowerCase().includes(normalizedSearch))
                : true;

            return matchesCourse && matchesSearch;
        });
    }, [lessons, searchTerm, selectedCourse]);

    const courseSuggestions = useMemo(() => {
        const normalizedSearch = courseSearchTerm.trim().toLowerCase();

        if (!normalizedSearch) {
            return activeCourses.slice(0, 8);
        }

        return activeCourses
            .filter(
                (course) =>
                    course.course_name.toLowerCase().startsWith(normalizedSearch) ||
                    course.course_code.toLowerCase().startsWith(normalizedSearch)
            )
            .slice(0, 8);
    }, [courseSearchTerm, courses]);

    const activeCount = useMemo(
        () => filteredLessons.filter((lesson) => lesson.status === "Active").length,
        [filteredLessons]
    );

    const totalPages = Math.max(1, Math.ceil(filteredLessons.length / PAGE_SIZE));

    const paginatedLessons = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        return filteredLessons.slice(startIndex, startIndex + PAGE_SIZE);
    }, [currentPage, filteredLessons]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCourse]);

    useEffect(() => {
        setCurrentPage((prev) => Math.min(prev, totalPages));
    }, [totalPages]);

    const openEditModal = (lesson) => {
        setEditForm({
            id: lesson._id,
            lesson_title: lesson.lesson_title,
            course: lesson.course?._id || "",
            lesson_order: lesson.lesson_order,
            description: lesson.description,
            status: lesson.status,
        });
        setEditErrors({});
        setIsEditOpen(true);
    };

    const closeEditModal = () => {
        setIsEditOpen(false);
        setEditForm(initialEditForm);
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

        if (!editForm.lesson_title.trim()) {
            nextErrors.lesson_title = "Lesson title is required";
        }

        if (!editForm.course) {
            nextErrors.course = "Course is required";
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
            const currentLesson = lessons.find((lesson) => lesson._id === editForm.id);
            const isCourseChanged = currentLesson?.course?._id !== editForm.course;
            const nextLessonOrder =
                lessons
                    .filter(
                        (lesson) =>
                            lesson._id !== editForm.id && lesson.course?._id === editForm.course
                    )
                    .reduce(
                        (maxOrder, lesson) =>
                            Math.max(maxOrder, Number(lesson.lesson_order) || 0),
                        0
                    ) + 1;

            const payload = {
                lesson_title: editForm.lesson_title.trim(),
                course: editForm.course,
                lesson_order: isCourseChanged
                    ? nextLessonOrder
                    : Number(editForm.lesson_order) || 1,
                description: editForm.description.trim(),
                status: editForm.status,
            };

            const res = await updateLesson(editForm.id, payload);
            const updatedLesson = res.data?.data;

            setLessons((prev) =>
                prev.map((item) => (item._id === editForm.id ? updatedLesson : item))
            );

            toast.success(res.data?.message || "Lesson updated successfully");
            closeEditModal();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update lesson");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 p-8 text-white shadow-xl">
                <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Lesson Master</h1>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                        <p className="text-sm text-blue-100">Visible lessons</p>
                        <p className="mt-2 text-2xl font-semibold">{filteredLessons.length}</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                        <p className="text-sm text-blue-100">Active lessons</p>
                        <p className="mt-2 text-2xl font-semibold">{activeCount}</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                        <p className="text-sm text-blue-100">Connected courses</p>
                        <p className="mt-2 text-2xl font-semibold">{courses.length}</p>
                    </div>
                </div>
            </section> */}

            <section className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
                <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">New Lesson</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Course dropdown with search */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Course <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 cursor-pointer flex justify-between items-center"
                                    onClick={() => activeCourses.length > 0 && setDropdownOpen((prev) => !prev)}
                                >
                                    <span className={form.course ? "text-slate-900" : "text-slate-400"}>
                                        {form.course ? (
                                            <CourseOptionRow
                                                course={courses.find((c) => c._id === form.course) || {}}
                                            />
                                        ) : (
                                            "Select course"
                                        )}
                                    </span>
                                    <span>▾</span>
                                </div>

                                {dropdownOpen && (
                                    <div className="absolute z-50 mt-2 w-full bg-white border rounded-xl shadow-lg">
                                        <input
                                            type="text"
                                            value={courseSearchTerm}
                                            onChange={handleCourseSearchChange}
                                            placeholder="Search course..."
                                            className="w-full px-4 py-2 border-b outline-none"
                                        />
                                        <div className="max-h-60 overflow-y-auto">
                                            {courseSuggestions.length === 0 ? (
                                                <p className="p-3 text-sm text-slate-400">No courses found</p>
                                            ) : (
                                                courseSuggestions.map((course) => (
                                                    <div
                                                        key={course._id}
                                                        onClick={() => {
                                                            handleCourseSelectChange({
                                                                target: { value: course._id },
                                                            });
                                                            setDropdownOpen(false);
                                                        }}
                                                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                                                    >
                                                        {formatCourseOption(course)}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {errors.course && (
                                <p className="mt-2 text-sm text-red-600">{errors.course}</p>
                            )}
                        </div>

                        {/* Lesson Title */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Lesson Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="lesson_title"
                                value={form.lesson_title}
                                onChange={handleChange}
                                placeholder="Enter lesson title"
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                            />
                            {errors.lesson_title && (
                                <p className="mt-2 text-sm text-red-600">{errors.lesson_title}</p>
                            )}
                        </div>

                        {/* Lesson Code */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Lesson Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="lesson_code"
                                value={form.lesson_code}
                                onChange={handleChange}
                                placeholder="Example: ALG-L1"
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 uppercase outline-none transition focus:border-blue-500"
                            />
                            {errors.lesson_code && (
                                <p className="mt-2 text-sm text-red-600">{errors.lesson_code}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Enter a short lesson description"
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                            />
                        </div>

                        {/* Status (read-only) */}
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
                                New lessons are created as Active by default.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving || isCoursesLoading || activeCourses.length === 0}
                            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 cursor-pointer"
                        >
                            {isSaving ? "Saving Lesson..." : "Save"}
                        </button>
                    </form>
                </div>
            </section>

            {/* Lessons Table */}
            <section className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
                <div className="mb-6 flex flex-col gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Lessons</h2>
                    </div>
                </div>

                {isLoading ? (
                    <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-slate-500">
                        Loading lessons...
                    </p>
                ) : filteredLessons.length === 0 ? (
                    <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-slate-500">
                        {lessons.length === 0
                            ? "No lessons saved yet"
                            : "No lessons match the selected course or search"}
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full overflow-hidden rounded-2xl border border-slate-200">
                            <thead className="bg-slate-100 text-left text-sm text-slate-700">
                                <tr>
                                    <th className="px-4 py-3">Lesson ID</th>
                                    <th className="px-4 py-3">Course</th>
                                    <th className="px-4 py-3">Lesson Title</th>
                                    <th className="px-4 py-3">Lesson Code</th>
                                    <th className="px-4 py-3">Description</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-slate-700">
                                {paginatedLessons.map((lesson) => (
                                    <tr key={lesson._id} className="border-t border-slate-200">
                                        <td className="px-4 py-3 font-semibold text-slate-900">
                                            {lesson.lesson_id}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span>{lesson.course?.course_name || "-"}</span>
                                                <span className="text-xs text-slate-500">
                                                    {lesson.course?.course_code || ""}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">{lesson.lesson_title}</td>
                                        <td className="px-4 py-3">{lesson.lesson_code}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className="block max-w-[140px] truncate"
                                                title={lesson.description}
                                            >
                                                {getDescriptionPreview(lesson.description)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="inline-flex items-center gap-2">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${lesson.status === "Active"
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-slate-200 text-slate-700"
                                                        }`}
                                                >
                                                    {lesson.status}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(lesson)}
                                                    className="text-slate-500 transition hover:text-blue-700"
                                                    aria-label={`Edit ${lesson.lesson_title}`}
                                                    title="Edit lesson"
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
                                {Math.min(currentPage * PAGE_SIZE, filteredLessons.length)} of{" "}
                                {filteredLessons.length} lessons
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                                    aria-label="Previous page"
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
                                >
                                    <ChevronRight size={18} strokeWidth={2.25} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* Edit Modal */}
            {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">Edit Lesson</h3>
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
                                    Course *
                                </label>
                                <select
                                    name="course"
                                    value={editForm.course}
                                    onChange={handleEditChange}
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                                >
                                    <option value="">Select course</option>
                                    {courses.map((course) => (
                                        <option key={course._id} value={course._id}>
                                            {course.course_name} ({course.course_code})
                                        </option>
                                    ))}
                                </select>
                                {editErrors.course && (
                                    <p className="mt-2 text-sm text-red-600">{editErrors.course}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Lesson Title *
                                </label>
                                <input
                                    type="text"
                                    name="lesson_title"
                                    value={editForm.lesson_title}
                                    onChange={handleEditChange}
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                                />
                                {editErrors.lesson_title && (
                                    <p className="mt-2 text-sm text-red-600">{editErrors.lesson_title}</p>
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
