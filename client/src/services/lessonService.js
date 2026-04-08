import API from "./api";

export const createLesson = (data) => API.post("/lessons", data);

export const getLessons = () => API.get("/lessons");

export const getLessonById = (id) => API.get(`/lessons/${id}`);

export const updateLesson = (id, data) => API.put(`/lessons/${id}`, data);

export const updateLessonQuestionBank = (id, data) =>
  API.put(`/lessons/${id}/question-bank`, data);
