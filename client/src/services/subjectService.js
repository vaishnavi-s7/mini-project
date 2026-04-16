import API from "./api";
 
/**
 * Create a subject record.
 */
export const createSubject = (data) => API.post("/subjects", data);
 
/**
 * Fetch all subjects.
 */
export const getSubjects = () => API.get("/subjects");

/**
 * Update an existing subject.
 */
export const updateSubject = (id, data) => API.put(`/subjects/${id}`, data);

/**
 * Delete a subject by identifier.
 */
export const deleteSubject = (id) => API.delete(`/subjects/${id}`);
