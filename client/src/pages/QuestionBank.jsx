import { BookOpen, BookText, Layers, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getLessons } from "../services/lessonService";

const normalize = (value) => String(value || "").toLowerCase();

const suggestionScore = (value, query) => {
  const normalizedValue = normalize(value);
  const normalizedQuery = normalize(query.trim());

  if (!normalizedQuery) return 0;
  if (normalizedValue === normalizedQuery) return 0;
  if (normalizedValue.startsWith(normalizedQuery)) return 1;
  if (normalizedValue.includes(normalizedQuery)) return 2;
  return 3;
};

const SearchField = ({
  fieldKey,
  label,
  placeholder,
  value,
  onChange,
  suggestions,
  onSelectSuggestion,
  activeField,
  setActiveField,
}) => (
  <div className="relative w-full">
    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
      {label}
    </label>
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setActiveField(fieldKey)}
        onBlur={() => {
          window.setTimeout(() => {
            setActiveField((current) => (current === fieldKey ? "" : current));
          }, 120);
        }}
      />
    </div>

    {activeField === fieldKey && value.trim() && suggestions.length > 0 && (
      <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelectSuggestion(suggestion)}
            className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
          >
            <span>{suggestion}</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-300">Suggestion</span>
          </button>
        ))}
      </div>
    )}
  </div>
);

