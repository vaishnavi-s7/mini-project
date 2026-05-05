import { Navigate, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import UploadCSV from "../pages/UploadCSV";
import ViewData from "../pages/ViewData";
import SubjectMaster from "../pages/SubjectMaster";
import CourseMaster from "../pages/CourseMaster";
import LessonMaster from "../pages/LessonMaster";
import LessonDetails from "../pages/LessonDetails";
import MasterDashboard from "../pages/MasterDashboard";
import QuestionBank from "../pages/QuestionBank";
 
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Profile from "../pages/Profile";
import ChangePassword from "../pages/ChangePassword";
import HODDashboard from "../pages/HODDashboard";
import HODPendingApprovals from "../pages/HODPendingApprovals";
import HODFacultyOverview from "../pages/HODFacultyOverview";
import HODAnnouncements from "../pages/HODAnnouncements";
import HODStudentDetails from "../pages/HODStudentDetails";
 
import ProtectedWrapper from "../components/common/ProtectedWrapper";

function RoleHome() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (user?.role === "HOD") {
    return <Navigate to="/hod-dashboard" replace />;
  }

  return <Home />;
}
 
/**
 * Define public and protected application routes.
 */
export default function AppRoutes() {
  return (
    <Routes>
 
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<RoleHome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/hod-dashboard"
        element={
          <ProtectedWrapper role="HOD">
            <HODDashboard />
          </ProtectedWrapper>
        }
      />
      <Route
        path="/hod-pending-approvals"
        element={
          <ProtectedWrapper role="HOD">
            <HODPendingApprovals />
          </ProtectedWrapper>
        }
      />
      <Route
        path="/hod-faculty-overview"
        element={
          <ProtectedWrapper role="HOD">
            <HODFacultyOverview />
          </ProtectedWrapper>
        }
      />
      <Route
        path="/hod-announcements"
        element={
          <ProtectedWrapper role="HOD">
            <HODAnnouncements />
          </ProtectedWrapper>
        }
      />
      <Route
        path="/hod-student-details"
        element={
          <ProtectedWrapper role="HOD">
            <HODStudentDetails />
          </ProtectedWrapper>
        }
      />
      <Route
        path="/change-password"
        element={
          <ProtectedWrapper>
            <ChangePassword />
          </ProtectedWrapper>
        }
      />
 
      {/* PROTECTED ROUTES */}
      <Route
        path="/upload-csv"
        element={
          <ProtectedWrapper>
            <UploadCSV />
          </ProtectedWrapper>
        }
      />
 
      <Route
        path="/view-data"
        element={
          <ProtectedWrapper>
            <ViewData />
          </ProtectedWrapper>
        }
      />
 
      <Route
        path="/subject-master"
        element={
          <ProtectedWrapper>
            <SubjectMaster />
          </ProtectedWrapper>
        }
      />

      <Route
        path="/course-master"
        element={
          <ProtectedWrapper>
            <CourseMaster />
          </ProtectedWrapper>
        }
      />

      <Route
        path="/master-dashboard"
        element={
          <ProtectedWrapper>
            <MasterDashboard />
          </ProtectedWrapper>
        }
      />

      <Route
        path="/question-bank"
        element={
          <ProtectedWrapper>
            <QuestionBank />
          </ProtectedWrapper>
        }
      />

      <Route
        path="/lesson-master"
        element={
          <ProtectedWrapper>
            <LessonMaster />
          </ProtectedWrapper>
        }
      />

      <Route
        path="/lesson-details/:lessonId"
        element={
          <ProtectedWrapper>
            <LessonDetails />
          </ProtectedWrapper>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedWrapper>
            <Profile />
          </ProtectedWrapper>
        }
      />
 
    </Routes>
  );
}
 
 
