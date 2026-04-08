import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="bg-gray-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">

        <h1
          className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold cursor-pointer truncate"
          onClick={() => navigate("/")}
        >
          Student Management System
        </h1>

      </div>
    </header>
  );
}