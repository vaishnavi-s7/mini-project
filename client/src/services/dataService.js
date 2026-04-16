import API from "./api";
 
/**
 * Create a student record through the API.
 */
export const createData = (data) => {
  return API.post("/students", data);
};
 
/**
 * Fetch all student records.
 */
export const getAllData = () => {
  return API.get("/students");
};
 
/**
 * Upload a CSV file for bulk student import.
 */
export const uploadCSV = (formData) => {
  return API.post("/students/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
