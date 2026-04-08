import API from "./api";

export const createLesson = (data) => API.post("/lessons", data);

export const getLessons = () => API.get("/lessons");

export const updateLesson = (id, data) => API.put(`/lessons/${id}`, data);
