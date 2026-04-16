import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  createSubject,
  deleteSubject,
  getSubjects,
  updateSubject,
} from "../services/subjectService";
import { getLocalSubjectIcon } from "../utils/subjectIcons";
import ConfirmModal from "../components/common/ConfirmModal";
import DescriptionPreview from "../components/common/DescriptionPreview";
 
const initialForm = {
  subject_name: "",
  subject_code: "",
  description: "",
};
 
const initialEditForm = {
  id: "",
  subject_name: "",
  description: "",
  status: "Active",
};
 
const PAGE_SIZE = 3;
 
/**
 * Render the subject management screen.
 */
export default function SubjectMaster() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [previewIcon, setPreviewIcon] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [editErrors, setEditErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
 
  const validateForm = () => {
    const nextErrors = {};
 
    if (!form.subject_name.trim()) {
      nextErrors.subject_name = "Subject name is required";
    }
 
    if (!form.subject_code.trim()) {
      nextErrors.subject_code = "Subject code is required";
    }
 
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };
 
  const loadSubjects = async () => {
    try {
      setIsLoading(true);
      const res = await getSubjects();
      setSubjects(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load subjects");
      setSubjects([]);
    } finally {
      setIsLoading(false);
    }
  };
 
  useEffect(() => {
    loadSubjects();
  }, []);
 
  const handleChange = (e) => {
    const { name, value } = e.target;
 
    setForm((prev) => ({
      ...prev,
      [name]: name === "subject_code" ? value.toUpperCase() : value,
    }));
 
    setErrors((prev) => ({
      ...prev,
      [name]: "",
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
        subject_name: form.subject_name.trim(),
        subject_code: form.subject_code.trim().toUpperCase(),
        description: form.description.trim(),
        status: "Active",
      };
 
      const res = await createSubject(payload);
      const savedSubject = res.data?.data;
 
      if (savedSubject) {
        setSubjects((prev) => [...prev, savedSubject]);
        setCurrentPage(Math.ceil((subjects.length + 1) / PAGE_SIZE));
      } else {
        await loadSubjects();
      }
 
      setForm(initialForm);
      setErrors({});
      toast.success(res.data?.message || "Subject created successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save subject");
    } finally {
      setIsSaving(false);
    }
  };
 
  const activeCount = useMemo(
    () => subjects.filter((subject) => subject.status === "Active").length,
    [subjects]
  );
 
  const totalPages = Math.max(1, Math.ceil(subjects.length / PAGE_SIZE));
 
  const paginatedSubjects = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return subjects.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, subjects]);
 
  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);
 
  const openEditModal = (subject) => {
    setEditForm({
      id: subject._id,
      subject_name: subject.subject_name,
      description: subject.description,
      status: subject.status,
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
 
    if (!editForm.subject_name.trim()) {
      nextErrors.subject_name = "Subject name is required";
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
        subject_name: editForm.subject_name.trim(),
        description: editForm.description.trim(),
        status: editForm.status,
      };
 
      const res = await updateSubject(editForm.id, payload);
      const updatedSubject = res.data?.data;
 
      setSubjects((prev) =>
        prev.map((item) => (item._id === editForm.id ? updatedSubject : item))
      );
 
      toast.success(res.data?.message || "Subject updated successfully");
      closeEditModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update subject");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteSubject = async (subject) => {
    if (!subject) {
      return;
    }

    try {
      setDeletingId(subject._id);
      const res = await deleteSubject(subject._id);
      toast.success(res.data?.message || "Subject deleted successfully");
      await loadSubjects();
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete subject");
    } finally {
      setDeletingId("");
    }
  };
 
  return (
    <div className="space-y-8">
      {/* <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 p-8 text-white shadow-xl">
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
          Subject 
        </h1>
       
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-blue-100">Saved subjects</p>
            <p className="mt-2 text-2xl font-semibold">{subjects.length}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-blue-100">Active subjects</p>
            <p className="mt-2 text-2xl font-semibold">{activeCount}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-blue-100">CSV source</p>
            <p className="mt-2 text-lg font-semibold">Saved master values only</p>
          </div>
        </div>
      </section> */}
 
      <section className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">New Subject</h2>
          </div>
 
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 ">
                Subject Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subject_name"
                value={form.subject_name}
                onChange={handleChange}
                placeholder="Enter subject name"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              />
              {errors.subject_name && (
                <p className="mt-2 text-sm text-red-600">{errors.subject_name}</p>
              )}
            </div>
 
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Subject Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subject_code"
                value={form.subject_code}
                onChange={handleChange}
                placeholder="Example: MATH"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 uppercase outline-none transition focus:border-blue-500"
              />
              {errors.subject_code && (
                <p className="mt-2 text-sm text-red-600">{errors.subject_code}</p>
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
                placeholder="Enter a short subject description"
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
                New subjects are created as Active by default.
              </p>
            </div>
 
            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 cursor-pointer"
            >
              {isSaving ? "Saving Subject..." : "Save"}
            </button>
          </form>
        </div>
 
        {/* <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">How this works</h2>
          <div className="mt-5 space-y-4 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-800">1. Create master data</p>
              <p className="mt-2">
                Save a subject with a unique name and code like
                {" "}
                <span className="font-semibold">Mathematics / MATH</span>.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-800">2. Prevent duplicates</p>
              <p className="mt-2">
                The backend blocks duplicate subject name or code entries and
                returns a clear message instead of creating a duplicate row.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-800">3. Reuse saved values</p>
              <p className="mt-2">
                When we connect this to CSV later, the subject column should use
                only values already saved here.
              </p>
            </div>
          </div>
        </div> */}
      </section>
 
      <section className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Subjects</h2>
          </div>
        </div>
 
        {isLoading ? (
          <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-slate-500">
            Loading subjects...
          </p>
        ) : subjects.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-slate-500">
            No subjects saved yet
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full overflow-hidden rounded-2xl border border-slate-200">
              <thead className="bg-slate-100 text-left text-sm text-slate-700">
                <tr>
                  <th className="px-4 py-3">Subject ID</th>
                  <th className="px-4 py-3">Subject Name</th>
                  <th className="px-4 py-3">Subject Code</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-700">
                {paginatedSubjects.map((subject) => (
                  <tr key={subject._id} className="border-t border-slate-200">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {subject.subject_id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {getLocalSubjectIcon(subject) ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewIcon({
                                src: getLocalSubjectIcon(subject),
                                alt: subject.subject_name,
                              })
                            }
                            className="rounded-full"
                            title={`View ${subject.subject_name} icon`}
                          >
                            <img
                              src={getLocalSubjectIcon(subject)}
                              alt={subject.subject_name}
                              className="h-10 w-10 cursor-pointer rounded-full border border-slate-200 bg-white p-1 object-contain"
                            />
                          </button>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                            {subject.subject_name?.charAt(0)?.toUpperCase() || "S"}
                          </div>
                        )}
                        <span>{subject.subject_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{subject.subject_code}</td>
                    <td className="px-4 py-3">
                      <DescriptionPreview
                        text={subject.description}
                        className="block max-w-[420px]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            subject.status === "Active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {subject.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => openEditModal(subject)}
                          className="text-slate-500 transition hover:text-blue-700"
                          aria-label={`Edit ${subject.subject_name}`}
                          title="Edit subject"
                        >
                          <Pencil size={16} strokeWidth={2} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(subject)}
                          disabled={deletingId === subject._id}
                          className="text-slate-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Delete ${subject.subject_name}`}
                          title="Delete subject"
                        >
                          <Trash2 size={16} strokeWidth={2} />
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
                {Math.min(currentPage * PAGE_SIZE, subjects.length)} of{" "}
                {subjects.length} subjects
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
                <h3 className="text-2xl font-bold text-slate-900">Edit Subject</h3>
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
                  Subject Name *
                </label>
                <input
                  type="text"
                  name="subject_name"
                  value={editForm.subject_name}
                  onChange={handleEditChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                />
                {editErrors.subject_name && (
                  <p className="mt-2 text-sm text-red-600">
                    {editErrors.subject_name}
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
                  className="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 cursor-pointer"
                >
                  {isUpdating ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewIcon && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
          onClick={() => setPreviewIcon(null)}
        >
          <div
            className="rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-xl font-bold text-slate-900">
                {previewIcon.alt}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewIcon(null)}
                className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
              >
                Close
              </button>
            </div>
            <img
              src={previewIcon.src}
              alt={previewIcon.alt}
              className="h-64 w-64 object-contain"
            />
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Subject"
        message={
          deleteTarget
            ? `Delete "${deleteTarget.subject_name}"? This will also remove the courses and lessons linked to it.`
            : ""
        }
        confirmLabel="Delete subject"
        danger
        isLoading={deletingId === deleteTarget?._id}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => handleDeleteSubject(deleteTarget)}
      />
    </div>
  );
}
 
 
 
 
