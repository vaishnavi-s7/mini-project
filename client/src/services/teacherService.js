import API from "./api";

/**
 * Create a teacher account. The backend allows this for HOD users only.
 */
export const createTeacher = (data) => API.post("/teachers", data);
