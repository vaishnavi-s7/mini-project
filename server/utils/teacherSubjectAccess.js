import User from "../models/User.js";

const normalizeValue = (value) =>
  String(value || "").trim().toLowerCase();

/**
 * Confirm the current user can manage content for the supplied subject.
 */
export const ensureCanManageSubject = async (req, subject, itemType = "content") => {
  const requester = await User.findById(req.user?.id).select("role subject");

  if (!requester) {
    return {
      allowed: false,
      status: 401,
      message: "Not authorized",
    };
  }

  if (requester.role === "HOD") {
    return { allowed: true, user: requester };
  }

  if (requester.role !== "TEACHER") {
    return {
      allowed: false,
      status: 403,
      message: "Only HODs and assigned teachers can manage courses or lessons",
    };
  }

  const assignedSubject = normalizeValue(requester.subject);
  const subjectName = normalizeValue(subject?.subject_name);
  const subjectCode = normalizeValue(subject?.subject_code);

  if (assignedSubject && (assignedSubject === subjectName || assignedSubject === subjectCode)) {
    return { allowed: true, user: requester };
  }

  return {
    allowed: false,
    status: 403,
    message: "You have not registered for this subject",
  };
};