export default function QuestionBank() {
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generalSearch, setGeneralSearch] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [lessonSearch, setLessonSearch] = useState("");
  const [activeField, setActiveField] = useState("");

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        const res = await getLessons();
        setLessons(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load question bank");
        setLessons([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, []);

  const allQuestions = useMemo(() => {
    return lessons.flatMap((lesson) => {
      const banks = Array.isArray(lesson.question_bank) ? lesson.question_bank : [];

      return banks.map((bank, index) => ({
        id: bank._id || `${lesson._id}-${index}`,
        title: bank.title || `Question Bank ${index + 1}`,
        content: bank.content || "",
        lessonTitle: lesson.lesson_title || "-",
        lessonCode: lesson.lesson_code || "-",
        courseName: lesson.course?.course_name || "-",
        courseCode: lesson.course?.course_code || "-",
        subjectName: lesson.course?.subject?.subject_name || "-",
        subjectCode: lesson.course?.subject?.subject_code || "-",
      }));
    });
  }, [lessons]);

  const subjectOptions = useMemo(() => {
    return Array.from(new Set(allQuestions.map((question) => question.subjectName).filter(Boolean)));
  }, [allQuestions]);

  const courseOptions = useMemo(() => {
    return Array.from(new Set(allQuestions.map((question) => question.courseName).filter(Boolean)));
  }, [allQuestions]);

  const lessonOptions = useMemo(() => {
    return Array.from(new Set(allQuestions.map((question) => question.lessonTitle).filter(Boolean)));
  }, [allQuestions]);

  const generalOptions = useMemo(() => {
    return Array.from(
      new Set(
        allQuestions
          .flatMap((question) => [question.title, question.subjectName, question.courseName, question.lessonTitle])
          .filter(Boolean)
      )
    );
  }, [allQuestions]);

  const getSuggestions = (options, query) =>
    options
      .filter((option) => normalize(option).includes(normalize(query)))
      .sort((a, b) => suggestionScore(a, query) - suggestionScore(b, query) || a.localeCompare(b))
      .slice(0, 5);

  const subjectSuggestions = useMemo(
    () => getSuggestions(subjectOptions, subjectSearch),
    [subjectOptions, subjectSearch]
  );

  const courseSuggestions = useMemo(
    () => getSuggestions(courseOptions, courseSearch),
    [courseOptions, courseSearch]
  );

  const lessonSuggestions = useMemo(
    () => getSuggestions(lessonOptions, lessonSearch),
    [lessonOptions, lessonSearch]
  );

  const generalSuggestions = useMemo(
    () => getSuggestions(generalOptions, generalSearch),
    [generalOptions, generalSearch]
  );

  const clearFilters = () => {
    setGeneralSearch("");
    setSubjectSearch("");
    setCourseSearch("");
    setLessonSearch("");
    setActiveField("");
  };

  const filteredQuestions = useMemo(() => {
    const generalQuery = normalize(generalSearch.trim());
    const subjectQuery = normalize(subjectSearch.trim());
    const courseQuery = normalize(courseSearch.trim());
    const lessonQuery = normalize(lessonSearch.trim());

    return allQuestions.filter((question) => {
      const generalMatch =
        !generalQuery ||
        [
          question.title,
          question.content,
          question.lessonTitle,
          question.lessonCode,
          question.courseName,
          question.courseCode,
          question.subjectName,
          question.subjectCode,
        ]
          .filter(Boolean)
          .some((value) => normalize(value).includes(generalQuery));

      const subjectMatch =
        !subjectQuery || normalize(question.subjectName).includes(subjectQuery) || normalize(question.subjectCode).includes(subjectQuery);

      const courseMatch =
        !courseQuery || normalize(question.courseName).includes(courseQuery) || normalize(question.courseCode).includes(courseQuery);

      const lessonMatch =
        !lessonQuery || normalize(question.lessonTitle).includes(lessonQuery) || normalize(question.lessonCode).includes(lessonQuery);

      return generalMatch && subjectMatch && courseMatch && lessonMatch;
    });
  }, [allQuestions, courseSearch, generalSearch, lessonSearch, subjectSearch]);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <main className="flex min-h-screen flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <div className="mb-5 grid gap-3 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end">
          <SearchField
            fieldKey="general"
            label="General Search"
            placeholder="Search questions..."
            value={generalSearch}
            onChange={setGeneralSearch}
            suggestions={generalSuggestions}
            onSelectSuggestion={(value) => {
              setGeneralSearch(value);
              setActiveField("");
            }}
            activeField={activeField}
            setActiveField={setActiveField}
          />
          <SearchField
            fieldKey="subject"
            label="Subject Search"
            placeholder="Type a subject..."
            value={subjectSearch}
            onChange={setSubjectSearch}
            suggestions={subjectSuggestions}
            onSelectSuggestion={(value) => {
              setSubjectSearch(value);
              setActiveField("");
            }}
            activeField={activeField}
            setActiveField={setActiveField}
          />
          <SearchField
            fieldKey="course"
            label="Course Search"
            placeholder="Type a course..."
            value={courseSearch}
            onChange={setCourseSearch}
            suggestions={courseSuggestions}
            onSelectSuggestion={(value) => {
              setCourseSearch(value);
              setActiveField("");
            }}
            activeField={activeField}
            setActiveField={setActiveField}
          />
          <SearchField
            fieldKey="lesson"
            label="Lesson Search"
            placeholder="Type a lesson..."
            value={lessonSearch}
            onChange={setLessonSearch}
            suggestions={lessonSuggestions}
            onSelectSuggestion={(value) => {
              setLessonSearch(value);
              setActiveField("");
            }}
            activeField={activeField}
            setActiveField={setActiveField}
          />
          <div className="flex items-end justify-center">
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-[46px] w-[46px] items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              title="Clear filters"
              aria-label="Clear filters"
            >
              <X size={18} strokeWidth={2.75} />
            </button>
          </div>
        </div>

        <div className="mt-4 flex h-[calc(100vh-140px)] flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-white/50 shadow-xl shadow-slate-200/50 backdrop-blur-sm">
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b bg-white/90 p-4">
              <div className="flex items-center gap-2">
                <BookText className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Question Bank</h2>
              </div>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                {filteredQuestions.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-slate-500">Loading question bank...</p>
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center space-y-2 text-slate-400">
                  <BookOpen className="h-8 w-8 opacity-20" />
                  <p className="text-xs font-medium">No questions found</p>
                </div>
              ) : (
                <div className="grid max-h-[34rem] grid-cols-1 gap-4 overflow-y-auto pr-1 lg:grid-cols-2">
                  {filteredQuestions.map((question) => (
                    <div
                      key={question.id}
                      className="min-h-[168px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-slate-900">{question.title}</h3>
                          <p className="mt-1 text-xs text-slate-400">
                            {question.subjectName} / {question.courseName} / {question.lessonTitle}
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-2 text-slate-400">
                          <Layers className="h-4 w-4" />
                        </div>
                      </div>

                      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {question.content || "No question content"}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-blue-700">
                          {question.subjectCode}
                        </span>
                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-700">
                          {question.courseCode}
                        </span>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                          {question.lessonCode}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
