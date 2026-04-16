import API from "./api";

/**
 * Create a course record.
 */
export const createCourse = (data) => API.post("/courses", data);

/**
 * Fetch all courses.
 */
export const getCourses = () => API.get("/courses");

/**
 * Update an existing course.
 */
export const updateCourse = (id, data) => API.put(`/courses/${id}`, data);

/**
 * Delete a course by identifier.
 */
export const deleteCourse = (id) => API.delete(`/courses/${id}`);
