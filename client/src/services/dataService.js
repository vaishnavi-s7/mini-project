import API from "./api";

/* create student */
export const createData = (data) => {
  return API.post("/students", data);
};

/* get all students */
export const getAllData = () => {
  return API.get("/students");
};

/* upload csv */
export const uploadCSV = (formData) => {
  return API.post("/students/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};