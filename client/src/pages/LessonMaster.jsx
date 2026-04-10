import { useEffect, useMemo, useState } from "react";

import { ChevronLeft, ChevronRight, Edit3, Pencil, Plus, Trash2, X } from "lucide-react";

import toast from "react-hot-toast";

import {
    createLesson,
    deleteLesson,
    getLessons,
    updateLessonQuestionBank,
    updateLesson,
} from "../services/lessonService";
import { getCourses } from "../services/courseService";
import { getLocalSubjectIcon } from "../utils/subjectIcons";
import ConfirmModal from "../components/common/ConfirmModal";
import DescriptionPreview from "../components/common/DescriptionPreview";

const API_ORIGIN = "http://localhost:5000";

const getSubjectIconUrl = (iconPath) =>
    iconPath
        ? iconPath.startsWith("http") || iconPath.startsWith("blob:")
            ? iconPath
            : `${API_ORIGIN}${iconPath}`
        : "";

const getCourseSubjectIcon = (course) =>
    getLocalSubjectIcon(course?.subject) || getSubjectIconUrl(course?.subject?.icon_path);

const initialForm = {
    lesson_title: "",
    lesson_code: "",
    course: "",
    description: "",
};

const initialEditForm = {
    id: "",
    lesson_title: "",
    course: "",
    description: "",
    status: "Active",
};

const PAGE_SIZE = 3;

const EMPTY_BANK = () => ({ title: "", content: "" });

