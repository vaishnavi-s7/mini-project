import nodemailer from "nodemailer";

/**
 * Send a password reset OTP email to the user.
 */
export const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();
    console.log("✅ Email server ready");

    const resetLink = `http://localhost:5173/reset-password?email=${email}&otp=${otp}`;

    const info = await transporter.sendMail({
      from: `"CSV App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial; text-align: center;">
          <h2>Password Reset</h2>

          <p>Your OTP is:</p>
          <h1 style="color: #16a34a;">${otp}</h1>

          <p>This OTP is valid for 2 minutes.</p>

          <p>Or click below to continue:</p>

          <a href="${resetLink}" 
             style="
               display:inline-block;
               padding:12px 24px;
               background-color:black;
               color:white;
               text-decoration:none;
               border-radius:6px;
               margin-top:10px;
             ">
             Reset Password
          </a>

          <p style="margin-top:20px; font-size:12px; color:gray;">
            This will open the reset page with your OTP pre-filled.
          </p>
        </div>
      `,
    });

    console.log("📩 Email sent:", info.response);

  } catch (error) {
    console.log("❌ EMAIL ERROR:", error);
    throw error;
  }
};

/**
 * Send a welcome email after successful account creation.
 */
export const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"CSV App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: " Welcome to CSV Manager!",
      html: `
        <div style="font-family: Arial; text-align: center; padding: 20px;">
          
          <h2 style="color: #111;">Welcome, ${name} 👋</h2>

          <p style="font-size: 16px; color: #444;">
            Your account has been successfully created.
          </p>

          <p style="font-size: 15px; color: #666;">
            You can now upload CSV files, manage your data, and explore the platform.
          </p>

          <div style="margin-top: 20px;">
            <a href="http://localhost:5173/login"
               style="
                 display:inline-block;
                 padding:12px 24px;
                 background-color:black;
                 color:white;
                 text-decoration:none;
                 border-radius:6px;
               ">
               Go to Login
            </a>
          </div>

          <p style="margin-top: 30px; font-size: 12px; color: gray;">
            If you did not create this account, please ignore this email.
          </p>

        </div>
      `,
    });

    console.log(" Welcome email sent:", info.response);

  } catch (error) {
    console.log(" WELCOME EMAIL ERROR:", error);
  }
};

/**
 * Send credentials to a teacher after the HOD creates the account.
 */
export const sendTeacherWelcomeEmail = async ({ username, email, password }) => {
  try {
    const loginUrl = process.env.CLIENT_LOGIN_URL || "http://localhost:5173/login";

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"AcadX" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome Onboard",
      text: `Welcome to the system!

Your account has been created by the HOD.

Login Credentials:
Username: ${username}
Email: ${email}
Password: ${password}

Login here: ${loginUrl}

For security reasons, please change your password after logging in using the 'Forgot Password' option.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Welcome to the system!</p>
          <p>Your account has been created by the HOD.</p>
          <p><strong>Login Credentials:</strong></p>
          <p>
            Username: ${username}<br />
            Email: ${email}<br />
            Password: ${password}
          </p>
          <p>
            <a href="${loginUrl}"
               style="display:inline-block; padding:12px 20px; background:#2563eb; color:#ffffff; text-decoration:none; border-radius:6px;">
              Login to the application
            </a>
          </p>
          <p>
            For security reasons, please change your password after logging in
            using the 'Forgot Password' option.
          </p>
        </div>
      `,
    });

    console.log("Teacher welcome email sent:", info.response);
  } catch (error) {
    console.log("TEACHER WELCOME EMAIL ERROR:", error);
    throw error;
  }
};
