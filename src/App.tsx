import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import JobBoard from "./pages/JobBoard";
import ResumeScanner from "./pages/ResumeScanner";
import ResumeBuilder from "./pages/ResumeBuilder";
import Roadmaps from "./pages/Roadmaps";
import NotFound from "./pages/NotFound";
import Login from "./components/Auth/Login.jsx";

const queryClient = new QueryClient();

/**
 * ProtectedRoute Component
 * Currently defaults to true for development. 
 * Redirects to the landing page if the user is not authenticated.
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = true; // Set to false to test redirecting to Home
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          {/* These routes do not display the sidebar or topbar navigation */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* --- PROTECTED ROUTES --- */}
          {/* These routes are wrapped in AppLayout for the sidebar ecosystem */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Main application features */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/jobs" element={<JobBoard />} />
            <Route path="/scanner" element={<ResumeScanner />} />
            <Route path="/builder" element={<ResumeBuilder />} />
            <Route path="/roadmaps" element={<Roadmaps />} />
          </Route>

          {/* --- CATCH ALL --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;