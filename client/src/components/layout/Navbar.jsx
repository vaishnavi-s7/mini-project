import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Menu, UserCircle, X } from "lucide-react";

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
    `inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm sm:text-base font-medium transition ${
      location.pathname === path
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-blue-100 hover:text-blue-700"
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
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md">
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
              className="rounded-md border-2 border-blue-600 px-4 py-2 text-blue-600 transition hover:bg-blue-600 hover:text-white"
            >
              Login
            </button>
          )}

          {user && (
            <div className="relative" ref={dropdownRef}>
              <UserCircle
                className="h-9 w-9 cursor-pointer text-blue-600 transition hover:scale-105"
                onClick={() => setOpen((currentValue) => !currentValue)}
              />

              {open && (
                <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border bg-white shadow-lg">
                  <div className="border-b px-4 py-2 text-sm font-semibold">
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
                    className="w-full px-4 py-2 text-left text-red-500 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
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
                className="rounded-md border border-blue-600 px-4 py-2 text-sm text-blue-600 transition hover:bg-blue-600 hover:text-white"
              >
                Login
              </button>
            )}

            {user && (
              <div className="flex flex-col gap-2">
                <div className="text-sm font-semibold">{user?.name || "User"}</div>

                <Link
                  to="/profile"
                  className="w-fit rounded-md px-3 py-2 text-sm hover:bg-blue-50"
                  onClick={() => setMobileMenu(false)}
                >
                  Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-fit rounded-md px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
