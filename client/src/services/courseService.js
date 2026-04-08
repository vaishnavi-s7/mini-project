import API from "./api";

export const createCourse = (data) => API.post("/courses", data);

export const getCourses = () => API.get("/courses");

export const updateCourse = (id, data) => API.put(`/courses/${id}`, data);
