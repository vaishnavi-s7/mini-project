import { useState, useEffect } from "react";
import { resetPassword, resendOTP } from "../services/authService";
import { useNavigate, Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { validatePassword } from "../utils/validator";

export default function ResetPassword() {
  const [form, setForm] = useState({
    otpArray: ["", "", "", "", "", ""],
    newPassword: "",
  });

  const [timer, setTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // GET EMAIL FROM URL OR LOCAL STORAGE
  const queryParams = new URLSearchParams(location.search);
  const emailFromURL = queryParams.get("email");
  const otpFromURL = queryParams.get("otp");

  const email =
    emailFromURL || localStorage.getItem("resetEmail");

  const validation = validatePassword(form.newPassword);

  // STORE EMAIL + AUTO-FILL OTP
  useEffect(() => {
    if (email) {
      localStorage.setItem("resetEmail", email);
    } else {
      navigate("/forgot-password");
    }

    if (otpFromURL) {
      const splitOtp = otpFromURL.split("");
      setForm((prev) => ({
        ...prev,
        otpArray: splitOtp,
      }));
    }
  }, []);

  // TIMER
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setIsResendDisabled(false);
    }
  }, [timer]);

  const formatTime = (time) => {
    return time < 10 ? `00:0${time}` : `00:${time}`;
  };

  // OTP INPUT HANDLING
  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...form.otpArray];
    newOtp[index] = value;

    setForm({ ...form, otpArray: newOtp });

    // Move forward
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !form.otpArray[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // RESEND OTP
  const handleResend = async () => {
    try {
      await resendOTP({ email });

      toast.success("OTP resent!");

      setTimer(30);
      setIsResendDisabled(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validation.valid) {
      toast.error("Weak password!");
      return;
    }

    try {
      await resetPassword({
        email,
        otp: form.otpArray.join(""),
        newPassword: form.newPassword,
      });

      toast.success("Password updated 🎉");

      localStorage.removeItem("resetEmail");

      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  const ruleStyle = (cond) =>
    cond ? "text-green-600" : "text-red-500";

  return (
    <div className="bg-gray-100 px-4 py-6">

      <div className="max-w-5xl mx-auto">

        {/* DARK CONTAINER */}
        <div className="bg-gradient-to-br from-gray-700 to-gray-600 rounded-2xl py-8 px-4 sm:py-10 sm:px-8">

          {/* WHITE CARD */}
          <div className="bg-white w-full max-w-md sm:max-w-lg mx-auto p-5 sm:p-10 rounded-2xl shadow-xl">

            {/* TITLE */}
            <h2 className="text-xl sm:text-3xl font-bold text-center mb-2">
              Reset Password
            </h2>

            <p className="text-center text-gray-500 text-sm sm:text-base mb-6 break-words">
              OTP sent to <span className="font-semibold">{email}</span>
            </p>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* OTP */}
              <div className="flex justify-center flex-wrap gap-2 sm:gap-3">
                {form.otpArray.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-9 h-10 sm:w-11 sm:h-12 text-center text-base sm:text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                ))}
              </div>

              {/* RESEND */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResendDisabled}
                  className={`
                  px-4 py-2 rounded-lg font-semibold transition cursor-pointer
                  ${isResendDisabled
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed border"
                      : "bg-black text-white hover:bg-white hover:text-black border shadow"
                    }
                `}
                >
                  {isResendDisabled ? "Wait..." : "Resend OTP"}
                </button>

                <span className="text-gray-500 text-xs sm:text-sm">
                  {timer > 0 ? formatTime(timer) : "You can resend now"}
                </span>
              </div>

              {/* PASSWORD */}
              <div>
                <input
                  type="password"
                  name="newPassword"
                  placeholder="New Password"
                  onChange={handleChange}
                  className="input w-full"
                  required
                />

                {/* MOBILE FRIENDLY VALIDATION */}
                {form.newPassword && (
                  <div className="mt-2 w-full bg-gray-50 border rounded-lg p-3 text-sm space-y-1">
                    <p className={ruleStyle(validation.length)}>✔ Length</p>
                    <p className={ruleStyle(validation.uppercase)}>✔ Uppercase</p>
                    <p className={ruleStyle(validation.special)}>✔ Special</p>
                    <p className={ruleStyle(validation.number)}>✔ Number</p>
                  </div>
                )}
              </div>

              {/* BUTTON */}
              <button className="w-full bg-gray-800 text-white py-2.5 sm:py-3 rounded-lg hover:bg-black transition">
                Reset Password
              </button>
            </form>

            {/* BACK */}
            <p className="text-center mt-5 sm:mt-6 text-xs sm:text-sm">
              <Link to="/login" className="hover:underline">
                Back to Login
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}