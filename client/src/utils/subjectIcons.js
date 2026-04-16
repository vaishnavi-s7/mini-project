const subjectIconModules = import.meta.glob("../assets/*.{png,jpg,jpeg,svg}", {
  eager: true,
  import: "default",
});

/**
 * Build a lookup map from local asset file names to imported icon URLs.
 */
const SUBJECT_ICON_MAP = Object.fromEntries(
  Object.entries(subjectIconModules).map(([path, icon]) => {
    const fileName = path.split("/").pop() || "";
    const subjectKey = fileName.replace(/\.[^/.]+$/, "").toLowerCase();

    return [subjectKey, icon];
  })
);

const normalizeValue = (value) =>
  value?.trim().toLowerCase().replace(/[_-]+/g, " ") || "";

/**
 * Resolve the best matching local icon for a subject.
 * Falls back to an empty string when there is no match.
 */
export const getLocalSubjectIcon = (subject) => {
  const name = normalizeValue(subject?.subject_name);
  const code = normalizeValue(subject?.subject_code);
  const firstWord = name.split(/\s+/)[0];

  if (name && SUBJECT_ICON_MAP[name]) {
    return SUBJECT_ICON_MAP[name];
  }

  if (firstWord && SUBJECT_ICON_MAP[firstWord]) {
    return SUBJECT_ICON_MAP[firstWord];
  }

  if (code && SUBJECT_ICON_MAP[code]) {
    return SUBJECT_ICON_MAP[code];
  }

  return "";
};