export default function LessonMaster() {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [courses, setCourses] = useState([]);
    const [courseSearchTerm, setCourseSearchTerm] = useState("");
    const [lessons, setLessons] = useState([]);
    const [searchTerm] = useState("");
    const [selectedCourse] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isCoursesLoading, setIsCoursesLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editForm, setEditForm] = useState(initialEditForm);
    const [editErrors, setEditErrors] = useState({});
    const [isUpdating, setIsUpdating] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [editDropdownOpen, setEditDropdownOpen] = useState(false);
    const [editCourseSearchTerm, setEditCourseSearchTerm] = useState("");
    const [deletingId, setDeletingId] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);

    // ── Question Bank state ──────────────────────────────────────────────────
    const [questionModalLesson, setQuestionModalLesson] = useState(null);
    const [questionBanks, setQuestionBanks] = useState([EMPTY_BANK()]);
    const [editingBankIndex, setEditingBankIndex] = useState(null);
    const [savedBankCountMap, setSavedBankCountMap] = useState({}); // { lessonId: number }
    // ────────────────────────────────────────────────────────────────────────

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

    useEffect(() => {
        const nextCountMap = lessons.reduce((acc, lesson) => {
            acc[lesson._id] = Array.isArray(lesson?.question_bank) ? lesson.question_bank.length : 0;
            return acc;
        }, {});
        setSavedBankCountMap(nextCountMap);
    }, [lessons]);

    const validateForm = () => {
        const nextErrors = {};
        if (!form.lesson_title.trim()) nextErrors.lesson_title = "Lesson title is required";
        if (!form.lesson_code.trim()) nextErrors.lesson_code = "Lesson code is required";
        if (!form.course) nextErrors.course = "Course is required";
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === "lesson_code" ? value.toUpperCase() : value,
        }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleCourseSearchChange = (e) => {
        setCourseSearchTerm(e.target.value);
    };

    const handleCourseSelectChange = (e) => {
        const { value } = e.target;
        setForm((prev) => ({ ...prev, course: value }));
        setErrors((prev) => ({ ...prev, course: "" }));
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
                        (maxOrder, lesson) => Math.max(maxOrder, Number(lesson.lesson_order) || 0),
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
        const iconUrl = getCourseSubjectIcon(course);
        const fallbackLabel =
            course?.subject?.subject_name?.charAt(0)?.toUpperCase() ||
            course.course_name?.charAt(0)?.toUpperCase() ||
            "?";

        return (
            <div className="flex items-center gap-3">
                {iconUrl ? (
                    <img
                        src={iconUrl}
                        alt={course.subject?.subject_name || course.course_name || "Course icon"}
                        className="h-8 w-8 rounded-lg border border-slate-200 object-cover"
                    />
                ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-500">
                        {fallbackLabel}
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
            const matchesCourse = selectedCourse ? lesson.course?._id === selectedCourse : true;
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
        if (!normalizedSearch) return activeCourses.slice(0, 8);
        return activeCourses
            .filter(
                (course) =>
                    course.course_name.toLowerCase().startsWith(normalizedSearch) ||
                    course.course_code.toLowerCase().startsWith(normalizedSearch)
            )
            .slice(0, 8);
    }, [courseSearchTerm, courses]);

    const editableCourses = useMemo(() => {
        const currentCourse = courses.find((course) => course._id === editForm.course);
        if (!currentCourse || currentCourse.status === "Active") return activeCourses;
        return [currentCourse, ...activeCourses];
    }, [activeCourses, courses, editForm.course]);

    const editCourseSuggestions = useMemo(() => {
        const normalizedSearch = editCourseSearchTerm.trim().toLowerCase();
        if (!normalizedSearch) return editableCourses.slice(0, 8);
        return editableCourses
            .filter(
                (course) =>
                    course.course_name.toLowerCase().startsWith(normalizedSearch) ||
                    course.course_code.toLowerCase().startsWith(normalizedSearch)
            )
            .slice(0, 8);
    }, [editCourseSearchTerm, editableCourses]);

    const totalPages = Math.max(1, Math.ceil(filteredLessons.length / PAGE_SIZE));

    const paginatedLessons = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        return filteredLessons.slice(startIndex, startIndex + PAGE_SIZE);
    }, [currentPage, filteredLessons]);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedCourse]);
    useEffect(() => { setCurrentPage((prev) => Math.min(prev, totalPages)); }, [totalPages]);

    const openEditModal = (lesson) => {
        setEditForm({
            id: lesson._id,
            lesson_title: lesson.lesson_title,
            course: lesson.course?._id || "",
            description: lesson.description,
            status: lesson.status,
        });
        setEditCourseSearchTerm("");
        setEditDropdownOpen(false);
        setEditErrors({});
        setIsEditOpen(true);
    };

    const closeEditModal = () => {
        setIsEditOpen(false);
        setEditForm(initialEditForm);
        setEditCourseSearchTerm("");
        setEditDropdownOpen(false);
        setEditErrors({});
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
        setEditErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validateEditForm = () => {
        const nextErrors = {};
        if (!editForm.lesson_title.trim()) nextErrors.lesson_title = "Lesson title is required";
        if (!editForm.course) nextErrors.course = "Course is required";
        if (!["Active", "Inactive"].includes(editForm.status)) nextErrors.status = "Valid status is required";
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
                        (lesson) => lesson._id !== editForm.id && lesson.course?._id === editForm.course
                    )
                    .reduce(
                        (maxOrder, lesson) => Math.max(maxOrder, Number(lesson.lesson_order) || 0),
                        0
                    ) + 1;

            const payload = {
                lesson_title: editForm.lesson_title.trim(),
                course: editForm.course,
                lesson_order: isCourseChanged
                    ? nextLessonOrder
                    : Number(currentLesson?.lesson_order) || 1,
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

    const handleDeleteLesson = async (lesson) => {
        if (!lesson) {
            return;
        }

        try {
            setDeletingId(lesson._id);
            const res = await deleteLesson(lesson._id);
            toast.success(res.data?.message || "Lesson deleted successfully");
            await loadLessons();
            setDeleteTarget(null);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete lesson");
        } finally {
            setDeletingId("");
        }
    };

    // ── Question Bank handlers ───────────────────────────────────────────────
    const openQuestionModal = (lesson) => {
        setQuestionModalLesson(lesson);
        const existingBanks = Array.isArray(lesson?.question_bank) ? lesson.question_bank : [];
        setQuestionBanks(
            existingBanks.length > 0
                ? existingBanks.map((bank) => ({
                    title: bank?.title || "",
                    content: bank?.content || "",
                }))
                : [EMPTY_BANK()]
        );
        setEditingBankIndex(null);
    };

    const closeQuestionModal = () => {
        setQuestionModalLesson(null);
        setQuestionBanks([EMPTY_BANK()]);
        setEditingBankIndex(null);
    };

    const handleAddBank = () => {
        const hasIncompleteBank = questionBanks.some(
            (bank) => !bank.title.trim() || !bank.content.trim()
        );

        if (hasIncompleteBank) {
            toast.error("Fill the current question box before adding a new one.");
            return;
        }

        setQuestionBanks((prev) => {
            const nextIndex = prev.length;
            setEditingBankIndex(nextIndex);
            return [...prev, EMPTY_BANK()];
        });
    };

    const canAddBank = questionBanks.every(
        (bank) => bank.title.trim() && bank.content.trim()
    );

    const handleBankFieldChange = (index, field, value) => {
        setQuestionBanks((prev) =>
            prev.map((b, i) => (i === index ? { ...b, [field]: value } : b))
        );
    };

    const handleRemoveBank = (index) => {
        setQuestionBanks((prev) => {
            const updated = prev.filter((_, i) => i !== index);
            return updated.length ? updated : [EMPTY_BANK()];
        });
        setEditingBankIndex((prev) => {
            if (prev === null) return null;
            if (prev === index) return null;
            return prev > index ? prev - 1 : prev;
        });
    };

    const handleUpload = async () => {
        const filled = questionBanks.filter((b) => b.title.trim() || b.content.trim());

        if (!filled.length) {
            toast.error("Please fill in at least one question bank");
            return;
        }

        try {
            const payload = {
                question_bank: filled.map((b) => ({
                    title: b.title.trim(),
                    content: b.content.trim(),
                })),
            };

            const res = await updateLessonQuestionBank(questionModalLesson._id, payload);
            const updatedLesson = res.data?.data;

            if (updatedLesson?._id) {
                setLessons((prev) =>
                    prev.map((lesson) => (lesson._id === updatedLesson._id ? updatedLesson : lesson))
                );

                setSavedBankCountMap((prev) => ({
                    ...prev,
                    [updatedLesson._id]: Array.isArray(updatedLesson.question_bank)
                        ? updatedLesson.question_bank.length
                        : 0,
                }));
            }

            toast.success(res.data?.message || "Question banks uploaded successfully");
            closeQuestionModal();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to upload question bank");
        }
    };
    // ────────────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-8">
            <section className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
                <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">New Lesson</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Course dropdown */}
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
                                            <CourseOptionRow course={courses.find((c) => c._id === form.course) || {}} />
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
                                                            handleCourseSelectChange({ target: { value: course._id } });
                                                            setDropdownOpen(false);
                                                        }}
                                                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                                                    >
                                                        <CourseOptionRow course={course} />
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {errors.course && <p className="mt-2 text-sm text-red-600">{errors.course}</p>}
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
                            {errors.lesson_title && <p className="mt-2 text-sm text-red-600">{errors.lesson_title}</p>}
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
                                placeholder="Example: ALG101-L1"
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 uppercase outline-none transition focus:border-blue-500"
                            />
                            {errors.lesson_code && <p className="mt-2 text-sm text-red-600">{errors.lesson_code}</p>}
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
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Lessons</h2>
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
                                {paginatedLessons.map((lesson) => {
                                    const savedCount = savedBankCountMap[lesson._id] || 0;
                                    return (
                                        <tr key={lesson._id} className="border-t border-slate-200">
                                            <td className="px-4 py-3 font-semibold text-slate-900">
                                                {lesson.lesson_id}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <CourseOptionRow course={lesson.course || {}} />
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{lesson.lesson_title}</td>
                                            <td className="px-4 py-3">{lesson.lesson_code}</td>
                                            <td className="px-4 py-3">
                                                <DescriptionPreview
                                                    text={lesson.description}
                                                    className="block max-w-[140px]"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="inline-flex items-center gap-2">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                            lesson.status === "Active"
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
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteTarget(lesson)}
                                                        disabled={deletingId === lesson._id}
                                                        className="text-slate-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                        aria-label={`Delete ${lesson.lesson_title}`}
                                                        title="Delete lesson"
                                                    >
                                                        <Trash2 size={16} strokeWidth={2} />
                                                    </button>
                                                    {/* ── Question Bank "+" button ── */}
                                                    <button
                                                        type="button"
                                                        onClick={() => openQuestionModal(lesson)}
                                                        className="relative flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700"
                                                        aria-label={`Upload question bank for ${lesson.lesson_title}`}
                                                        title="Upload Question Bank"
                                                    >
                                                        <Plus size={13} strokeWidth={2.5} />
                                                        {savedCount > 0 && (
                                                            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white">
                                                                {savedCount}
                                                            </span>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
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
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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

            {/* ── Question Bank Modal ──────────────────────────────────────────────── */}
            {questionModalLesson && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
                    <div
                        className="flex w-full max-w-xl flex-col rounded-3xl bg-white shadow-2xl"
                        style={{ maxHeight: "88vh" }}
                    >
                        {/* Fixed Header */}
                        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 pb-4 pt-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Question Bank</h3>
                                <p className="mt-0.5 text-sm text-slate-500">
                                    {questionModalLesson.lesson_title}{" "}
                                    <span className="font-medium text-slate-400">
                                        ({questionModalLesson.lesson_code})
                                    </span>
                                </p>
                            </div>

                            {/* Right side: single global "+" Add Bank button + close */}
                            <div className="flex shrink-0 items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleAddBank}
                                    disabled={!canAddBank}
                                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                                    title="Add question bank"
                                >
                                    <Plus size={12} strokeWidth={2.5} />
                                </button>
                                <button
                                    type="button"
                                    onClick={closeQuestionModal}
                                    className="rounded-full border border-slate-200 p-1.5 text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
                                    aria-label="Close modal"
                                >
                                    <X size={16} strokeWidth={2} />
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Cards Area */}
                        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
                            {questionBanks.map((bank, index) => (
                                <div
                                    key={index}
                                    className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                >
                                    {/* Card Header */}
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-slate-600">
                                                Question Bank {index + 1}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => setEditingBankIndex(index)}
                                                className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                                                title="Edit question bank"
                                                aria-label={`Edit question bank ${index + 1}`}
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            {questionBanks.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveBank(index)}
                                                    className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-red-200 hover:text-red-500"
                                                    title="Remove this bank"
                                                >
                                                    <Trash2 size={12} strokeWidth={2} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {editingBankIndex === index ? (
                                        <>
                                            {/* Title Input */}
                                            <div>
                                                <input
                                                    type="text"
                                                    value={bank.title}
                                                    onChange={(e) =>
                                                        handleBankFieldChange(index, "title", e.target.value)
                                                    }
                                                    placeholder="Question bank title"
                                                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                                                />
                                            </div>

                                            {/* Content Textarea */}
                                            <div>
                                                <textarea
                                                    value={bank.content}
                                                    onChange={(e) =>
                                                        handleBankFieldChange(index, "content", e.target.value)
                                                    }
                                                    rows={4}
                                                    placeholder="Enter question bank Content"
                                                    className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setEditingBankIndex(null)}
                                                className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                                            >
                                                Done editing
                                            </button>
                                        </>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-900">
                                                {bank.title || `Question Bank ${index + 1}`}
                                            </div>
                                            <div className="min-h-[96px] rounded-xl bg-white px-3 py-2 text-sm leading-6 text-slate-600">
                                                {bank.content || "Click the edit icon to add question bank content"}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Fixed Footer */}
                        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
                            <p className="text-xs text-slate-400">
                                {questionBanks.filter((b) => b.title.trim() || b.content.trim()).length} bank
                                {questionBanks.filter((b) => b.title.trim() || b.content.trim()).length !== 1 ? "s" : ""} with content
                            </p>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeQuestionModal}
                                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleUpload}
                                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* ───────────────────────────────────────────────────────────────────── */}

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
                                <div className="relative">
                                    <div
                                        className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-300 px-4 py-3"
                                        onClick={() =>
                                            editableCourses.length > 0 && setEditDropdownOpen((prev) => !prev)
                                        }
                                    >
                                        <div className={editForm.course ? "text-slate-900" : "text-slate-400"}>
                                            {editForm.course ? (
                                                <CourseOptionRow
                                                    course={editableCourses.find((course) => course._id === editForm.course) || {}}
                                                />
                                            ) : (
                                                "Select course"
                                            )}
                                        </div>
                                        <span>▾</span>
                                    </div>

                                    {editDropdownOpen && (
                                        <div className="absolute z-50 mt-2 w-full rounded-xl border bg-white shadow-lg">
                                            <input
                                                type="text"
                                                value={editCourseSearchTerm}
                                                onChange={(e) => setEditCourseSearchTerm(e.target.value)}
                                                placeholder="Search course..."
                                                className="w-full border-b px-4 py-2 outline-none"
                                            />
                                            <div className="max-h-60 overflow-y-auto">
                                                {editCourseSuggestions.length === 0 ? (
                                                    <p className="p-3 text-sm text-slate-400">No courses found</p>
                                                ) : (
                                                    editCourseSuggestions.map((course) => (
                                                        <div
                                                            key={course._id}
                                                            onClick={() => {
                                                                handleEditChange({ target: { name: "course", value: course._id } });
                                                                setEditDropdownOpen(false);
                                                            }}
                                                            className="cursor-pointer px-4 py-2 text-sm hover:bg-blue-50"
                                                        >
                                                            <CourseOptionRow course={course} />
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {editErrors.course && <p className="mt-2 text-sm text-red-600">{editErrors.course}</p>}
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
                                {editErrors.lesson_title && <p className="mt-2 text-sm text-red-600">{editErrors.lesson_title}</p>}
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
                                {editErrors.status && <p className="mt-2 text-sm text-red-600">{editErrors.status}</p>}
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

            <ConfirmModal
                open={Boolean(deleteTarget)}
                title="Delete Lesson"
                message={
                    deleteTarget
                        ? `Delete "${deleteTarget.lesson_title}"? This will remove the lesson and its saved question bank.`
                        : ""
                }
                confirmLabel="Delete lesson"
                danger
                isLoading={deletingId === deleteTarget?._id}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={() => handleDeleteLesson(deleteTarget)}
            />
        </div>
    );
}
