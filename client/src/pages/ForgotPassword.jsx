import { useState } from "react";
import { forgotPassword } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

/**
 * Render the password reset request form.
 */
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await forgotPassword({ email });

      // STORE EMAIL
      localStorage.setItem("resetEmail", email);

      toast.success("OTP sent to your email");

      navigate("/reset-password");

    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="bg-gray-100 px-4 py-6">

      <div className="max-w-5xl mx-auto">

        {/* DARK CONTAINER */}
        <div className="bg-gradient-to-br from-gray-700 to-gray-600 rounded-2xl py-8 px-8 sm:py-8 sm:px-8">

          {/* WHITE CARD */}
          <div className="bg-white w-full max-w-md sm:max-w-lg mx-auto p-6 sm:p-10 rounded-2xl shadow-xl">

            <h2 className="text-xl sm:text-3xl font-bold text-center mb-3">
              Forgot Password
            </h2>

            <p className="text-center text-gray-500 text-sm sm:text-base mb-6">
              Enter your email to receive an OTP
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
                required
              />

              <button className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-black transition cursor-pointer">
                Send OTP
              </button>
            </form>

            <p className="text-center mt-6 text-sm text-gray-600">
              Remember your password?{" "}
              <Link
                to="/login"
                className="text-gray-900 font-medium hover:underline"
              >
                Login
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
