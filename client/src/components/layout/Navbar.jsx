import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Menu, Plus, UserCircle, X } from "lucide-react";
import toast from "react-hot-toast";
import { createData } from "../../services/dataService";

/**
 * Render the teacher navigation bar and account menu.
 */
export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [open, setOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [isCreatingStudent, setIsCreatingStudent] = useState(false);
  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    grade: "",
    section: "",
  });

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/upload-csv", label: "Upload" },
    { to: "/view-data", label: "Student Details" },
    { to: "/course-master", label: "Courses" },
    { to: "/lesson-master", label: "Lessons" },
    { to: "/question-bank", label: "Question Bank" },
    { to: "/master-dashboard", label: "Dashboard" },
  ];

  const linkStyle = (path) =>
    `inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
      location.pathname === path
        ? "bg-blue-900 text-white"
        : "text-slate-700 hover:bg-blue-50 hover:text-blue-900"
    }`;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("auth-change"));
    navigate("/login");
  };

  const handleStudentFormChange = (event) => {
    const { name, value } = event.target;
    setStudentForm((previousValue) => ({ ...previousValue, [name]: value }));
  };

  const resetStudentForm = () => {
    setStudentForm({
      name: "",
      email: "",
      grade: "",
      section: "",
    });
  };

  const handleCreateStudent = async (event) => {
    event.preventDefault();

    try {
      setIsCreatingStudent(true);
      const response = await createData({
        name: studentForm.name,
        email: studentForm.email,
        grade: Number(studentForm.grade),
        section: studentForm.section,
      });

      toast.success(response.data?.message || "Student created successfully");
      resetStudentForm();
      setStudentModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create student");
    } finally {
      setIsCreatingStudent(false);
    }
  };

  return (
    <nav className="relative z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="hidden flex-1 justify-center md:flex">
          <div className="flex flex-wrap justify-center gap-2">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className={linkStyle(link.to)}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {!user && (
            <button
              onClick={() => navigate("/login")}
              className="rounded-md border-2 border-blue-900 px-4 py-2 text-blue-900 transition hover:bg-blue-900 hover:text-white"
            >
              Login
            </button>
          )}

          {user && (
            <>
              <button
                type="button"
                onClick={() => setStudentModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                <Plus className="h-4 w-4" />
                Add Student
              </button>

              <div className="relative" ref={dropdownRef}>
                <UserCircle
                  className="h-9 w-9 cursor-pointer text-slate-700 transition hover:scale-105"
                  onClick={() => setOpen((currentValue) => !currentValue)}
                />

                {open && (
                  <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                    <div className="border-b px-4 py-3 text-sm font-semibold text-slate-900">
                      {user?.name || "User"}
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-slate-700 hover:bg-blue-50 hover:text-blue-900"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="md:hidden">
          <button onClick={() => setMobileMenu((currentValue) => !currentValue)}>
            {mobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenu && (
        <div className="space-y-3 px-4 pb-4 pt-2 md:hidden">
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

          <div className="border-t pt-2">
            {!user && (
              <button
                onClick={() => {
                  navigate("/login");
                  setMobileMenu(false);
                }}
                className="rounded-md border border-blue-900 px-4 py-2 text-sm text-blue-900 transition hover:bg-blue-900 hover:text-white"
              >
                Login
              </button>
            )}

            {user && (
              <div className="flex flex-col gap-2">
                <div className="text-sm font-semibold">{user?.name || "User"}</div>

                <button
                  type="button"
                  onClick={() => {
                    setStudentModalOpen(true);
                    setMobileMenu(false);
                  }}
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                  <Plus className="h-4 w-4" />
                  Add Student
                </button>

                <button
                  onClick={handleLogout}
                  className="w-fit rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-900"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {studentModalOpen && user && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Add Student</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Create a new student record directly from the teacher navbar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStudentModalOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close add student form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={studentForm.name}
                  onChange={handleStudentFormChange}
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
                  value={studentForm.email}
                  onChange={handleStudentFormChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Grade
                  </label>
                  <input
                    type="number"
                    name="grade"
                    min="1"
                    max="10"
                    value={studentForm.grade}
                    onChange={handleStudentFormChange}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Section
                  </label>
                  <input
                    type="text"
                    name="section"
                    value={studentForm.section}
                    onChange={handleStudentFormChange}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm uppercase outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStudentModalOpen(false)}
                  className="rounded-md border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-900 transition hover:bg-blue-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingStudent}
                  className="rounded-md bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isCreatingStudent ? "Creating..." : "Create Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}
