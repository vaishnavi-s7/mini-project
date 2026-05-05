import Navbar from "./components/layout/Navbar";
import HODNavbar from "./components/layout/HODNavbar";
import Footer from "./components/layout/Footer";
import AppRoutes from "./routes/AppRoutes";
import Header from "./components/layout/Header";
import { Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";

/**
 * Compose the shared application shell around all routes.
 */
function App() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isHod = user?.role === "HOD";

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">

      {/* Header */}
      <Header />
      <Toaster position="top-right" />
      {isHod ? <HODNavbar /> : <Navbar />}

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-8">
        <AppRoutes />
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default App;
