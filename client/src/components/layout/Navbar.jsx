import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { UserCircle, Menu, X } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const dropdownRef = useRef();

  const user = JSON.parse(localStorage.getItem("user"));

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/upload-csv", label: "Upload CSV" },
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

  // Close dropdown when clicking outside
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
    </nav>
  );
}
