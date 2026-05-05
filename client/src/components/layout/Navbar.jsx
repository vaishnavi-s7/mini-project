import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Menu, Plus, UserCircle, X } from "lucide-react";
import toast from "react-hot-toast";
import { createTeacher } from "../../services/teacherService";

/**
 * Render the main navigation bar and account menu.
 */
export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);
  const [teacherForm, setTeacherForm] = useState({
    username: "",
    email: "",
    subject: "",
    password: "Password01!",
  });
  const [isCreatingTeacher, setIsCreatingTeacher] = useState(false);
  const dropdownRef = useRef();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isHod = user?.role === "HOD";

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/upload-csv", label: "Upload" },
    { to: "/view-data", label: "Student Details" },
    { to: "/subject-master", label: "Subjects" },
    { to: "/course-master", label: "Courses" },
    { to: "/lesson-master", label: "Lessons" },
    { to: "/question-bank", label: "Question Bank" },
    { to: "/master-dashboard", label: "Dashboard" },
  ];

  const linkStyle = (path) =>
    `inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm sm:text-base font-medium transition ${location.pathname === path
      ? "bg-blue-600 text-white"
      : "text-gray-700 hover:bg-blue-100 hover:text-blue-700"
    }`;

  // Close the profile dropdown when clicking outside of it.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleTeacherFormChange = (event) => {
    const { name, value } = event.target;
    setTeacherForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetTeacherForm = () => {
    setTeacherForm({
      username: "",
      email: "",
      subject: "",
      password: "Password01!",
    });
  };

  const handleCreateTeacher = async (event) => {
    event.preventDefault();

    try {
      setIsCreatingTeacher(true);
      await createTeacher({
        username: teacherForm.username,
        email: teacherForm.email,
        subject: teacherForm.subject,
      });

      toast.success("Teacher created and welcome email sent");
      resetTeacherForm();
      setTeacherModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create teacher");
    } finally {
      setIsCreatingTeacher(false);
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between">

        {/* LOGO
        <h1
          className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 cursor-pointer"
          onClick={() => navigate("/")}
        >
          CSV Manager
        </h1> */}

        {/* DESKTOP NAV */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="flex flex-wrap justify-center gap-2">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className={linkStyle(link.to)}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE (DESKTOP) */}
        <div className="hidden md:flex items-center gap-4">

          {!user && (
            <button
              onClick={() => navigate("/login")}
              className="border-2 border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-600 hover:text-white transition"
            >
              Login
            </button>
          )}

          {user && (
            <>
              {isHod && (
                <button
                  type="button"
                  onClick={() => setTeacherModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Teacher
                </button>
              )}

            <div className="relative" ref={dropdownRef}>
              <UserCircle
                className="w-9 h-9 text-blue-600 cursor-pointer hover:scale-105 transition"
                onClick={() => setOpen(!open)}
              />

              {open && (
                <div className="absolute right-0 mt-2 w-52 bg-white shadow-lg rounded-xl border z-50 overflow-hidden">
                  <div className="px-4 py-2 border-b text-sm font-semibold">
                    {user?.name || "User"}
                  </div>

                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-blue-50"
                    onClick={() => setOpen(false)}
                  >
                    Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
            </>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <div className="md:hidden">
          <button onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenu && (
        <div className="md:hidden px-4 pb-4 pt-2 space-y-3">

          {/* LINKS */}
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={linkStyle(link.to)}
                onClick={() => setMobileMenu(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* AUTH */}
          <div className="pt-2 border-t">

            {!user && (
              <button
                onClick={() => {
                  navigate("/login");
                  setMobileMenu(false);
                }}
                className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-600 hover:text-white transition text-sm"
              >
                Login
              </button>
            )}

            {user && (
              <div className="flex flex-col gap-2">
                <div className="text-sm font-semibold">
                  {user?.name || "User"}
                </div>

                {isHod && (
                  <button
                    type="button"
                    onClick={() => {
                      setTeacherModalOpen(true);
                      setMobileMenu(false);
                    }}
                    className="inline-flex w-fit items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add Teacher
                  </button>
                )}

                <Link
                  to="/profile"
                  className="px-3 py-2 hover:bg-blue-50 rounded-md text-sm w-fit"
                  onClick={() => setMobileMenu(false)}
                >
                  Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-left px-3 py-2 text-red-500 hover:bg-red-50 rounded-md text-sm w-fit"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {teacherModalOpen && isHod && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Add Teacher</h2>
                <p className="mt-1 text-sm text-slate-500">
                  The default password is assigned automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTeacherModalOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close add teacher form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={teacherForm.username}
                  onChange={handleTeacherFormChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={teacherForm.email}
                  onChange={handleTeacherFormChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={teacherForm.subject}
                  onChange={handleTeacherFormChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  type="text"
                  value={teacherForm.password}
                  className="w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600"
                  disabled
                  readOnly
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTeacherModalOpen(false)}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTeacher}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isCreatingTeacher ? "Creating..." : "Create Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}
