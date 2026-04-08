import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../services/authService";
import { validatePassword } from "../utils/validator";
import toast from "react-hot-toast";

export default function ChangePassword() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const validation = validatePassword(form.newPassword);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validation.valid) {
            return toast.error("Weak password! Please follow the rules.");
        }

        if (form.newPassword !== form.confirmPassword) {
            return toast.error("Passwords do not match");
        }

        try {
            await changePassword(form);
            toast.success("Password updated successfully");
            navigate("/profile");
        } catch (err) {
            toast.error(err.response?.data?.message || "Update failed");
        }
    };

    const ruleStyle = (cond) =>
        cond ? "text-green-600" : "text-red-500";

    return (
        <div className="bg-gray-100 px-4 py-4">

            <div className="max-w-5xl mx-auto">
                <div className="bg-gradient-to-br from-gray-700 to-gray-600 rounded-2xl py-16 sm:py-20 px-4 sm:px-6 relative">

                    {/* BACK BUTTON */}
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-4 left-4 sm:top-6 sm:left-6 text-white bg-white/10 px-3 py-2 sm:px-4 rounded-lg hover:bg-white/20 transition"
                    >
                        ← Back
                    </button>

                    {/* CARD */}
                    <div className="flex justify-center">
                        <div className="bg-white w-full max-w-lg p-6 sm:p-10 rounded-2xl shadow-xl mt-3">

                            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">
                                Change Password
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-5">

                                <input
                                    type="password"
                                    name="currentPassword"
                                    placeholder="Current Password"
                                    onChange={handleChange}
                                    className="input"
                                    required
                                />

                                {/* 🔥 NEW PASSWORD WITH VALIDATION */}
                                <div className="relative">
                                    <input
                                        type="password"
                                        name="newPassword"
                                        placeholder="New Password"
                                        onChange={handleChange}
                                        className="input"
                                        required
                                    />

                                    {form.newPassword && (
                                        <div className="mt-2 sm:absolute sm:top-0 sm:left-full sm:ml-4 w-full sm:w-64 bg-white border rounded-xl shadow-lg p-3 text-sm space-y-1 z-10">

                                            <p className={ruleStyle(validation.length)}>
                                                {validation.length ? "✔" : "❌"} 6–24 characters
                                            </p>

                                            <p className={ruleStyle(validation.uppercase)}>
                                                {validation.uppercase ? "✔" : "❌"} One uppercase letter
                                            </p>

                                            <p className={ruleStyle(validation.special)}>
                                                {validation.special ? "✔" : "❌"} One special character
                                            </p>

                                            <p className={ruleStyle(validation.number)}>
                                                {validation.number ? "✔" : "❌"} One number
                                            </p>

                                            {!validation.valid && (
                                                <p className="text-red-600 font-semibold mt-1">
                                                    Weak password
                                                </p>
                                            )}

                                            {validation.valid && (
                                                <p className="text-green-600 font-semibold mt-1">
                                                    Strong password
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    onChange={handleChange}
                                    className="input"
                                    required
                                />

                                <button className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-black transition">
                                    Update Password
                                </button>

                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}