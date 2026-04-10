import { Routes, Route } from "react-router-dom";
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
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Profile from "../pages/Profile";
import ChangePassword from "../pages/ChangePassword";
 
import ProtectedWrapper from "../components/common/ProtectedWrapper";
 
export default function AppRoutes() {
  return (
    <Routes>
 
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
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
 
 
