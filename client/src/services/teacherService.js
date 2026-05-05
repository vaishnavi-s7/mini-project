import API from "./api";

/**
 * Create a teacher account. The backend allows this for HOD users only.
 */
export const createTeacher = (data) => API.post("/teachers", data);

/**
 * Fetch all teacher accounts for the HOD dashboard.
 */
export const getTeachers = () => API.get("/teachers");
