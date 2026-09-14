import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import React, { useEffect } from "react";
import Welcome from "./pages/Welcome";
import About from "./pages/About";
import Portfolio from "./pages/Portfolio";
import OurProjects from "./pages/OurProjects";

// Admin Context & Styles
import "./admin/admin.css";
import { AuthProvider } from "./admin/context/AuthContext";
import { ToastProvider } from "./admin/components/Toast";
import ProtectedRoute from "./admin/components/ProtectedRoute";
import AdminLayout from "./admin/components/AdminLayout";

// Admin Pages
import Login from "./admin/pages/Login";
import Dashboard from "./admin/pages/Dashboard";
import PortfolioList from "./admin/pages/PortfolioList";
import PortfolioForm from "./admin/pages/PortfolioForm";
import HeroBentoManager from "./admin/pages/HeroBentoManager";
import BrandsManager from "./admin/pages/BrandsManager";
import MediaLibrary from "./admin/pages/MediaLibrary";
import AuditLogs from "./admin/pages/AuditLogs";
import LoginHistory from "./admin/pages/LoginHistory";
import UsersManager from "./admin/pages/UsersManager";
import Settings from "./admin/pages/Settings";
import ServicesManager from "./admin/pages/ServicesManager";
import ComboPackagesManager from "./admin/pages/ComboPackagesManager";
import ContactManager from "./admin/pages/ContactManager";

function App() {
  useEffect(() => {
    // Only load public vanilla scripts if not on admin or studio paths
    if (window.location.pathname.startsWith("/admin") || window.location.pathname.startsWith("/studio")) return;

    if (document.getElementById("cambm-main-script")) return;

    const loadScript = (src, id) => {
      const script = document.createElement("script");
      script.id = id;
      script.src = src;
      script.defer = true;
      document.body.appendChild(script);
    };

    loadScript("/js/main.js", "cambm-main-script");
    loadScript("/js/cal-widget.js", "cambm-cal-widget");

    if (window.CAMBMTheme && window.CAMBMTheme.initControls) {
      window.CAMBMTheme.initControls();
    }
    if (window.initI18n) {
      window.initI18n();
    }
  }, []);

  useEffect(() => {
    // Lightweight video attribute configuration without full-document MutationObserver thrashing
    const setupVideos = () => {
      if (window.location.pathname.startsWith("/admin") || window.location.pathname.startsWith("/studio")) return;
      const videos = document.querySelectorAll("video.bento-video, .hero-video, .ambient-video");
      videos.forEach((video) => {
        if (!video.muted) video.muted = true;
        if (video.volume !== 0) video.volume = 0;
        if (!video.playsInline) video.playsInline = true;
      });
    };

    setupVideos();
    window.addEventListener("cambm:bento-updated", setupVideos, { passive: true });
    window.addEventListener("cambm:revealed", setupVideos, { passive: true });

    return () => {
      window.removeEventListener("cambm:bento-updated", setupVideos);
      window.removeEventListener("cambm:revealed", setupVideos);
    };
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public Website Routes */}
            <Route path="/" element={<Welcome />} />
            <Route path="/welcome.html" element={<Navigate to="/" replace />} />
            <Route path="/about" element={<About />} />
            <Route
              path="/about.html"
              element={<Navigate to="/about" replace />}
            />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route
              path="/portfolio.html"
              element={<Navigate to="/portfolio" replace />}
            />
            <Route path="/our-projects" element={<OurProjects />} />
            <Route
              path="/our-projects.html"
              element={<Navigate to="/our-projects" replace />}
            />
            <Route path="/projects" element={<OurProjects />} />
            <Route
              path="/projects.html"
              element={<Navigate to="/our-projects" replace />}
            />
            <Route
              path="/portfolio-under-construction.html"
              element={<Navigate to="/portfolio" replace />}
            />
            <Route
              path="/portfolio-under-construction"
              element={<Navigate to="/portfolio" replace />}
            />
            <Route path="/packages" element={<Navigate to="/#packages" replace />} />
            <Route path="/services" element={<Navigate to="/#packages" replace />} />

            {/* Admin / Studio Authentication */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/studio/login" element={<Login />} />
            <Route
              path="/admin"
              element={<Navigate to="/studio/dashboard" replace />}
            />
            <Route
              path="/studio"
              element={<Navigate to="/studio/dashboard" replace />}
            />

            {/* Protected Studio & Admin Dashboard Routes */}
            <Route
              path="/studio/*"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="services" element={<ServicesManager />} />
              <Route path="combo-packages" element={<ComboPackagesManager />} />
              <Route path="contacts" element={<ContactManager />} />
              <Route
                path="portfolio"
                element={
                  <ProtectedRoute permission="manage_portfolio">
                    <PortfolioList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="portfolio/add"
                element={
                  <ProtectedRoute permission="manage_portfolio">
                    <PortfolioForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="portfolio/edit/:id"
                element={
                  <ProtectedRoute permission="manage_portfolio">
                    <PortfolioForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="hero-bento"
                element={
                  <ProtectedRoute permission="manage_bento">
                    <HeroBentoManager />
                  </ProtectedRoute>
                }
              />
              <Route
                path="creatives"
                element={<Navigate to="/studio/hero-bento" replace />}
              />
              <Route
                path="videos"
                element={<Navigate to="/studio/hero-bento" replace />}
              />
              <Route
                path="brands"
                element={
                  <ProtectedRoute permission="manage_brands">
                    <BrandsManager />
                  </ProtectedRoute>
                }
              />
              <Route
                path="media"
                element={
                  <ProtectedRoute permission="manage_media">
                    <MediaLibrary />
                  </ProtectedRoute>
                }
              />
              <Route
                path="audit-logs"
                element={
                  <ProtectedRoute permission="view_audit_logs">
                    <AuditLogs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="login-history"
                element={
                  <ProtectedRoute permission="view_audit_logs">
                    <LoginHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users"
                element={
                  <ProtectedRoute permission="manage_users">
                    <UsersManager />
                  </ProtectedRoute>
                }
              />
              <Route path="settings" element={<Settings />} />
              <Route
                path="*"
                element={<Navigate to="/studio/dashboard" replace />}
              />
            </Route>

            {/* Redirect legacy /admin/* to /studio/* */}
            <Route path="/admin/dashboard" element={<Navigate to="/studio/dashboard" replace />} />
            <Route path="/admin/services" element={<Navigate to="/studio/services" replace />} />
            <Route path="/admin/portfolio" element={<Navigate to="/studio/portfolio" replace />} />
            <Route path="/admin/hero-bento" element={<Navigate to="/studio/hero-bento" replace />} />
            <Route path="/admin/brands" element={<Navigate to="/studio/brands" replace />} />
            <Route path="/admin/media" element={<Navigate to="/studio/media" replace />} />
            <Route path="/admin/settings" element={<Navigate to="/studio/settings" replace />} />
            <Route path="/admin/*" element={<Navigate to="/studio/dashboard" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
