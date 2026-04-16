import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../services/authService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

/**
 * Render the authenticated user's profile page.
 */
export default function Profile() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        grade: "",
        section: "",
        phone: "",
        age: "",
        address: "",
    });

    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    // 🔥 NEW STATES FOR DROPDOWN
    const [gradeOpen, setGradeOpen] = useState(false);
    const [sectionOpen, setSectionOpen] = useState(false);

    const grades = Array.from({ length: 12 }, (_, i) => i + 1);
    const sections = ["A", "B", "C", "D"];

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await getProfile();
            setForm({
                name: res.data.name || "",
                email: res.data.email || "",
                grade: res.data.grade || "",
                section: res.data.section || "",
                phone: res.data.phone || "",
                age: res.data.age || "",
                address: res.data.address || "",
            });
            setLoading(false);
        } catch (err) {
            console.log(err);
            toast.error("Failed to load profile");
            setLoading(false);
        }
    };

    const handleChange = (name, value) => {
        setForm({ ...form, [name]: value });
    };

    const handleUpdate = async () => {
        if (!form.grade || form.grade < 1 || form.grade > 12) {
            return toast.error("Grade must be between 1 and 12");
        }

        if (!["A", "B", "C", "D"].includes(form.section)) {
            return toast.error("Section must be A to D");
        }

        if (!form.age || form.age < 5 || form.age > 19) {
            return toast.error("Age must be between 5 and 19");
        }

        if (!/^\d{10}$/.test(form.phone)) {
            return toast.error("Phone must be exactly 10 digits");
        }

        try {
            await updateProfile({
                phone: form.phone,
                age: form.age,
                address: form.address,
                grade: form.grade,
                section: form.section,
            });

            setEditing(false);
            toast.success("Profile updated successfully");
        } catch (err) {
            console.log(err);
            toast.error("Update failed");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-lg font-medium">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex justify-center items-center px-4">

            <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl p-5 sm:p-8 md:p-10">

                <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
                    Profile
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Name */}
                    <div>
                        <label className="label">Name</label>
                        <input value={form.name} disabled className="input w-full" />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="label">Email</label>
                        <input value={form.email} disabled className="input w-full" />
                    </div>

                    {/* 🔥 CUSTOM GRADE DROPDOWN */}
                    <div className="relative">
                        <label className="label">Grade</label>

                        <div
                            onClick={() => editing && setGradeOpen(!gradeOpen)}
                            className="input w-full cursor-pointer flex justify-between items-center"
                        >
                            {form.grade || "Select Grade"}
                            <span>▼</span>
                        </div>

                        {gradeOpen && (
                            <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow max-h-60 overflow-y-auto">
                                {grades.map((g) => (
                                    <div
                                        key={g}
                                        onClick={() => {
                                            handleChange("grade", g);
                                            setGradeOpen(false);
                                        }}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    >
                                        {g}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 🔥 CUSTOM SECTION DROPDOWN */}
                    <div className="relative">
                        <label className="label">Section</label>

                        <div
                            onClick={() => editing && setSectionOpen(!sectionOpen)}
                            className="input w-full cursor-pointer flex justify-between items-center"
                        >
                            {form.section || "Select Section"}
                            <span>▼</span>
                        </div>

                        {sectionOpen && (
                            <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow">
                                {sections.map((sec) => (
                                    <div
                                        key={sec}
                                        onClick={() => {
                                            handleChange("section", sec);
                                            setSectionOpen(false);
                                        }}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    >
                                        {sec}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="label">Phone</label>
                        <input
                            name="phone"
                            value={form.phone}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                if (value.length <= 10) {
                                    setForm({ ...form, phone: value });
                                }
                            }}
                            disabled={!editing}
                            className="input w-full"
                        />
                    </div>

                    {/* Age */}
                    <div>
                        <label className="label">Age</label>
                        <input
                            type="number"
                            name="age"
                            value={form.age}
                            onChange={(e) => handleChange("age", e.target.value)}
                            disabled={!editing}
                            className="input w-full"
                        />
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                        <label className="label">Address</label>
                        <textarea
                            name="address"
                            value={form.address}
                            onChange={(e) => handleChange("address", e.target.value)}
                            disabled={!editing}
                            className="input w-full h-24 resize-none"
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:justify-between">

                    <button
                        onClick={() => navigate("/change-password")}
                        className="px-5 py-2 border border-gray-400 rounded-lg w-full sm:w-auto"
                    >
                        Change Password
                    </button>

                    {!editing ? (
                        <button
                            onClick={() => setEditing(true)}
                            className="btn-primary w-full sm:w-auto px-5 py-2"
                        >
                            Edit Profile
                        </button>
                    ) : (
                        <button
                            onClick={handleUpdate}
                            className="btn-primary w-full sm:w-auto px-5 py-2"
                        >
                            Update Profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
