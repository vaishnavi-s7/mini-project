import API from "./api";

/**
 * Create a lesson record.
 */
export const createLesson = (data) => API.post("/lessons", data);

/**
 * Fetch all lessons.
 */
export const getLessons = () => API.get("/lessons");

/**
 * Fetch a single lesson by identifier.
 */
export const getLessonById = (id) => API.get(`/lessons/${id}`);

/**
 * Update a lesson.
 */
export const updateLesson = (id, data) => API.put(`/lessons/${id}`, data);

/**
 * Update only the question bank for a lesson.
 */
export const updateLessonQuestionBank = (id, data) =>
  API.put(`/lessons/${id}/question-bank`, data);

/**
 * Delete a lesson by identifier.
 */
export const deleteLesson = (id) => API.delete(`/lessons/${id}`);
