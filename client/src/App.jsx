import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import AppRoutes from "./routes/AppRoutes";
import Header from "./components/layout/Header";
import { Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">

      {/* Header */}
      <Header />
      <Toaster position="top-right" />
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow px-4 py-8 max-w-6xl w-full mx-auto">
        <AppRoutes />
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default App;