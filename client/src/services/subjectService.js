import API from "./api";
 
export const createSubject = (data) => API.post("/subjects", data);
 
export const getSubjects = () => API.get("/subjects");
 
export const updateSubject = (id, data) => API.put(`/subjects/${id}`, data);
 
 