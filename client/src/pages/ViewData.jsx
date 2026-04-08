import { useEffect, useState } from "react";
import { getAllData } from "../services/dataService";
import { useNavigate } from "react-router-dom";

export default function ViewData() {
  const [data, setData] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // const [gradeOpen, setGradeOpen] = useState(false);
  // const [sectionOpen, setSectionOpen] = useState(false);
  // const [sortOpen, setSortOpen] = useState(false);

  const [openDropdown, setOpenDropdown] = useState(null);

  const grades = Array.from({ length: 10 }, (_, i) => i + 1);
  const sections = ["A", "B", "C", "D"];

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    setIsAuthenticated(true);

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getAllData();

        const students = Array.isArray(res?.data?.data)
          ? res.data.data
          : [];

        setData(students);

      } catch (err) {
        setError("Failed to load data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = (Array.isArray(data) ? data : [])
    .filter((student) =>
      (student?.name || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .filter((student) =>
      gradeFilter
        ? String(student?.grade || "").trim() === String(gradeFilter)
        : true
    )
    .filter((student) =>
      sectionFilter
        ? (student?.section || "").trim().toUpperCase() === sectionFilter
        : true
    )
    .sort((a, b) => {
      const nameA = a?.name || "";
      const nameB = b?.name || "";

      return sortOrder === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });

  return (
    <div className={`relative min-h-screen px-3 sm:px-6 ${!isAuthenticated ? "overflow-hidden" : ""}`}>

      <div className={`${!isAuthenticated ? "blur-sm pointer-events-none" : ""}`}>
        <div className="max-w-7xl mx-auto py-6">

          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left">
            Student Records
          </h2>

          {loading && <p className="text-center text-gray-500">Loading data...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {!loading && !error && (
            <>
              {/* FILTERS */}
              <div className="bg-white p-4 sm:p-5 rounded-xl shadow mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* SEARCH */}
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="p-2 border rounded-lg w-full"
                />

                {/* 🔥 GRADE DROPDOWN */}
                <div className="relative">
                  <div
                    onClick={() =>
                      setOpenDropdown(openDropdown === "grade" ? null : "grade")
                    }
                    className="p-2 border rounded-lg cursor-pointer flex justify-between"
                  >
                    {gradeFilter ? `Grade ${gradeFilter}` : "All Grades"}
                    <span>▼</span>
                  </div>

                  {openDropdown === "grade" && (
                    <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow max-h-60 overflow-y-auto">
                      <div
                        onClick={() => {
                          setGradeFilter("");
                          setOpenDropdown(null);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        All Grades
                      </div>

                      {grades.map((g) => (
                        <div
                          key={g}
                          onClick={() => {
                            setGradeFilter(g);
                            setOpenDropdown(null);
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          Grade {g}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 🔥 SECTION DROPDOWN */}
                <div className="relative">
                  <div
                    onClick={() =>
                      setOpenDropdown(openDropdown === "section" ? null : "section")
                    }
                    className="p-2 border rounded-lg cursor-pointer flex justify-between"
                  >
                    {sectionFilter ? `Section ${sectionFilter}` : "All Sections"}
                    <span>▼</span>
                  </div>

                  {openDropdown === "section" && (
                    <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow">
                      <div
                        onClick={() => {
                          setSectionFilter("");
                          setOpenDropdown(null);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        All Sections
                      </div>

                      {sections.map((sec) => (
                        <div
                          key={sec}
                          onClick={() => {
                            setSectionFilter(sec);
                            setOpenDropdown(null);
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          Section {sec}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 🔥 SORT DROPDOWN */}
                <div className="relative">
                  <div
                    onClick={() =>
                      setOpenDropdown(openDropdown === "sort" ? null : "sort")
                    }
                    className="p-2 border rounded-lg cursor-pointer flex justify-between"
                  >
                    {sortOrder === "asc" ? "Name: A → Z" : "Name: Z → A"}
                    <span>▼</span>
                  </div>

                  {openDropdown === "sort" && (
                    <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow">
                      <div
                        onClick={() => {
                          setSortOrder("asc");
                          setOpenDropdown(null);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        Name: A → Z
                      </div>

                      <div
                        onClick={() => {
                          setSortOrder("desc");
                          setOpenDropdown(null);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        Name: Z → A
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* TABLE + MOBILE SAME AS BEFORE */}
              <div className="bg-white shadow rounded-xl overflow-hidden">
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full border-collapse min-w-[600px]">
                    <thead className="bg-gray-100 text-sm">
                      <tr>
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">Email</th>
                        <th className="p-3 text-left">Grade</th>
                        <th className="p-3 text-left">Section</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.length > 0 ? (
                        filteredData.map((student, index) => (
                          <tr key={index} className="border-t hover:bg-gray-50 text-sm">
                            <td className="p-3">{student?.name || "-"}</td>
                            <td className="p-3 break-all">{student?.email || "-"}</td>
                            <td className="p-3">{student?.grade || "-"}</td>
                            <td className="p-3">{student?.section || "-"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center p-4 text-gray-500">
                            No data found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden p-3 space-y-3">
                  {filteredData.length > 0 ? (
                    filteredData.map((student, index) => (
                      <div key={index} className="border rounded-lg p-3 shadow-sm">
                        <p className="font-semibold">{student?.name || "-"}</p>
                        <p className="text-sm text-gray-500 break-all">{student?.email || "-"}</p>
                        <div className="flex justify-between mt-2 text-sm">
                          <span>Grade: {student?.grade || "-"}</span>
                          <span>Section: {student?.section || "-"}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">No data found</p>
                  )}
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {!isAuthenticated && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm">
          <p className="text-lg font-semibold">Please login to access</p>
        </div>
      )}
    </div>
  );
}