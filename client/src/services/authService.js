import API from "./api";

/**
 * Send login credentials to the backend.
 */
export const loginUser = (data) => API.post("/auth/login", data);

/**
 * Register a new user account.
 */
export const registerUser = (data) => API.post("/auth/register", data);

/**
 * Request a password reset OTP.
 */
export const forgotPassword = (data) => API.post("/auth/forgot-password", data);

/**
 * Submit a new password after OTP verification.
 */
export const resetPassword = (data) => API.post("/auth/reset-password", data);

/**
 * Request a fresh OTP for password reset.
 */
export const resendOTP = (data) => API.post("/auth/resend-otp", data);

/**
 * Fetch the current authenticated user's profile.
 */
export const getProfile = () => API.get("/auth/profile");

/**
 * Update the current authenticated user's profile details.
 */
export const updateProfile = (data) =>
    API.put("/auth/profile", data);

/**
 * Change the current authenticated user's password.
 */
export const changePassword = (data) =>
    API.put("/auth/change-password", data);
