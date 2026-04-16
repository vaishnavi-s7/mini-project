import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authService";
import { validatePassword } from "../utils/validator";
import { toast } from "react-toastify";

/**
 * Render the account registration form.
 */
export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const validation = validatePassword(form.password);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validation.valid) {
      toast.error("Weak password! Please follow the rules.");
      return;
    }

    try {
      await registerUser(form);
      toast.success("Account created successfully");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const ruleStyle = (cond) =>
    cond ? "text-green-600" : "text-red-500";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-600 px-4">

      <div className="bg-white w-full max-w-lg p-10 rounded-2xl shadow-2xl">

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Create Account
        </h2>

        <p className="text-center text-gray-500 mb-8">
          Sign up to start managing your CSV data
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />

          {/* 🔥 PASSWORD RULE BOX */}
          <div className="relative">
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700"
              required
            />

            {form.password && (
              <div className="absolute top-0 left-full ml-4 w-64 bg-white border rounded-xl shadow-lg p-3 text-sm space-y-1 z-10">

                <p className={ruleStyle(validation.length)}>
                  {validation.length ? "✔" : "❌"} 6–24 characters
                </p>

                <p className={ruleStyle(validation.uppercase)}>
                  {validation.uppercase ? "✔" : "❌"} One uppercase letter
                </p>

                <p className={ruleStyle(validation.special)}>
                  {validation.special ? "✔" : "❌"} One special character
                </p>

                <p className={ruleStyle(validation.number)}>
                  {validation.number ? "✔" : "❌"} One number
                </p>

                {/* STATUS */}
                {!validation.valid && (
                  <p className="text-red-600 font-semibold mt-1">
                    Weak password
                  </p>
                )}

                {validation.valid && (
                  <p className="text-green-600 font-semibold mt-1">
                    Strong password
                  </p>
                )}
              </div>
            )}
          </div>

          <button className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-black transition">
            Register
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-gray-900 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
