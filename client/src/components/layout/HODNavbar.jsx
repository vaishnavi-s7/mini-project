import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Menu, Plus, UserCircle, X } from "lucide-react";
import toast from "react-hot-toast";
import { createTeacher } from "../../services/teacherService";

const navLinks = [
  { to: "/hod-dashboard", label: "Overview" },
  { to: "/subject-master", label: "Subjects" },
  { to: "/hod-faculty-overview", label: "Faculty Overview" },
  { to: "/hod-announcements", label: "Announcements" },
  { to: "/hod-student-details", label: "Student Details" },
];

export default function HODNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isHod = user?.role === "HOD";

  const [open, setOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);
  const [isCreatingTeacher, setIsCreatingTeacher] = useState(false);
  const [teacherForm, setTeacherForm] = useState({
    username: "",
    email: "",
    subject: "",
    password: "Password01!",
  });

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

  useEffect(() => {
    if (!teacherModalOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [teacherModalOpen]);

  const handleTeacherFormChange = (event) => {
    const { name, value } = event.target;
    setTeacherForm((previousValue) => ({ ...previousValue, [name]: value }));
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

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("auth-change"));
    navigate("/login");
  };

  return (
    <>
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
            <button
              type="button"
              onClick={() => setTeacherModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              <Plus className="h-4 w-4" />
              Add Teacher
            </button>

            <div className="relative" ref={dropdownRef}>
              <UserCircle
                className="h-9 w-9 cursor-pointer text-slate-700 transition hover:scale-105"
                onClick={() => setOpen((currentValue) => !currentValue)}
              />

              {open && (
                <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                  <div className="border-b px-4 py-3 text-sm font-semibold text-slate-900">
                    {user?.name || user?.username || "HOD"}
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-900"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button type="button" onClick={() => setMobileMenu((currentValue) => !currentValue)}>
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

            <div className="border-t pt-3">
              <div className="mb-2 text-sm font-semibold text-slate-900">
                {user?.name || user?.username || "HOD"}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTeacherModalOpen(true);
                    setMobileMenu(false);
                  }}
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  <Plus className="h-4 w-4" />
                  Add Teacher
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-fit rounded-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-900"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Centered Modal Overlay */}
      {teacherModalOpen && isHod && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 sm:p-6">
          <div className="w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Add Teacher</h2>
                <p className="mt-1 text-sm text-slate-500">
                  The default password is assigned automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTeacherModalOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close add teacher form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="flex-1 overflow-y-auto space-y-4 pr-1">
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

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTeacherModalOpen(false)}
                  className="rounded-md border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-900 transition hover:bg-blue-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTeacher}
                  className="rounded-md bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isCreatingTeacher ? "Creating..." : "Create Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
