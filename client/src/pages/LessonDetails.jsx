import { Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import {
  getLessonById,
  updateLessonQuestionBank,
} from "../services/lessonService";

const createQuestionBankItem = (index = 0) => ({
  local_id: `new-${Date.now()}-${index}`,
  title: "",
  content: "",
});

const createInitialQuestionBanks = () =>
  [createQuestionBankItem(0)];

export default function LessonDetails() {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [questionBank, setQuestionBank] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadLesson = async () => {
      try {
        setIsLoading(true);
        const res = await getLessonById(lessonId);
        const lessonData = res.data?.data || null;

        setLesson(lessonData);
        setQuestionBank(
          Array.isArray(lessonData?.question_bank)
            ? lessonData.question_bank.length > 0
              ? lessonData.question_bank.map((item, index) => ({
                local_id: item._id || `existing-${index}`,
                title: item.title || "",
                content: item.content || "",
              }))
              : createInitialQuestionBanks()
            : createInitialQuestionBanks()
        );
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load lesson details");
      } finally {
        setIsLoading(false);
      }
    };

    loadLesson();
  }, [lessonId]);

  const handleQuestionBankChange = (index, field, value) => {
    setQuestionBank((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleAddQuestionBank = () => {
    const hasIncompleteBlock = questionBank.some(
      (item) => !item.title.trim() || !item.content.trim()
    );

    if (hasIncompleteBlock) {
      toast.error("Fill the current question box before adding a new one.");
      return;
    }

    const nextIndex = questionBank.length;
    setQuestionBank((prev) => [...prev, createQuestionBankItem(nextIndex)]);
    setEditingIndex(nextIndex);
  };

  const canAddQuestionBank = questionBank.every(
    (item) => item.title.trim() && item.content.trim()
  );

  const handleDeleteQuestionBank = (indexToDelete) => {
    setQuestionBank((prev) => prev.filter((_, index) => index !== indexToDelete));
    setEditingIndex((prev) => {
      if (prev === null) return null;
      if (prev === indexToDelete) return null;
      return prev > indexToDelete ? prev - 1 : prev;
    });
  };

  const handleSave = async () => {
    try {
      if (questionBank.length === 0) {
        toast.error("Add at least one question block before saving.");
        return;
      }

      const normalizedQuestionBank = questionBank.map((item) => ({
        title: item.title.trim(),
        content: item.content.trim(),
      }));

      const firstInvalidBlockIndex = normalizedQuestionBank.findIndex(
        (item) => !item.title || !item.content
      );

      if (firstInvalidBlockIndex !== -1) {
        toast.error(
          `Question block ${firstInvalidBlockIndex + 1} is incomplete. Fill title and content.`
        );
        return;
      }

      setIsSaving(true);
      const payload = {
        question_bank: normalizedQuestionBank,
      };

      const res = await updateLessonQuestionBank(lessonId, payload);
      const updatedLesson = res.data?.data;

      setLesson(updatedLesson);
      setQuestionBank(
        Array.isArray(updatedLesson?.question_bank)
          ? updatedLesson.question_bank.map((item, index) => ({
            local_id: item._id || `saved-${index}`,
            title: item.title || "",
            content: item.content || "",
          }))
          : []
      );
      setEditingIndex(null);
      toast.success(res.data?.message || "Question bank updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save question bank");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Back
            </button>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              {lesson?.lesson_title || "Lesson Details"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {lesson?.course?.subject?.subject_name || "-"} /{" "}
              {lesson?.course?.course_name || "-"} / {lesson?.lesson_code || "-"}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleAddQuestionBank}
              disabled={!canAddQuestionBank}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={18} />
              Add Question Bank
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              <Save size={18} />
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
        {isLoading ? (
          <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-slate-500">
            Loading lesson details...
          </p>
        ) : questionBank.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center">
            <p className="text-slate-500">No question bank entries added yet.</p>
          </div>
        ) : (
          <div className="max-h-[38rem] overflow-y-auto pr-1 no-scrollbar">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {questionBank.map((item, index) => {
                const isEditing = editingIndex === index;

                return (
                  <div
                    key={item.local_id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="mb-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestionBank(index)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        title="Delete question block"
                        aria-label={`Delete question block ${index + 1}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {isEditing ? (
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(event) =>
                            handleQuestionBankChange(index, "title", event.target.value)
                          }
                          placeholder="Question bank title"
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                        />
                        <textarea
                          value={item.content}
                          onChange={(event) =>
                            handleQuestionBankChange(index, "content", event.target.value)
                          }
                          rows="8"
                          placeholder="Enter question bank content"
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setEditingIndex(null)}
                          className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                        >
                          Done editing
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingIndex(index)}
                        className="block w-full text-left"
                      >
                        <p className="text-lg font-semibold text-slate-900">
                          {item.title || `Question Bank ${index + 1}`}
                        </p>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                          {item.content || "Click to add question bank content"}
                        </p>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
