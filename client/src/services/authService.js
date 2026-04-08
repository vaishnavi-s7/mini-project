import API from "./api";

export const loginUser = (data) => API.post("/auth/login", data);
export const registerUser = (data) => API.post("/auth/register", data);
export const forgotPassword = (data) => API.post("/auth/forgot-password", data);
export const resetPassword = (data) => API.post("/auth/reset-password", data);
export const resendOTP = (data) => API.post("/auth/resend-otp", data);
export const getProfile = () => API.get("/auth/profile");
export const updateProfile = (data) =>
    API.put("/auth/profile", data);
export const changePassword = (data) =>
    API.put("/auth/change-password", data);