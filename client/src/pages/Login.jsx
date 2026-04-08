import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await loginUser(form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Login successful");
      navigate("/");
    } catch (err) {
      console.log("FULL ERROR 👉", err);
      console.log("RESPONSE 👉", err.response);

      let message = "";

      // 👇 SAFE extraction
      if (err.response && err.response.data) {
        message = err.response.data.message;
      }

      // 👇 fallback (VERY IMPORTANT)
      if (!message) {
        message = err.message;
      }

      // 👇 now handle properly
      if (message === "User not found") {
        toast.error("User not registered. Please register and login.");
      }
      else if (message === "Invalid password") {
        toast.error("Wrong password. Enter valid password to login.");
      }
      else {
        toast.error(message || "Login failed");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-600 px-4">

      <div className="bg-white w-full max-w-lg p-10 rounded-2xl shadow-2xl">

        {/* TITLE */}
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Welcome Back
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Login to continue managing your CSV data
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700"
            required
          />

          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-gray-600 hover:text-black">
              Forgot Password?
            </Link>
          </div>

          <button className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-black transition cursor-pointer">
            Login
          </button>
        </form>

        {/* FOOTER */}
        <p className="text-center mt-6 text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link to="/register" className="text-gray-900 font-medium hover:underline">
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}